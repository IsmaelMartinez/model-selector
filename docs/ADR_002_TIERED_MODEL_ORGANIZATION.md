# ADR 002: Three-Tier Model Organization System

## Status
**Accepted** - January 29, 2025

## Context
The Model Selector needs to organize diverse AI models (ranging from 6MB to 3GB) in a way that helps users make informed decisions based on their constraints and requirements.

## Decision
Organize models into **three performance tiers** based primarily on model size, with environmental impact as a key differentiator.

## Rationale

### Three-Tier System
**Tier 1 - Lightweight (<100MB):**
- Target: Mobile, browser, edge deployment
- Environmental Score: 1 (Low impact)
- Examples: MobileNetV3, DistilBERT, YOLOv8n

**Tier 2 - Standard (100-500MB):**
- Target: Cloud deployment, balanced performance
- Environmental Score: 2 (Medium impact)  
- Examples: ResNet-50, BERT Base, YOLOv8s

**Tier 3 - Advanced (>500MB):**
- Target: High-performance applications, specialized hardware
- Environmental Score: 3 (High impact)
- Examples: BERT Large, GPT-2 Large, YOLOv8x

### Why Size-Based Tiers?

**Primary Factors:**
- **Deployment Constraints**: Browser limits, mobile storage, bandwidth
- **Environmental Impact**: Strongly correlated with model size
- **Infrastructure Requirements**: Hardware and hosting needs
- **User Accessibility**: Clear, measurable criteria

**Secondary Factors (within tiers):**
- Accuracy benchmarks
- Framework compatibility
- Maintenance status

### Rejected Alternatives

**1. Accuracy-Only Tiers**
- **Rejected because:** Ignores deployment constraints and environmental impact
- **Problem:** High-accuracy models may be unusable in target deployment

**2. Task-Specific Tiers**
- **Rejected because:** Creates fragmentation, harder to compare across tasks
- **Problem:** Users often work across multiple task types

**3. Framework-Based Organization**
- **Rejected because:** Most models support multiple frameworks
- **Problem:** Creates artificial divisions for equivalent models

## Implementation Details

### Selection Priority
```
1. Lightweight models (prioritized for environmental impact)
2. Standard models (if lightweight insufficient)  
3. Advanced models (only for demanding applications)
```

### Environmental Scoring
Based on estimated inference power consumption:
- **Score 1**: <5W (edge devices, mobile)
- **Score 2**: 5-50W (cloud instances)
- **Score 3**: >50W (specialized hardware, GPUs)

### Model Coverage per Tier
Target minimum coverage:
- 2+ models per tier per task category
- Diverse architectural approaches within tiers
- Multiple accuracy/efficiency tradeoffs

## Consequences

### Positive
- ✅ Clear user guidance based on deployment constraints
- ✅ Environmental consciousness built into recommendations
- ✅ Simple mental model for users to understand
- ✅ Scales well as we add more models and categories
- ✅ Aligns with "smaller is better" environmental principle

### Negative
- ❌ Size doesn't always correlate perfectly with performance
- ❌ May discourage users from considering larger, more capable models
- ❌ Oversimplifies complex tradeoffs in model selection
- ❌ Environmental estimates are rough approximations

### Mitigation Strategies
- Provide accuracy metrics within each tier for informed choices
- Include deployment guidance explaining tier rationale
- Allow advanced users to browse all tiers
- Regular validation of environmental impact estimates

## Review Criteria
This decision will be reviewed when:
- User feedback suggests tier boundaries are inappropriate
- New model architectures challenge size-performance assumptions
- Environmental impact estimation methods improve significantly
- Usage analytics show unexpected tier preference patterns

---
**Decision Made By:** MVP Development Team  
**Review Date:** July 2025