# Model Selector Documentation

This directory contains comprehensive documentation for the Model Selector project.

## Contents

### User Documentation
- [`usage.md`](usage.md) - Quick usage guide
- [`user-guide.md`](user-guide.md) - Detailed user guide with examples

### Technical Documentation
- [`data-structure.md`](data-structure.md) - Data structure and model tiering
- [`environmental-methodology.md`](environmental-methodology.md) - Environmental impact scoring methodology
- [`model-curation-process.md`](model-curation-process.md) - How models are curated and updated
- [`auto-update-strategy.md`](auto-update-strategy.md) - Automated model update strategy
- [`quick-start-auto-updates.md`](quick-start-auto-updates.md) - Quick start for auto updates

### Architecture Decision Records (ADRs)
- [`adrs/adr-0001-sveltekit-vite-rules-first-mvp.md`](adrs/adr-0001-sveltekit-vite-rules-first-mvp.md) - Tech stack decision
- [`adrs/adr-0002-task-classification-model-selection.md`](adrs/adr-0002-task-classification-model-selection.md) - Task classification approach
- [`adrs/adr-0003-browser-llm-classification-model-selection.md`](adrs/adr-0003-browser-llm-classification-model-selection.md) - Browser LLM selection (Llama 3.2 1B)
- [`adrs/adr-0004-slm-model-selection.md`](adrs/adr-0004-slm-model-selection.md) - SLM evaluation (rejected approach)
- [`adrs/adr-0005-automated-model-dataset-updates.md`](adrs/adr-0005-automated-model-dataset-updates.md) - Automated updates decision
- [`adrs/adr-0006-model-accuracy-filtering.md`](adrs/adr-0006-model-accuracy-filtering.md) - Accuracy filtering feature
- [`adrs/adr-0007-ensemble-classification-mode.md`](adrs/adr-0007-ensemble-classification-mode.md) - Ensemble classification mode

### Research
- [`research/browser-slm-learnings.md`](research/browser-slm-learnings.md) - Browser SLM technical evaluation and learnings

## Overview

The Model Selector is designed to help users choose the most environmentally efficient AI models for their specific tasks through an intuitive, portable interface that works offline.

### Key Principles

- **Environmental Focus**: "Smaller is better" philosophy
- **Privacy First**: Runs locally in browser, no external data transmission
- **Offline Capable**: PWA with browser-based AI
- **Accessible**: Full keyboard navigation and screen reader support
