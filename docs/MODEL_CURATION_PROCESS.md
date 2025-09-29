# Model Curation Process

## Quick Summary

The model dataset (`src/lib/data/models.json`) contains 35+ curated AI models organized by task and performance tier. Models were selected from Hugging Face Hub and Papers with Code based on popularity, accuracy, and deployment feasibility.

## Data Sources

**Primary Sources:**
- **Hugging Face Model Hub**: Model metadata, IDs, framework support
- **Papers with Code**: Benchmark scores and performance validation
- **Official Documentation**: Vendor specs (Google, Microsoft, Meta)

**Selection Criteria:**
- Open-source with Hugging Face availability
- Multiple deployment options (browser/cloud/edge)  
- Active maintenance and framework support
- Size-based tiers: Lightweight (<100MB), Standard (100-500MB), Advanced (>500MB)

## Data Collection Process

**Automated Collection:**
```bash
# Query Hugging Face API for popular models by task
curl "https://huggingface.co/api/models?filter=task:image-classification&sort=downloads&limit=50"
```

**Manual Curation:**
1. Cross-check model cards for accuracy and compatibility
2. Verify deployment feasibility (browser/cloud/edge)
3. Estimate environmental impact based on model size
4. Organize into 3-tier system (Lightweight/Standard/Advanced)

**Environmental Scoring:**
- Score 1 (Low): <100MB, edge-friendly, <5W power consumption
- Score 2 (Medium): 100-500MB, cloud deployment, 5-50W power
- Score 3 (High): >500MB, specialized hardware, >50W power

## Future Updates

**Quarterly Update Process:**
1. Query Hugging Face API for trending models
2. Cross-reference Papers with Code leaderboards  
3. Validate new model claims and compatibility
4. Update JSON data and test integration

**Replication Steps:**
```bash
# 1. Setup environment
pip install huggingface_hub requests
export HF_TOKEN="your_token"

# 2. Query for models by category
curl "https://huggingface.co/api/models?filter=task:CATEGORY&sort=downloads"

# 3. Manual curation and validation
# 4. Update src/lib/data/models.json
```

**Known Limitations:**
- Environmental scores are estimates based on model size
- Accuracy metrics vary by benchmark and may not reflect real-world performance
- Coverage focused on popular English-language models

---
*Last Updated: September 29, 2025*