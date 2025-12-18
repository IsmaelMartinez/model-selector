# ADR-0007: Ensemble Classification Mode

## Status
**SUPERSEDED** by [ADR-0008](adr-0008-embedding-similarity-classification.md)

> ⚠️ **This ADR is no longer in use.** The 3-agent LLM ensemble has been replaced by MiniLM k-NN voting (top-5 reference examples vote for category). See ADR-0008 for the current implementation.

## Date
2025-11-16

## Context

The LLM-based task classification (ADR-0003) achieves 95.2% accuracy in Fast Mode. However, some users require higher confidence in classification results, especially for critical applications.

### Requirements

1. **Higher Accuracy**: Target 98%+ accuracy for users who need it
2. **User Choice**: Optional mode, not default behavior
3. **Transparency**: Show voting confidence to users
4. **Reasonable Speed**: Acceptable latency (~2s vs ~0.4s for Fast Mode)

### Problem: LLM Response Variability

Single LLM calls can produce "lazy" or inconsistent responses. The same model with different parameters sometimes gives different answers for edge cases.

## Decision

**We will implement an optional 3-agent ensemble classification with majority voting.**

### Architecture

```
Fast Mode (default):  Single LLM call → Result (~0.4s)
Ensemble Mode:        3x Parallel LLM → Majority Vote → Result (~2s)
```

### Implementation

1. **Parallel Execution**: 3 LLM calls with different temperatures (0.0, 0.2, 0.4)
2. **Majority Voting**: 2/3 or 3/3 consensus determines final category
3. **Confidence Display**: Shows vote count (e.g., "3/3 votes")
4. **UI Toggle**: `ClassificationMode.svelte` component for mode selection
5. **Persistence**: Mode preference saved to localStorage

### Key Files

| File | Purpose |
|------|---------|
| `src/components/ClassificationMode.svelte` | Fast/Ensemble toggle UI |
| `src/lib/classification/LLMTaskClassifier.js` | Ensemble logic implementation |
| `src/lib/storage/preferences.js` | Mode persistence |

### Temperature Strategy

| Agent | Temperature | Purpose |
|-------|-------------|---------|
| Agent 1 | 0.0 | Deterministic, most consistent |
| Agent 2 | 0.2 | Slight variation for edge cases |
| Agent 3 | 0.4 | More variation to catch alternatives |

## Consequences

### Positive

1. **Higher Accuracy**: Target 98%+ via consensus
2. **Confidence Signal**: Users see voting agreement
3. **Reduced "Lazy" Responses**: Multiple calls reduce single-point failures
4. **User Choice**: Opt-in preserves fast default experience
5. **Same Model**: Reuses cached Llama 3.2 1B model

### Negative

1. **Slower**: ~2s vs ~0.4s (5x slower)
2. **Higher Resource Use**: 3x inference compute
3. **Complexity**: More code paths to maintain
4. **Occasional Splits**: 1-1-1 votes require tiebreaker logic

### Mitigation

1. **Speed**: Default to Fast Mode; Ensemble is opt-in
2. **Resources**: Parallel execution minimizes wall-clock impact
3. **Complexity**: Well-tested with dedicated test suite
4. **Splits**: First agent (temperature 0.0) wins ties

## Performance Comparison

| Mode | Accuracy | Speed | Resource Use |
|------|----------|-------|--------------|
| Fast | 95.2% | ~0.4s | 1x |
| Ensemble | 98%+ | ~2s | 3x |

## Alternatives Considered

### Alternative 1: Larger Model
**Why Rejected**: Significant download size increase; diminishing returns on accuracy

### Alternative 2: Fine-tuned Model
**Why Rejected**: Requires training infrastructure; loses general-purpose flexibility

### Alternative 3: External API Ensemble
**Why Rejected**: Violates offline-first principle; adds cost and latency

### Alternative 4: Sequential Retry
**Why Rejected**: Slower than parallel; less robust voting signal

## Testing

```bash
npm run test:llm  # Includes ensemble validation tests (~3min)
```

Test coverage in `tests/ensemble-validation.test.js`

---

**Decision made**: 2025-11-16
**Original Status**: Accepted - Implemented
**Current Status**: ⚠️ SUPERSEDED by ADR-0008 (2025-12-17)

---

## Supersession Notice

This ADR was superseded on 2025-12-17 by [ADR-0008: Embedding Similarity Classification](adr-0008-embedding-similarity-classification.md).

**Reason for supersession:**
- The LLM classifier (ADR-0003) this ensemble was built on has been replaced
- k-NN voting with MiniLM achieves the same goal (higher accuracy via consensus) with:
  - Single model call instead of 3 LLM calls
  - ~23MB model vs ~500MB
  - ~2ms inference vs ~2s ensemble

**Key difference:**
| Approach | How voting works |
|----------|------------------|
| **Old (This ADR)** | 3 LLM calls @ different temperatures → majority vote |
| **New (ADR-0008)** | 1 embedding call → top-5 reference examples vote by category |

The `LLMTaskClassifier.js` file and `tests/ensemble-validation.test.js` have been removed from the codebase.

