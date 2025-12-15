# Model Selector - Project Vision

## Mission
An open source assistant to help you choose the most environmentally efficient AI model for your task — focusing on sustainability and simplicity first.

## Core Principles
- **Privacy First**: Runs locally in browser, no external data transmission
- **Environmental Consciousness**: "Smaller is better" philosophy
- **Simplicity First**: Prove concept before adding complexity
- **Open Source**: Community-driven development

## Current Status

### ✅ MVP Complete
- ✅ SvelteKit project structure with static site generation
- ✅ Browser-based LLM classification (Llama 3.2 1B, 95.2% accuracy)
- ✅ Tiered recommendation engine (Lightweight/Standard/Advanced)
- ✅ Environmental impact scoring (1-3 scale)
- ✅ Model accuracy filtering (50-95% threshold)
- ✅ Ensemble classification mode (98%+ accuracy target)
- ✅ Automated model dataset updates (daily via GitHub Actions)
- ✅ PWA with offline capability
- ✅ Full accessibility support

**Live**: https://ismaelmartinez.github.io/model-selector

## Roadmap

### Phase 1: MVP ✅ Complete
**Goals**: Chrome-optimized PWA with tiered recommendations and environmental scoring

**Achieved**: 
- <1 second to recommendations (target was <30s)
- 7 AI task categories with 95.2% classification accuracy
- ~40KB bundle size (target was <2MB)
- Full accessibility support

### Phase 2: v1.1 (In Progress)
**Goals**: Enhanced data quality and expanded features

- 📋 Phase 2 Auto-Updates: Gemini-based validation for model card parsing
- 📋 Improved accuracy data: Extract real metrics from model cards
- 📋 Cross-browser support: Firefox, Safari testing
- 📋 Community features: User feedback mechanisms

### Future Phases
- **v2.0**: Advanced filtering and comparison features
- **v3.0**: API integrations for real-time data (2026+)

## Technical Architecture

```
User Input → LLM Classification (Llama 3.2 1B) → Model Selection → Environmental Scoring → Recommendations
```

**Fallback Chain**: LLM → Semantic Matching → Keyword Matching → Default Category

## Success Metrics
- **Speed**: <1 second query to recommendation ✅
- **Accuracy**: 95.2% classification accuracy ✅
- **Performance**: ~40KB bundle, <1s load time ✅
- **Adoption**: Target 1000+ monthly users by end 2025

## Contributing
1. Test with real use cases
2. Curate model data
3. Improve algorithms
4. Promote sustainability focus

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Documentation
- [project-status.md](project-status.md) - Detailed current status
- [docs/](docs/) - Technical documentation and ADRs
- [CLAUDE.md](CLAUDE.md) - AI assistant configuration

## Impact Goals
Democratize AI model selection while reducing environmental impact through efficient model choices and simplified selection process.
