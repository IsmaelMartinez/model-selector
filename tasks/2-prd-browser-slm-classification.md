# PRD: Browser-Based SLM for Task Classification

**Version**: 1.0  
**Date**: September 30, 2025  
**Status**: Draft  
**PRD Number**: 2  
**Related PRD**: [1-prd-mvp-model-selector.md](./1-prd-mvp-model-selector.md)

## 1. Introduction/Overview

Replace the current keyword-based task classification system with a Small Language Model (SLM) running entirely in the browser. This will improve classification accuracy while maintaining the privacy-first, no-server architecture of the MVP.

The SLM will use zero-shot classification to understand user task descriptions and map them to the appropriate AI model categories without requiring complex decision trees or extensive keyword lists.

## 2. Goals

1. **Improve Classification Accuracy**: Achieve ≥90% correct task classification (up from current ~83%)
2. **Maintain Privacy**: Keep all inference client-side with no external API calls
3. **Fast Inference**: Classify tasks in ≤10 seconds on standard hardware
4. **Simplify Codebase**: Remove complex keyword matching logic and decision trees
5. **Cross-Browser Support**: Work on Chrome, Firefox, Safari, and mobile browsers
6. **Graceful Degradation**: Fall back to keyword classification if SLM fails to load

## 3. User Stories

### Primary Users (Developers)

**US-1**: As a developer, I want more accurate task classification so that I receive relevant model recommendations.

**US-2**: As a developer, I want the classification to happen quickly (≤10s) so I don't have to wait long for results.

**US-3**: As a developer, I want my task descriptions to stay private so that sensitive project information isn't sent to external servers.

**US-4**: As a mobile developer, I want the tool to work on my phone/tablet so I can use it anywhere.

**US-5**: As a developer with slow internet, I want the tool to work offline after initial load so I can use it without connectivity.

**US-6**: As a developer with limited hardware, I want to know when the SLM can't load so I understand why classification might be less accurate.

## 4. Functional Requirements

### 4.1 Model Integration

**REQ-1**: The application MUST use Transformers.js library for browser-based inference.

**REQ-2**: The application MUST use a zero-shot classification model compatible with Transformers.js.

**REQ-3**: The recommended model is `Xenova/distilbert-base-uncased-finetuned-sst-2-english` or similar DistilBERT-based model optimized for MNLI/zero-shot tasks.

**REQ-4**: The model MUST be quantized (q4 or q8) to reduce download size and improve load time.

**REQ-5**: The model MUST use WebGPU acceleration when available, falling back to WASM if not supported.

### 4.2 Task Classification

**REQ-6**: The SLM MUST classify user input into one of the 7 primary task categories:
- Computer Vision
- Natural Language Processing
- Speech Processing
- Time Series Analysis
- Recommendation Systems
- Reinforcement Learning
- Data Preprocessing

**REQ-7**: The SLM MUST provide a confidence score for its classification.

**REQ-8**: If confidence is below 60%, the system SHOULD use the SLM result as-is (no clarification flow for MVP - deferred to future iteration).

**REQ-9**: The classification result MUST include the matched task category and subcategory (e.g., "computer_vision" → "object_detection").

### 4.3 Performance Requirements

**REQ-10**: Model initialization (download + load) MUST complete within 30 seconds on a typical broadband connection (10 Mbps).

**REQ-11**: Single task classification MUST complete within 10 seconds after model is loaded.

**REQ-12**: Total bundle size increase MUST be ≤2MB (excluding model weights which are loaded separately).

**REQ-13**: The model MUST be cached in the browser after first load for offline usage.

### 4.4 Fallback and Error Handling

**REQ-14**: If the SLM fails to load due to technical issues (browser incompatibility, network error, low memory, model loading timeout), the system MUST fall back to keyword-based classification.

**REQ-15**: The UI MUST display a notification when technical fallback occurs, with messaging: "⚠️ Using simplified classification (couldn't load AI model). Results may be less accurate."

**REQ-16**: The notification MUST be dismissible and non-intrusive (banner or toast).

**REQ-17**: The fallback notification MUST NOT appear if the SLM loads and classifies successfully.

**REQ-18**: ~~Clarification flow for low confidence~~ **DEFERRED**: Clarification questions for low confidence scenarios (<60%) moved to future iteration for MVP simplicity. SLM results will be used as-is regardless of confidence score.

### 4.5 Browser Compatibility

**REQ-19**: The application MUST work on Chrome (desktop and mobile):
- Chrome/Edge (latest 2 versions)
- Chrome Mobile (Android)
- **Cross-browser support** (Firefox, Safari, iOS) deferred to future iteration

**REQ-20**: The application MUST detect browser capabilities and choose appropriate inference backend (WebGPU > WASM).

**REQ-20a**: For non-Chrome browsers (MVP phase), display a message: "This tool is optimized for Chrome. Other browsers coming soon."

### 4.6 Loading Experience

**REQ-21**: While the SLM is initializing, the UI MUST display a loading indicator with progress information.

**REQ-22**: The loading indicator MUST show:
- "Loading AI model (one-time download)..." message
- Progress bar or spinner
- Estimated time remaining (if available)
- Indication that the model will be cached for offline use

**REQ-23**: Users MUST be able to use the keyword-based classifier while the SLM loads in the background.

**REQ-24**: The UI MUST display which classification model is currently in use:
- When using SLM: "Powered by [Model Name]" (e.g., "Powered by DistilBERT" or "Powered by BART")
- When using keyword fallback: "Using simplified classification"
- Display location: Footer or subtle badge near results

### 4.7 Data Alignment

**REQ-25**: The SLM classification labels MUST map directly to the task taxonomy in `src/lib/data/tasks.json`.

**REQ-26**: No changes to the existing task taxonomy structure are required (maintain 7 primary categories and current subcategories).

## 5. Non-Goals (Out of Scope)

**NG-1**: Training or fine-tuning custom models (use pre-trained models only).

**NG-2**: Supporting multi-task classification (one primary task per query).

**NG-3**: Cloud-based inference or API integration (remains fully client-side).

**NG-4**: Multi-language support (English only for MVP).

**NG-5**: Clarification flows for low-confidence scenarios (deferred to future iteration for MVP simplicity).

**NG-6**: Model performance benchmarking dashboard or analytics.

**NG-7**: User feedback collection on classification accuracy.

**NG-8**: Cross-browser testing and optimization (Firefox, Safari, iOS) - deferred to post-MVP.

**NG-9**: Support for Internet Explorer or browsers older than 2 versions back.

## 6. Design Considerations

### 6.1 User Interface

- **Loading State**: Show progress bar during initial model load (first visit only)
- **Processing State**: Show subtle spinner during classification (1-10s)
- **Fallback Notification**: Yellow banner at top of results: "⚠️ Using simplified classification (couldn't load AI model). Results may be less accurate."
- **Success State**: No additional UI when SLM works correctly (invisible upgrade)

### 6.2 Accessibility

- Loading states MUST have ARIA live regions for screen readers
- Progress indicators MUST be keyboard accessible
- Fallback notifications MUST be announced to screen readers

### 6.3 Mobile Experience

- Model loading MUST work on mobile browsers with limited RAM (≥2GB)
- Classification MUST work offline after model is cached
- Loading time MUST be acceptable on 4G connections (≤30s)

## 7. Technical Considerations

### 7.1 Architecture

**Primary Flow (SLM Successfully Loaded):**
```
User Input
    ↓
[Browser SLM Classifier]
    ↓
Zero-shot classification with task labels
    ↓
Task Category + Subcategory (use result regardless of confidence)
    ↓
Model Selection → Environmental Scoring → Recommendations
```

**Technical Error Fallback (SLM Failed to Load):**
```
SLM Load Error
(browser incompatibility, network error, memory limit, timeout)
    ↓
Show notification: "⚠️ Using simplified classification"
    ↓
[Keyword Classifier]
    ↓
Task Category + Subcategory
    ↓
Model Selection → Environmental Scoring → Recommendations
```

### 7.2 Implementation Approach

**Phase 1: Research & Prototyping (2-3 days)**
- Test Transformers.js with zero-shot classification models
- Evaluate model size, load time, and inference speed
- Validate accuracy on sample tasks from current test suite
- Choose optimal model and quantization settings
- **IMPORTANT**: Create ADR (Architecture Decision Record) documenting model selection rationale

**Phase 2: Integration (3-4 days)**
- Create new `BrowserSLMClassifier.js` component
- Integrate Transformers.js pipeline for zero-shot classification
- Implement fallback logic to keyword classifier
- Add loading states and progress indicators

**Phase 3: Testing & Optimization (2-3 days)**
- Test classification accuracy against existing test suite
- Optimize model loading and caching
- Test cross-browser compatibility
- Performance tuning (bundle size, inference speed)

**Phase 4: Documentation & Deployment (1-2 days)**
- Update user documentation
- Document fallback behavior
- Deploy and validate on GitHub Pages

**Total Timeline**: 8-12 days (quick iteration)

### 7.3 Technology Stack

- **ML Library**: Transformers.js v3+ (with WebGPU support)
- **Runtime**: ONNX Runtime Web (via Transformers.js)
- **Acceleration**: WebGPU (primary), WASM (fallback)
- **Model Format**: ONNX with INT4 or INT8 quantization
- **Caching**: Browser Cache API for model weights

### 7.4 Model Selection Criteria

1. **Size**: ≤100MB quantized model
2. **Speed**: ≤10s inference on mid-range hardware
3. **Accuracy**: ≥80% on NLI/zero-shot tasks
4. **Compatibility**: Full Transformers.js support
5. **License**: Open source (Apache 2.0, MIT, etc.)

**Recommended Models** (evaluate in order):
1. `Xenova/distilbert-base-uncased-mnli` - Most compatible, small size (~67M params)
2. `Xenova/bart-large-mnli` - Higher accuracy, larger size (~406M params, may be too large)
3. Any DistilBERT model fine-tuned on MNLI/NLI tasks

**IMPORTANT**: After model selection, create an Architecture Decision Record (ADR) documenting:
- Models evaluated and their performance metrics
- Selection rationale (size, speed, accuracy tradeoffs)
- Browser compatibility test results
- Quantization strategy chosen
- Expected accuracy on project test suite

### 7.5 Performance Optimization

- **Lazy Loading**: Load model on first classification request (not page load)
- **Caching**: Persist model in browser cache after first download
- **Quantization**: Use INT4 quantization (`dtype: 'q4'`) for smallest size
- **Batch Processing**: Not required (single classification per request)
- **Web Workers**: Optional - evaluate if it improves perceived performance

### 7.6 Error Scenarios

| Scenario | Behavior |
|----------|----------|
| Browser doesn't support WebGPU/WASM | Use keyword classifier, show notification |
| Model download fails (network) | Use keyword classifier, show notification |
| Model exceeds memory limit | Use keyword classifier, show notification |
| Inference timeout (>10s) | Use keyword classifier, show notification |
| Low confidence (<60%) | Use SLM result as-is (clarification flow deferred to future iteration) |

### 7.7 Data Flow

```javascript
// Simplified pseudo-code
async function classifyTask(userInput) {
  try {
    // Try SLM first
    if (slmModel.isLoaded()) {
      const result = await slmModel.classify(userInput, taskLabels);
      // Use SLM result regardless of confidence (no clarification flow for MVP)
      return result.category;
    }
  } catch (error) {
    // Technical error - fall back to keywords with notification
    console.warn('SLM classification failed, using fallback');
    showFallbackNotification();
  }
  
  // Fallback to keywords
  return keywordClassifier.classify(userInput);
}
```

## 8. Success Metrics

### 8.1 Primary Metrics

**M-1**: Classification accuracy 100% on expanded test suite (current: 83%, 29/35 passing)
- Target accounts for edge cases not currently tested
- Expanded test suite to include 50+ diverse task descriptions covering corner cases
- Include ambiguous descriptions, domain-specific jargon, multi-modal tasks, and minimal input

**M-2**: Inference time ≤10 seconds per classification (measured on median user hardware)

**M-3**: Model load time ≤30 seconds on 10 Mbps connection

**M-4**: Chrome browser compatibility (cross-browser testing deferred to future iteration)

### 8.2 Secondary Metrics

**M-5**: Fallback rate ≤10% (SLM loads successfully for ≥90% of users)

**M-6**: Bundle size increase ≤2MB (excluding model weights)

**M-7**: User satisfaction: "Classification feels more accurate" (qualitative feedback)

### 8.3 Testing Approach

1. **Unit Tests**: Test SLM wrapper functions independently
2. **Integration Tests**: Test SLM + fallback logic with sample inputs
3. **Accuracy Tests**: Expand to 50+ test cases covering:
   - **Common cases**: Standard CV, NLP, speech tasks (existing 35 tests)
   - **Edge cases**: Ambiguous descriptions requiring clarification
   - **Corner cases**: Domain-specific jargon (e.g., "fine-tune BERT embeddings")
   - **Multi-modal tasks**: Tasks spanning multiple categories
   - **Minimal input**: Short/vague descriptions (e.g., "classify things")
   - **Rare categories**: Reinforcement learning, time series edge cases
   - Target: 100% correct classification (with clarification flow if needed)
4. **Cross-Browser Tests**: Deferred to future iteration (Chrome-first for MVP)
5. **Performance Tests**: Measure load time and inference time on Chrome
6. **Clarification Flow Tests**: Test question-answer flow for low-confidence scenarios

### 8.4 Acceptance Criteria

✅ All 7 functional requirements groups (4.1-4.7) are implemented

✅ REQ-27 implemented: UI displays classification confidence scores

✅ Classification accuracy 100% on expanded test suite (50+ cases)

✅ ~~Clarification flow~~ **DEFERRED** to future iteration for MVP simplicity

✅ Inference time ≤10 seconds on test hardware (Chrome)

✅ Fallback notification displays correctly when SLM fails to load

✅ Works on Chrome desktop and mobile (cross-browser testing deferred)

✅ Model loads and caches correctly in browser

✅ No external API calls during classification

✅ UI displays which model is in use (DistilBERT/BART)

✅ ADR created documenting model selection rationale

## 9. Decisions Made

**Q-1**: ~~Should we add a "Force keyword classifier" option in settings?~~ **DECIDED**: No - keep interface simple for MVP

**Q-2**: ~~Should we display classification confidence scores to users?~~ **DECIDED**: Yes - show confidence scores to help users understand classification quality

**Q-3**: ~~Should we log SLM vs keyword classifier usage for analytics?~~ **DECIDED**: No - maintain privacy-first approach

**Q-4**: ~~Should we remember hardware limitations to avoid retrying?~~ **DECIDED**: No - let users retry (hardware/network may improve)

**Q-5**: ~~Should we allow user feedback on classification accuracy?~~ **DECIDED**: Not for MVP, but add to future enhancements

**Q-6**: ~~Do we need A/B testing before rollout?~~ **DECIDED**: No - direct deployment with fallback safety net

**Q-7**: ~~Should model be preloaded or lazy-loaded?~~ **DECIDED**: Lazy-loaded on first classification request

**Q-8**: ~~Which clarification approach for low confidence?~~ **DECIDED**: Ask 2-3 clarifying questions (REQ-18)

### Updated Requirements from Decisions

**REQ-27** (New): The UI MUST display classification confidence scores to users:
- Show percentage confidence (e.g., "85% confident this is Computer Vision")
- Display confidence level indicator (High ≥80%, Medium 60-79%, Low <60%)
- Location: Near classification result with subtle styling
- Hide confidence scores for keyword classifier fallback (not applicable)

## 10. Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Model too large (>100MB) | Slow load, high bounce rate | Use q4 quantization, test before commit |
| Browser incompatibility | Users can't use SLM | Robust fallback to keywords, clear messaging |
| Inference too slow (>10s) | Poor UX, users leave | Choose smaller model, optimize with WebGPU |
| Low accuracy (<90%) | No improvement over keywords | Test on current suite before deployment |
| Memory issues on mobile | Crashes on low-RAM devices | Detect and fallback, consider smaller model |

## 11. Future Enhancements (Post-v1.1)

**FE-1**: Add multiple SLM options (let users choose speed vs accuracy)

**FE-2**: Fine-tune SLM on project-specific task examples for higher accuracy

**FE-3**: Add multi-language support (Spanish, French, etc.)

**FE-4**: Add clarification flow for low-confidence scenarios (ask 2-3 questions when confidence <60%)

**FE-5**: Add user feedback collection on classification accuracy (from Q-5 decision)

**FE-6**: Add semantic search for model selection using embeddings

**FE-7**: Explore smaller models (Phi-3-mini, TinyLlama) for mobile optimization

**FE-8**: Expand cross-browser support (Firefox, Safari, iOS) with optimizations

## Appendix A: Research Summary

### Browser-Based SLM Landscape (September 2025)

**Transformers.js** is the industry-standard library for running ML models in browsers:
- v3+ includes WebGPU support for 100x faster inference
- 1200+ pre-converted ONNX models available
- Supports zero-shot classification pipeline
- Active development by Hugging Face

**Zero-Shot Classification** accuracy:
- DistilBERT-MNLI: ~68-72% F1 on standard benchmarks
- Target 90% accuracy is achievable for our simplified 7-category taxonomy
- Performance scales with model size and quality of task labels

**Performance Benchmarks**:
- DistilBERT (~67M params, quantized): ~2-5s inference on modern hardware
- Model load time: ~10-20s on broadband (depends on quantization)
- Mobile performance: Pixel 9 Pro uses 0.75% battery for 25 inferences

**Browser Compatibility**:
- WebGPU: Chrome 113+, Edge 113+, Firefox 133+ (behind flag)
- WASM: Universal support (all modern browsers)
- Mobile: Works on Chrome Mobile (Android) and Safari Mobile (iOS 16+)

### Hugging Face Task Taxonomy

Hugging Face organizes models into 6 main categories:
1. Multimodal
2. Natural Language Processing
3. Computer Vision
4. Audio
5. Tabular
6. Reinforcement Learning

Our taxonomy aligns well with this standard, with minor differences (we include Speech Processing, Time Series, Recommendation Systems, Data Preprocessing as separate categories).

## Appendix B: Code Simplification Opportunities

With SLM integration, we can simplify:

1. **Remove complex keyword lists**: `tasks.json` keywords become optional fallback only
2. **Simplify BrowserTaskClassifier**: Replace semantic similarity + keyword matching with single SLM call
3. **Remove manual task mappings**: Let model infer task from natural language
4. **Reduce maintenance burden**: No need to update keywords for new task types

**Lines of code reduction estimate**: ~30-40% reduction in classification logic complexity.