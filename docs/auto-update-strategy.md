# Automated Model Dataset Updates

**Status**: Phase 1 Active ✅  
**Schedule**: Daily at 2 AM UTC  
**Cost**: $0 (GitHub Actions + HF API free tiers)

## How It Works

```
GitHub Actions (daily) → ModelAggregator.js → Hugging Face API
                                ↓
                    Process & organize models
                                ↓
                    Create PR → Human review → Merge
```

### Process Details

1. **Fetch** - Query HF API for popular models by task category
2. **Organize** - Tier by size (Lightweight ≤500MB, Standard ≤4GB, Advanced ≤20GB, XLarge unlimited)
3. **Score** - Calculate environmental impact (1-3)
4. **Preserve** - Keep curated `specialization` tags from existing data
5. **Dedupe** - Merge with existing dataset, prioritize curated models
6. **PR** - Create pull request for review

## Configuration

### Files

| File | Purpose |
|------|---------|
| `.github/workflows/models-updater.yml` | Daily workflow |
| `src/lib/aggregation/ModelAggregator.js` | Aggregation logic |
| `src/lib/data/models.json` | Output dataset |

### Optional: HF Token

For better rate limits, add `HF_TOKEN` to GitHub Secrets:
1. Get token: https://huggingface.co/settings/tokens
2. Add to: Settings → Secrets → Actions → `HF_TOKEN`

## Manual Commands

```bash
npm run update-models          # Run update
npm run update-models:dry-run  # Preview only
```

## PR Review Checklist

- [ ] New models are relevant
- [ ] Add `specialization` tags to specialized models
- [ ] No critical models removed
- [ ] Bundle size acceptable

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Workflow not running | Check Actions enabled in repo settings |
| "No changes" every time | Test locally with `npm run update-models:dry-run` |
| Rate limits (429) | Add HF_TOKEN secret |
| Bundle too large | Reduce models per tier in ModelAggregator.js |

## Free Tier Limits

| Service | Limit | Our Usage |
|---------|-------|-----------|
| HF API (unauth) | 1000 calls/day | ~160/day |
| GitHub Actions | 2000 min/month | ~150/month |

## Future Phases (Planned)

**Phase 2**: Gemini-powered model card parsing for better accuracy metrics  
**Phase 3**: Community feedback integration

---
*See also: [Model Curation Process](./model-curation-process.md) | [Specialization Guide](./model-specialization-curation.md)*
