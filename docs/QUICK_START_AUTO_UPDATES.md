# Quick Start: Automated Model Updates

**Status**: ✅ Phase 1 Implemented
**Ready to Use**: Yes, workflow active on next month's 1st

---

## What Was Implemented

✅ **Automated Monthly Updates**
- GitHub Actions workflow runs on 1st of each month at 2 AM UTC
- Fetches latest models from Hugging Face API
- Creates pull request with updated models.json
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
- Workflow runs automatically on the 1st of each month
- Check GitHub → Actions for execution
- Review and merge the automated PR

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
   - Without token: 1000 calls/day (sufficient for monthly updates)
   - With token: Much higher limits (recommended for reliability)

---

## What Happens Next

### First Automated Run
- **When**: 1st of next month at 2 AM UTC
- **Duration**: ~2-5 minutes
- **Output**: Pull request with updated models

### Expected PR Contents
- Updated `src/lib/data/models.json`
- 5-15 new models added (typically)
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
- Next update in 30 days

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
- Normal if all fetched models already in dataset
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
2. ⏳ Push to remote and create PR for review
3. ⏳ Merge to main branch
4. ⏳ Wait for first automated run (1st of month)

### Short Term (1-2 months)
1. Monitor first few automated PRs
2. Validate data quality
3. Adjust settings if needed
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

The automated update system is now active and will run on the 1st of each month.
