# Tasks for Browser-Based SLM Classification Integration

**Based on**: `2-prd-browser-slm-classification.md`  
**Timeline**: 6-8 days (simplified without clarification flow)  
**Target**: 100% classification accuracy with 10s inference time  

## Parent Task 1: Research & Model Selection (2-3 days)
- [x] 1.1 Install and test Transformers.js v3+ integration in development environment
- [ ] 1.2 Evaluate `Xenova/distilbert-base-uncased-mnli` performance (size, load time, accuracy)
- [ ] 1.3 Evaluate `Xenova/bart-large-mnli` as alternative option (if DistilBERT insufficient)
- [ ] 1.4 Test zero-shot classification with current task taxonomy (7 categories)
- [ ] 1.5 Benchmark inference time on target hardware (Chrome desktop/mobile)
- [ ] 1.6 Test model quantization options (q4, q8) for optimal size/performance balance
- [ ] 1.7 Validate WebGPU vs WASM performance on Chrome
- [ ] 1.8 Run accuracy tests against existing 35-test classification suite
- [ ] 1.9 Create ADR (Architecture Decision Record) documenting model selection rationale
- [ ] 1.10 Expand test suite to 50+ cases covering edge cases and corner cases

## Parent Task 2: Core SLM Integration (3-4 days)
- [ ] 2.1 Create new `BrowserSLMClassifier.js` component with Transformers.js pipeline
- [ ] 2.2 Implement zero-shot classification with confidence scoring (REQ-7)
- [ ] 2.3 Add model caching using Browser Cache API (REQ-13)
- [ ] 2.4 Integrate SLM classifier into existing `BrowserTaskClassifier.js` as primary method
- [ ] 2.5 Implement lazy loading for model initialization (load on first classification request)
- [ ] 2.6 Add WebGPU detection and automatic backend selection (WebGPU > WASM)
- [ ] 2.7 Map SLM classification results to existing task taxonomy structure
- [ ] 2.8 Ensure classification results include category and subcategory (REQ-9)
- [ ] 2.9 Add model performance monitoring and statistics tracking
- [ ] 2.10 Bundle size optimization to stay under 2MB increase (excluding model weights)

## ~~Parent Task 3: Clarification Flow~~ **DEFERRED** to Future Iteration
**Moved to Future Enhancement**: Clarification questions for low-confidence scenarios deferred for MVP simplicity. SLM results will be used as-is regardless of confidence score.

## Parent Task 3: Fallback & Error Handling (1-2 days)
- [ ] 3.1 Implement technical error detection (browser compatibility, network, memory, timeout)
- [ ] 3.2 Create fallback notification component for SLM load failures (REQ-15)
- [ ] 3.3 Add dismissible banner/toast for "⚠️ Using simplified classification" message
- [ ] 3.4 Ensure keyword classifier is used when SLM fails to load (REQ-14)
- [ ] 3.5 Add browser compatibility detection (Chrome vs non-Chrome message)
- [ ] 3.6 Implement graceful degradation for unsupported browsers (REQ-20a)
- [ ] 3.7 Add proper error logging without exposing sensitive information
- [ ] 3.8 Test error scenarios: network failures, memory limits, timeouts
- [ ] 3.9 Ensure fallback notification only appears for technical failures
- [ ] 3.10 Add retry mechanism for transient errors (network timeouts)

## Parent Task 4: Loading Experience & UI Enhancements (2-3 days)
- [ ] 4.1 Create `ModelLoadingIndicator.svelte` component with progress tracking
- [ ] 4.2 Add "Loading AI model (one-time download)..." message (REQ-22)
- [ ] 4.3 Implement progress bar or spinner for model initialization
- [ ] 4.4 Add estimated time remaining for model download (if available from Transformers.js)
- [ ] 4.5 Display caching information: "Model will be cached for offline use"
- [ ] 4.6 Allow keyword classifier use while SLM loads in background (REQ-23)
- [ ] 4.7 Add model status indicator: "Powered by DistilBERT" or "Powered by BART" (REQ-24)
- [ ] 4.8 Implement confidence score display for users (REQ-27): percentage and level
- [ ] 4.9 Add subtle styling for confidence levels (High ≥80%, Medium 60-79%, Low <60%)
- [ ] 4.10 Update existing UI components to show which classifier is active
- [ ] 4.11 Hide confidence scores when using keyword classifier fallback
- [ ] 4.12 Add loading states for classification inference (1-10 second processing)

## Parent Task 5: Testing & Validation (2-3 days)
- [ ] 5.1 Expand classification test suite to 50+ test cases covering edge cases
- [ ] 5.2 Add test cases for domain-specific jargon (e.g., "fine-tune BERT embeddings")
- [ ] 5.3 Add test cases for multi-modal tasks spanning multiple categories
- [ ] 5.4 Add test cases for minimal input (e.g., "classify things")
- [ ] 5.5 Add test cases for rare categories (reinforcement learning, time series)
- [ ] 5.6 Run comprehensive accuracy validation targeting 100% correct classification
- [ ] 5.7 Test performance benchmarks: 30s load time, 10s inference time
- [ ] 5.8 Test fallback scenarios with simulated browser incompatibility
- [ ] 5.9 Test model caching and offline functionality
- [ ] 5.10 Validate Chrome desktop and mobile compatibility
- [ ] 5.11 Test bundle size increase stays under 2MB
- [ ] 5.12 Load testing with concurrent users (if applicable)
- [ ] 5.13 Test SLM behavior with various confidence levels (no clarification needed)

## Parent Task 6: Integration & Deployment (1-2 days)
- [ ] 6.1 Integrate SLM classifier into main application workflow (`+page.svelte`)
- [ ] 6.2 Update task classification logic to prioritize SLM over existing methods
- [ ] 6.3 Ensure smooth integration with existing ModelSelector component
- [ ] 6.4 Add proper error boundaries to prevent application crashes
- [ ] 6.5 Update application initialization to handle SLM setup
- [ ] 6.6 Test end-to-end user flow: input → SLM classification → recommendations
- [ ] 6.7 Validate that environmental scoring still works with SLM results
- [ ] 6.8 Performance testing on GitHub Pages hosting environment
- [ ] 6.9 Update package.json with Transformers.js dependencies
- [ ] 6.10 Validate production build works with SLM integration
- [ ] 6.11 Deploy and test on GitHub Pages with real user scenarios
- [ ] 6.12 Monitor initial user feedback and system performance

## Relevant Files

### New Files to Create
- `src/lib/classification/BrowserSLMClassifier.js` - Main SLM integration with Transformers.js
- `src/components/ModelLoadingIndicator.svelte` - Loading states for model initialization
- `src/components/FallbackNotification.svelte` - Error/fallback notifications
- `src/lib/utils/ModelCache.js` - Browser caching utilities for model weights
- `src/lib/utils/BrowserDetection.js` - Browser compatibility detection utilities
- `docs/adr/ADR-001-SLM-Model-Selection.md` - Architecture Decision Record
- `src/lib/testing/SLMTestSuite.js` - Expanded test cases for SLM validation

### Files to Modify
- `src/lib/classification/BrowserTaskClassifier.js` - Integrate SLM as primary classification method
- `src/routes/+page.svelte` - Add SLM initialization and loading states
- `src/components/TaskInput.svelte` - Add support for classification while SLM loads
- `src/components/RecommendationDisplay.svelte` - Display confidence scores and model used
- `package.json` - Add @huggingface/transformers dependency
- `vite.config.js` - Configure build for Transformers.js compatibility
- `src/lib/data/tasks.json` - Possibly update for SLM label mapping (if needed)

### Dependencies to Add
- `@huggingface/transformers` - Core Transformers.js library for browser inference
- Ensure ONNX Runtime Web compatibility (typically bundled with Transformers.js)

## Notes

### Implementation Priority
1. **Phase 1** (Tasks 1-2): Research and core SLM integration - foundation for everything else
2. **Phase 2** (Task 3): Technical error handling and fallback
3. **Phase 3** (Tasks 4-5): UI enhancements and comprehensive testing
4. **Phase 4** (Task 6): Final integration and deployment

**Note**: Clarification flow for low-confidence scenarios has been deferred to future iteration for MVP simplicity.

### Architecture Patterns to Follow
- **Dependency Injection**: Pass SLM classifier instance to components that need it
- **Progressive Enhancement**: Keep keyword classifier as reliable fallback
- **Error Boundaries**: Wrap SLM operations in try-catch with graceful degradation
- **Lazy Loading**: Don't block app initialization with model loading
- **Caching Strategy**: Browser Cache API for model persistence, localStorage for preferences

### Performance Considerations
- **Bundle Size**: Keep core app under 2MB increase (model weights loaded separately)
- **Memory Management**: Dispose of model instances properly when not needed
- **Background Loading**: Allow app usage while model loads
- **Quantization**: Use q4 quantization for optimal size/performance balance

### Testing Strategy
- **Unit Tests**: Test SLM classifier components independently
- **Integration Tests**: Test full classification flow with mocked models
- **Accuracy Tests**: Comprehensive suite targeting 100% classification accuracy
- **Performance Tests**: Validate load time and inference time requirements
- **Fallback Tests**: Ensure robust error handling and graceful degradation
- **User Acceptance**: Test clarification flow with real user scenarios

### Browser Compatibility Notes
- **Chrome-First**: Primary target for MVP (desktop and mobile)
- **Graceful Degradation**: Clear messaging for non-Chrome browsers
- **WebGPU vs WASM**: Automatic detection and fallback
- **Memory Limits**: Handle low-memory devices gracefully

### Success Metrics
- **Classification Accuracy**: 100% on expanded 50+ test case suite
- **Performance**: ≤30s model load, ≤10s inference time
- **Fallback Rate**: ≤10% of users falling back to keyword classifier
- **User Experience**: Smooth SLM integration (clarification flow deferred to future)
- **Bundle Impact**: ≤2MB increase in initial load (excluding model)

### Risk Mitigation
- **Model Too Large**: Use q4 quantization, test before commit
- **Slow Inference**: Choose smaller model if needed, optimize with WebGPU
- **Browser Incompatibility**: Robust fallback to keyword classifier
- **Low Accuracy**: Validate against expanded test suite before deployment
- **Memory Issues**: Detect and fallback on low-RAM devices