#!/usr/bin/env node

import util from 'node:util'
import { pipeline } from 'node:stream/promises'
import { Command } from 'commander'
import { confirm } from '@inquirer/prompts'
import { renderMarkdown, renderFile, installClaudeSkill, checkSkillInstalled } from './index.mjs'
import { config } from './config.mjs'

const debug = util.debuglog('mdcat')
const program = new Command()

program
  .name('mdcat')
  .description('Render markdown files in the browser using hcat')
  .version('1.0.0')
  .argument('[file]', 'markdown file to render')
  .option('-p, --port <port>', 'port for the hcat server', Number, config.port)
  .option('-H, --hostname <hostname>', 'hostname for the hcat server', config.hostname)
  .option('--wait-for-stdin <ms>', 'time to wait for stdin data in ms', Number, config.waitForStdin)
  .action(async (file, options) => {
    if (file) {
      debug('rendering file: %s', file)
      await renderFile(file, { port: options.port, hostname: options.hostname })
      return
    }

    const isStarted = { value: false }
    const ac = new AbortController()
    const signal = ac.signal

    const incomingDataPromise = bufferStream(process.stdin, isStarted, signal)
    await sleep(options.waitForStdin)

    if (isStarted.value) {
      const incomingData = await incomingDataPromise
      debug('rendering stdin data (%d bytes)', incomingData.length)
      renderMarkdown(incomingData.toString('utf8'), { port: options.port, hostname: options.hostname })
    } else {
      ac.abort()
      debug('no incoming data')
      program.help()
    }
  })

program.command('install-claude-code')
  .description('Install mdcat as a Claude Code skill')
  .option('-g, --global', 'Install globally in ~/.claude/skills (default)', true)
  .option('-l, --local', 'Install locally in project .claude/skills')
  .action(async (options) => {
    const installGlobal = !options.local

    const status = await checkSkillInstalled()

    if (installGlobal && status.globalInstalled) {
      console.log('mdcat skill is already installed globally at:')
      console.log(status.globalPath)
      const overwrite = await confirm({
        message: 'Do you want to overwrite the existing installation?',
        default: false
      })
      if (!overwrite) {
        console.log('Installation cancelled.')
        return
      }
    }

    if (!installGlobal && status.localInstalled) {
      console.log('mdcat skill is already installed locally at:')
      console.log(status.localPath)
      const overwrite = await confirm({
        message: 'Do you want to overwrite the existing installation?',
        default: false
      })
      if (!overwrite) {
        console.log('Installation cancelled.')
        return
      }
    }

    const installPath = await installClaudeSkill(installGlobal)
    console.log('\nmdcat skill installed successfully at:')
    console.log(installPath)
    console.log('\nThe skill is now available in Claude Code!')
    console.log('You can use it by asking Claude to use the mdcat skill.')
  })

program.parse()

async function bufferStream(stream, isStarted, signal) {
  const buffers = []

  try {
    await pipeline(stream, async function* (source) {
      for await (const chunk of source) {
        isStarted.value = true
        buffers.push(chunk)
      }
    }, { signal })
  } catch (e) {
    if (e.code !== 'ABORT_ERR') {
      throw e
    }
  }

  return Buffer.concat(buffers)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
