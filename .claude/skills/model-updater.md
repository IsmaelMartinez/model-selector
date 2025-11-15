---
description: Update model database from HuggingFace Hub with validation
tags: [data, models, huggingface]
---

# Model Updater Skill

You are helping update the model database from HuggingFace Hub. Follow this workflow:

## Update Process

### 1. Dry Run First (ALWAYS)

```bash
npm run update-models:dry-run
```

**Review the output:**
- How many models will be added?
- How many models will be updated?
- Are there any errors or warnings?
- Do the changes look reasonable?

### 2. Review Changes

Ask yourself:
- Are the new models relevant to our 7 categories?
- Do they have appropriate environmental scores?
- Are the model sizes reasonable?
- Do they support browser deployment (transformers.js)?

**Categories to consider:**
1. computer_vision
2. natural_language_processing
3. speech_processing
4. time_series
5. recommendation_systems
6. reinforcement_learning
7. data_preprocessing

**Tiers:**
- lightweight: <100MB (environmentalScore: 1)
- standard: <500MB (environmentalScore: 2)
- advanced: <2000MB (environmentalScore: 3)

### 3. Run Actual Update

```bash
npm run update-models
```

This will:
- Fetch latest data from HuggingFace Hub
- Update `src/lib/data/models.json`
- Preserve existing manual edits

### 4. Validate Changes

```bash
# Run tests to ensure data structure is valid
npm test

# Start dev server to verify UI still works
npm run dev
# Visit localhost:5173 and test a few classifications
```

### 5. Review Git Diff

```bash
git diff src/lib/data/models.json
```

**Look for:**
- Unexpected removals (models shouldn't disappear)
- Size changes (verify accuracy)
- New models in appropriate categories
- Correct environmental scores

### 6. Commit Changes

```bash
git add src/lib/data/models.json
git commit -m "data: update model database from HuggingFace Hub

- Added X new models
- Updated Y existing models
- Categories: [list affected categories]
"
```

## Manual Model Addition

If you need to manually add a model (not from HuggingFace update):

1. Find the right location in `src/lib/data/models.json`:
   - Category → Subcategory → Tier

2. Add model with required fields:
```json
{
  "id": "unique-id",
  "name": "Model Name",
  "huggingFaceId": "org/model-name",
  "description": "Brief description",
  "sizeMB": 75,
  "accuracy": 0.92,
  "environmentalScore": 1,
  "deploymentOptions": ["browser", "edge"],
  "frameworks": ["transformers.js"],
  "lastUpdated": "2025-01-15"
}
```

3. Validate and test (steps 4-6 above)

## Troubleshooting

**Update fails:**
- Check internet connection
- Verify HuggingFace Hub is accessible
- Check `src/lib/aggregation/ModelAggregator.js` for errors

**Tests fail after update:**
- Review data structure in models.json
- Check for missing required fields
- Verify JSON syntax is valid

**UI breaks after update:**
- Verify tier structure is intact
- Check that all models have required fields
- Test classification with `npm run dev`

## Usage

When user asks to "update models" or "refresh model data", use this skill to safely update the database with proper validation.
