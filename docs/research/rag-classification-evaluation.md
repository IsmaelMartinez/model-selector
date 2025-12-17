# RAG Evaluation for Improved Task Classification

## Overview

This document evaluates whether Retrieval-Augmented Generation (RAG) can improve task classification quality in the Model Selector, and explores alternative approaches including requiring more input context, using smaller embedding models, or eliminating the browser LLM entirely.

## Problem Statement

### Current State
- Browser-based Llama 3.2 1B classification reports 95.2% accuracy on test cases
- Model size: ~500MB+ (quantized ONNX)
- Initial load time: 15-30 seconds on first use

### Observed Issues
1. **Vague input problem**: Short or ambiguous task descriptions lead to incorrect classifications
2. **Benchmark vs reality gap**: Test cases are well-formed; real user input is often terse
3. **Edge case handling**: Classification struggles with tasks spanning multiple categories
4. **User experience friction**: Model download and loading time is significant

### Example Problematic Inputs
| User Input | Expected | Actual Issue |
|------------|----------|--------------|
| "analyze data" | Unclear | Too vague - could be any category |
| "process images" | Computer Vision | Might classify as Data Preprocessing |
| "detect things" | Likely CV | Missing context - objects? anomalies? fraud? |
| "ML task" | Unknown | No useful signal |

## RAG Evaluation

### How RAG Could Work

```
User Input → Embedding Model → Vector Search → Retrieve Similar Examples → Augmented Context → Classification
```

**Concept**: Store embeddings of known good task descriptions and their categories. When user provides input, find the most similar examples and use them to inform classification.

### RAG Architecture for Browser

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│  ┌──────────────┐    ┌──────────────┐              │
│  │ User Input   │───→│ Embedding    │              │
│  │              │    │ Model (~23MB)│              │
│  └──────────────┘    └──────┬───────┘              │
│                             │                       │
│                             ▼                       │
│                    ┌──────────────┐                │
│                    │ Vector Store │                │
│                    │ (IndexedDB)  │                │
│                    └──────┬───────┘                │
│                           │                        │
│                           ▼                        │
│                    ┌──────────────┐                │
│                    │ Top-K Similar│                │
│                    │ Examples     │                │
│                    └──────┬───────┘                │
│                           │                        │
│                           ▼                        │
│                    ┌──────────────┐                │
│                    │ Classification│               │
│                    │ (Vote/LLM)   │                │
│                    └──────────────┘                │
└─────────────────────────────────────────────────────┘
```

### RAG Benefits
1. **Better context**: Similar examples provide classification hints
2. **Edge case handling**: Retrieve examples for ambiguous inputs
3. **Expandable**: Easy to add new examples without retraining
4. **Explainability**: Can show users "similar tasks" for transparency

### RAG Challenges
1. **Added complexity**: Vector store, embedding pipeline, retrieval logic
2. **Storage overhead**: IndexedDB for embeddings (~1-5MB depending on corpus)
3. **Two-model problem**: Still need embedding model + potentially LLM
4. **Overkill for 7 categories**: RAG shines with many categories, not few

### Browser-Specific Constraints
- **IndexedDB limits**: ~50MB practical limit, sufficient for this use case
- **Embedding model size**: 23-90MB for sentence transformers
- **No server**: All retrieval must happen client-side
- **Cold start**: First embedding model load adds latency

### RAG Verdict
**Not recommended** for current scope. The 7-category taxonomy is too small to benefit from RAG's retrieval capabilities. The added complexity doesn't justify marginal accuracy gains.

---

## Embeddings for Similarity: Background

### What Are Embeddings?

Embeddings are dense vector representations of text where **semantically similar inputs are mapped to nearby points** in high-dimensional space. This is the standard approach for:

- **Semantic search**: Find documents by meaning, not just keywords
- **Clustering**: Group similar items together automatically
- **Similarity matching**: "Is X similar to Y?"
- **Recommendation systems**: "Users who liked X also liked Y"

### How Embedding Similarity Works

```
"classify dog breeds"     →  [0.12, -0.45, 0.78, ...]  ─┐
                                                        ├── Close in vector space (similar)
"identify cat species"    →  [0.15, -0.42, 0.81, ...]  ─┘

"predict stock prices"    →  [-0.67, 0.23, -0.11, ...] ─── Far in vector space (different)
```

**Key insight**: We don't need an LLM to "understand" the task. We just need to find which known examples are most similar to the user's input.

### Why This Works for Classification

1. **Pre-label examples**: Store embeddings of known task descriptions with their categories
2. **Compare at runtime**: When user provides input, find the k most similar examples
3. **Vote by category**: The category with the most similar examples wins

This is fundamentally simpler than LLM generation and requires a much smaller model (~23MB vs ~500MB).

### Industry Standard

Embedding-based similarity is used by:
- Google Search (semantic understanding)
- OpenAI's retrieval system
- Pinecone, Weaviate, Chroma (vector databases)
- Most modern recommendation systems

---

## Validation Spikes

Before implementing embedding-based classification, we need to validate the approach with focused experiments.

### Spike 1: Embedding Model Benchmark

**Goal**: Determine which embedding model provides the best accuracy for our task taxonomy.

**Models to Test**:
| Model | Size | Notes |
|-------|------|-------|
| `Xenova/all-MiniLM-L6-v2` | ~23MB | Most popular, good baseline |
| `Xenova/bge-small-en-v1.5` | ~33MB | BAAI model, strong performance |
| `Xenova/gte-small` | ~33MB | Alibaba model, competitive |
| `Xenova/e5-small-v2` | ~33MB | Microsoft model, good for retrieval |

**Test Methodology**:
1. Generate embeddings for all examples in `tasks.json`
2. Run leave-one-out cross-validation
3. Measure: accuracy, top-3 accuracy, average similarity score
4. Test against 50+ real-world task descriptions

**Success Criteria**: >= 85% accuracy on test set with <35MB model

**Estimated Effort**: 2-3 days

### Spike 2: Similarity Threshold Calibration

**Goal**: Determine the optimal similarity threshold to distinguish "confident" from "uncertain" classifications.

**Experiments**:
1. Run classification on 100+ test cases
2. Record similarity scores for correct vs incorrect predictions
3. Plot ROC curve to find optimal threshold
4. Determine: at what similarity score does accuracy drop below 70%?

**Key Questions**:
- What similarity score corresponds to 70% confidence?
- What k value (top-k) works best? (3, 5, 7, 10?)
- Should we use weighted voting or simple majority?

**Expected Output**:
```javascript
const CONFIDENCE_THRESHOLDS = {
  high: 0.85,    // >= 85% similarity → high confidence
  medium: 0.70,  // >= 70% similarity → medium confidence  
  low: 0.70      // < 70% similarity → trigger fallback
};
```

**Estimated Effort**: 1-2 days

### Spike 3: Example Coverage Analysis

**Goal**: Determine how many examples per category are needed for reliable classification.

**Experiments**:
| Examples per Category | Expected Accuracy | Test |
|-----------------------|-------------------|------|
| 5 examples | ~70-75% | Minimum viable |
| 10 examples | ~80-85% | Baseline |
| 20 examples | ~85-90% | Good coverage |
| 50 examples | ~90-95% | Comprehensive |

**Methodology**:
1. Start with 5 examples per category (7 categories × 5 = 35 examples)
2. Measure accuracy
3. Incrementally add examples to weakest categories
4. Find diminishing returns point

**Key Questions**:
- How many examples until accuracy plateaus?
- Which categories need more examples?
- What's the storage cost vs accuracy tradeoff?

**Estimated Effort**: 2 days

### Spike 4: Cold Start Performance

**Goal**: Ensure acceptable user experience on first load.

**Measurements**:
| Device | Target Load Time | Target Inference Time |
|--------|------------------|----------------------|
| Desktop (Chrome) | <3s | <100ms |
| Mobile (Chrome) | <5s | <200ms |
| Low-end mobile | <8s | <500ms |

**Test Scenarios**:
1. First visit (cold cache)
2. Return visit (warm cache)
3. Offline mode (Service Worker)

**Lazy Loading Strategy**:
```javascript
// Only load embedding model when keyword matching fails
async function classify(input) {
  // Try keywords first (instant)
  const keywordResult = classifyWithKeywords(input);
  if (keywordResult.confidence >= 0.70) {
    return keywordResult;
  }
  
  // Lazy load embedding model
  if (!this.embedder) {
    this.embedder = await loadEmbeddingModel(); // ~23MB, 3-5s
  }
  
  return classifyWithEmbeddings(input);
}
```

**Estimated Effort**: 1-2 days

### Spike Summary

| Spike | Goal | Effort | Priority |
|-------|------|--------|----------|
| 1. Model Benchmark | Pick best embedding model | 2-3 days | High |
| 2. Threshold Calibration | Find 70% confidence cutoff | 1-2 days | High |
| 3. Example Coverage | Determine example count | 2 days | Medium |
| 4. Cold Start | Validate UX acceptable | 1-2 days | Medium |

**Total estimated effort**: 6-9 days

---

## 70% Accuracy Threshold Requirements

### Rationale

- **Below 70%**: Classification is essentially guessing; not actionable
- **70-85%**: Usable with tuning and user confirmation
- **Above 85%**: High confidence, can auto-recommend

### Classification Confidence Threshold

The classifier must report a confidence score. Behavior based on confidence:

| Confidence | Behavior |
|------------|----------|
| >= 70% | Show category-specific model recommendations |
| < 70% | Trigger generic model fallback (see next section) |

**Implementation**:
```javascript
const MINIMUM_CONFIDENCE = 0.70;

async function getRecommendations(taskDescription) {
  const classification = await classify(taskDescription);
  
  if (classification.confidence >= MINIMUM_CONFIDENCE) {
    // Show category-specific recommendations
    return {
      type: 'specific',
      category: classification.category,
      confidence: classification.confidence,
      models: await getModelsForCategory(classification.category)
    };
  } else {
    // Trigger fallback
    return {
      type: 'fallback',
      topCategories: classification.topCategories, // Top 3 with scores
      confidence: classification.confidence,
      models: getGenericModels()
    };
  }
}
```

### Model Recommendation Accuracy Filter

Filter the Hugging Face models database to **exclude models with <70% reported accuracy**.

**Rationale**:
- Models below 70% accuracy are not production-ready
- Including low-accuracy models adds noise to recommendations
- Users can't realistically tune a 50% accuracy model to be useful

**Implementation**:
```javascript
// In ModelSelector.js or model filtering logic
const MINIMUM_MODEL_ACCURACY = 0.70;

function filterModels(models) {
  return models.filter(model => {
    // If accuracy is reported, require >= 70%
    if (model.accuracy !== null && model.accuracy !== undefined) {
      return model.accuracy >= MINIMUM_MODEL_ACCURACY;
    }
    // If accuracy not reported, include but flag as "unverified"
    return true;
  });
}
```

**UI Indication**:
- Models with >= 85% accuracy: Show green badge "High Accuracy"
- Models with 70-85% accuracy: Show yellow badge "Good Accuracy"
- Models with unreported accuracy: Show gray badge "Accuracy Unknown"

---

## Generic Model Fallback Strategy

### When to Trigger Fallback

Fallback is triggered when classification confidence is below 70%.

### Fallback Behavior

1. **Show confidence transparently**: "We're X% confident this is [category]"
2. **Display top 2-3 categories**: Let user choose if classification is wrong
3. **Offer generic models**: Multi-purpose models that work across categories

### User Interface Flow

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Low Confidence Classification                           │
│                                                             │
│  We're 58% confident this is "Computer Vision"              │
│                                                             │
│  Other possibilities:                                       │
│  • Data Preprocessing (24%)                                 │
│  • Natural Language Processing (18%)                        │
│                                                             │
│  [Select a category] or [Show generic models]               │
└─────────────────────────────────────────────────────────────┘
```

### Generic Models List

When user selects "Show generic models", display multi-purpose models:

| Model | Type | Best For |
|-------|------|----------|
| GPT-4 / GPT-4o | API | General tasks, high accuracy |
| Claude 3.5 Sonnet | API | Reasoning, analysis |
| Llama 3 70B | Open | General purpose, self-hosted |
| Mistral Large | API/Open | Balanced performance |
| Gemini Pro | API | Multimodal tasks |

**Implementation**:
```javascript
const GENERIC_MODELS = [
  {
    name: 'GPT-4o',
    provider: 'OpenAI',
    type: 'api',
    description: 'Best overall accuracy for general tasks',
    environmentalImpact: 3, // Higher impact
    link: 'https://openai.com/gpt-4'
  },
  {
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic', 
    type: 'api',
    description: 'Strong reasoning and analysis capabilities',
    environmentalImpact: 3,
    link: 'https://anthropic.com/claude'
  },
  {
    name: 'Llama 3 8B',
    provider: 'Meta',
    type: 'open',
    description: 'Good balance of size and capability, self-hostable',
    environmentalImpact: 2,
    link: 'https://huggingface.co/meta-llama/Meta-Llama-3-8B'
  },
  {
    name: 'Mistral 7B',
    provider: 'Mistral AI',
    type: 'open', 
    description: 'Efficient general-purpose model',
    environmentalImpact: 1,
    link: 'https://huggingface.co/mistralai/Mistral-7B-v0.1'
  }
];

function getGenericModels() {
  return GENERIC_MODELS.sort((a, b) => 
    a.environmentalImpact - b.environmentalImpact // Smaller impact first
  );
}
```

### Confidence Reporting

Every classification result must include:

```javascript
{
  category: 'computer_vision',
  subcategory: 'object_detection',
  confidence: 0.72,              // 0-1 scale
  confidenceLevel: 'medium',     // 'high' | 'medium' | 'low'
  method: 'embedding_similarity', // How classification was made
  topCategories: [               // Always include alternatives
    { category: 'computer_vision', score: 0.72 },
    { category: 'data_preprocessing', score: 0.18 },
    { category: 'natural_language_processing', score: 0.10 }
  ],
  similarExamples: [             // For explainability
    { text: 'detect objects in images', similarity: 0.89 },
    { text: 'identify items in photos', similarity: 0.85 }
  ]
}
```

---

## Alternative Approaches

### Option A: Minimum Input Requirements

**Concept**: Require sufficient context before attempting classification.

#### Implementation
```javascript
const MIN_WORDS = 10;
const MIN_CHARACTERS = 50;

function validateInput(text) {
  const words = text.trim().split(/\s+/).length;
  const chars = text.trim().length;
  
  if (words < MIN_WORDS || chars < MIN_CHARACTERS) {
    return {
      valid: false,
      message: `Please describe your task in more detail (at least ${MIN_WORDS} words).`,
      suggestions: [
        "What type of data are you working with?",
        "What outcome do you want to achieve?",
        "What domain is this for?"
      ]
    };
  }
  return { valid: true };
}
```

#### Guided Input Prompts
When input is too short, prompt users with:
- "What type of data are you working with? (text, images, audio, numbers)"
- "What do you want to accomplish? (classify, detect, generate, predict)"
- "What is the domain? (healthcare, finance, e-commerce, research)"

#### Pros
- Zero additional model overhead
- Immediate implementation
- Better quality input = better classification
- Educational for users

#### Cons
- Friction for users who know what they want
- Some valid tasks are short ("sentiment analysis")
- Doesn't improve classifier itself

#### Verdict
**Recommended as first step**. Low effort, immediate quality improvement.

---

### Option B: Embedding Similarity (No LLM)

**Concept**: Replace LLM classification with embedding-based similarity matching.

#### How It Works
1. Precompute embeddings for all example tasks in `tasks.json`
2. When user provides input, compute its embedding
3. Find most similar examples using cosine similarity
4. Classify based on top-k matches (weighted voting)

#### Model Options
| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| `Xenova/all-MiniLM-L6-v2` | ~23MB | Fast | Good |
| `Xenova/paraphrase-MiniLM-L6-v2` | ~23MB | Fast | Good |
| `Xenova/bge-small-en-v1.5` | ~33MB | Fast | Better |
| `Xenova/gte-small` | ~33MB | Fast | Better |

#### Implementation Sketch
```javascript
import { pipeline } from '@huggingface/transformers';

class EmbeddingSimilarityClassifier {
  constructor() {
    this.embedder = null;
    this.exampleEmbeddings = null; // Precomputed
  }

  async initialize() {
    // ~23MB model, much smaller than Llama 3.2 1B
    this.embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
    
    // Load precomputed embeddings (could be bundled)
    this.exampleEmbeddings = await this.loadPrecomputedEmbeddings();
  }

  async classify(userInput) {
    const inputEmbedding = await this.embedder(userInput, {
      pooling: 'mean',
      normalize: true
    });

    // Find top-k similar examples
    const similarities = this.exampleEmbeddings.map(ex => ({
      category: ex.category,
      similarity: this.cosineSimilarity(inputEmbedding, ex.embedding)
    }));

    // Weighted voting
    const topK = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    return this.weightedVote(topK);
  }

  cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
```

#### Precomputed Embeddings
Generate embeddings for all examples at build time:
```javascript
// Build script: generate-embeddings.js
const examples = [
  { text: "classify dog breeds in photos", category: "computer_vision" },
  { text: "detect spam emails", category: "natural_language_processing" },
  { text: "predict stock prices", category: "time_series" },
  // ... all examples from tasks.json
];

// Save as JSON bundle (~100KB for 500 examples)
```

#### Pros
- **20x smaller** than Llama 3.2 1B (~23MB vs ~500MB)
- **10x faster** inference (embedding vs generation)
- Deterministic results
- Explainable (show similar examples)
- Precomputed embeddings can be bundled (no cold start for examples)

#### Cons
- Still requires model download (~23MB)
- Quality depends on example coverage
- Less flexible than LLM for novel inputs

#### Verdict
**Strongly recommended**. Best balance of accuracy, size, and simplicity.

---

### Option C: Enhanced Keyword + Rules (No Model)

**Concept**: Improve the existing rule-based classifier to handle more cases.

#### Enhancements
1. **Synonym expansion**: Map related terms to canonical keywords
2. **Phrase patterns**: Detect multi-word patterns
3. **Negative keywords**: Exclude certain matches
4. **Confidence scoring**: Better calibration

#### Implementation
```javascript
const SYNONYMS = {
  'picture': 'image',
  'photo': 'image',
  'photograph': 'image',
  'pic': 'image',
  'video': 'image',
  'words': 'text',
  'sentences': 'text',
  'document': 'text',
  'article': 'text',
  'forecast': 'predict',
  'estimate': 'predict',
  // ...
};

const PHRASE_PATTERNS = [
  { pattern: /object\s+detection/i, category: 'computer_vision', subcategory: 'object_detection' },
  { pattern: /sentiment\s+analysis/i, category: 'natural_language_processing', subcategory: 'sentiment_analysis' },
  { pattern: /time\s+series/i, category: 'time_series' },
  { pattern: /speech\s+to\s+text/i, category: 'speech_processing' },
  // ...
];

function classifyWithRules(input) {
  const normalized = expandSynonyms(input.toLowerCase());
  
  // Try phrase patterns first (highest confidence)
  for (const { pattern, category, subcategory } of PHRASE_PATTERNS) {
    if (pattern.test(normalized)) {
      return { category, subcategory, confidence: 0.95, method: 'phrase_pattern' };
    }
  }
  
  // Fall back to keyword matching
  return keywordMatch(normalized);
}
```

#### Pros
- **Zero download**: Instant classification
- **Predictable**: Same input always gives same output
- **Debuggable**: Easy to understand why classification happened
- **Fast**: Sub-millisecond classification

#### Cons
- Limited to predefined patterns
- Requires manual maintenance
- Misses semantic similarity
- Can't handle novel phrasings

#### Verdict
**Recommended as baseline fallback**. Perfect for clear-cut cases.

---

### Option D: Hybrid Approach (Recommended)

**Concept**: Tiered system that escalates complexity only when needed.

#### Architecture
```
User Input
    │
    ▼
┌───────────────────┐
│ Input Validation  │ ─── Too short? → Request more detail
│ (min 10 words)    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Phrase Patterns   │ ─── Match? → High confidence result
│ (instant)         │
└─────────┬─────────┘
          │ No match
          ▼
┌───────────────────┐
│ Keyword Matching  │ ─── High confidence? → Return result
│ (instant)         │
└─────────┬─────────┘
          │ Low confidence
          ▼
┌───────────────────┐
│ Embedding         │ ─── Find similar examples
│ Similarity        │     Return weighted result
│ (~23MB model)     │
└───────────────────┘
```

#### Key Design Decisions
1. **Lazy model loading**: Only download embedding model if keyword matching fails
2. **Progressive disclosure**: Start simple, add complexity only when needed
3. **User feedback loop**: Low confidence triggers clarification request

#### Implementation Phases

**Phase 1**: Input validation + enhanced keywords (no model changes)
- Add minimum input requirements
- Improve keyword/phrase patterns
- Add clarification prompts

**Phase 2**: Embedding similarity (optional model)
- Replace Llama 3.2 1B with MiniLM (~23MB)
- Precompute example embeddings
- Lazy load on first low-confidence classification

**Phase 3**: User-driven improvements
- Collect anonymized failure cases (opt-in)
- Add new examples based on real usage
- Refine patterns based on feedback

---

## Comparison Matrix

| Approach | Model Size | Load Time | Accuracy Potential | Complexity | Browser Fit |
|----------|------------|-----------|-------------------|------------|-------------|
| Current (Llama 3.2 1B) | ~500MB | 15-30s | 95%+ | Medium | Poor |
| Full RAG | ~500MB+ | 20-40s | 97%+ | High | Poor |
| Embedding Similarity | ~23MB | 3-5s | 90-95% | Low | Good |
| Enhanced Keywords | 0MB | 0s | 80-90% | Low | Excellent |
| **Hybrid (Recommended)** | 0-23MB | 0-5s | 90-95% | Medium | Good |

---

## Recommendations

### Immediate Actions (Phase 1)
1. **Add input validation**: Require minimum 10 words or 50 characters
2. **Implement clarification flow**: Prompt users for more context when input is vague
3. **Enhance phrase patterns**: Add more regex patterns for common task types
4. **Add confidence reporting**: Every classification must report confidence score

### Validation Phase (Spikes)
1. **Execute Spike 1**: Benchmark embedding models (MiniLM, BGE, GTE, E5)
2. **Execute Spike 2**: Calibrate 70% confidence threshold
3. **Execute Spike 3**: Determine optimal example count per category
4. **Execute Spike 4**: Validate cold start performance

### Short-term (Phase 2)
1. **Replace Llama 3.2 1B**: With best embedding model from Spike 1 (~23MB)
2. **Implement 70% threshold**: Classification confidence and model accuracy filtering
3. **Add generic fallback**: Show multi-purpose models when confidence < 70%
4. **Precompute embeddings**: Bundle example embeddings with the app

### Model Database Updates
1. **Filter models < 70% accuracy**: Remove from recommendations
2. **Add accuracy badges**: Visual indicators for model quality
3. **Include generic models**: Add GPT-4, Claude, Llama 3, Mistral to fallback list

### Future Consideration
- **Add user feedback**: Anonymous collection of low-confidence cases
- **Expand example corpus**: Based on real-world usage patterns
- **Consider server-side**: For users who opt-in, API-based classification for edge cases

---

## Conclusion

**RAG is overkill** for a 7-category classification system. The complexity and model size don't justify marginal accuracy improvements.

**The recommended path**:
1. Start with input validation and enhanced rules (zero model overhead)
2. Run validation spikes to confirm embedding approach viability
3. Replace Llama 3.2 1B with a ~23MB embedding model
4. Enforce 70% accuracy threshold for both classification and model recommendations
5. Provide generic model fallback with transparent confidence reporting

**Key thresholds**:
- **70% minimum**: For classification confidence and model accuracy
- **23MB target**: For embedding model size (vs 500MB+ current)
- **<5s target**: For cold start load time

This aligns with the project's core principle: **"Smaller is better"**.

---

**Date**: 2025-12-15  
**Author**: Development Team  
**Status**: Research Complete - Ready for Implementation Decision

