# AI Model Advisor - User Guide

## Overview

The AI Model Advisor helps you find the most environmentally efficient AI models for your specific tasks. Our recommendations prioritize "smaller is better" - models that use less energy while maintaining good performance.

## How to Use

### 1. Describe Your Task

Enter a clear description of what you want to achieve:

**Good Examples**:
- "I want to classify customer support tickets by urgency level"
- "Detect objects in security camera footage"
- "Analyze sentiment in product reviews"
- "Generate text summaries for articles"
- "Convert speech to text for meeting transcripts"

**Tips for Better Results**:
- Be specific about your task type (classify, detect, generate, predict)
- Mention the type of data (text, images, audio, time series)
- Include context about your use case

### 2. Review Recommendations

The system will show you up to 3 model recommendations, ranked by environmental efficiency:

**Model Information**:
- **Name & Description**: What the model does
- **Size**: Model file size (smaller = more efficient)
- **Accuracy**: Performance score (higher = better)
- **Environmental Impact**: 🌱 Low, ⚡ Medium, 🔥 High
- **Tier**: 🪶 Lightweight (≤500MB), ⚖️ Standard (≤4GB), 🚀 Advanced (≤20GB), 🏢 Extra Large (>20GB)
- **Top Pick**: ⭐ Most environmentally efficient option

**Deployment Options**:
- **Browser**: Runs directly in web browsers
- **Edge**: Suitable for edge devices
- **Mobile**: Optimized for mobile devices
- **Cloud**: Best deployed on cloud servers
- **Server**: Requires dedicated server hardware

### 3. Choose Your Model

**Prioritization Logic**:
1. **Lightweight models first** - Most energy efficient
2. **Smaller sizes within each tier** - Less storage and memory
3. **Good accuracy-to-size ratio** - Best performance per resource

**For Production Use**:
- Start with the ⭐ Top Pick (most efficient)
- Consider accuracy requirements vs. environmental impact
- Check deployment compatibility with your infrastructure

## Supported Task Categories

### Computer Vision
- **Image Classification**: Categorize images (animals, objects, scenes)
- **Object Detection**: Find and locate objects in images
- **Semantic Segmentation**: Pixel-level image analysis

### Natural Language Processing
- **Text Classification**: Categorize documents or messages
- **Sentiment Analysis**: Determine emotional tone in text
- **Text Generation**: Create human-like text content
- **Named Entity Recognition**: Extract entities from text

### Speech Processing
- **Speech Recognition**: Convert audio to text
- **Text-to-Speech**: Generate spoken audio from text

### Time Series Analysis
- **Forecasting**: Predict future values from historical data
- **Anomaly Detection**: Identify unusual patterns in data

### Recommendation Systems
- **Collaborative Filtering**: User-based recommendations
- **Content-Based**: Item feature-based recommendations

### Reinforcement Learning
- **Game Playing**: AI agents for games and strategy
- **Robotics**: Control systems for robotic applications

### Data Preprocessing
- **Data Cleaning**: Remove errors and inconsistencies
- **Feature Engineering**: Create meaningful data features

## Model Specialization Disclaimer

### Important: Smaller Models Are Often Task-Specialized

Our "eco-first" approach prioritizes lightweight models for their environmental efficiency. However, **smaller models are frequently specialized for narrow, specific tasks** rather than general-purpose use.

### What This Means for You

| Specialized Model | What It Does | What It Does NOT Do |
|-------------------|--------------|---------------------|
| Table Transformer | Detect tables in documents | Detect other objects |
| FinBERT | Financial sentiment analysis | General sentiment analysis |
| Whisper-small.en | English speech recognition | Multilingual ASR |
| Signature Detector | Detect signatures | General object detection |
| Face Expression | Classify facial expressions | Face identification or age |

### Types of Specialization

1. **Task-Specialized**: Models trained for one specific task (e.g., table detection only)
2. **Domain-Specialized**: Models trained on specific industries (e.g., finance, medical)
3. **Language-Specialized**: Models supporting only one language (e.g., English-only ASR)
4. **Platform-Optimized**: Models designed for specific deployment (e.g., mobile-only)

### Recommendations

- **Verify model descriptions** match your exact use case before deploying
- **Test on your data** — specialized models may fail on inputs outside their training domain
- **Consider Standard/Advanced tiers** if you need general-purpose capabilities
- **Check language support** for NLP and speech models

For detailed analysis, see [Model Specialization Patterns Research](research/model-specialization-patterns.md).

## Environmental Impact

### Why It Matters
- **Energy Consumption**: Smaller models use less electricity
- **Carbon Footprint**: Lower energy = reduced CO2 emissions
- **Cost Efficiency**: Less compute = lower operational costs
- **Accessibility**: Lighter models run on more devices

### Impact Levels
- **🌱 Low Impact** (Lightweight ≤500MB): Edge/mobile deployable, minimal power
- **⚡ Medium Impact** (Standard ≤4GB): Cloud/server, includes quantized LLMs
- **🔥 High Impact** (Advanced ≤20GB): Dedicated GPU, full-precision 7B+ models

### Our Approach
We prioritize models that achieve good results with minimal environmental impact. This "smaller is better" philosophy helps you build sustainable AI applications.

## Tips for Success

### Writing Good Task Descriptions
```
❌ "Help me with AI"
✅ "Classify customer support tickets by urgency level"

❌ "Image stuff"  
✅ "Detect objects in retail store security footage"

❌ "Text things"
✅ "Analyze sentiment in social media posts about our product"
```

### Choosing the Right Model
- **Start small**: Try the lightweight recommendation first
- **Test thoroughly**: Validate accuracy on your specific data
- **Consider trade-offs**: Balance accuracy vs. environmental impact
- **Plan for scale**: Smaller models handle more users efficiently

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support (Tab, Enter, Arrow keys)
- **Screen Reader**: ARIA labels and semantic HTML
- **Visual Indicators**: Clear environmental and tier badges
- **Shortcuts**: Ctrl+Enter to submit quickly

## Getting Help

- **Unclear Results?** Try describing your task differently
- **No Models Found?** Check if your task type is supported
- **Performance Issues?** Ensure you're using a modern browser
- **Technical Questions?** Check our GitHub repository for issues and discussions

---

*Built with environmental sustainability in mind 🌍*