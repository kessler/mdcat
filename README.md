# @kessler/mdcat

Pipe/show markdown files in the browser.

## Install

```bash
pnpm install -g @kessler/mdcat
```

## CLI Usage

```bash
# Render a markdown file
mdcat README.md

# Pipe markdown content
cat README.md | mdcat

# Custom port
mdcat --port 8080 README.md
```

### Options

- `-p, --port <port>` - Port for the hcat server (default: random)
- `-H, --hostname <hostname>` - Hostname for the hcat server (default: localhost)
- `--wait-for-stdin <ms>` - Time to wait for stdin data in ms (default: 200)

## API

```js
import { renderMarkdown, renderFile } from 'mdcat'

// Render a markdown string
renderMarkdown('# Hello World')

// Render a file
await renderFile('README.md')

// With options
renderMarkdown('# Hello', { port: 8080, hostname: 'localhost' })
```

## Configuration

Uses [rc](https://github.com/dominictarr/rc) for persistent configuration. Create a `.mdcatrc` file or use environment variables:

```json
{
  "port": 0,
  "hostname": "localhost",
  "waitForStdin": 200
}
```

## License

Apache-2.0
