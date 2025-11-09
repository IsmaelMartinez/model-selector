# Model Curation Process

## Quick Summary

The model dataset (`src/lib/data/models.json`) contains 200+ curated AI models organized by task and performance tier. Models are automatically aggregated from Hugging Face Hub based on popularity, downloads, and deployment feasibility, with quarterly updates via automated workflows.

## Data Sources

**Primary Sources:**
- **Hugging Face Model Hub**: Model metadata, IDs, framework support, downloads, popularity
- **Automated Aggregation**: Monthly updates via GitHub Actions workflow
- **Official Documentation**: Vendor specs (Google, Microsoft, Meta) for manual validation

**Selection Criteria:**
- Open-source with Hugging Face availability
- Multiple deployment options (browser/cloud/edge)  
- Active maintenance and framework support
- Size-based tiers: Lightweight (<100MB), Standard (100-500MB), Advanced (>500MB)

## Data Collection Process

**Automated Collection (Primary):**

The project uses an automated GitHub Actions workflow (`.github/workflows/update-models.yml`) that runs monthly:

```bash
# Automated monthly aggregation via workflow
# Queries Hugging Face API for popular models by task
npm run update-models

# Manual dry-run for testing
npm run update-models:dry-run

# Direct API query example
curl "https://huggingface.co/api/models?pipeline_tag=image-classification&sort=downloads&limit=20"
```

**Automated Processing:**
1. Fetch models from Hugging Face API (sorted by downloads/popularity)
2. Extract metadata: size, frameworks, last updated, downloads, likes
3. Categorize by task (7 main categories: CV, NLP, Speech, etc.)
4. Organize into 3-tier system (Lightweight/Standard/Advanced) based on size
5. Calculate environmental scores based on size and deployment options
6. Deduplicate and merge with existing dataset
7. Create pull request for human review

**Manual Review (Post-Automation):**
1. Review PR for quality of new models
2. Verify metadata accuracy
3. Check for breaking changes
4. Test bundle size remains acceptable
5. Approve or reject automated updates

**Environmental Scoring:**
- Score 1 (Low): <100MB, edge-friendly, <5W power consumption
- Score 2 (Medium): 100-500MB, cloud deployment, 5-50W power
- Score 3 (High): >500MB, specialized hardware, >50W power

## Automated Update Process

**Monthly Automated Updates:**

The system now automatically updates via GitHub Actions on the 1st of each month:

1. **Workflow Trigger**: GitHub Actions runs `.github/workflows/update-models.yml`
2. **Model Aggregation**: `src/lib/aggregation/ModelAggregator.js` fetches from HF API
3. **Processing**: Models organized, tiered, and validated
4. **PR Creation**: Automated pull request with updated `models.json`
5. **Human Review**: Maintainer reviews and approves
6. **Deployment**: Merged PR triggers automatic deployment to GitHub Pages

**Manual Updates (When Needed):**

```bash
# 1. Setup environment (already in package.json)
npm install

# 2. Optional: Set Hugging Face token for better rate limits
export HF_TOKEN="your_token"

# 3. Test update (dry-run, no file changes)
npm run update-models:dry-run

# 4. Perform actual update
npm run update-models

# 5. Review changes
git diff src/lib/data/models.json

# 6. Commit and push (or workflow does this automatically)
git add src/lib/data/models.json
git commit -m "chore: update model dataset"
git push
```

**For Complete Documentation:**
See [`docs/AUTO_UPDATE_STRATEGY.md`](./AUTO_UPDATE_STRATEGY.md) for:
- Detailed automation strategy (3 phases)
- Setup and configuration
- Monitoring and troubleshooting
- Free tier limits and costs
- Future enhancements (Gemini validation, community features)

**Current Implementation Status:**
- ✅ **Phase 1**: Basic automation with HF API (ACTIVE)
- 📋 **Phase 2**: Smart validation with Gemini (PLANNED)
- 💡 **Phase 3**: Community enhancement (FUTURE)

**Known Limitations (Phase 1):**
- Environmental scores are estimates based on model size (Phase 2 will use real params)
- Accuracy metrics are estimates (Phase 2 will extract from model cards)
- No automated quality validation yet (Phase 2 will add Gemini validation)
- Coverage focused on popular models (sorted by downloads)
- English-language models primarily

**Monitoring:**
- Workflow runs: GitHub → Actions → "Update Model Dataset"
- Review PRs tagged with `automated/model-update-*`
- Check `models.json` lastUpdated timestamp
- Verify bundle size remains <2MB after updates

---
*Last Updated: November 9, 2025*
*Automation: Phase 1 Active*