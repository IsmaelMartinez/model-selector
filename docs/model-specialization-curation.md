# Model Specialization Curation Guide

The `specialization` field tracks whether models are optimized for narrow tasks vs general-purpose use. This is manually curated because it requires semantic understanding of model capabilities.

## Schema

```json
{ "specialization": "type:value" }
```

| Type | Prefix | Examples |
|------|--------|----------|
| Task-Specific | `task:` | `task:tables`, `task:signatures`, `task:nsfw` |
| Domain-Specific | `domain:` | `domain:finance`, `domain:medical` |
| Language-Specific | `language:` | `language:english`, `language:spanish` |
| General Purpose | `general` | No prefix, just `general` |

**Values**: Lowercase, hyphenated for multi-word (`task:face-expression`).

## Decision Tree

```
Is this model trained for ONE specific task/entity type?
├── YES → task:[specific-task]
└── NO → Is it trained on domain-specific data?
    ├── YES → domain:[domain]
    └── NO → Is it language-specific?
        ├── YES → language:[language]
        └── NO → general (or omit field)
```

## Analysis Prompt for LLM

```
Analyze this AI model for specialization:

Model: [NAME] | HF ID: [ID] | Task: [CATEGORY]
Description: [PASTE]

Questions:
1. Does it perform ONE specific task or a BROAD class of tasks?
2. Was it trained on general data (ImageNet, Common Crawl) or domain-specific data?
3. For NLP/Speech: Single language or multilingual?
4. What can this model NOT do that users might expect?

Output:
- Specialization tag: task:[x], domain:[x], language:[x], general, or null
- Reasoning: 1 sentence
- Confidence: high/medium/low
```

## Examples

| Model | Analysis | Tag |
|-------|----------|-----|
| `microsoft/table-transformer-detection` | Only tables | `task:tables` |
| `ProsusAI/finbert` | Financial sentiment | `domain:finance` |
| `openai/whisper-small.en` | English only | `language:english` |
| `google/vit-base-patch16-224` | 1000+ ImageNet categories | `general` |

## Tier Correlation

| Tier | Size | Typical Specialization |
|------|------|------------------------|
| Lightweight | ≤500MB | Often specialized |
| Standard | ≤4GB | Mix |
| Advanced | ≤20GB | Usually general |
| Extra Large | No limit | General foundation models |

## Workflow

1. **Automated PR arrives** → Review new models in diff
2. **For each new model** → Check HF card, apply analysis prompt
3. **Add tag** → Edit `models.json`, add `"specialization": "type:value"`
4. **Merge** → Aggregator preserves tags in future updates

## Common Pitfalls

❌ Over-tagging general models (`bert-base-uncased` doesn't need `domain:general-text`)  
❌ Under-tagging specialized models (FinBERT needs `domain:finance`)  
❌ Vague values (`task:detection` → use `task:tables` instead)

---
*See also: [Model Specialization Research](research/model-specialization-patterns.md)*
