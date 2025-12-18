# AI Model Advisor

**Find the most environmentally efficient AI models for your task**

Open source assistant that helps discover AI models prioritizing environmental sustainability with a "smaller is better" approach.

> 💡 **This is a starting point, not a final answer.** We point you toward models that might fit your task, but you decide what works best for your use case, data, and constraints. Smaller models are often highly specialized and can match or outperform larger ones for specific tasks while using far fewer resources.

## Features

- **Environmental Focus**: Prioritizes models with lower energy consumption
- **Intelligent Classification**: MiniLM embedding classifier with 98.3% accuracy across 7 categories
- **Accuracy Filtering**: Filter recommendations by minimum accuracy threshold (50-95%)
- **Tiered Recommendations**: Lightweight → standard → advanced models
- **Instant Results**: Client-side processing with fast response (~0.3s)
- **Accessible Interface**: Keyboard navigation and screen reader support
- **PWA Installable**: Works on desktop & mobile, offline-capable after first visit
- **Lightweight**: Only ~23MB model download (cached automatically)

## Live Demo

[AI Model Advisor](https://ismaelmartinez.github.io/ai-model-advisor)

## Supported Tasks

Computer Vision, Natural Language Processing, Speech Processing, Time Series, Recommendation Systems, Reinforcement Learning, Data Preprocessing

## Development

```bash
npm install     # Install dependencies
npm run dev     # Start development server
npm run build   # Build for production
```

### Testing

```bash
npm test          # Run fast tests (~2s, CI-friendly)
npm run test:llm  # Run LLM accuracy tests (~3min, local-only)
```

**Test Commands:**
- `npm test`: Fast unit and integration tests (23 tests, ~2s)
- `npm run test:llm`: Full embedding classification tests (48 tests, ~3min)
  - Downloads MiniLM model (~23MB) on first run
  - Validates 98.3% classification accuracy
  - Local-only, NOT for CI/CD pipelines

## Environmental Impact

- **Low Impact**: <0.1 kWh/day
- **Medium Impact**: 0.1-1.0 kWh/day  
- **High Impact**: >1.0 kWh/day

Performance: ~40KB gzipped, <1s load time

## Deployment

### Automated
GitHub Pages auto-deploys from main branch via GitHub Actions.

### Manual
```bash
npm run build
# Deploy contents of `dist/` directory to hosting provider
```

**Requirements**: Node.js 18+, modern browsers (desktop & mobile), ~40KB bundle

**Runtime**: Downloads ~23MB classification model on first visit (cached in IndexedDB for offline use)

## Contributing

Help with model data, task categories, classification accuracy, UI/UX, performance, or documentation.

## Technical Details

- **Classification**: MiniLM sentence embeddings via transformers.js (98.3% accuracy)
- **Model**: Xenova/all-MiniLM-L6-v2 (~23MB, cached in IndexedDB)
- **Testing**: Comprehensive test suite with acceptance, integration, and embedding tests
- **PWA**: Service worker with cache-first strategy, installable on all platforms

See [ADR-0003](docs/adrs/adr-0003-browser-llm-classification-model-selection.md) for detailed model selection rationale.

## Roadmap

- ✅ MVP: Complete working application
- ✅ Browser-based embedding classification: 98.3% accuracy across 7 categories
- ✅ PWA Support: Installable on desktop & mobile
- 🔄 v1.1: Additional categories and enhanced filtering
- 🚀 v2.0: Advanced comparison features

## License

MIT License - see [LICENSE](LICENSE) for details

---

**Building sustainable AI, one model at a time**
