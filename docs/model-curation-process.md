# Model Curation Process

## Quick Summary

The model dataset (`src/lib/data/models.json`) contains 200+ curated AI models organized by task and performance tier. Models are automatically aggregated from Hugging Face Hub based on popularity, downloads, and deployment feasibility, with daily updates via automated workflows (2 AM UTC).

## Tier System

Models are organized into four performance tiers based on size:

| Tier | Size Limit | Description | Typical Use Cases |
|------|------------|-------------|-------------------|
| **Lightweight** | ≤500MB | Edge/mobile deployable models | Mobile apps, browser inference, IoT |
| **Standard** | ≤4GB | Production-ready including quantized LLMs | Cloud APIs, server inference |
| **Advanced** | ≤20GB | Full-precision 7B+ models | Enterprise, research, max capability |
| **Extra Large** | No limit | Very large models (13B+, 70B+) | Research, specialized infrastructure |

### Why These Thresholds?

- **500MB**: Upper limit for comfortable edge deployment
- **4GB**: Quantized 7B models (Q4/Q8) fit here, runnable on consumer GPUs
- **20GB**: Full-precision 7B-13B models, requires dedicated hardware
- **No limit**: 70B+ models, multi-GPU setups, research clusters

## Data Sources

**Primary Sources:**
- **Hugging Face Model Hub**: Model metadata, IDs, framework support, downloads, popularity
- **Automated Aggregation**: Daily updates via GitHub Actions workflow (2 AM UTC)
- **Official Documentation**: Vendor specs (Google, Microsoft, Meta) for manual validation

**Selection Criteria:**
- Open-source with Hugging Face availability
- Multiple deployment options (browser/cloud/edge)  
- Active maintenance and framework support
- Size within tier limits

## Model Specialization

Smaller models tend to be highly specialized for narrow tasks. The `specialization` field tracks this:

| Type | Prefix | Example |
|------|--------|---------|
| Task-Specific | `task:` | `task:tables`, `task:signatures` |
| Domain-Specific | `domain:` | `domain:finance`, `domain:medical` |
| Language-Specific | `language:` | `language:english`, `language:spanish` |

**Key Points:**
- Lightweight models are often specialized (capacity concentration)
- Advanced models are usually general-purpose
- Specialization is manually curated, not auto-detected

See [`docs/model-specialization-curation.md`](./model-specialization-curation.md) for the full curation guide.

## Data Collection Process

**Automated Collection (Primary):**

The project uses an automated GitHub Actions workflow (`.github/workflows/models-updater.yml`) that runs daily at 2 AM UTC:

```bash
# Automated daily aggregation via workflow
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
4. Organize into 3-tier system based on size thresholds
5. Calculate environmental scores based on size and deployment options
6. **Preserve curated fields** (specialization) from existing models
7. Deduplicate and merge with existing dataset
8. Create pull request for human review

**Manual Review (Post-Automation):**
1. Review PR for quality of new models
2. Verify metadata accuracy
3. **Add specialization tags** to new models (see curation guide)
4. Check for breaking changes
5. Test bundle size remains acceptable
6. Approve or reject automated updates

**Environmental Scoring:**
- Score 1 (Low): ≤500MB, edge-friendly
- Score 2 (Medium): ≤4GB, cloud/server deployment
- Score 3 (High): >4GB, specialized hardware recommended (Advanced and XLarge)

## Automated Update Process

**Daily Automated Updates:**

The system automatically updates via GitHub Actions daily at 2 AM UTC:

1. **Workflow Trigger**: GitHub Actions runs `.github/workflows/models-updater.yml`
2. **Model Aggregation**: `src/lib/aggregation/ModelAggregator.js` fetches from HF API
3. **Processing**: Models organized, tiered, and validated
4. **Specialization Preservation**: Existing `specialization` tags are kept
5. **PR Creation**: Automated pull request with updated `models.json`
6. **Human Review**: Maintainer reviews, adds specialization tags, and approves
7. **Deployment**: Merged PR triggers automatic deployment to GitHub Pages

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
See [`docs/auto-update-strategy.md`](./auto-update-strategy.md) for:
- Detailed automation strategy (3 phases)
- Setup and configuration
- Monitoring and troubleshooting
- Free tier limits and costs
- Future enhancements (Gemini validation, community features)

**Current Implementation Status:**
- ✅ **Phase 1**: Basic automation with HF API (ACTIVE)
- ✅ **Specialization Curation**: Manual curation guide and preservation (ACTIVE)
- 📋 **Phase 2**: Smart validation with Gemini (PLANNED)
- 💡 **Phase 3**: Community enhancement (FUTURE)

**Known Limitations (Phase 1):**
- Environmental scores are estimates based on model size (Phase 2 will use real params)
- Accuracy metrics are estimates (Phase 2 will extract from model cards)
- No automated quality validation yet (Phase 2 will add Gemini validation)
- Specialization requires manual curation
- Coverage focused on popular models (sorted by downloads)
- English-language models primarily

**Monitoring:**
- Workflow runs: GitHub → Actions → "Update Model Dataset"
- Review PRs tagged with `automated/model-update-*`
- Check `models.json` lastUpdated timestamp
- Verify bundle size remains <2MB after updates

## Related Documentation

- [Model Specialization Curation Guide](./model-specialization-curation.md)
- [Auto-Update Strategy](./auto-update-strategy.md)
- [Data Structure](./data-structure.md)
- [Environmental Methodology](./environmental-methodology.md)

---
*Last Updated: December 2025*
*Automation: Phase 1 Active (Daily at 2 AM UTC)*
*Node.js: 22*
