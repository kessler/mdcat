import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { marked } from 'marked'
import hcat from 'hcat'
import deepmerge from 'deepmerge'
import { config as defaultConfig } from './config.mjs'

/**
 * Render markdown content in the browser using hcat
 * @param {string} markdown - Raw markdown string
 * @param {object} [options] - Options passed to hcat
 * @param {number} [options.port] - Port for the hcat server
 * @param {string} [options.hostname] - Hostname for the hcat server
 * @returns {object} hcat server instance
 */
export function renderMarkdown(markdown, options = {}) {
  const mergedOptions = deepmerge(defaultConfig, options)
  const html = marked.parse(markdown)

  return hcat(html, {
    port: mergedOptions.port,
    hostname: mergedOptions.hostname,
    contentType: 'text/html'
  })
}

/**
 * Read a markdown file and render it in the browser
 * @param {string} filePath - Path to the markdown file
 * @param {object} [options] - Options passed to hcat
 * @returns {Promise<object>} hcat server instance
 */
export async function renderFile(filePath, options = {}) {
  const content = await readFile(filePath, 'utf8')
  return renderMarkdown(content, options)
}

/**
 * Installs the mdcat CLI skill to Claude Code
 * @param {boolean} global - Install globally (true) or locally (false)
 * @returns {Promise<string>} - Path where skill was installed
 */
export async function installClaudeSkill(global = true) {
  const { globalPath, localPath } = getClaudeSkillPaths()
  const installPath = global ? globalPath : localPath

  await mkdir(installPath, { recursive: true })

  const templatePath = join(import.meta.dirname, 'skill.template.md')
  const skillContent = await readFile(templatePath, 'utf8')

  const skillFilePath = join(installPath, 'SKILL.md')
  await writeFile(skillFilePath, skillContent, 'utf8')

  return installPath
}

/**
 * Gets the Claude skill directories (global and local)
 * @returns {object} - Object with global and local paths
 */
function getClaudeSkillPaths() {
  const globalPath = join(homedir(), '.claude', 'skills', 'mdcat')
  const localPath = join(process.cwd(), '.claude', 'skills', 'mdcat')

  return { globalPath, localPath }
}

/**
 * Checks if the mdcat CLI skill is installed in Claude Code
 * @returns {Promise<object>} - Object with installation status
 */
export async function checkSkillInstalled() {
  const { globalPath, localPath } = getClaudeSkillPaths()

  const globalInstalled = await exists(join(globalPath, 'SKILL.md'))
  const localInstalled = await exists(join(localPath, 'SKILL.md'))

  return {
    globalInstalled,
    localInstalled,
    globalPath,
    localPath
  }
}

async function exists(path) {
  try {
    await readFile(path)
    return true
  } catch {
    return false
  }
}
