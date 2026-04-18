---
name: mdcat
description: Render markdown files in the browser using mdcat CLI
user_invocable: true
---

# mdcat

A CLI tool that renders markdown files in the browser. Converts markdown to HTML and displays it using hcat.

## Instructions

When asked to show, display, or render a markdown file, use the `mdcat` CLI tool. Do NOT use `hcat` directly.

```bash
# Render a markdown file
mdcat <file>

# Pipe markdown content
cat <file> | mdcat
```

## Options

- `-p, --port <port>` - Port for the hcat server (default: random)
- `-H, --hostname <hostname>` - Hostname for the hcat server (default: localhost)
- `--wait-for-stdin <ms>` - Time to wait for stdin data in ms (default: 200)
