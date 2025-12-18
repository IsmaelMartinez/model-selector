# Environmental Impact Methodology

## Environmental Scoring (1-3)

Scores are assigned based on model size tiers, which correlate with power consumption:

| Score | Tier | Size Limit | kWh/day | Description |
|-------|------|------------|---------|-------------|
| **1** | Lightweight | ≤500MB | <0.1 | Edge/mobile friendly, minimal carbon footprint |
| **2** | Standard | ≤4GB | 0.1-1.0 | Cloud deployment, consumer hardware capable |
| **3** | Advanced | ≤20GB | >1.0 | Dedicated GPU required, significant footprint |
| **3** | Extra Large | No limit | >1.0 | Multi-GPU, research clusters |

### Score 1 (Low Impact)
- **Size**: ≤500MB
- **Deployment**: Mobile, browser, edge devices
- **Examples**: MobileNetV3, DistilBERT, Whisper-small, quantized small models

### Score 2 (Medium Impact)
- **Size**: ≤4GB
- **Deployment**: Cloud, consumer GPUs, quantized LLMs
- **Examples**: BERT-large, Whisper-large, quantized 7B models (Q4/Q8)

### Score 3 (High Impact)
- **Size**: >4GB (Advanced and Extra Large tiers)
- **Deployment**: Dedicated GPU servers, multi-GPU setups
- **Examples**: Full-precision 7B models, CodeLlama-7B, 70B+ models

## Calculation Method

**Power Estimation**: Based on model size, architecture type, and deployment platform
- Mobile: 2W baseline
- Browser: 15W baseline  
- Cloud: 50W baseline
- GPU: 250W baseline

**Architecture Multipliers**:
- CNN: 1.0× (baseline)
- Transformer: 1.5× (attention overhead)
- Diffusion: 2.0× (iterative process)
- Quantized: 0.6× (optimized)

**Tier-Based Assignment** (simplified):
```
if (sizeMB <= 500)   → Score 1 (Lightweight)
if (sizeMB <= 4000)  → Score 2 (Standard)
if (sizeMB <= 20000) → Score 3 (Advanced)
else                 → Score 3 (Extra Large)
```

## Quantization Impact

Modern 7B parameter models can be quantized to fit different tiers:

| Model | Full Precision | Q8 | Q4 | Tier |
|-------|----------------|----|----|------|
| Llama-2-7B | ~14GB | ~7GB | ~4GB | Standard (Q4) |
| CodeLlama-7B | ~14GB | ~7GB | ~4GB | Standard (Q4) |
| Mistral-7B | ~14GB | ~7GB | ~4GB | Standard (Q4) |

This means quantized 7B models can achieve Score 2 (Medium Impact) rather than Score 3.

## Limitations

**Estimates Only**: Order-of-magnitude comparisons, not precise measurements
**Inference Only**: Training emissions not included
**Global Averages**: Regional carbon intensity variation not considered
**Quantization Not Tracked**: Model cards don't always specify quantization level

## Specialization Trade-off

**Important**: Our "eco-first" approach prioritizes smaller models, but smaller models are often **highly specialized** for narrow tasks (e.g., table detection, signature detection, single-language ASR).

**Implications**:
- A recommended lightweight model may only work for its specific use case
- General-purpose tasks may require Standard or Advanced tier models
- Always verify that the model's specialization matches your actual requirements

See [Model Specialization Patterns](research/model-specialization-patterns.md) for detailed analysis.

## Usage

Use scores for **comparative analysis** between models, not absolute measurements. Environmental impact weighted at 40% in recommendations alongside accuracy (40%) and deployment compatibility (20%).

## Related Documentation

- [Model Curation Process](./model-curation-process.md)
- [Data Structure](./data-structure.md)
- [Model Specialization Curation](./model-specialization-curation.md)

---
**Version 1.1** • Updated December 2025
