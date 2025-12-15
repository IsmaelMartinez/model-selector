# Model Selector Data Structure Documentation

## Overview

The Model Selector uses two main JSON files to organize AI/ML tasks and models:
- `src/lib/data/tasks.json` - Task taxonomy and classification keywords
- `src/lib/data/models.json` - Model metadata with tiered recommendations

## Task Taxonomy (`tasks.json`)

### Structure

The task taxonomy organizes AI/ML tasks into a hierarchical structure:

```
taskTaxonomy/
├── [category]/
│   ├── label: Human-readable category name
│   ├── description: Category explanation
│   └── subcategories/
│       └── [subcategory]/
│           ├── label: Human-readable subcategory name
│           ├── description: Subcategory explanation
│           ├── keywords: Array of classification keywords
│           └── examples: Array of real-world use cases
```

### Categories

1. **Computer Vision** - Image and video analysis tasks
   - Image Classification
   - Object Detection  
   - Semantic Segmentation

2. **Natural Language Processing** - Text understanding and generation
   - Text Classification
   - Sentiment Analysis
   - Text Generation
   - Named Entity Recognition

3. **Speech Processing** - Audio and speech analysis
   - Speech Recognition
   - Text to Speech

4. **Time Series Analysis** - Temporal data analysis
   - Forecasting
   - Anomaly Detection

5. **Recommendation Systems** - Personalized content suggestions
   - Collaborative Filtering
   - Content-Based Filtering

6. **Reinforcement Learning** - Learning through interaction
   - Game Playing
   - Robotics Control

7. **Data Preprocessing** - Data cleaning and preparation
   - Data Cleaning
   - Feature Engineering

### Classification Logic

Tasks are classified using keyword matching against user input. The system:
1. Searches for keywords in user descriptions
2. Applies confidence thresholds (high: 0.8, medium: 0.6, low: 0.4)
3. Falls back to "data_preprocessing" if no match found
4. Prioritizes categories by the defined priority order

## Model Data Structure (`models.json`)

### Tier System

Models are organized into three tiers based on resource requirements:

#### Lightweight (Priority 1)
- **Size**: < 100MB
- **Environmental Score**: 1 (Low Impact)
- **Use Case**: Edge devices, mobile, real-time applications
- **Deployment**: Browser, mobile, edge

#### Standard (Priority 2)  
- **Size**: < 500MB
- **Environmental Score**: 2 (Medium Impact)
- **Use Case**: Balanced performance and efficiency
- **Deployment**: Cloud, server

#### Advanced (Priority 3)
- **Size**: < 2000MB
- **Environmental Score**: 3 (High Impact)
- **Use Case**: Maximum accuracy requirements
- **Deployment**: Cloud, server with specialized hardware

### Model Metadata

Each model includes:

```json
{
  "id": "unique_identifier",
  "name": "Human-readable name",
  "huggingFaceId": "namespace/model-name",
  "description": "Model description and use case",
  "sizeMB": 123.4,
  "accuracy": 0.85,
  "environmentalScore": 1,
  "deploymentOptions": ["browser", "cloud", "server"],
  "frameworks": ["PyTorch", "TensorFlow", "ONNX"],
  "lastUpdated": "2023-XX-XX"
}
```

## Environmental Impact Scoring

Environmental scores (1-3) based on estimated kWh/day usage. See `/docs/environmental-methodology.md` for detailed methodology. Selection algorithm weights environmental impact at 40% alongside accuracy (40%) and deployment compatibility (20%).

## Usage in Application

### Classification Flow

1. User inputs task description
2. `TaskClassifier.js` matches keywords against taxonomy
3. System identifies appropriate category and subcategory
4. `RecommendationEngine.js` filters models by task type
5. `ModelSelector.js` ranks models using selection rules
6. Top recommendations returned with environmental impact data

### Data Updates

- Model data is static (no real-time API calls)
- Updates require manual curation and testing
- Version tracking in JSON metadata
- Deployment pipeline validates data integrity

## Future Enhancements

- Integration with real-time model performance data
- Expanded environmental impact methodology  
- Support for custom model additions
- Dynamic accuracy benchmarking
- Regional energy grid impact calculations