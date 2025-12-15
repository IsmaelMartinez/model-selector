# Environmental Impact Methodology

## Environmental Scoring (1-3)

**Score 1 (Low Impact)**: <0.1 kWh/day
- Mobile/edge friendly, minimal carbon footprint
- Examples: MobileNetV3, DistilBERT

**Score 2 (Medium Impact)**: 0.1-1.0 kWh/day  
- Cloud deployment with reasonable usage
- Examples: BERT Base, ResNet-50

**Score 3 (High Impact)**: >1.0 kWh/day
- Specialized applications, significant footprint
- Examples: GPT-2 Large, Large Vision Transformers

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

## Limitations

**Estimates Only**: Order-of-magnitude comparisons, not precise measurements
**Inference Only**: Training emissions not included
**Global Averages**: Regional carbon intensity variation not considered

## Usage

Use scores for **comparative analysis** between models, not absolute measurements. Environmental impact weighted at 40% in recommendations alongside accuracy (40%) and deployment compatibility (20%).

---
**Version 1.0** • Updated September 2025