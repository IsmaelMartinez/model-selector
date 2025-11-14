# PRD: Accuracy Improvements - Filtering, Ensemble & Clarifications

**Version**: 1.0
**Date**: November 14, 2025
**Status**: Draft
**PRD Number**: 3
**Related PRDs**:
- [1-prd-mvp-model-selector.md](./1-prd-mvp-model-selector.md)
- [2-prd-browser-slm-classification.md](./2-prd-browser-slm-classification.md)

## 1. Introduction/Overview

Enhance the AI Model Selector with three complementary accuracy improvements:

1. **Model Filtering**: Allow users to filter models by accuracy threshold (e.g., ≥75%)
2. **Ensemble Classification**: Optional 5x parallel classification with majority voting for higher accuracy
3. **Smart Clarifications**: Ask clarifying questions when classification is uncertain

These features leverage existing infrastructure (Llama 3.2 1B-Instruct already loaded, model accuracy data already in `models.json`) while maintaining the privacy-first, client-side architecture.

## 2. Goals

1. **Empower Users**: Let users filter models by quality metrics (accuracy threshold)
2. **Improve Accuracy**: Achieve 98%+ classification accuracy for users who opt into ensemble mode
3. **Handle Ambiguity**: Gracefully resolve uncertain classifications through clarifying questions
4. **Maintain Performance**: Keep fast mode responsive (<1s) while offering accurate mode option
5. **Preserve Privacy**: All processing remains client-side, no external API calls
6. **Environmental Efficiency**: Minimize resource usage by making ensemble mode opt-in

## 3. User Stories

### Primary Users (Developers)

**US-1**: As a developer, I want to filter models by accuracy so that I only see high-quality models that meet my requirements.

**US-2**: As a developer working on a critical project, I want a "high accuracy mode" so that I can be more confident in the recommendations, even if it takes a bit longer.

**US-3**: As a developer with an ambiguous task, I want the tool to ask me clarifying questions so that it recommends the right model category.

**US-4**: As a developer, I want to see how confident the system is in its classification so that I can judge if the recommendations are reliable.

**US-5**: As a developer with a clear task, I want fast results without extra questions so that I can get recommendations quickly.

**US-6**: As a developer, I want to adjust the accuracy threshold so that I can balance between seeing all options vs only top-tier models.

## 4. Functional Requirements

### 4.1 Phase 1: Model Accuracy Filtering

**REQ-1**: The application MUST display an accuracy filter control in the UI.

**REQ-2**: The filter MUST allow users to set a minimum accuracy threshold using a slider (range: 50% - 95%).

**REQ-3**: The default accuracy threshold MUST be 0% (show all models).

**REQ-4**: When a threshold is set, the application MUST hide models with accuracy below the threshold in the recommendations display.

**REQ-5**: The UI MUST show a count of hidden models (e.g., "Showing 3 models (2 hidden by accuracy filter)").

**REQ-6**: The filter setting MUST persist in browser localStorage so users don't have to reset it each session.

**REQ-7**: The accuracy value MUST be displayed for each recommended model in the results.

**REQ-8**: The filter MUST work independently for each tier (lightweight/standard/advanced).

**REQ-9**: If filtering removes all models in a tier, display a message: "No models meet your accuracy threshold. Try lowering the filter."

**REQ-10**: The accuracy filter MUST be accessible via keyboard (slider with arrow key support).

### 4.2 Phase 2: Ensemble Classification Mode

**REQ-11**: The application MUST provide a toggle control for "Accuracy Mode" with two options:
- **Fast** (default): Single classification (~400ms)
- **Ensemble**: 5x parallel classification with voting (~2s)

**REQ-12**: In Ensemble mode, the application MUST run 5 parallel classifications with the same Llama 3.2 model using slightly different prompts/temperatures.

**REQ-13**: The ensemble results MUST use majority voting to determine the final classification.

**REQ-14**: The application MUST display ensemble confidence score showing agreement level:
- **High Confidence**: 5/5 or 4/5 agree
- **Medium Confidence**: 3/5 agree
- **Low Confidence**: 2/5 agree (no majority)

**REQ-15**: The confidence score MUST be displayed prominently in the results UI.

**REQ-16**: The Accuracy Mode preference MUST persist in browser localStorage.

**REQ-17**: When ensemble mode is processing, display a progress indicator showing "Running 5 classifications..." with visual progress.

**REQ-18**: If no majority exists (2/5 vs 2/5 vs 1/5 split), the system MUST trigger the clarification flow (see Phase 3).

**REQ-19**: Ensemble mode MUST work with the existing cached Llama 3.2 model (no additional downloads).

**REQ-20**: The UI MUST show estimated time for each mode:
- Fast: "~0.5 seconds"
- Ensemble: "~2-3 seconds"

### 4.3 Phase 3: Smart Clarification Flow

**REQ-21**: When classification confidence is Low (no majority in ensemble, or <60% in fast mode), the system MUST offer clarification questions.

**REQ-22**: The clarification flow MUST be optional - users can click "Skip clarification, use best guess" to proceed with the highest-voted category.

**REQ-23**: The application MUST use Llama 3.2 to generate 2-3 contextual clarifying questions based on the user's original input and the ambiguous categories.

**REQ-24**: Clarification questions MUST be multiple choice or yes/no format for quick answering.

**REQ-25**: Example clarifying questions:
- "Will your model work with images, text, or audio?"
- "Are you building this for real-time or batch processing?"
- "Do you need to generate new content or analyze existing content?"

**REQ-26**: After user answers clarification questions, the system MUST re-run classification incorporating the answers.

**REQ-27**: The clarification UI MUST show why questions are being asked (e.g., "We're not sure if this is Computer Vision or NLP. Please help us understand:").

**REQ-28**: Users MUST be able to go back and change their answers before final classification.

**REQ-29**: The number of clarification questions MUST be kept minimal (2-3 max) to avoid decision fatigue.

**REQ-30**: Clarification flow MUST have a timeout - if user doesn't answer within 30 seconds, auto-proceed with best guess.

**REQ-31**: The final classification after clarification MUST show "Classification refined with your input" indicator.

### 4.4 UI/UX Requirements

**REQ-32**: All new controls (filter slider, mode toggle) MUST follow existing design system and accessibility standards.

**REQ-33**: The accuracy filter MUST have a "Reset" button to quickly return to 0% threshold.

**REQ-34**: The UI MUST provide tooltips/help text explaining:
- What the accuracy metric means
- What ensemble mode does and when to use it
- Why clarification questions are being asked

**REQ-35**: All new UI elements MUST be fully keyboard accessible with proper ARIA labels.

**REQ-36**: The clarification flow MUST work on mobile devices with touch-friendly controls.

**REQ-37**: Loading states MUST be clear and informative during ensemble processing.

### 4.5 Testing & Quality Requirements

**REQ-38**: Fix all 6 currently failing tests (4 task classification + 2 integration tests).

**REQ-39**: Add new tests for:
- Accuracy filtering logic
- Ensemble voting algorithm
- Clarification question generation
- Edge cases (all models filtered out, tie votes, etc.)

**REQ-40**: Achieve ≥95% test pass rate across all test suites.

**REQ-41**: Add performance tests to ensure:
- Fast mode: ≤1 second total time
- Ensemble mode: ≤3 seconds total time
- Clarification generation: ≤2 seconds

### 4.6 Data & Persistence Requirements

**REQ-42**: User preferences MUST persist across sessions using localStorage:
- `accuracyThreshold`: number (0-95)
- `accuracyMode`: "fast" | "ensemble"
- `showAccuracyInResults`: boolean (default: true)

**REQ-43**: Model accuracy data MUST be displayed in human-friendly format (77.2% not 0.772).

**REQ-44**: Accuracy filter MUST handle models with missing/null accuracy values gracefully (treat as 0% or show separately).

## 5. Non-Goals (Out of Scope)

**NG-1**: Multi-model support (Gemini, GPT, etc.) - Deferred to future iteration.

**NG-2**: Fine-tuning or training custom models - Use existing Llama 3.2 model only.

**NG-3**: Filtering by other metrics (model size, framework, deployment options) - Focus on accuracy only.

**NG-4**: Analytics or telemetry on which modes users prefer - Maintain privacy-first approach.

**NG-5**: Advanced ensemble techniques (weighted voting, stacking, boosting) - Simple majority voting only.

**NG-6**: Saving/sharing classification results - Keep tool stateless and privacy-focused.

**NG-7**: Real-time model accuracy updates - Use existing static data in models.json.

**NG-8**: Custom accuracy thresholds per task category - Single global threshold only.

## 6. Design Considerations

### 6.1 User Interface Mockup

```
┌─────────────────────────────────────────────────────────────┐
│  AI Model Selector                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Describe your AI task:                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ I need to detect objects in surveillance footage     │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─── Settings ────────────────────────────────────────┐  │
│  │                                                      │  │
│  │  Accuracy Mode:  ◉ Fast (~0.5s)  ○ Ensemble (~2s)  │  │
│  │                                                      │  │
│  │  Minimum Accuracy:  [====●─────────] 75%  [Reset]  │  │
│  │  (Only show models with ≥75% accuracy)              │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Get Recommendations]                                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Classification: Computer Vision - Object Detection         │
│  Confidence: ⭐⭐⭐⭐⭐ High (5/5 models agree)               │
├─────────────────────────────────────────────────────────────┤
│  Showing 2 models (1 hidden by accuracy filter)             │
│                                                             │
│  🟢 Lightweight Models                                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ EfficientNet B0                            📊 77.2% │  │
│  │ Efficient CNN with excellent accuracy-to-size ratio│  │
│  │ 20.3 MB | Env Score: ⚡ | Browser, Mobile, Cloud   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  🟡 Standard Models                                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ YOLOv5s                                    📊 85.3% │  │
│  │ Real-time object detection optimized for speed     │  │
│  │ 14.1 MB | Env Score: ⚡⚡ | Browser, Mobile, Edge   │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Clarification Flow UI

```
┌─────────────────────────────────────────────────────────────┐
│  🤔 We need a bit more information                          │
├─────────────────────────────────────────────────────────────┤
│  Your task could be Computer Vision or NLP.                │
│  Please answer 2 quick questions:                           │
│                                                             │
│  1. What type of data will you work with?                  │
│     ◉ Images or video                                      │
│     ○ Text or documents                                    │
│     ○ Both images and text                                 │
│                                                             │
│  2. What is your main goal?                                │
│     ◉ Detect/recognize objects in images                   │
│     ○ Understand or generate text                          │
│     ○ Extract text from images (OCR)                       │
│                                                             │
│  [← Back]  [Skip, use best guess]  [Submit Answers →]     │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Accessibility

- Slider MUST support keyboard navigation (arrow keys, page up/down)
- Radio buttons for mode toggle MUST be keyboard accessible
- Clarification questions MUST be navigable with Tab/Shift+Tab
- Screen readers MUST announce confidence scores and filter status
- Color-blind friendly confidence indicators (use symbols + colors)

### 6.4 Mobile Experience

- Slider MUST work with touch gestures
- Clarification questions MUST have large touch targets (≥44px)
- Ensemble mode progress MUST be visible on small screens
- Settings panel MUST collapse on mobile to save space

## 7. Technical Considerations

### 7.1 Architecture

**Phase 1 Flow (Accuracy Filtering):**
```
User Input → Classification → Model Selection
                                      ↓
                            Apply Accuracy Filter (threshold from localStorage)
                                      ↓
                            Display Filtered Recommendations
```

**Phase 2 Flow (Ensemble Mode):**
```
User Input
    ↓
Check mode setting (fast vs ensemble)
    ↓
[Fast Mode]                    [Ensemble Mode]
Single classification    →     5x parallel classifications
      ↓                              ↓
  Category                    Majority voting → Category + Confidence
      ↓                              ↓
Model Selection              Model Selection
      ↓                              ↓
Apply Accuracy Filter        Apply Accuracy Filter
      ↓                              ↓
   Display                          Display
```

**Phase 3 Flow (Clarification):**
```
Classification Result
    ↓
Check confidence (fast: <60% | ensemble: no majority)
    ↓
[High Confidence]              [Low Confidence]
Proceed directly       →       Generate clarification questions (using Llama 3.2)
                                      ↓
                              User answers or skips
                                      ↓
                              Re-run classification with answers
                                      ↓
                              Model Selection → Display
```

### 7.2 Implementation Approach

**Phase 1: Model Accuracy Filtering (Week 1, 5-7 days)**

Day 1-2: UI Components
- Create `AccuracyFilter.svelte` component with slider
- Add filter controls to main page
- Implement localStorage persistence

Day 3-4: Filtering Logic
- Add filtering logic to `ModelSelector.js`
- Handle edge cases (no models pass threshold, missing accuracy data)
- Add accuracy display to recommendation cards

Day 5: Testing & Fixes
- Fix 6 failing tests
- Add new tests for filtering logic
- Document accuracy data structure

Day 6-7: Polish & Documentation
- Add tooltips and help text
- Ensure accessibility compliance
- Update user guide

**Phase 2: Ensemble Classification Mode (Week 2, 5-7 days)**

Day 1-2: Core Ensemble Logic
- Extend `BrowserTaskClassifier.js` with ensemble method
- Implement 5x parallel classification with Promise.all()
- Add majority voting algorithm

Day 3-4: UI & UX
- Create mode toggle component
- Add confidence score display
- Implement progress indicator for ensemble processing
- Add localStorage for mode preference

Day 5-6: Testing & Optimization
- Test ensemble accuracy vs single classification
- Optimize prompt variations for diversity
- Add performance tests (ensure <3s total time)
- Test edge cases (tie votes, all different results)

Day 7: Integration & Polish
- Integrate ensemble mode with existing classification flow
- Add help text explaining when to use each mode
- Update documentation

**Phase 3: Smart Clarification Flow (Week 3, 6-8 days)**

Day 1-2: Clarification Question Generation
- Extend `BrowserTaskClassifier.js` with question generation
- Use Llama 3.2 to generate contextual questions
- Design prompt template for question generation

Day 3-4: Clarification UI
- Create `ClarificationFlow.svelte` component
- Implement multi-step question flow
- Add skip/back navigation
- Add timeout mechanism

Day 5-6: Re-classification with Answers
- Implement answer incorporation into classification prompt
- Re-run classification with additional context
- Display "refined classification" indicator

Day 7-8: Testing & Refinement
- Test question quality and relevance
- Test re-classification accuracy improvement
- Optimize for mobile experience
- End-to-end testing of full flow

**Total Timeline: 3-4 weeks (16-22 days)**

### 7.3 Technology Stack

No new dependencies required! All features use existing infrastructure:

- **Framework**: SvelteKit (existing)
- **ML Model**: Llama 3.2 1B-Instruct via Transformers.js (already loaded)
- **Storage**: Browser localStorage (existing)
- **Testing**: Vitest (existing)
- **Data**: models.json already contains accuracy field

### 7.4 Data Structures

**localStorage Schema:**
```javascript
{
  "modelSelector": {
    "accuracyThreshold": 75,           // 0-95
    "accuracyMode": "ensemble",        // "fast" | "ensemble"
    "showAccuracyInResults": true      // boolean
  }
}
```

**Ensemble Result Structure:**
```javascript
{
  "category": "computer_vision",
  "subcategory": "object_detection",
  "confidence": {
    "level": "high",                   // "high" | "medium" | "low"
    "votes": {
      "computer_vision": 4,
      "natural_language_processing": 1
    },
    "total": 5,
    "percentage": 80                    // 4/5 = 80%
  },
  "needsClarification": false
}
```

**Clarification Question Structure:**
```javascript
{
  "questions": [
    {
      "id": 1,
      "text": "What type of data will you work with?",
      "type": "multiple_choice",
      "options": [
        { "id": "a", "text": "Images or video", "categories": ["computer_vision"] },
        { "id": "b", "text": "Text or documents", "categories": ["nlp"] },
        { "id": "c", "text": "Both images and text", "categories": ["computer_vision", "nlp"] }
      ]
    }
  ],
  "ambiguousCategories": ["computer_vision", "nlp"]
}
```

### 7.5 Ensemble Implementation Details

**Prompt Variation Strategies:**
```javascript
// Strategy 1: Temperature variation
const temperatures = [0.3, 0.5, 0.7, 0.9, 1.0];

// Strategy 2: Prompt rephrasing
const prompts = [
  "Classify this task: {input}",
  "What AI category does this belong to: {input}",
  "Identify the machine learning task type: {input}",
  "This task is best suited for which AI domain: {input}",
  "Categorize this AI use case: {input}"
];

// Run all 5 in parallel
const results = await Promise.all(
  temperatures.map((temp, i) =>
    classifyWithLlama(input, prompts[i], temp)
  )
);

// Majority voting
const votes = countVotes(results);
const winner = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
```

### 7.6 Performance Optimization

**Ensemble Mode:**
- Use `Promise.all()` for true parallel execution
- Reuse already-loaded Llama 3.2 model (no re-initialization)
- Target: 5x classifications in ~2 seconds (400ms each)

**Clarification Questions:**
- Generate questions asynchronously while user sees "low confidence" message
- Cache common clarification questions for frequent ambiguous pairs
- Limit to 2-3 questions max to avoid user fatigue

**Accuracy Filter:**
- Filter in-memory (no API calls)
- Use efficient array filtering methods
- Update UI reactively (Svelte stores)

### 7.7 Error Handling

| Scenario | Behavior |
|----------|----------|
| Ensemble timeout (>5s) | Fall back to single classification, show warning |
| All 5 ensemble results different | Trigger clarification flow |
| Clarification question generation fails | Show generic questions based on ambiguous categories |
| User closes clarification without answering | Use highest-voted category from ensemble |
| No models pass accuracy filter | Show message "No models meet threshold, try lowering filter" |
| Accuracy data missing for model | Display "N/A" and include in results if threshold is 0% |

## 8. Success Metrics

### 8.1 Primary Metrics

**M-1**: Classification accuracy improvement:
- Fast mode: Maintain 95.2% (current baseline)
- Ensemble mode: Achieve ≥98% on test suite

**M-2**: Test pass rate improvement:
- Current: 83% (29/35 passing)
- Target: ≥95% (at least 50/53 passing including new tests)

**M-3**: User control:
- Users can successfully filter models by accuracy threshold
- Filter correctly hides/shows models based on threshold

**M-4**: Performance:
- Fast mode: ≤1 second total time (maintained from current)
- Ensemble mode: ≤3 seconds total time
- Clarification generation: ≤2 seconds

### 8.2 Secondary Metrics

**M-5**: Ensemble adoption rate (if we add privacy-friendly local analytics in future):
- What % of users try ensemble mode?
- What % keep it enabled?

**M-6**: Clarification flow completion:
- Users complete clarification flow (vs skip)
- Re-classification accuracy after clarification ≥95%

**M-7**: User satisfaction (qualitative feedback):
- "Accuracy filter helps me find the right models"
- "Ensemble mode gives me more confidence in results"
- "Clarification questions were helpful and not annoying"

### 8.3 Testing Approach

**1. Unit Tests:**
- Majority voting algorithm (various vote distributions)
- Accuracy filtering logic (edge cases: 0%, 100%, no models, all models)
- Clarification question generation (various ambiguous category pairs)
- localStorage persistence (save/load/defaults)

**2. Integration Tests:**
- Full ensemble flow (5x classification → voting → result)
- Full clarification flow (low confidence → questions → answers → re-classify)
- Filter + ensemble interaction (filtered models with ensemble confidence)

**3. Accuracy Tests:**
- Expand test suite to 50+ cases covering:
  - Clear, unambiguous tasks (should work in fast mode)
  - Ambiguous tasks (ensemble should achieve majority)
  - Very ambiguous tasks (should trigger clarification)
  - Edge cases from current failing tests
- Target: ≥98% in ensemble mode, ≥95% in fast mode

**4. Performance Tests:**
- Measure ensemble mode total time (should be ≤3s)
- Measure clarification generation time (should be ≤2s)
- Ensure fast mode is not impacted (should remain ≤1s)

**5. Accessibility Tests:**
- Keyboard navigation through all new UI elements
- Screen reader announcements for confidence scores
- ARIA labels for slider, toggle, clarification questions

**6. Mobile Tests:**
- Touch interaction with slider
- Clarification flow on small screens
- Ensemble mode performance on mobile devices

### 8.4 Acceptance Criteria

✅ **Phase 1 Complete When:**
- Accuracy filter UI implemented and functional
- Users can set threshold from 50% to 95%
- Filter persists across sessions (localStorage)
- Accuracy displayed for each recommended model
- All 6 failing tests are fixed
- At least 33/35 existing tests passing (≥94%)

✅ **Phase 2 Complete When:**
- Ensemble mode toggle implemented
- 5x parallel classification working correctly
- Majority voting algorithm tested and accurate
- Confidence scores displayed clearly (X/5 agree)
- Mode preference persists across sessions
- Ensemble accuracy ≥98% on test suite
- Performance: Ensemble mode completes in ≤3 seconds

✅ **Phase 3 Complete When:**
- Clarification flow triggers on low confidence
- 2-3 contextual questions generated using Llama 3.2
- Users can answer, skip, or go back
- Re-classification incorporates user answers
- Clarification improves accuracy for ambiguous cases
- UI works well on both desktop and mobile
- Full accessibility compliance (keyboard + screen reader)

✅ **Overall Project Complete When:**
- All three phases implemented and tested
- Test pass rate ≥95% (including new tests)
- Documentation updated (user guide, technical docs)
- No performance regressions (fast mode still ≤1s)
- All acceptance criteria from phases 1-3 met

## 9. Decisions Made

**D-1**: **Ensemble vs Multi-Model Approach**
**DECIDED**: Use 5x same model (Llama 3.2) with variations vs loading multiple different models (Gemini, GPT, etc.)
**Rationale**:
- No additional downloads (Llama 3.2 already loaded)
- Simpler implementation and testing
- Maintains privacy-first approach (no API calls)
- Multi-model support deferred to future iteration

**D-2**: **Clarification Trigger Condition**
**DECIDED**: Trigger clarification when:
- Fast mode: Confidence <60%
- Ensemble mode: No majority (highest vote ≤2/5)
**Rationale**: Balances UX (not too many questions) with accuracy needs

**D-3**: **Default Mode**
**DECIDED**: Fast mode is default, ensemble is opt-in
**Rationale**:
- Most tasks are unambiguous and don't need ensemble
- Respects user's device resources
- Power users can enable ensemble for critical tasks

**D-4**: **Accuracy Filter Default**
**DECIDED**: Default threshold is 0% (show all models)
**Rationale**:
- Let users discover all options first
- Users can tighten filter based on their needs
- Avoids hiding potentially useful lightweight models with lower accuracy

**D-5**: **Clarification Question Count**
**DECIDED**: Maximum 2-3 questions per clarification flow
**Rationale**:
- Minimize decision fatigue
- Each question should eliminate ≥50% of ambiguity
- Users can always skip if questions are annoying

**D-6**: **Ensemble Prompt Variation Strategy**
**DECIDED**: Use combination of temperature variation (0.3-1.0) AND prompt rephrasing
**Rationale**:
- Maximizes diversity in classification attempts
- More likely to surface correct answer in voting
- Tested approach in LLM ensemble literature

**D-7**: **Clarification Question Generation**
**DECIDED**: Use Llama 3.2 to generate contextual questions vs hardcoded question bank
**Rationale**:
- More relevant questions for specific user input
- Leverages already-loaded model
- Can adapt to edge cases we didn't anticipate
- Can fall back to generic questions if generation fails

**D-8**: **Accuracy Metric Display Format**
**DECIDED**: Show percentage (77.2%) not decimal (0.772)
**Rationale**:
- More intuitive for users
- Consistent with common ML reporting conventions
- Easier to compare at a glance

**D-9**: **Filter Persistence**
**DECIDED**: Persist filter settings in localStorage (not URL params or session storage)
**Rationale**:
- Settings persist across sessions and tabs
- No URL clutter
- Matches existing privacy-first approach
- Users can clear via browser settings

**D-10**: **Test Fixes Priority**
**DECIDED**: Fix failing tests as part of Phase 1 (not as separate phase)
**Rationale**:
- Establishes accurate baseline before adding features
- Ensures new features don't break existing functionality
- Builds confidence in test suite

## 10. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| Ensemble mode too slow (>5s) | Poor UX, users avoid feature | Medium | Optimize parallel execution, add progress indicator, set clear expectations |
| Clarification questions not helpful | Users skip, no accuracy improvement | Medium | Test question quality extensively, allow skip option, limit to 2-3 questions |
| Too many clarifications asked | Decision fatigue, users abandon | Low | Set conservative threshold (only very ambiguous cases), respect skip choice |
| Ensemble voting ties (no majority) | Unclear how to proceed | Medium | Trigger clarification flow, or use highest vote with "low confidence" label |
| Filter hides all models | Users see empty results | Low | Show clear message, suggest lowering threshold, display count of hidden models |
| Llama 3.2 fails to load | No ensemble or clarification | Low | Already handled by existing fallback to keyword classifier |
| Performance regression in fast mode | Current users have worse experience | Low | Extensive performance testing, keep fast mode completely separate from ensemble |
| Accessibility issues with new UI | Excludes users with disabilities | Medium | Thorough a11y testing, follow existing component patterns, test with screen readers |
| Ensemble mode drains mobile battery | Users complain about battery usage | Low | Make it opt-in, show clear mode indicator, add help text about tradeoffs |
| localStorage quota exceeded | Settings can't be saved | Very Low | Settings are tiny (~100 bytes), clear error message if quota exceeded |

## 11. Future Enhancements (Post-v1.2)

**FE-1**: Multi-model ensemble (Llama + Gemini + Phi-3) for even higher accuracy
- Requires loading multiple models
- Privacy considerations for API-based models
- Cost implications if using paid APIs

**FE-2**: Advanced filtering options:
- Filter by model size (MB)
- Filter by deployment target (browser/mobile/cloud)
- Filter by framework (TensorFlow.js/PyTorch/ONNX)
- Combine multiple filters with AND/OR logic

**FE-3**: Smart prompt improvements for ensemble:
- Use LLM to generate diverse rephrased prompts on-the-fly
- Adapt prompt variations based on task category
- Learn from past ensemble results (if we add analytics)

**FE-4**: Confidence calibration:
- Analyze historical accuracy of different confidence levels
- Adjust thresholds based on actual performance
- Display calibrated confidence ("When we say 80%, we're right 85% of the time")

**FE-5**: Explanation feature:
- Show why each model voted for its category
- Help users understand disagreements
- Educational value for users learning about AI

**FE-6**: Saved preferences profiles:
- "Quick mode" (fast, 0% filter)
- "Quality mode" (ensemble, 75% filter)
- "Maximum accuracy" (ensemble, 90% filter, always clarify)
- Users can create custom profiles

**FE-7**: A/B testing framework (privacy-friendly):
- Compare ensemble vs fast accuracy locally
- Share anonymous aggregate stats (opt-in only)
- Continuous improvement based on real usage

**FE-8**: Batch classification:
- Classify multiple tasks at once
- Show ensemble results for each
- Useful for evaluating multiple project ideas

**FE-9**: Confidence-aware recommendations:
- Boost high-accuracy models when classification confidence is low
- "Since we're not 100% sure, here are models that work across categories"

**FE-10**: Clarification question bank:
- Build up library of effective questions over time
- Reuse common questions for common ambiguous pairs
- Faster clarification generation

## 12. Open Questions

**Q-1**: Should we track which tasks commonly need clarification and proactively improve their keywords?
**Status**: Deferred - would require analytics, conflicts with privacy-first approach

**Q-2**: Should ensemble mode have intermediate options (3x vs 5x)?
**Status**: Deferred - keep simple for MVP, can add later if users request

**Q-3**: Should we show all 5 ensemble results to power users?
**Status**: Deferred - could add as "advanced view" toggle in future

**Q-4**: Should clarification questions be skippable individually or only all-at-once?
**Status**: Deferred - implement all-at-once skip for MVP, refine based on feedback

**Q-5**: Should we cache generated clarification questions?
**Status**: Deferred - evaluate after Phase 3 implementation based on generation time

## Appendix A: Test Cases for Ensemble Mode

### Ensemble Voting Scenarios

**Test 1: Unanimous Agreement (5/5)**
```
Input: "I need to classify images of cats and dogs"
Results: [CV, CV, CV, CV, CV]
Expected: category=computer_vision, confidence=high, votes=5/5
```

**Test 2: Strong Majority (4/5)**
```
Input: "Analyze customer reviews for sentiment"
Results: [NLP, NLP, NLP, NLP, CV]
Expected: category=nlp, confidence=high, votes=4/5
```

**Test 3: Weak Majority (3/5)**
```
Input: "Extract information from documents"
Results: [NLP, NLP, NLP, CV, CV]
Expected: category=nlp, confidence=medium, votes=3/5
```

**Test 4: No Majority - Tie (2/2/1)**
```
Input: "Process data for insights"
Results: [NLP, NLP, CV, CV, Data_Prep]
Expected: needsClarification=true, ambiguousCategories=[NLP, CV]
```

**Test 5: No Majority - Close Split (2/2/1)**
```
Input: "Analyze time series patterns"
Results: [Time_Series, Time_Series, NLP, NLP, Data_Prep]
Expected: needsClarification=true, ambiguousCategories=[Time_Series, NLP]
```

### Edge Cases

**Test 6: All Different Results**
```
Input: "Build an AI model"
Results: [CV, NLP, Speech, Time_Series, Rec_Sys]
Expected: needsClarification=true, show top 2 categories
```

**Test 7: Fast Mode Low Confidence**
```
Input: "Understand user behavior"
Results: Single classification with <60% confidence
Expected: needsClarification=true
```

## Appendix B: Sample Clarification Questions

### Common Ambiguous Pairs

**Computer Vision vs NLP:**
- "What type of data will you primarily work with?"
  - Images or video → CV
  - Text or documents → NLP
  - Both → Multimodal (suggest CV or NLP based on primary goal)

**NLP vs Speech Processing:**
- "What format is your input data?"
  - Written text → NLP
  - Audio recordings → Speech
  - Transcripts of speech → NLP

**Time Series vs Data Preprocessing:**
- "What is your main objective?"
  - Predict future values → Time Series
  - Clean and prepare data → Data Preprocessing
  - Find patterns in sequential data → Time Series

**Computer Vision vs Data Preprocessing:**
- "Are you working with visual data?"
  - Yes, images/video → CV
  - No, tabular data → Data Preprocessing

**Recommendation Systems vs NLP:**
- "What are you trying to recommend?"
  - Products/content based on user behavior → Rec Sys
  - Text content based on semantic similarity → NLP or Rec Sys
  - Both → Rec Sys (often uses NLP as component)

### Generic Fallback Questions

If Llama 3.2 fails to generate contextual questions:

1. "What best describes your input data?"
   - Images/Video
   - Text/Documents
   - Audio/Speech
   - Numbers/Tables
   - Time-ordered sequences

2. "What is your primary goal?"
   - Classify/categorize items
   - Generate new content
   - Predict future values
   - Extract/transform information
   - Find patterns/anomalies
   - Recommend items

3. "Where will this model run?"
   - Browser/web app
   - Mobile device
   - Cloud/server
   - Edge device
   - Not sure yet

## Appendix C: Implementation Checklist

### Phase 1: Model Accuracy Filtering
- [ ] Create `AccuracyFilter.svelte` component
- [ ] Add slider UI with 50%-95% range
- [ ] Implement localStorage persistence
- [ ] Add filter logic to `ModelSelector.js`
- [ ] Display accuracy on recommendation cards
- [ ] Handle models with missing accuracy data
- [ ] Add "Reset filter" button
- [ ] Show count of hidden models
- [ ] Add keyboard accessibility (arrow keys)
- [ ] Add tooltips explaining accuracy metric
- [ ] Fix 6 failing tests
- [ ] Add tests for filtering logic
- [ ] Update user documentation

### Phase 2: Ensemble Classification Mode
- [ ] Add ensemble method to `BrowserTaskClassifier.js`
- [ ] Implement 5x parallel classification with `Promise.all()`
- [ ] Create prompt variation strategy (temperature + rephrasing)
- [ ] Implement majority voting algorithm
- [ ] Create `AccuracyModeToggle.svelte` component
- [ ] Add confidence score display component
- [ ] Implement progress indicator for ensemble processing
- [ ] Add localStorage for mode preference
- [ ] Handle tie votes (trigger clarification)
- [ ] Add timeout handling (>5s fallback to single)
- [ ] Add tests for voting algorithm
- [ ] Add performance tests (ensure ≤3s)
- [ ] Test ensemble accuracy on expanded test suite
- [ ] Update documentation with mode comparison

### Phase 3: Smart Clarification Flow
- [ ] Add clarification question generation to `BrowserTaskClassifier.js`
- [ ] Design prompt template for question generation
- [ ] Create `ClarificationFlow.svelte` component
- [ ] Implement multi-step question UI
- [ ] Add skip/back navigation
- [ ] Add 30-second timeout mechanism
- [ ] Implement answer incorporation into re-classification
- [ ] Display "refined classification" indicator
- [ ] Create generic fallback questions
- [ ] Handle question generation failures
- [ ] Add tests for question generation
- [ ] Test re-classification accuracy improvement
- [ ] Optimize for mobile (touch targets, layout)
- [ ] Test full clarification flow end-to-end
- [ ] Update user guide with clarification flow explanation

### Cross-Phase
- [ ] Ensure all components follow existing design system
- [ ] Complete accessibility testing (keyboard + screen reader)
- [ ] Test on mobile devices (Chrome Mobile)
- [ ] Performance testing across all modes
- [ ] Update PROJECT_STATUS.md with progress
- [ ] Create Architecture Decision Record (ADR)
- [ ] Update README with new features
- [ ] Prepare demo/screenshots for documentation

---

**Total Estimated Effort**: 16-22 days (3-4 weeks)
**Complexity**: Medium (builds on existing infrastructure)
**Risk Level**: Low-Medium (well-defined scope, existing model reuse)
**Value**: High (directly addresses user requests and accuracy goals)
