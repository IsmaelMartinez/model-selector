# AI Model Advisor Data Structure Documentation

## Overview

The AI Model Advisor uses two main JSON files to organize AI/ML tasks and models:
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

Models are organized into four tiers based on size and resource requirements:

#### Lightweight (Priority 1)
- **Size**: ≤500MB
- **Environmental Score**: 1 (Low Impact)
- **Use Case**: Edge devices, mobile, browser inference
- **Deployment**: Browser, mobile, edge, cloud
- **Examples**: DistilBERT, MobileNet, small vision transformers

#### Standard (Priority 2)  
- **Size**: ≤4GB
- **Environmental Score**: 2 (Medium Impact)
- **Use Case**: Production workloads, quantized LLMs
- **Deployment**: Cloud, server (consumer hardware)
- **Examples**: BERT-large, Whisper-large, quantized 7B models (Q4/Q8)

#### Advanced (Priority 3)
- **Size**: ≤20GB
- **Environmental Score**: 3 (High Impact)
- **Use Case**: Maximum capability, full-precision LLMs
- **Deployment**: Server with dedicated GPU
- **Examples**: Full-precision 7B-13B models, CodeLlama, StarCoder2

#### Extra Large (Priority 4)
- **Size**: No limit
- **Environmental Score**: 3 (High Impact)
- **Use Case**: Research, specialized infrastructure
- **Deployment**: Multi-GPU servers, clusters
- **Examples**: 70B+ models, Llama-2-70B, large multimodal models

### Why These Thresholds?

| Threshold | Rationale |
|-----------|-----------|
| **500MB** | Upper limit for comfortable edge/browser deployment |
| **4GB** | Quantized 7B models fit here, runnable on consumer GPUs |
| **20GB** | Full-precision 7B-13B models, requires dedicated hardware |
| **No limit** | 70B+ models, research clusters, specialized infrastructure |

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
  "specialization": "general",
  "deploymentOptions": ["browser", "cloud", "server"],
  "frameworks": ["PyTorch", "TensorFlow", "ONNX"],
  "lastUpdated": "2023-XX-XX"
}
```

### Model Specialization

The optional `specialization` field indicates when a model is optimized for a narrow task or domain rather than general-purpose use. Models without this field are assumed to be general-purpose.

**Specialization Types:**

| Prefix | Meaning | Example |
|--------|---------|---------|
| `task:` | Optimized for a specific task | `task:tables`, `task:signatures`, `task:faces` |
| `domain:` | Trained on domain-specific data | `domain:finance`, `domain:social-media` |
| `language:` | Single-language support | `language:english`, `language:russian` |
| `general` | General-purpose (explicit) | `general` |

**Why This Matters:**

Smaller models often achieve efficiency by specializing in narrow tasks. A model marked `task:tables` will only detect tables in documents, not general objects. Users should verify that a model's specialization matches their use case.

See [Model Specialization Patterns Research](research/model-specialization-patterns.md) for detailed analysis.

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

- **Automated updates**: Daily via GitHub Actions workflow (2 AM UTC)
- **Manual curation**: Specialization tags require human review
- **Preservation**: Curated fields (specialization) are preserved during automated updates
- **Version tracking**: `lastUpdated` field in JSON metadata
- **Deployment**: Merged PRs auto-deploy to GitHub Pages

See [`model-curation-process.md`](./model-curation-process.md) for the full update workflow.

## Future Enhancements

- Integration with real-time model performance data
- Expanded environmental impact methodology  
- Support for custom model additions
- Dynamic accuracy benchmarking
- Regional energy grid impact calculations