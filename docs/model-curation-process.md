# Model Curation

Models in `src/lib/data/models.json` are curated from Hugging Face and organized by task and size tier.

## Tier System

| Tier | Size | Use Cases |
|------|------|-----------|
| Lightweight | ≤500MB | Edge, mobile, browser |
| Standard | ≤4GB | Cloud APIs, quantized LLMs |
| Advanced | ≤20GB | Full-precision 7B+ models |
| Extra Large | No limit | 70B+ models |

## Automated Updates

Daily at 2 AM UTC via GitHub Actions. See [auto-updates.md](./auto-updates.md).

## Specialization Tags

Smaller models are often specialized. Tag them during review:

| Type | Example |
|------|---------|
| Task-specific | `task:tables`, `task:signatures` |
| Domain-specific | `domain:finance`, `domain:medical` |
| Language-specific | `language:english` |

### How to Tag

When reviewing automated PRs:

1. Check model card on Hugging Face
2. Determine if model is specialized or general
3. Add `"specialization": "type:value"` if specialized

### Examples

| Model | Tag |
|-------|-----|
| `microsoft/table-transformer-detection` | `task:tables` |
| `ProsusAI/finbert` | `domain:finance` |
| `openai/whisper-small.en` | `language:english` |
| `google/vit-base-patch16-224` | `general` |

## Environmental Scoring

- **Score 1**: ≤500MB
- **Score 2**: ≤4GB
- **Score 3**: >4GB

See [environmental-methodology.md](./environmental-methodology.md) for details.
