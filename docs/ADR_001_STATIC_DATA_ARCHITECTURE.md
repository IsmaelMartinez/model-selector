# ADR 001: Static Data Architecture for Model Recommendations

## Status
**Accepted** - September 29, 2025

## Context
The MVP Model Selector needs to provide AI model recommendations without real-time API dependencies. We evaluated several approaches for data architecture and model recommendation delivery.

## Decision
We will use a **static data architecture** with pre-aggregated model metadata stored in JSON files, processed entirely client-side.

## Rationale

### Chosen Approach: Static JSON + Client Processing
- **Pros:**
  - Zero external API dependencies during usage
  - Fast response times (<100ms classification)
  - Works offline and as PWA
  - Predictable bundle size (~50KB for model data)
  - Simple deployment (static hosting)
  - No API rate limits or costs
  
- **Cons:**
  - Model data becomes stale between updates
  - Limited to pre-curated model set
  - Manual update process required

### Rejected Alternatives

**1. Real-time API Integration**
- **Rejected because:** API dependencies, rate limits, latency, offline incompatibility
- **Use case:** Future premium features with live model rankings

**2. Hybrid Approach (Cache + API)**
- **Rejected because:** Added complexity for MVP, still requires API fallback handling
- **Use case:** Potential future enhancement for fresh model discovery

**3. Database-driven Architecture**
- **Rejected because:** Adds server infrastructure, deployment complexity, cost
- **Use case:** Not needed for MVP scale (<100 models)

## Implementation Details

### Data Structure
```
src/lib/data/
├── models.json      # 35+ curated models with metadata
└── tasks.json       # Task taxonomy and classification keywords
```

### Key Components
- **TaskClassifier**: Hybrid classification (API → Semantic → Keywords)
- **RecommendationEngine**: Tier-based model selection
- **Static Data**: Pre-aggregated from Hugging Face Hub + Papers with Code

### Update Process
- **Frequency**: Quarterly manual updates
- **Sources**: Hugging Face API, Papers with Code leaderboards
- **Validation**: Technical feasibility testing required

## Consequences

### Positive
- ✅ MVP can launch without API infrastructure
- ✅ Reliable offline functionality
- ✅ Fast user experience
- ✅ Simple deployment and maintenance
- ✅ Proven technical feasibility (validation tests pass)

### Negative
- ❌ Model data staleness (max 3 months old)
- ❌ Manual effort required for updates
- ❌ Limited to pre-selected model set
- ❌ No dynamic model discovery

### Mitigation Strategies
- Document clear update process for maintainers
- Implement automated validation for data updates
- Plan migration path to hybrid approach for future versions
- Monitor community feedback for missing models

## Review Criteria
This decision will be reviewed when:
- User feedback indicates need for more current model data
- Model landscape changes rapidly (>10 new popular models per quarter)
- Technical infrastructure allows for reliable API integration
- MVP graduates to full product with dedicated backend

---
**Decision Made By:** MVP Development Team  
**Review Date:** March 2026