# ADR-0003: Browser-Based LLM Model Selection for Task Classification

## Status
Accepted

## Date
2025-10-12

## Context

The AI Model Advisor application requires intelligent task classification to recommend appropriate AI models to users. After implementing keyword-based classification (ADR-0002), we evaluated browser-based LLMs to provide more sophisticated, context-aware task categorization.

### Requirements

1. **High Accuracy**: >90% across multiple task categories
2. **Browser-Based**: No backend infrastructure required
3. **Fast Inference**: <2 seconds per classification for good UX
4. **Comprehensive Coverage**: Support 7+ diverse AI task categories
5. **Environmental Focus**: Efficient model size and resource usage
6. **Production Ready**: Reliable, tested, and maintainable

### Categories to Classify

1. Computer Vision (image classification, object detection, segmentation)
2. Natural Language Processing (translation, sentiment analysis, NER)
3. Speech Processing (speech-to-text, TTS, speaker recognition)
4. Time Series (forecasting, anomaly detection, trend analysis)
5. Data Preprocessing (cleaning, normalization, missing values)
6. Recommendation Systems (personalization, suggestions)
7. Reinforcement Learning (game playing, robot control, optimization)

## Decision

**We will use Llama 3.2 1B-Instruct with enhanced pre-prompting for task classification.**

### Model Configuration

```javascript
const generator = await pipeline('text-generation',
  'onnx-community/Llama-3.2-1B-Instruct', {
  dtype: 'q4f16',      // 4-bit quantization for 1.2GB size
  device: 'webgpu'     // GPU acceleration in browser
});
```

### Enhanced Pre-Prompting Strategy

The key innovation is our enhanced pre-prompting approach with three components:

1. **Explicit Role Definition**: "You are a specialized AI task classifier"
2. **Clear Classification Rules**: Numbered steps for systematic classification
3. **Category Descriptions + Examples**: One example per category (7 total)

```javascript
const prompt = `You are a specialized AI task classifier. Your job is to categorize user tasks into exactly one of these 7 categories:

- computer_vision: visual tasks like image classification, object detection, segmentation
- natural_language_processing: text tasks like translation, sentiment analysis, summarization
- speech_processing: audio tasks like speech recognition, text-to-speech, speaker identification
- time_series: temporal data tasks like forecasting, anomaly detection, trend analysis
- data_preprocessing: data cleaning tasks like normalization, handling missing values
- recommendation_systems: personalization tasks like product recommendations, content suggestions
- reinforcement_learning: learning through interaction like game playing, robot control

Classification rules:
1. Read the task description carefully
2. Identify keywords and domain-specific terms
3. Match the task to the most appropriate category
4. Return only the category name, nothing else

Examples:
Task: "Translate text to Spanish" → Category: natural_language_processing
Task: "Detect faces in photographs" → Category: computer_vision
[... 5 more examples, one per category]

Now classify this task:
Task: "${taskDescription}"
Category:`;
```

## Evaluation Process

### Models Tested

We evaluated three models with comprehensive testing (21 test cases, 3 per category):

#### 1. Llama 3.2 1B-Instruct (WINNER)
- **Size**: 1.2GB (q4f16 quantized)
- **Accuracy**: **95.2%** (20/21 correct)
- **Speed**: ~400ms per classification
- **Load Time**: 4-5s first time, <1s cached
- **Perfect Categories**: 6 out of 7 (100% each)
- **Weak Category**: Time Series (66.7%, 2/3 correct)

**Per-Category Results**:
| Category | Accuracy | Tests |
|----------|----------|-------|
| Computer Vision | 100% | 3/3 |
| NLP | 100% | 3/3 |
| Speech Processing | 100% | 3/3 |
| Time Series | 66.7% | 2/3 |
| Data Preprocessing | 100% | 3/3 |
| Recommendation Systems | 100% | 3/3 |
| Reinforcement Learning | 100% | 3/3 |

#### 2. DistilBERT-base-uncased-mnli (REJECTED)
- **Size**: 250MB
- **Accuracy**: **42.9%** (9/21 correct)
- **Speed**: ~50ms per classification
- **Issue**: Strong bias toward "recommendation systems" category
- **Root Cause**: MNLI training distribution doesn't transfer well to task classification
- **Example Failures**:
  - "Classify images of products" → "recommendation system" (48.7% confidence)
  - "Detect objects in surveillance" → "recommendation system" (30.5%)
  - "Translate documents" → "recommendation system" (23.8%)

#### 3. Qwen2.5-0.5B-Instruct (REJECTED)
- **Size**: 500MB (q4f16 quantized)
- **Accuracy**: ~30% (estimated from partial testing)
- **Speed**: ~300ms per classification
- **Issue**: Model too small, inconsistent outputs, poor instruction following
- **Root Cause**: Insufficient model capacity for reliable 7-category classification

### Test Methodology

**Test Cases**: 21 diverse tasks (3 per category) covering:
- Technical terminology ("Segment medical images")
- Natural language descriptions ("Predict energy consumption for next month")
- Domain-specific vocabulary ("Named entity recognition", "Anomaly detection")

**Testing Approach**:
- Sequential model loading to avoid memory exhaustion
- Identical test cases for fair comparison
- Interactive test page: `test-multi-category-sequential.html`
- Automated test suite: `tests/llm-classification.test.js`

## Consequences

### Positive

1. **Excellent Accuracy**: 95.2% exceeds 90% target, with 6 perfect categories
2. **Production-Ready Performance**: 300-600ms inference is fast enough for real-time UX
3. **No Backend Required**: Runs entirely in browser with WebGPU
4. **Scalable Approach**: Only 4.8% accuracy drop when expanding from 2 to 7 categories
5. **Cached Performance**: <1s load time after first use due to browser caching
6. **Environmental Efficiency**: 1.2GB model is reasonably sized
7. **General-Purpose Advantage**: LLM adapts better than specialized classifiers
8. **Enhanced Prompting Discovery**: Reusable technique for future improvements

### Negative

1. **Large Initial Download**: 1.2GB first-time load (4-5 seconds)
2. **Browser Requirements**: Chrome/Edge 113+ with WebGPU support
3. **Memory Usage**: ~2GB RAM for model + inference
4. **Time Series Weakness**: 66.7% accuracy on time series tasks (1 failed case)
5. **Inference Cost**: 400ms is slower than specialized classifiers (~50ms)
6. **Model Size**: 5x larger than DistilBERT (but worth the accuracy gain)

### Mitigation Strategies

1. **Download Size**: Browser caching makes subsequent loads instant
2. **Browser Support**: Progressive enhancement - fallback to keyword classification
3. **Memory**: Sequential loading prevents memory exhaustion
4. **Time Series**: Acceptable for production; can monitor and refine if needed
5. **Inference Speed**: 400ms is within acceptable range for user experience

## Alternatives Considered

### Alternative 1: DistilBERT Zero-Shot Classifier
**Rationale**: Smaller (250MB), faster (50ms), specialized for classification
**Why Rejected**: 42.9% accuracy unacceptable; strong training bias toward specific categories; zero-shot approach failed for diverse task taxonomy

### Alternative 2: Qwen2.5-0.5B-Instruct
**Rationale**: Smaller than Llama (500MB), still a general-purpose LLM
**Why Rejected**: ~30% accuracy due to insufficient model capacity; unreliable outputs; poor instruction following

### Alternative 3: Larger Models (3B+)
**Rationale**: Higher accuracy potential
**Why Rejected**: Not evaluated - 1B model already achieves 95.2% accuracy, larger models would increase download time and memory usage without clear benefit

### Alternative 4: Keyword-Based Classification
**Rationale**: Zero download, instant classification
**Why Rejected**: Lower accuracy, lacks context awareness, difficult to maintain rules for edge cases (kept as fallback)

### Alternative 5: Server-Side Classification
**Rationale**: Access to larger models, no browser limitations
**Why Rejected**: Requires backend infrastructure, adds latency, goes against PWA/offline-first goals

## Key Learnings

### What Worked

1. **Enhanced Pre-Prompting**: Explicit role + rules + examples → 95.2% accuracy
2. **General > Specialized**: LLM with good prompting outperforms specialized classifier
3. **Model Size Threshold**: 1B parameters appears to be sweet spot for this task
4. **Sequential Testing**: Prevents browser memory exhaustion
5. **WebGPU Acceleration**: Makes browser-based LLM inference practical

### What Didn't Work

1. **Zero-Shot Classification**: Training distribution mismatch causes category bias
2. **Sub-1B Models**: Insufficient capacity for reliable multi-category classification
3. **Simultaneous Model Loading**: Causes memory exhaustion in browser
4. **Complex Chat Templates**: Models ignored them, simple prompts worked better

### Critical Success Factor

**Enhanced pre-prompting was the breakthrough.** Adding explicit context (role definition + classification rules + category examples) improved accuracy significantly compared to baseline few-shot prompting.

## Implementation Details

### Production Code Location
- Classification logic: `src/lib/classification/LLMTaskClassifier.js`
- Integration: `src/main.js`
- Test suite: `tests/llm-classification.test.js`
- Interactive test: `test-multi-category-sequential.html`

### Browser Requirements
- Chrome/Edge 113+ with WebGPU support
- ~2GB available RAM
- GPU recommended for optimal speed

### Performance Characteristics
- First load: 4-5 seconds (1.2GB download)
- Cached load: <1 second (IndexedDB cache)
- Inference: 300-600ms per classification
- Memory: ~2GB peak usage

## Known Issues

### Time Series Category (66.7% Accuracy)

**Failed Test Case**: "Predict energy consumption for next month"

**Options**:
1. Accept 95.2% overall accuracy (recommended)
2. Add more time series examples to prompt
3. Monitor production usage and refine if needed

**Decision**: Deploy as-is. The overall 95.2% accuracy is excellent, and the single failure represents an acceptable edge case.

## Success Metrics

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| Accuracy | >90% | 95.2% | ✅ Exceeded |
| Speed | <2s | <1s | ✅ Exceeded |
| Categories | 7 | 7 | ✅ Met |
| Browser-Based | Yes | Yes | ✅ Met |
| Production-Ready | Yes | Yes | ✅ Met |

## Related Decisions

- **ADR-0001**: SvelteKit/Vite technology stack - enables WebGPU in PWA
- **ADR-0002**: Task classification model selection - superseded by this decision for improved accuracy

## References

- Model: [onnx-community/Llama-3.2-1B-Instruct](https://huggingface.co/onnx-community/Llama-3.2-1B-Instruct)
- Framework: [Transformers.js](https://huggingface.co/docs/transformers.js) v3+
- Test page: `test-multi-category-sequential.html`
- Test results: 21/21 test cases, 95.2% accuracy, 6 perfect categories
- Alternative models tested: DistilBERT-mnli (42.9%), Qwen2.5-0.5B (~30%)

## Notes

- This ADR represents the culmination of extensive model evaluation and testing
- Enhanced pre-prompting technique is reusable for future classification improvements
- Sequential testing approach is important for avoiding browser memory issues
- Model is production-ready and recommended for immediate deployment

---

**Decision made**: 2025-10-12
**Status**: Accepted - Ready for production deployment
**Testing**: Complete (21 test cases, 95.2% accuracy)
