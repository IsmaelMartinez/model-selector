# Environmental Impact Methodology

## Overview

The Model Selector includes a comprehensive environmental impact scoring system that provides reasonable estimates for AI model energy consumption and carbon footprint. This document outlines the methodology, assumptions, and limitations of our environmental calculations.

## Scoring System

### Environmental Scores (1-3)

- **Score 1 (Low Impact)**: < 0.1 kWh/day typical usage
  - Suitable for edge devices and frequent use
  - Minimal carbon footprint
  - Examples: MobileNetV3, DistilBERT

- **Score 2 (Medium Impact)**: 0.1-1.0 kWh/day typical usage
  - Good for cloud deployment with reasonable usage
  - Moderate carbon footprint
  - Examples: BERT Base, ResNet-50

- **Score 3 (High Impact)**: > 1.0 kWh/day typical usage
  - Best for specialized applications with careful usage planning
  - Significant carbon footprint
  - Examples: GPT-2 Large, Large Vision Transformers

## Calculation Methodology

### Power Consumption Estimation

**Base Power by Deployment Type:**
- Mobile: 2W baseline
- Edge: 8W baseline  
- Browser: 15W baseline
- Cloud: 50W baseline
- Server: 100W baseline
- GPU: 250W baseline

**Size Scaling:**
Power consumption scales logarithmically with model size:
```
Power = BasePower × (log₁₀(ModelSize_MB / 10) + 1) × ComplexityMultiplier
```

**Complexity Multipliers by Architecture:**
- Transformer models: 1.5× (attention mechanisms are compute-intensive)
- CNN models: 1.0× (baseline)
- RNN models: 1.2× (sequential processing overhead)
- Diffusion models: 2.0× (iterative generation process)
- Distilled models: 0.7× (optimized architectures)
- Quantized models: 0.6× (reduced precision)

### Carbon Footprint Calculation

**Carbon Intensity by Deployment (g CO₂/kWh):**
- Mobile: 400g (battery-powered, mixed grid)
- Edge: 500g (small devices, average grid)
- Browser: 450g (personal computing, mixed grid)
- Cloud: 350g (modern data centers, some renewable)
- Server: 400g (traditional data centers)
- GPU: 600g (high-performance computing)

**Calculation:**
```
CO₂_per_inference = (Power_W × 0.1h) / 1000 × CarbonIntensity_g/kWh
Daily_CO₂ = CO₂_per_inference × InferencesPerHour × HoursPerDay
```

### Usage Patterns

**Inference Frequency Assumptions:**
- **Interactive**: 10 inferences/hour (typical user interaction)
- **Batch**: 100 inferences/hour (scheduled processing)
- **Real-time**: 3600 inferences/hour (continuous processing)
- **Periodic**: 1 inference/hour (occasional analysis)

**Default Usage Scenario:**
- 8 hours per day
- 5 days per week
- Interactive usage pattern
- Cloud deployment (if not specified)

## Data Sources & Validation

### Academic Research
- "Energy and Policy Considerations for Deep Learning in NLP" (Strubell et al.)
- "Carbontracker: Tracking and Predicting the Carbon Footprint of Training Deep Learning Models" (Anthony et al.)
- Industry reports on data center efficiency and carbon intensity

### Hardware Benchmarks
- Cloud provider sustainability reports (AWS, Google Cloud, Azure)
- GPU manufacturer specifications (NVIDIA, AMD)
- Mobile device power consumption studies

### Model Characteristics
- Hugging Face model repository metadata
- Papers with Code benchmark results
- Community-reported deployment experiences

## Limitations & Disclaimers

### Estimate Accuracy
- **Purpose**: Comparative analysis, not precise measurements
- **Accuracy**: Order-of-magnitude estimates for relative comparison
- **Variability**: Actual impact depends on specific hardware, software, and usage

### Not Included
- **Training Emissions**: Only inference impact is calculated
- **Manufacturing**: Hardware production carbon footprint not included
- **Network**: Data transfer emissions not calculated
- **Cooling**: Data center cooling overhead simplified

### Geographic Variation
- Carbon intensity varies significantly by region
- Calculations use global averages
- Local grid composition (renewable vs. fossil) not considered

### Hardware Specificity
- Estimates based on typical hardware configurations
- Actual efficiency varies by specific chips, generations
- Optimization techniques (quantization, pruning) effects estimated

## Usage Recommendations

### For Developers
1. **Comparative Analysis**: Use scores to compare models, not for absolute measurements
2. **Deployment Planning**: Consider environmental impact in model selection
3. **Optimization**: Implement quantization, pruning for high-impact models
4. **Usage Patterns**: Optimize inference frequency and batch processing

### For Researchers
1. **Validation**: Verify estimates against measured data when possible
2. **Updates**: Methodology evolves with new research and data
3. **Context**: Consider full lifecycle impact including training
4. **Reporting**: Include environmental considerations in model documentation

## Methodology Updates

### Version History
- **v1.0** (September 2025): Initial implementation with size-based scoring
- Future updates will incorporate:
  - More granular hardware specifications
  - Regional carbon intensity data
  - Training emission estimates
  - Real-world usage pattern data

### Data Refresh
- Carbon intensity data: Updated annually
- Hardware efficiency: Updated with new chip generations
- Model benchmarks: Updated with new research

## Integration with Model Selection

### Recommendation Engine
Environmental scores are weighted alongside accuracy and deployment constraints:
- Environmental weighting: 40%
- Accuracy weighting: 40% 
- Deployment compatibility: 20%

### User Interface
- Environmental badges on model cards
- Tier-based filtering (prioritize lightweight models)
- Impact comparisons between model options
- Optimization recommendations for high-impact models

---

**Methodology Version**: 1.0  
**Last Updated**: September 29, 2025  
**Next Review**: March 2026

For questions or suggestions about the environmental methodology, please open an issue in the project repository.