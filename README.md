# AI Model Selector

**Find the most environmentally efficient AI models for your task**

Open source assistant that helps discover AI models prioritizing environmental sustainability with a "smaller is better" approach.

## Features

- **Environmental Focus**: Prioritizes models with lower energy consumption
- **Intelligent Classification**: Browser-based LLM with 95.2% accuracy across 7 categories
- **Tiered Recommendations**: Lightweight → standard → advanced models
- **Instant Results**: Client-side processing with fast response
- **Accessible Interface**: Keyboard navigation and screen reader support
- **Offline-Capable**: PWA with browser-based AI (no backend required)

## Live Demo

[AI Model Selector](https://ismaelmartinez.github.io/model-selector)

## Supported Tasks

Computer Vision, Natural Language Processing, Speech Processing, Time Series, Recommendation Systems, Reinforcement Learning, Data Preprocessing

## Development

```bash
npm install     # Install dependencies
npm run dev     # Start development server
npm test        # Run tests
npm run build   # Build for production
```

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

**Requirements**: Node.js 18+, modern browsers, ~40KB bundle

## Contributing

Help with model data, task categories, classification accuracy, UI/UX, performance, or documentation.

## Technical Details

- **Classification**: Llama 3.2 1B-Instruct with enhanced pre-prompting (95.2% accuracy)
- **Testing**: Comprehensive test suite with acceptance, integration, and LLM tests
- **Interactive Testing**: `test-multi-category-sequential.html` for model evaluation

See [ADR-0003](docs/adrs/adr-0003-browser-llm-classification-model-selection.md) for detailed model selection rationale and evaluation results.

## Roadmap

- ✅ MVP: Complete working application
- ✅ Browser-based LLM classification: 95.2% accuracy across 7 categories
- 🔄 v1.1: Enhanced model database and UI improvements
- 🎯 v1.2: Advanced environmental calculations and performance optimizations
- 🚀 v2.0: Additional categories and advanced features

## License

MIT License - see [LICENSE](LICENSE) for details

---

**Building sustainable AI, one model at a time**
