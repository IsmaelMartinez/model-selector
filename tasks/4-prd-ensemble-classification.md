# PRD: Ensemble Classification (Swarm/Hive Mode)

**Version**: 1.0
**Date**: November 15, 2025
**Status**: Planning - Needs Validation
**PRD Number**: 4
**Related PRDs**:
- [1-prd-mvp-model-selector.md](./1-prd-mvp-model-selector.md)
- [3-prd-model-accuracy-filtering.md](./3-prd-model-accuracy-filtering.md)

## 1. Introduction/Overview

Add an optional "Ensemble Mode" that runs multiple parallel classifications and uses majority voting to achieve higher accuracy. This gives users who need maximum confidence in their classification results a "high accuracy mode" while keeping the default fast mode for typical use.

The feature leverages the existing Llama 3.2 1B-Instruct model (already loaded) by running it 5 times in parallel with slight variations (temperature, prompt rephrasing), then combining results through majority voting.

**Key Insight**: No new model downloads required, reuses existing infrastructure, purely optional enhancement.

## 2. Goals

1. **Improve Accuracy**: Achieve 98%+ classification accuracy for users who opt into ensemble mode (vs 95.2% baseline)
2. **Maintain Performance**: Complete ensemble classification in ≤3 seconds (vs ~400ms for fast mode)
3. **Preserve Privacy**: All processing remains client-side, no external API calls
4. **User Control**: Make it opt-in so default experience stays fast and efficient
5. **Environmental Efficiency**: Minimize resource usage by making ensemble mode optional, not default

## 3. User Stories

**US-1**: As a developer working on a critical project, I want a "high accuracy mode" so that I can be more confident in the recommendations, even if it takes a bit longer.

**US-2**: As a developer, I want to see how confident the system is in its classification so that I can judge if the recommendations are reliable.

**US-3**: As a developer with a clear task, I want fast results without extra processing so that I can get recommendations quickly (default behavior).

**US-4**: As a developer, I want my accuracy mode preference to persist so I don't have to toggle it every time.

**US-5**: As a developer, I want to understand the tradeoff between fast and ensemble mode so I can make an informed choice.

## 4. Core Concept

### Ensemble Approach (5x Parallel Classification)

**Run 5 classifications simultaneously** with the same Llama 3.2 model using variations:

1. **Temperature Variation**: 0.3, 0.5, 0.7, 0.9, 1.0
2. **Prompt Rephrasing**: 5 different ways to ask the same question
   - "Classify this task: {input}"
   - "What AI category does this belong to: {input}"
   - "Identify the machine learning task type: {input}"
   - "This task is best suited for which AI domain: {input}"
   - "Categorize this AI use case: {input}"

**Majority Voting**:
- 5/5 or 4/5 agree → **High Confidence** ⭐⭐⭐⭐⭐
- 3/5 agree → **Medium Confidence** ⭐⭐⭐
- ≤2/5 agree (tie) → **Low Confidence** ⭐ → Trigger clarification (PRD 5)

### Example:
```
User input: "I need to detect objects in surveillance footage"

Fast Mode (1 classification):
→ Computer Vision - Object Detection (95.2% historical accuracy)

Ensemble Mode (5 parallel classifications):
→ [CV, CV, CV, CV, CV] = 5/5 agree
→ Computer Vision - Object Detection (High Confidence ⭐⭐⭐⭐⭐)
→ Target: 98%+ accuracy
```

## 5. Functional Requirements (High-Level)

### 5.1 Mode Toggle
- Provide "Fast" vs "Ensemble" toggle in UI
- Default: Fast mode
- Persist preference in localStorage

### 5.2 Ensemble Classification
- Run 5 parallel classifications with Promise.all()
- Use temperature + prompt variations for diversity
- Complete within 3 seconds target
- Handle individual classification failures gracefully

### 5.3 Voting Algorithm
- Count votes for each category
- Determine winner (highest vote count)
- Calculate confidence: High (4-5), Medium (3), Low (≤2)
- Handle ties (multiple categories with same vote count)

### 5.4 Display
- Show confidence score prominently in results
- Display vote breakdown: "5/5 models agree" or "4/5 agree"
- Show progress indicator during ensemble processing
- Display estimated time for each mode

### 5.5 Fallback
- If ensemble times out (>5s), fall back to single classification
- If individual classifications fail, proceed with remaining results
- Always return a result, even if low confidence

## 6. Technical Approach (High-Level)

### Architecture
```
User clicks "Get Recommendations"
    ↓
Check mode: Fast or Ensemble?
    ↓
[Fast Mode]                    [Ensemble Mode]
Single classification    →     5x parallel classifications
      ↓                              ↓
  Category                    Majority voting → Category + Confidence
      ↓                              ↓
Model Selection              Model Selection
      ↓                              ↓
   Display                          Display with confidence
```

### Performance Target
- **Fast Mode**: ~400ms (current baseline)
- **Ensemble Mode**: ≤3 seconds (5x classifications in parallel)
- **Overhead**: <100ms for voting algorithm

### Accuracy Target
- **Fast Mode**: Maintain 95.2% (current baseline)
- **Ensemble Mode**: Achieve ≥98% on test suite

## 7. Success Criteria

✅ **Validation Complete When:**
- [ ] Prototype proves ensemble achieves ≥98% accuracy
- [ ] Prototype proves ensemble completes in ≤3 seconds
- [ ] Voting algorithm handles all edge cases (ties, all different, etc.)
- [ ] Performance acceptable on median user hardware

✅ **Implementation Complete When:**
- [ ] Mode toggle UI implemented and functional
- [ ] 5x parallel classification working correctly
- [ ] Majority voting algorithm tested and accurate
- [ ] Confidence scores displayed clearly
- [ ] Mode preference persists across sessions
- [ ] Ensemble accuracy ≥98% on test suite
- [ ] Performance: Ensemble mode completes in ≤3 seconds
- [ ] All tests passing
- [ ] Documentation updated

## 8. Validation Needed

**IMPORTANT**: Before committing to full implementation, validate the approach:

1. **Quick Prototype** (2-3 hours):
   - Implement basic 5x parallel classification
   - Test on current failing edge cases
   - Measure actual accuracy improvement
   - Measure actual performance on typical hardware

2. **Decision Point**:
   - If accuracy ≥98% and performance ≤3s → Proceed with full implementation
   - If not → Revise approach or defer feature

3. **Alternative Approaches** (if validation fails):
   - Use 3x instead of 5x (faster, still better than single)
   - Different prompt strategies
   - Different temperature ranges
   - Weighted voting based on prompt quality

## 9. Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Ensemble too slow (>5s) | Poor UX | Optimize parallel execution, set clear expectations, timeout fallback |
| No accuracy improvement | Feature doesn't deliver value | Validate with prototype first, measure on test suite |
| Voting ties (no majority) | Unclear result | Trigger clarification flow (PRD 5) or use highest vote with low confidence label |
| Battery drain on mobile | Users avoid feature | Make opt-in, show clear mode indicator, document tradeoff |
| Increased complexity | Harder to maintain | Keep voting logic simple (majority only), extensive testing |

## 10. Dependencies

- **None**: Can be implemented independently
- **Synergy with PRD 5**: Ensemble low confidence can trigger clarification flow
- **Builds on**: Existing Llama 3.2 infrastructure (no new models needed)

## 11. Timeline Estimate

- **Validation Prototype**: 2-3 hours
- **Full Implementation** (if validated): 5-7 days
  - Day 1-2: Core ensemble logic and voting
  - Day 3-4: UI and UX
  - Day 5-6: Testing and optimization
  - Day 7: Polish and documentation

## 12. Next Steps

1. **Session 1**: Review PRD, refine approach
2. **Session 2**: Quick prototype to validate accuracy + performance
3. **Session 3** (if validated): Create detailed task list
4. **Session 4+**: Execute implementation

---

## Notes

This PRD is intentionally high-level. Detailed tasks will be created after validating that the ensemble approach actually delivers the promised accuracy improvement and acceptable performance.

The key question to answer: **Does 5x parallel classification with majority voting actually achieve 98%+ accuracy?**

Let's find out before committing to full implementation.
