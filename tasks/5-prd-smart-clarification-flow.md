# PRD: Smart Clarification Flow

**Version**: 1.0
**Date**: November 15, 2025
**Status**: Planning - Dependent on PRD 4
**PRD Number**: 5
**Related PRDs**:
- [1-prd-mvp-model-selector.md](./1-prd-mvp-model-selector.md)
- [3-prd-model-accuracy-filtering.md](./3-prd-model-accuracy-filtering.md)
- [4-prd-ensemble-classification.md](./4-prd-ensemble-classification.md)

## 1. Introduction/Overview

Add an intelligent clarification system that asks users 2-3 contextual questions when the classification is uncertain or ambiguous. This handles edge cases gracefully and helps users who provide vague or ambiguous task descriptions get accurate recommendations.

The system uses Llama 3.2 to generate relevant questions based on the user's input and the ambiguous categories, then re-classifies with the additional context.

**Key Insight**: Better to ask a few questions than give wrong recommendations.

## 2. Goals

1. **Handle Ambiguity**: Gracefully resolve uncertain classifications through clarifying questions
2. **Improve Accuracy**: Achieve ≥95% accuracy for ambiguous cases after clarification
3. **Minimize Friction**: Keep questions minimal (2-3 max) to avoid decision fatigue
4. **User Control**: Always allow users to skip clarification and proceed with best guess
5. **Smart Questions**: Generate contextual, relevant questions (not generic)

## 3. User Stories

**US-1**: As a developer with an ambiguous task description, I want the tool to ask me clarifying questions so that it recommends the right model category.

**US-2**: As a developer in a hurry, I want to skip clarification questions and use the best guess so I'm not forced to answer.

**US-3**: As a developer, I want to understand why questions are being asked so the process feels transparent.

**US-4**: As a developer, I want to go back and change my answers so I can correct mistakes.

**US-5**: As a developer with a clear task, I want fast results without extra questions so I don't waste time (default behavior).

## 4. When to Trigger Clarification

### Triggers:

1. **From Fast Mode**:
   - Classification confidence <60%
   - Ambiguous input detected (e.g., "build an AI model" - too vague)

2. **From Ensemble Mode** (PRD 4):
   - No majority in voting (2/2/1 split or worse)
   - Tie between two categories (2/2/1)
   - All different results (1/1/1/1/1)

3. **Never Trigger**:
   - High confidence results (>80% in fast, 4-5 agree in ensemble)
   - User explicitly skips previous clarification

### Example Scenarios:

**Trigger Clarification**:
```
Input: "Process data for insights"
Fast: 58% confidence → NLP (but uncertain)
→ Ask: "What type of data?" (text vs numbers vs images)
```

**No Clarification Needed**:
```
Input: "Detect objects in surveillance footage"
Fast: 98% confidence → Computer Vision
Ensemble: 5/5 agree → Computer Vision
→ Skip questions, show results directly
```

## 5. Clarification Flow

### User Experience:

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

### Flow Steps:

1. **Detect** low confidence or tie
2. **Generate** 2-3 contextual questions using Llama 3.2
3. **Display** questions with multiple choice options
4. **Collect** user answers (or skip)
5. **Re-classify** with enriched context
6. **Show** final results with "refined classification" indicator

## 6. Question Generation

### Approach:

Use Llama 3.2 to generate questions based on:
- Original user input
- Ambiguous categories (e.g., CV vs NLP)
- Common disambiguation patterns

### Example Prompt:
```
The user said: "Process data for insights"
This could be either:
- Natural Language Processing (analyzing text)
- Data Preprocessing (preparing datasets)
- Time Series Analysis (analyzing sequential data)

Generate 2-3 clarifying questions (multiple choice) to determine which category is correct.
Focus on: data type, goal, input format.
```

### Fallback:

If question generation fails, use **hardcoded question bank** for common ambiguous pairs:
- CV vs NLP: "What type of data?"
- NLP vs Speech: "What format is your input?"
- Time Series vs Data Prep: "What is your main objective?"

## 7. Re-classification with Answers

### Enriched Prompt:
```
Original input: "Process data for insights"
Additional context from user:
- Data type: Numerical time-ordered sequences
- Main goal: Predict future values

Classify this task into one of: [categories...]
```

### Expected Result:
```
Before: Ambiguous (NLP 40%, Data Prep 35%, Time Series 25%)
After: Time Series Analysis (95% confidence)
```

## 8. Functional Requirements (High-Level)

### 8.1 Detection
- Detect when clarification is needed (confidence thresholds, voting ties)
- Identify which categories are ambiguous
- Skip clarification if user previously skipped

### 8.2 Question Generation
- Use Llama 3.2 to generate 2-3 contextual questions
- Format as multiple choice (3-4 options per question)
- Fall back to generic questions if generation fails
- Each question should eliminate ≥50% of ambiguity

### 8.3 UI Component
- Display clarification flow as modal or inline step
- Show which categories are ambiguous
- Explain why questions are being asked
- Provide skip option prominently
- Allow back navigation to change answers
- Show progress (Question 1 of 2, etc.)

### 8.4 Re-classification
- Incorporate user answers into classification prompt
- Re-run classification with enriched context
- Display final result with confidence
- Show "Classification refined with your input" indicator

### 8.5 Timeout & Fallback
- Auto-proceed with best guess after 30 seconds (optional)
- If user closes clarification, use highest-voted category
- Always provide a result, never get stuck

## 9. Technical Considerations

### Complexity Factors:
- **Question Quality**: Hard to guarantee generated questions are helpful
- **UX Design**: Multi-step flow on mobile can be challenging
- **Error Handling**: Generation failures, unclear answers, etc.
- **Testing**: Harder to test than simple filtering or voting

### Performance:
- Question generation: ≤2 seconds (using Llama 3.2)
- Re-classification: ≤1 second
- Total clarification overhead: ≤5 seconds

### Dependencies:
- **Soft dependency on PRD 4**: Ensemble voting ties are natural trigger
- **Works standalone**: Can also trigger from low confidence in fast mode
- **Requires Llama 3.2**: Already loaded, no new dependencies

## 10. Success Criteria

✅ **Implementation Complete When:**
- [ ] Clarification triggers on low confidence / voting ties
- [ ] 2-3 contextual questions generated using Llama 3.2
- [ ] Users can answer, skip, or go back
- [ ] Re-classification incorporates user answers
- [ ] Clarification improves accuracy for ambiguous cases (≥95%)
- [ ] UI works well on desktop and mobile
- [ ] Full accessibility compliance (keyboard + screen reader)
- [ ] Fallback questions work when generation fails
- [ ] All tests passing
- [ ] Documentation updated

## 11. Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Generated questions not helpful | Users frustrated, skip feature | Test question quality extensively, use fallback question bank |
| Too many clarifications asked | Decision fatigue, users abandon | Set conservative threshold, respect skip choice, limit to 2-3 questions |
| Complex UX on mobile | Poor mobile experience | Design mobile-first, large touch targets, simple flow |
| Question generation slow | Poor UX, users impatient | Optimize prompt, show loading indicator, 2s timeout for generation |
| Re-classification still wrong | No accuracy improvement | Improve prompt engineering, more testing with diverse inputs |

## 12. Alternative Approaches

If full question generation proves too complex:

**Option A**: Hardcoded question bank only
- Simpler, faster, more predictable
- Works for common ambiguous pairs
- Loses contextual intelligence

**Option B**: Single question only
- "What best describes your data: Images, Text, Audio, Numbers?"
- Faster UX, less decision fatigue
- Less precise disambiguation

**Option C**: No questions, show multiple categories
- "This could be CV or NLP. Here are recommendations for both:"
- No extra steps for user
- May show irrelevant recommendations

## 13. Dependencies & Order

**Recommended Implementation Order**:
1. ✅ **PRD 3** (Filtering) - Quick win, no dependencies
2. 🔬 **PRD 4** (Ensemble) - Validate first, natural trigger for PRD 5
3. 💬 **PRD 5** (Clarification) - Most complex, benefits from PRD 4

**Can PRD 5 be implemented without PRD 4?**
- Yes, using low confidence from fast mode as trigger
- But ensemble voting ties are more reliable trigger
- Question quality improves with ensemble data (knows which categories tied)

## 14. Timeline Estimate

- **Design & Prototyping**: 2 days
- **Question Generation**: 2 days
- **UI Implementation**: 2 days
- **Re-classification Logic**: 1 day
- **Testing & Polish**: 2-3 days

**Total**: 6-8 days (if starting after PRD 4 complete)

## 15. Next Steps

1. **Session 1**: Decide if this feature is worth the complexity
2. **Session 2**: Complete PRD 4 (ensemble) first - creates natural trigger
3. **Session 3**: Design clarification UX flow and question templates
4. **Session 4**: Create detailed task list
5. **Session 5+**: Execute implementation

---

## Notes

This PRD is intentionally high-level. The feature adds significant complexity compared to PRD 3 (filtering) and PRD 4 (ensemble), so careful consideration is needed before committing.

**Key Questions**:
1. Is the accuracy improvement worth the UX complexity?
2. Can we achieve good question quality consistently?
3. Will users actually answer questions or just skip?

Consider validating with user research or prototype before full implementation.
