# AI Model Selector

**Find the most environmentally efficient AI models for your task**

Open source assistant that helps discover AI models prioritizing environmental sustainability with a "smaller is better" approach.

## Features

- **Environmental Focus**: Prioritizes models with lower energy consumption
- **Smart Classification**: Automatically identifies task type from descriptions
- **Tiered Recommendations**: Lightweight → standard → advanced models
- **Instant Results**: Client-side processing with fast response
- **Accessible Interface**: Keyboard navigation and screen reader support

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

## Roadmap

- ✅ MVP: Complete working application
- ✅ Research: Browser SLM evaluation (see [ADR-001](docs/adr/ADR-001-SLM-Model-Selection.md))
- 🔄 v1.1: Enhanced model database and classification improvements
- 🎯 v1.2: Advanced environmental calculations and UI enhancements
- 🚀 v2.0: API integrations and advanced features

## License

MIT License - see [LICENSE](LICENSE) for details

---

**Building sustainable AI, one model at a time**
