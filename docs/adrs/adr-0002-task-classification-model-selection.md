# ADR-0002: Task Classification Model Selection

## Status
Accepted

## Context
The Model Selector MVP requires a task classification system to categorize user-provided task descriptions into appropriate ML/AI categories (computer vision, NLP, etc.). This classification drives the model recommendation engine.

Key requirements:
- Classify text descriptions into 8-12 ML task categories
- Support browser deployment or API access
- Reasonable accuracy for technical task descriptions
- Compatible with MVP constraints (offline-first, <2MB bundle target)
- Fallback mechanisms for reliability

## Decision
We will implement a **hybrid approach** with tiered classification methods:

### Primary: Zero-Shot Classification via Hugging Face API
- **Model**: `facebook/bart-large-mnli` or `MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli`
- **Deployment**: Hugging Face Inference API
- **Use Case**: High-accuracy classification for online scenarios

### Secondary: Client-Side Semantic Similarity  
- **Model**: `all-MiniLM-L6-v2` sentence transformer
- **Deployment**: Browser-based with pre-computed category embeddings
- **Use Case**: Offline fallback with good generalization

### Tertiary: Keyword-Based Fallback
- **Implementation**: Simple keyword matching against predefined patterns
- **Use Case**: Ultimate fallback when other methods fail

## Consequences

### Positive:
- **High Accuracy**: Zero-shot classification provides excellent results for complex task descriptions
- **Offline Capability**: Semantic similarity matching works without internet
- **Reliability**: Multiple fallback layers ensure system always provides results
- **Scalability**: Easy to add new categories without retraining
- **Privacy**: Client-side options don't send data to external services

### Negative:
- **API Dependency**: Primary method requires Hugging Face API access and key
- **Complexity**: Multiple classification methods increase implementation complexity
- **Bundle Size**: Sentence transformer models add ~10-15MB to bundle
- **Latency**: API calls introduce network dependency and latency

## Alternatives Considered

### Pure Client-Side Transformers.js
- **Model**: DistilBERT-based zero-shot classification
- **Rejected**: 60+ MB model size exceeds bundle constraints
- **Alternative Use**: Potential future optimization with WebGPU acceleration

### OpenAI/Anthropic APIs
- **Rejected**: Cost prohibitive for MVP, introduces vendor lock-in
- **Note**: Could be premium tier option in future

### Pure Keyword Matching
- **Rejected**: Insufficient accuracy for technical task descriptions
- **Use**: Retained as final fallback only

## Implementation Plan

### Phase 1: API Integration (Task 1.2-1.4)
1. Test Hugging Face Inference API access and authentication
2. Implement zero-shot classification with predefined categories
3. Create error handling and rate limiting

### Phase 2: Client-Side Fallback (Task 2.4)
1. Integrate sentence transformers for semantic similarity
2. Pre-compute category embeddings
3. Implement similarity threshold logic

### Phase 3: Keyword Fallback (Task 4.5)
1. Define keyword patterns for each category
2. Implement simple matching algorithm
3. Integration with main classification pipeline

## Task Categories (Initial Set)
- computer vision
- natural language processing
- object detection and tracking
- sentiment analysis and text classification
- text generation and language modeling
- time series analysis and forecasting
- speech recognition and processing
- recommendation systems
- reinforcement learning
- data preprocessing and feature engineering

## Success Metrics
- Classification accuracy >80% on manual test set
- Response time <3 seconds for online scenarios
- Offline functionality maintains >70% accuracy
- System availability >99% with fallback mechanisms

## Dependencies
- Hugging Face Inference API account and key
- sentence-transformers browser compatibility
- Service worker for offline embedding storage

## Future Considerations
- Integration of local SLM via WebGPU/WebAssembly
- Model fine-tuning on domain-specific task descriptions
- A/B testing different model combinations
- Cost optimization for API usage