---
description: Interactive guide for adding a new AI model to the database
tags: [data, models, curation]
---

# Add Model Skill

You are helping add a new AI model to the Model Selector database. Follow this interactive workflow:

## Step 1: Gather Model Information

**Ask the user for:**
1. Model name and HuggingFace ID (e.g., "facebook/detr-resnet-50")
2. What task does it perform? (classification, detection, etc.)
3. Model size in MB
4. Accuracy/performance metrics (if known)
5. Deployment options (browser, edge, cloud)
6. Framework compatibility (transformers.js, ONNX, etc.)

## Step 2: Determine Category and Tier

**Categories (choose one):**
1. `computer_vision` - Image tasks
2. `natural_language_processing` - Text tasks
3. `speech_processing` - Audio/speech tasks
4. `time_series` - Time series forecasting
5. `recommendation_systems` - Recommendation engines
6. `reinforcement_learning` - RL agents
7. `data_preprocessing` - Data cleaning/prep

**Subcategories** - Check `src/lib/data/tasks.json` for valid subcategories under chosen category

**Tier (based on size):**
- `lightweight`: <100MB (environmentalScore: 1)
- `standard`: 100-500MB (environmentalScore: 2)
- `advanced`: >500MB (environmentalScore: 3)

## Step 3: Calculate Environmental Score

Based on model size:
- **Score 1 (Low):** <100MB, <0.1 kWh/day
- **Score 2 (Medium):** 100-500MB, 0.1-1.0 kWh/day
- **Score 3 (High):** >500MB, >1.0 kWh/day

**Use lower score when:**
- Model has efficient quantization
- Supports edge deployment
- Uses optimized frameworks (transformers.js, ONNX)

## Step 4: Create Model Entry

```bash
# Open the models file
# nano src/lib/data/models.json  # or use your editor
```

**Navigate to:** `category` → `subcategory` → `tier`

**Add this structure:**
```json
{
  "id": "unique-descriptive-id",
  "name": "Model Display Name",
  "huggingFaceId": "org/model-name",
  "description": "Brief description of what the model does and its strengths",
  "sizeMB": 75,
  "accuracy": 0.92,
  "environmentalScore": 1,
  "deploymentOptions": ["browser", "edge"],
  "frameworks": ["transformers.js"],
  "lastUpdated": "2025-01-15"
}
```

**Field Guidelines:**
- `id`: Use format like `cv-image-class-mobilenet-v3`
- `name`: User-friendly display name
- `description`: 1-2 sentences, focus on use case
- `sizeMB`: Actual model size (check HuggingFace model card)
- `accuracy`: If known, otherwise use null or omit
- `environmentalScore`: 1-3 based on size/efficiency
- `deploymentOptions`: Where can it run? ["browser", "edge", "cloud"]
- `frameworks`: ["transformers.js", "ONNX", "TensorFlow.js"]
- `lastUpdated`: Today's date in YYYY-MM-DD format

## Step 5: Validate JSON

```bash
# Check JSON syntax
node -e "JSON.parse(require('fs').readFileSync('src/lib/data/models.json'))"
```

**Must complete without errors** ✅

## Step 6: Test the Changes

```bash
# Run tests
npm test

# Start dev server
npm run dev
```

**In browser (localhost:5173):**
1. Enter a task description that matches this model's category
2. Verify the new model appears in recommendations
3. Check that environmental score displays correctly
4. Verify model details are accurate

## Step 7: Commit

```bash
git add src/lib/data/models.json
git commit -m "data: add [Model Name] to [category]

- Model: [name] ([sizeMB]MB)
- Category: [category]/[subcategory]
- Tier: [tier]
- Environmental Score: [score]
"
```

## Example: Adding MobileNetV3

```json
{
  "id": "cv-image-class-mobilenet-v3",
  "name": "MobileNetV3-Small",
  "huggingFaceId": "google/mobilenet_v3_small_100_224",
  "description": "Efficient image classification optimized for mobile and edge devices. Excellent for real-time applications.",
  "sizeMB": 9.5,
  "accuracy": 0.675,
  "environmentalScore": 1,
  "deploymentOptions": ["browser", "edge", "mobile"],
  "frameworks": ["transformers.js", "TensorFlow.js"],
  "lastUpdated": "2025-01-15"
}
```

This would go in:
`src/lib/data/models.json` → `computer_vision` → `image_classification` → `lightweight` array

## Validation Checklist

Before committing:
- [ ] JSON is valid
- [ ] Model is in correct category/subcategory/tier
- [ ] Environmental score matches size
- [ ] All required fields present
- [ ] Description is clear and concise
- [ ] Tests pass (`npm test`)
- [ ] Model appears in UI correctly
- [ ] No duplicate IDs

## Resources

- See `docs/MODEL_CURATION_PROCESS.md` for detailed guidelines
- Check `src/lib/data/tasks.json` for valid categories/subcategories
- Review existing models for examples
- HuggingFace model cards for specifications

## Usage

When user wants to "add a model" or "include a new model", use this skill to guide them through the complete process with validation.
