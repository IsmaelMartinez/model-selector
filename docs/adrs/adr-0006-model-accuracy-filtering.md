# ADR-0006: Model Accuracy Filtering

## Status
Accepted

## Date
2025-11-16

## Context

Users have different accuracy requirements depending on their use case. Some applications require high accuracy (medical imaging, safety systems), while others prioritize efficiency over accuracy (prototyping, mobile apps).

### Requirements

1. **User Control**: Allow users to set minimum accuracy thresholds
2. **Persistence**: Remember user preferences across sessions
3. **Range**: Support thresholds from 50% to 95%
4. **Integration**: Work seamlessly with existing recommendation system

### Problem

Without filtering, users see all models regardless of accuracy, making it harder to find models that meet their quality requirements.

## Decision

**We will implement a user-controlled accuracy filter with localStorage persistence.**

### Implementation

1. **UI Component**: Slider in `AccuracyFilter.svelte` (50-95% range)
2. **Persistence**: localStorage via `src/lib/storage/preferences.js`
3. **Filtering**: Applied in `ModelSelector.js` before ranking
4. **Default**: 50% (show all models by default)

### User Flow

```
User adjusts slider → Filter saved to localStorage → Models filtered → Display updated
```

### Key Files

| File | Purpose |
|------|---------|
| `src/components/AccuracyFilter.svelte` | UI slider component |
| `src/lib/storage/preferences.js` | localStorage persistence |
| `src/lib/recommendation/ModelSelector.js` | Filter application |

## Consequences

### Positive

1. **User Empowerment**: Users control quality vs. quantity tradeoff
2. **Persistence**: Preferences remembered across sessions
3. **Simple UX**: Intuitive slider interface
4. **Fast**: Client-side filtering, no API calls

### Negative

1. **Limited Filtering**: Only accuracy, not other metrics (size, speed)
2. **Data Quality**: Depends on accuracy estimates in dataset

### Future Enhancements

- Multi-metric filtering (size, speed, environmental score)
- Preset profiles (high accuracy, balanced, efficient)
- Filter sharing via URL parameters

## Alternatives Considered

### Alternative 1: Fixed Accuracy Tiers
**Why Rejected**: Less flexible than continuous slider

### Alternative 2: Server-Side Filtering
**Why Rejected**: Violates offline-first principle

### Alternative 3: No Filtering (Sorting Only)
**Why Rejected**: Users still see irrelevant low-accuracy models

## Testing

```bash
npm test  # Includes accuracy filter tests
```

Test coverage in `tests/accuracy-filter.test.js`

---

**Decision made**: 2025-11-16
**Status**: Accepted - Implemented

