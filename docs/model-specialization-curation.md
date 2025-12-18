# Model Specialization Curation Guide

This document provides guidance for manually curating the `specialization` field for models in the AI Model Advisor dataset. Since smaller models tend to be highly specialized, this metadata is critical for user trust and appropriate recommendations.

## Why Manual Curation?

The `specialization` field cannot be reliably auto-detected from Hugging Face API metadata because:

1. **Model cards vary widely** in quality and completeness
2. **Specialization is semantic** - understanding what a model can and cannot do requires interpretation
3. **Edge cases matter** - a model's limitations are as important as its capabilities
4. **False positives are worse than missing data** - mislabeling a specialized model as general-purpose harms user trust

## Specialization Schema

```json
{
  "specialization": "type:value"
}
```

### Specialization Types

| Type | Prefix | Description | Examples |
|------|--------|-------------|----------|
| Task-Specific | `task:` | Model trained for a single narrow task | `task:tables`, `task:signatures`, `task:nsfw` |
| Domain-Specific | `domain:` | Model trained on domain-specific data | `domain:finance`, `domain:medical`, `domain:legal` |
| Language-Specific | `language:` | Model supporting only specific language(s) | `language:english`, `language:spanish` |
| General Purpose | `general` | Explicitly general-purpose (no prefix) | `general` |

### Values

Keep values:
- **Lowercase** with hyphens for multi-word: `task:face-expression`, `domain:social-media`
- **Specific but concise**: `task:tables` not `task:table-detection-in-documents`
- **Standardized**: Use consistent terms across similar models

## Analysis Prompt

Use the following prompt with an LLM to analyze a model's specialization:

---

### Prompt: Model Specialization Analysis

```
I need you to analyze an AI model to determine if it is specialized (optimized for a narrow task/domain) or general-purpose.

**Model Information:**
- Name: [MODEL_NAME]
- Hugging Face ID: [HUGGINGFACE_ID]
- Task Category: [e.g., object-detection, text-classification]
- Model Card/Description: [PASTE DESCRIPTION OR LINK]

**Analysis Questions:**

1. **Task Scope**: Does this model perform ONE specific task (e.g., detect tables only) or a BROAD class of tasks (e.g., detect any object)?

2. **Training Data Domain**: Was this model trained on:
   - General/diverse data (ImageNet, Common Crawl, etc.)
   - Domain-specific data (financial news, medical records, social media, etc.)
   - Task-specific data (only tables, only signatures, only faces, etc.)

3. **Language Support** (for NLP/Speech models):
   - Multilingual (many languages)
   - Single language (which one?)
   - Language-agnostic

4. **What can this model NOT do?**
   - List 2-3 related tasks that a user might expect but this model cannot perform

5. **Recommended Specialization Tag**:
   Based on the above, what specialization tag should be assigned?
   - `task:[specific-task]` if task-specialized
   - `domain:[domain-name]` if domain-specialized  
   - `language:[language]` if language-specific
   - `general` if truly general-purpose
   - (none) if uncertain - leave for human review

**Output Format:**
```json
{
  "modelId": "[id]",
  "specialization": "[type:value or general or null]",
  "reasoning": "[1-2 sentence explanation]",
  "limitations": ["list", "of", "what it cannot do"],
  "confidence": "high|medium|low"
}
```
```

---

## Decision Tree

```
Is this model trained for ONE specific task/entity type?
├── YES → task:[specific-task]
│   Examples:
│   - Table detection only → task:tables
│   - Signature detection → task:signatures
│   - Face age estimation → task:face-age
│   - Toxicity detection → task:toxicity
│
└── NO → Is it trained on domain-specific data?
    ├── YES → domain:[domain]
    │   Examples:
    │   - Financial texts → domain:finance
    │   - Medical records → domain:medical
    │   - Twitter/social → domain:social-media
    │   - Legal documents → domain:legal
    │
    └── NO → Is it language-specific?
        ├── YES → language:[language]
        │   Examples:
        │   - English only → language:english
        │   - Spanish only → language:spanish
        │
        └── NO → It's general-purpose
            - Either omit the field
            - Or explicitly set: general
```

## Examples

### Specialized Models

| Model | Analysis | Tag |
|-------|----------|-----|
| `microsoft/table-transformer-detection` | Only detects tables in documents, not other objects | `task:tables` |
| `tech4humans/yolov8s-signature-detector` | Only detects signatures, trained on signature data | `task:signatures` |
| `ProsusAI/finbert` | BERT fine-tuned on financial news for financial sentiment | `domain:finance` |
| `cardiffnlp/twitter-roberta-base-sentiment` | RoBERTa fine-tuned on Twitter data, optimized for informal text | `domain:social-media` |
| `openai/whisper-small.en` | English-only variant of Whisper | `language:english` |
| `pyannote/voice-activity-detection` | Only detects voice presence, doesn't transcribe | `task:voice-activity-detection` |

### General-Purpose Models

| Model | Analysis | Tag |
|-------|----------|-----|
| `google/vit-base-patch16-224` | Trained on ImageNet, classifies 1000+ categories | `general` or (none) |
| `bert-base-uncased` | General English language understanding | (none) |
| `openai/whisper-large-v3` | Supports 99+ languages, general transcription | (none) |
| `facebook/detr-resnet-50` | General object detection (COCO categories) | (none) |

## Curation Workflow

### When New Models Are Added

1. **Run the automated aggregation** - New models added without specialization
2. **Review the PR** - Check new models in `models.json` diff
3. **For each new model without specialization**:
   - Visit the Hugging Face model card
   - Use the analysis prompt above
   - Determine appropriate specialization tag
   - Add to the model in `models.json`
4. **Approve and merge** once specialization tags are added

### Quarterly Review

Every quarter, review existing specialization tags:

1. **Validate accuracy** - Check model cards haven't changed
2. **Standardize terminology** - Ensure consistent tag values
3. **Fill gaps** - Add tags to models that were skipped
4. **Update documentation** - Add new specialization values to this guide

## Automation Notes

The `ModelAggregator.js` is configured to:

1. **Preserve existing specialization** - When updating a model, the existing `specialization` field is kept
2. **Prioritize curated models** - Models with specialization tags sort higher in relevance ranking
3. **Protect from removal** - Curated models won't be pushed out by new high-download models

This means specialization tags you add will persist through automated updates.

## Tier and Specialization Relationship

There is a strong correlation between model size tier and specialization:

| Tier | Size Limit | Typical Specialization |
|------|------------|------------------------|
| **Lightweight** | ≤500MB | Often highly specialized (`task:`, `domain:`, `language:`) |
| **Standard** | ≤4GB | Mix of specialized and general-purpose |
| **Advanced** | ≤20GB | Usually general-purpose (7B+ LLMs) |
| **Extra Large** | No limit | General-purpose foundation models (70B+) |

### Why Smaller Models Are More Specialized

1. **Capacity concentration** - Limited parameters must focus on specific tasks
2. **Fine-tuning economics** - Cheaper to specialize small models
3. **Deployment constraints** - Edge devices need task-specific optimization
4. **Distillation artifacts** - Small models often distilled from larger ones for specific tasks

### Curation Implications

- **Lightweight tier**: Assume specialized unless clearly general-purpose
- **Standard tier**: Evaluate case-by-case
- **Advanced tier**: Assume general-purpose unless explicitly specialized (e.g., CodeLlama)
- **Extra Large tier**: Almost always general-purpose foundation models

### Example: Code Models Across Tiers

| Model | Size | Tier | Specialization |
|-------|------|------|----------------|
| Qwen2.5 Coder 0.5B | 500MB | Lightweight | `domain:code` |
| DeepSeek Coder 1.3B | 2.6GB | Standard | `domain:code` |
| CodeLlama 7B | 14GB | Advanced | `domain:code` |

All are code-specialized regardless of tier, but larger models have broader code capabilities.

## Common Pitfalls

### Don't Over-Tag

❌ **Wrong**: Tagging `bert-base-uncased` as `domain:general-text`
✅ **Right**: Leave it without a tag (it's truly general-purpose)

### Don't Under-Tag

❌ **Wrong**: Leaving `finbert` without a tag because "it still does sentiment"
✅ **Right**: Tag as `domain:finance` because it's specifically optimized for financial text

### Be Specific

❌ **Wrong**: `task:detection` (too vague)
✅ **Right**: `task:tables` or `task:signatures` (specific)

### Language vs Domain

❌ **Wrong**: Tagging a Spanish sentiment model as only `language:spanish`
✅ **Right**: Consider if it's also domain-specific. A Spanish Twitter model might be `domain:social-media` with a note that it's Spanish-only.

---

*Last Updated: December 2025*
*See also: [Model Specialization Patterns Research](research/model-specialization-patterns.md)*

