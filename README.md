# Model Selector

**Mission:**  
An open source assistant to help you choose, adapt, and deploy the best AI model for your task — in your browser, offline.

## Features

- Local parsing of natural language tasks into structured queries
- Rules/graph-based recommendations of open & closed models
- Environmentally minded: prioritizes efficient, sustainable solutions
- Runs as PWA or installable static site
- Extensible for research, benchmarking, and safety

## Project Structure

- `src/` — App source code (UI, logic, decision graph)
- `public/` — Static files, icons, manifest
- `.github/` — Workflow automations (future: graph updates)
- `tests/` — Tests for logic and UI

## Development

1. Install dependencies:  
   `npm install`
2. Run locally:  
   `npm run dev`
3. Build static site for deployment:  
   `npm run build`

## Roadmap

- MVP: Rules-based parser and decision graph, manual curation
- v1.1: GitHub Action to auto-update graph from Hugging Face, etc.
- v2+: Local SLM parser, guardrails, distributed compute

## Contributing

PRs and issues welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)
