# Web Components Navigator

A small browser tool for exploring web components from public GitHub repos — mainly from [Frontend Joe](https://github.com/frontend-joe).

**[Try it live →](https://qualyyy.github.io/web-components-navigator/)**

## What it does

Frontend Joe (and others) publish a lot of small, useful web components across separate GitHub repos. This project pulls them all into one place so you can browse them without having to clone them first.

- Browse components grouped by repo and category
- Filter by owner or category
- Click a component to open a live preview or jump straight to its source code

## How it's built

- The list of source repos lives in a simple JSON file (`data/repos.json`)
- A GitHub Action runs on a schedule (and whenever that file changes) to scan those repos via the GitHub API, find every component (anywhere there's an `index.html`), and rebuild the component list
- The site itself is plain HTML, CSS, and JavaScript — no frameworks
- A small Cloudflare Worker proxies the live previews so they can be shown directly on the page

## Why I made this

Mostly to make Frontend Joe's components easier to browse and reuse, and as a side project to explore new tools like the GitHub API, GitHub Actions, and small serverless tools like Cloudflare Workers.
