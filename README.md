# AI Model Advisor

Helps you find AI models for your task, prioritizing smaller and more efficient options.

**[Try it →](https://ismaelmartinez.github.io/ai-model-advisor)**

## What it does

1. Describe your AI task in plain language
2. Get model recommendations ranked by efficiency (smaller first)
3. See environmental impact estimates

Supports: Computer Vision, NLP, Speech, Time Series, Recommendations, Reinforcement Learning, Data Preprocessing

## Development

```bash
npm install
npm run dev     # Start dev server
npm run build   # Production build
npm test        # Run tests
```

## How it works

- Runs entirely in the browser (no backend)
- Uses MiniLM embeddings (~23MB, downloaded on first use) to classify your task
- Falls back to keyword matching if embeddings aren't available
- PWA - installable and works offline after first visit

## Environmental scoring

| Score | Size | Typical use |
|-------|------|-------------|
| Low | ≤500MB | Edge/mobile/browser |
| Medium | ≤4GB | Cloud, quantized models |
| High | >4GB | Dedicated GPU |

## Deployment

Automatically deploys to GitHub Pages on push to main.

Manual: `npm run build` and deploy the `dist/` folder.

## Documentation

See [`docs/`](docs/) for technical details.

## License

MIT
