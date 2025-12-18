# Automated Model Updates

Models are updated daily via GitHub Actions (2 AM UTC).

## How It Works

1. Fetches popular models from Hugging Face API
2. Organizes by task category and size tier
3. Calculates environmental scores
4. Creates a PR for review

## Manual Commands

```bash
npm run update-models          # Run update
npm run update-models:dry-run  # Preview changes
```

## PR Review Checklist

- [ ] New models are relevant
- [ ] Add `specialization` tags if needed (e.g., `task:tables`, `domain:finance`)
- [ ] No critical models removed

## Optional: Hugging Face Token

For better rate limits, add `HF_TOKEN` to GitHub Secrets:
1. Get token from https://huggingface.co/settings/tokens
2. Add to: Settings → Secrets → Actions → `HF_TOKEN`

## Files

| File | Purpose |
|------|---------|
| `.github/workflows/models-updater.yml` | Workflow |
| `src/lib/aggregation/ModelAggregator.js` | Update logic |
| `src/lib/data/models.json` | Model data |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Workflow not running | Check Actions enabled in repo settings |
| Rate limits (429) | Add HF_TOKEN secret |
| No changes detected | Normal if all models already exist |

