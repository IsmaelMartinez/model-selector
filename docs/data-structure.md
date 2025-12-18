# Data Structure

## Files

- `src/lib/data/tasks.json` - Task categories and keywords
- `src/lib/data/models.json` - Model metadata

## Task Taxonomy

```
taskTaxonomy/
├── [category]/
│   ├── label, description
│   └── subcategories/
│       └── [subcategory]/
│           ├── label, description
│           ├── keywords
│           └── examples
```

**Categories**: Computer Vision, NLP, Speech Processing, Time Series, Recommendations, Reinforcement Learning, Data Preprocessing

## Model Tiers

| Tier | Size | Environmental Score |
|------|------|---------------------|
| Lightweight | ≤500MB | 1 (Low) |
| Standard | ≤4GB | 2 (Medium) |
| Advanced | ≤20GB | 3 (High) |
| Extra Large | No limit | 3 (High) |

## Model Entry

```json
{
  "id": "unique_id",
  "name": "Model Name",
  "huggingFaceId": "org/model-name",
  "sizeMB": 123.4,
  "accuracy": 0.85,
  "environmentalScore": 1,
  "specialization": "general",
  "deploymentOptions": ["browser", "cloud"],
  "frameworks": ["PyTorch", "ONNX"],
  "lastUpdated": "2025-01-15"
}
```

## Specialization Field

Indicates if a model is optimized for a narrow task:

| Prefix | Meaning | Example |
|--------|---------|---------|
| `task:` | Specific task | `task:tables` |
| `domain:` | Domain-specific | `domain:finance` |
| `language:` | Single language | `language:english` |
| `general` | General purpose | — |
