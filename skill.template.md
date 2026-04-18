---
name: mdcat
description: Render markdown files in the browser using hcat
user_invocable: true
---

# mdcat

A CLI tool that renders markdown files in the browser using hcat.

## Usage

```bash
# Render a markdown file
mdcat README.md

# Pipe markdown content
cat README.md | mdcat

# With options
mdcat --port 8080 README.md
```

## Options

- `-p, --port <port>` - Port for the hcat server (default: random)
- `-H, --hostname <hostname>` - Hostname for the hcat server (default: localhost)
- `--wait-for-stdin <ms>` - Time to wait for stdin data in ms (default: 200)
