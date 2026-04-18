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
  const body = marked.parse(markdown)
  const html = createPage(body)

  return hcat(html, {
    port: mergedOptions.port,
    hostname: mergedOptions.hostname,
    contentType: 'text/html'
  })
}

function createPage(body) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #24292e;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.25;
    }
    h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code {
      font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 85%;
      background-color: rgba(27, 31, 35, 0.05);
      border-radius: 3px;
      padding: 0.2em 0.4em;
    }
    pre {
      background-color: #f6f8fa;
      border-radius: 6px;
      padding: 16px;
      overflow: auto;
      line-height: 1.45;
    }
    pre code {
      background: none;
      padding: 0;
      font-size: 100%;
    }
    blockquote {
      margin: 0;
      padding: 0 1em;
      color: #6a737d;
      border-left: 0.25em solid #dfe2e5;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    table th, table td {
      border: 1px solid #dfe2e5;
      padding: 6px 13px;
    }
    table tr:nth-child(2n) {
      background-color: #f6f8fa;
    }
    img { max-width: 100%; }
    hr {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: #e1e4e8;
      border: 0;
    }
    ul, ol { padding-left: 2em; }
    li + li { margin-top: 0.25em; }
  </style>
</head>
<body>
  ${body}
</body>
</html>`
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
