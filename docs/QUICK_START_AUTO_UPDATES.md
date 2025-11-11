# Quick Start: Automated Model Updates

**Status**: ✅ Phase 1 Implemented
**Schedule**: Daily at 2 AM UTC
**Node.js**: 22 (latest LTS)

---

## What Was Implemented

✅ **Automated Daily Updates**
- GitHub Actions workflow runs daily at 2 AM UTC
- Fetches latest models from Hugging Face API
- Creates pull request with updated models.json (only if changes detected)
- Human review before merging

✅ **Manual Trigger Available**
- Can run workflow anytime via GitHub Actions UI
- Test with dry-run mode before committing

✅ **Comprehensive Documentation**
- Full 3-phase strategy documented
- Troubleshooting guide included
- Free tier limits explained

---

## Files Created/Updated

| File | Status | Purpose |
|------|--------|---------|
| `.github/workflows/update-models.yml` | ✅ New | Monthly automation workflow |
| `docs/AUTO_UPDATE_STRATEGY.md` | ✅ New | Complete strategy documentation |
| `docs/MODEL_CURATION_PROCESS.md` | ✅ Updated | Removed defunct Papers with Code |
| `docs/QUICK_START_AUTO_UPDATES.md` | ✅ New | This file - quick reference |

---

## How to Use

### Option 1: Wait for Automatic Run
- Workflow runs automatically daily at 2 AM UTC
- Check GitHub → Actions for execution
- Review and merge the automated PR (created only when new models found)

### Option 2: Manual Trigger
1. Go to GitHub → Actions tab
2. Select "Update Model Dataset" workflow
3. Click "Run workflow" → Select branch → "Run workflow"
4. Wait for completion (~2-5 minutes)
5. Review the generated PR

### Option 3: Local Testing
```bash
# Test without making changes
npm run update-models:dry-run

# Run actual update locally
npm run update-models

# Review changes
git diff src/lib/data/models.json
```

---

## Optional: Add Hugging Face Token

For better rate limits (recommended but not required):

1. **Get Token**:
   - Go to https://huggingface.co/settings/tokens
   - Create new token (read access only)
   - Copy the token

2. **Add to GitHub**:
   - Go to repo Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `HF_TOKEN`
   - Value: paste your token
   - Click "Add secret"

3. **Benefits**:
   - Without token: 1000 calls/day (sufficient for daily updates - we use ~160/day)
   - With token: Much higher limits (recommended for reliability)

---

## What Happens Next

### First Automated Run
- **When**: Daily at 2 AM UTC (starting tomorrow)
- **Duration**: ~2-5 minutes
- **Output**: Pull request with updated models (only if new models found)

### Expected PR Contents
- Updated `src/lib/data/models.json`
- 0-5 new models added (varies by day; more during active periods)
- Updated lastUpdated timestamp
- Detailed PR description with review checklist

### Your Review Tasks
1. Check that new models are relevant
2. Verify metadata looks reasonable
3. Ensure tests pass (automatic)
4. Optionally test locally
5. Merge the PR

### After Merge
- Automatic deployment to GitHub Pages
- New models live on your site
- Next update tomorrow (daily schedule)

---

## Monitoring

### Check Workflow Status
- GitHub → Actions → "Update Model Dataset"
- Green checkmark = success
- Red X = failure (check logs)

### Check Dataset Age
```bash
# View last update date
cat src/lib/data/models.json | grep lastUpdated
```

### Check Model Count
```bash
# Count total models
cat src/lib/data/models.json | grep '"id":' | wc -l
```

---

## Troubleshooting

### "Workflow not running"
- Check: Settings → Actions → General → "Allow all actions"
- Or manually trigger via Actions UI

### "No changes detected"
- Normal on quiet days when all fetched models already in dataset
- Many days may have no new models (this is expected)
- HF API might be returning cached results
- Try manual dry-run: `npm run update-models:dry-run`

### "API rate limit errors"
- Add HF_TOKEN secret (see above)
- Or reduce models per category in ModelAggregator.js

### "Tests failing in PR"
- Check CI logs for specific errors
- Test locally: `npm test`
- May need to update test expectations

---

## Next Steps

### Immediate
1. ✅ Changes committed to your branch
2. ✅ Pushed to remote
3. ⏳ Merge PR to main branch
4. ⏳ Wait for first automated run (tomorrow at 2 AM UTC)

### Short Term (1-2 weeks)
1. Monitor first few automated PRs
2. Validate data quality
3. Adjust settings if needed (may want to reduce frequency if too noisy)
4. Consider Phase 2 (Gemini validation)

### Long Term (3-6 months)
1. Implement Phase 2 smart validation
2. Add community features (Phase 3)
3. Optimize based on real usage

---

## Documentation

For complete details, see:

- **Full Strategy**: [`AUTO_UPDATE_STRATEGY.md`](./AUTO_UPDATE_STRATEGY.md)
- **Curation Process**: [`MODEL_CURATION_PROCESS.md`](./MODEL_CURATION_PROCESS.md)
- **Workflow File**: [`../.github/workflows/update-models.yml`](../.github/workflows/update-models.yml)
- **Aggregator Code**: [`../src/lib/aggregation/ModelAggregator.js`](../src/lib/aggregation/ModelAggregator.js)

---

## Phase Roadmap

| Phase | Status | Description | Timeline |
|-------|--------|-------------|----------|
| **Phase 1** | ✅ Active | Basic HF API automation | Implemented |
| **Phase 2** | 📋 Planned | Gemini validation & smart extraction | 1-3 months |
| **Phase 3** | 💡 Future | Community features & feedback | 3-6 months |

---

## Questions?

- Review full documentation in `docs/AUTO_UPDATE_STRATEGY.md`
- Check workflow logs in GitHub Actions
- Test locally with `npm run update-models:dry-run`
- Open GitHub issue for bugs or improvements

---

**Ready to go!** 🚀

The automated update system is now active and will run daily at 2 AM UTC.
