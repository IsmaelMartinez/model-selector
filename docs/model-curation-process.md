# Model Curation Process

The model dataset (`src/lib/data/models.json`) contains 200+ curated AI models organized by task and tier. Models are automatically aggregated from Hugging Face Hub daily (2 AM UTC).

## Tier System

| Tier | Size | Use Cases |
|------|------|-----------|
| **Lightweight** | ≤500MB | Edge, mobile, browser |
| **Standard** | ≤4GB | Cloud APIs, quantized LLMs |
| **Advanced** | ≤20GB | Full-precision 7B+ models |
| **Extra Large** | No limit | 70B+ models, research |

## Specialization

Smaller models tend to be highly specialized. The `specialization` field tracks this:

| Type | Example |
|------|---------|
| Task-Specific | `task:tables`, `task:signatures` |
| Domain-Specific | `domain:finance`, `domain:medical` |
| Language-Specific | `language:english` |

See [model-specialization-curation.md](./model-specialization-curation.md) for the curation guide.

## Automated Updates

Daily workflow (`.github/workflows/models-updater.yml`):

1. Fetches models from Hugging Face API (sorted by downloads)
2. Organizes by task category and tier
3. Calculates environmental scores
4. **Preserves curated `specialization` tags**
5. Creates PR for human review

### Manual Commands

```bash
npm run update-models          # Actual update
npm run update-models:dry-run  # Preview only
```

## Review Checklist

When reviewing automated PRs:

- [ ] New models are relevant and high-quality
- [ ] **Add specialization tags** to new specialized models
- [ ] No critical models removed
- [ ] Bundle size <2MB

## Environmental Scoring

- **Score 1**: ≤500MB, edge-friendly
- **Score 2**: ≤4GB, cloud deployment
- **Score 3**: >4GB, specialized hardware

## Related Docs

- [Auto-Update Strategy](./auto-update-strategy.md)
- [Specialization Curation](./model-specialization-curation.md)
- [Data Structure](./data-structure.md)
- [Environmental Methodology](./environmental-methodology.md)

---
*Last Updated: December 2025 | Automation: Daily at 2 AM UTC*
