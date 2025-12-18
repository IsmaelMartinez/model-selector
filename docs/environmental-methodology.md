# Environmental Scoring

A simple size-based heuristic for comparing AI model environmental impact.

## Important Caveat

**This is a rough approximation, not a scientific measurement.**

The environmental score is based purely on model size as a proxy for compute requirements. While larger models generally require more resources and energy to run, actual environmental impact depends on many factors not captured here:

- Hardware type and efficiency (CPU, GPU, TPU)
- Batch size and inference optimization
- Data center Power Usage Effectiveness (PUE)
- Regional electricity grid carbon intensity
- Inference time and frequency of use
- Quantization and other optimizations

Use these scores for rough comparison only—to prefer smaller models when they meet your accuracy needs.

## Scoring System

| Score | Tier | Size | Label |
|-------|------|------|-------|
| 1 | Lightweight | ≤500 MB | Low Impact |
| 2 | Standard | ≤4 GB | Medium Impact |
| 3 | Advanced/XL | >4 GB | High Impact |

## Rationale

The core principle is straightforward: **bigger models require more compute**.

- More parameters = more memory = more computation per inference
- More computation = more energy consumption
- More energy = higher environmental impact

This doesn't account for efficiency differences between architectures or optimizations, but it provides a useful rule of thumb for model selection.

## Recommendation

When multiple models can accomplish your task with acceptable accuracy, prefer the smaller one. The environmental benefit compounds with usage—a model used thousands of times per day has significant cumulative impact.
