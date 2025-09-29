# AI Model Selector 🤖🌍

**Find the most environmentally efficient AI models for your task**

An open source assistant that helps you discover AI models prioritizing environmental sustainability. Get personalized recommendations with a "smaller is better" approach that reduces energy consumption while maintaining performance.

## ✨ Features

- **🌱 Environmental Focus**: Prioritizes models with lower energy consumption and carbon footprint
- **🔍 Smart Classification**: Automatically identifies your task type from natural language descriptions
- **📊 Tiered Recommendations**: Shows lightweight → standard → advanced models with clear efficiency ratings
- **⚡ Instant Results**: Client-side processing with <1 second response time
- **♿ Accessible Interface**: Full keyboard navigation and screen reader support
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Live Demo

Visit the live application: [AI Model Selector](https://ismaelmartinez.github.io/model-selector)

## 📋 Supported Tasks

**Computer Vision**: Image classification, object detection, semantic segmentation  
**Natural Language Processing**: Text classification, sentiment analysis, text generation, NER  
**Speech Processing**: Speech recognition, text-to-speech  
**Time Series**: Forecasting, anomaly detection  
**Recommendation Systems**: Collaborative filtering, content-based filtering  
**Reinforcement Learning**: Game playing, robotics control  
**Data Preprocessing**: Data cleaning, feature engineering  

## 🛠️ Development

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:5173
```

### Build & Test

```bash
# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── lib/
│   ├── data/           # Model and task datasets
│   ├── classification/ # Task classification logic
│   ├── recommendation/ # Model selection algorithms
│   └── environmental/  # Environmental impact calculations
├── components/         # Svelte UI components
├── routes/            # SvelteKit routes
└── tests/             # Test suites
```

## 🌍 Environmental Impact

Our recommendations prioritize models that minimize environmental impact:

- **🌱 Low Impact**: <0.1g CO2 per inference, <5W power consumption
- **⚡ Medium Impact**: 0.1-1.0g CO2 per inference, 5-50W power consumption  
- **🔥 High Impact**: >1.0g CO2 per inference, >50W power consumption

### Bundle Size
- **Total**: ~40KB gzipped
- **Performance**: <1s load time on fast connections
- **Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 📚 Documentation

- **[User Guide](docs/USER_GUIDE.md)**: How to use the application effectively
- **[Deployment Guide](docs/DEPLOYMENT.md)**: Setup instructions for hosting
- **[API Documentation](docs/API.md)**: Technical details for developers

## 🧪 Testing

We maintain comprehensive test coverage:

- **Task Classification**: Accuracy testing across 17 categories
- **Model Selection**: "Smaller is better" logic verification  
- **Performance**: Response time and bundle size validation
- **Accessibility**: Keyboard navigation and screen reader support
- **Integration**: End-to-end user workflow testing

```bash
# Run all tests
npm test

# Run specific test suite
npx vitest run tests/acceptance.test.js
```

## 🚀 Deployment

### Automated Deployment (GitHub Pages)

1. Enable Pages in repository Settings → Pages → Source: GitHub Actions
2. Push to `main` branch triggers automatic deployment
3. Visit your deployed site at `https://ismaelmartinez.github.io/model-selector`

### Manual Deployment

```bash
npm run build
# Deploy contents of `dist/` directory to your hosting provider
```

## 🤝 Contributing

We welcome contributions! Areas where you can help:

- **Model Data**: Add more models or improve metadata
- **Task Categories**: Expand supported task types
- **Classification**: Improve task identification accuracy
- **UI/UX**: Enhance accessibility and user experience
- **Performance**: Optimize bundle size and response times
- **Documentation**: Improve guides and examples

## 📈 Roadmap

- **✅ MVP**: Completed - Full working application with 17+ task categories
- **🔄 v1.1**: Enhanced model database with real-time Hugging Face integration
- **🎯 v1.2**: Advanced environmental impact calculations
- **🚀 v2.0**: Local SLM integration for improved task classification

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- Model data curated from [Hugging Face Hub](https://huggingface.co/)
- Environmental impact methodology based on research from [Papers with Code](https://paperswithcode.com/)
- Built with [SvelteKit](https://kit.svelte.dev/) and [Vite](https://vitejs.dev/)

---

**Building sustainable AI, one model at a time** 🌱
