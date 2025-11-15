# Claude Configuration - AI Model Selector

## Project Overview

**AI Model Selector** is an open-source Progressive Web Application that helps users choose environmentally efficient AI models for their tasks. The project follows a "smaller is better" philosophy, prioritizing models with lower environmental impact while maintaining high accuracy.

**Live URL:** https://ismaelmartinez.github.io/model-selector
**Status:** MVP Complete (36/36 tasks) ✅
**Current Version:** 0.1.0

### Mission
Building sustainable AI by helping users discover and select the most environmentally efficient models for their specific tasks, with browser-based classification achieving 95.2% accuracy.

---

## Quick Start Commands

### Development
```bash
npm install              # Install all dependencies
npm run dev              # Start dev server at localhost:5173
npm run build            # Build for production → dist/
npm run preview          # Preview production build
```

### Testing
```bash
npm test                 # Fast tests (23 tests, ~2s) - CI-friendly
npm run test:llm         # LLM accuracy tests (48 tests, ~3min) - local only
```

### Data Management
```bash
npm run update-models           # Update model database from Hugging Face
npm run update-models:dry-run   # Preview updates without saving
```

### Vanilla JS Version
```bash
npm run dev:vanilla      # Dev server for vanilla JS version
npm run build:vanilla    # Build vanilla JS version
npm run preview:vanilla  # Preview vanilla JS build
```

---

## Technology Stack

### Core Framework
- **SvelteKit 2.0** with **Svelte 5** - Modern reactive UI framework
- **Vite 5.0** - Fast build tool and dev server
- **@sveltejs/adapter-static** - Static site generation for PWA deployment
- **ES Modules** - Modern JavaScript module system

### AI/ML Components
- **@huggingface/transformers 3.7.5** - Browser-based ML inference (ONLY production dependency)
- **Llama 3.2 1B-Instruct** - Task classification model (95.2% accuracy)
- **WebGPU** with WASM fallback - Hardware acceleration for inference

### Testing
- **Vitest 1.0** - Fast unit test runner
- **71 total tests:**
  - 23 fast tests (acceptance + integration, ~2s)
  - 48 LLM accuracy tests (~3min)

### Deployment
- **GitHub Pages** - Static hosting
- **GitHub Actions** - Automated CI/CD
- **Bundle Size:** ~40KB gzipped
- **Load Time:** <1 second

---

## Codebase Structure

```
/home/user/model-selector/
├── src/                              # Source code
│   ├── components/                   # Svelte UI components
│   │   ├── TaskInput.svelte          # Task input with validation
│   │   └── RecommendationDisplay.svelte  # Model recommendation cards
│   ├── lib/                          # Core business logic
│   │   ├── aggregation/              # Model data fetching & updates
│   │   │   ├── ModelAggregator.js    # HuggingFace Hub data aggregation
│   │   │   └── cli.js                # CLI for model updates
│   │   ├── classification/           # Task classification engines
│   │   │   ├── LLMTaskClassifier.js  # Browser LLM (Llama 3.2 1B)
│   │   │   ├── BrowserTaskClassifier.js  # Semantic/keyword fallback
│   │   │   ├── EnhancedTaskClassifier.js # Node.js version with API support
│   │   │   ├── TaskClassifier.js     # Legacy wrapper
│   │   │   └── ClassificationUtils.js  # Helper functions
│   │   ├── data/                     # Static data files
│   │   │   ├── models.json           # 2090 lines - Model database (3 tiers)
│   │   │   ├── tasks.json            # 166 lines - Task taxonomy (7 categories)
│   │   │   ├── DataStructure.js      # Indexing utilities (Node)
│   │   │   └── DataStructureBrowser.js  # Browser version
│   │   ├── environmental/            # Environmental impact scoring
│   │   │   ├── EnvironmentalImpactCalculator.js  # 1-3 scoring system
│   │   │   └── EnvironmentalUtils.js  # Comparison helpers
│   │   ├── recommendation/           # Model selection algorithm
│   │   │   └── ModelSelector.js      # "Smaller is better" ranking
│   │   └── validation/               # Data validation
│   │       └── aggregation-test.js   # Validation utilities
│   ├── routes/                       # SvelteKit routing
│   │   ├── +page.svelte              # Main application page
│   │   ├── +layout.svelte            # App layout wrapper
│   │   └── +layout.js                # Layout configuration
│   ├── main.js                       # Vanilla JS entry point
│   └── index.js                      # Module entry point
├── tests/                            # Test suites
│   ├── acceptance.test.js            # MVP acceptance tests (11 tests)
│   ├── integration.test.js           # Integration tests (7 tests)
│   └── llm-classification.test.js    # LLM accuracy tests (48 tests)
├── tasks/                            # Project management
│   ├── tasks-1-mvp-implementation.md # MVP task list (COMPLETED)
│   ├── tasks-2-llm-integration.md    # LLM integration (COMPLETED)
│   └── tasks-3-prd-accuracy-improvements.md  # Future enhancements
├── docs/                             # Documentation
│   ├── adrs/                         # Architecture Decision Records
│   │   ├── adr-0001-framework-choice.md
│   │   ├── adr-0002-task-classification-model-selection.md
│   │   ├── adr-0003-browser-llm-classification-model-selection.md
│   │   └── adr-0004-slm-model-selection.md
│   ├── ENVIRONMENTAL_METHODOLOGY.md  # Impact calculation details
│   ├── MODEL_CURATION_PROCESS.md     # Data curation guide
│   └── CONTRIBUTING.md               # Contribution guidelines
├── public/                           # Public assets
├── static/                           # PWA static assets
├── .github/workflows/                # CI/CD pipelines
│   ├── deploy.yml                    # Auto-deploy to GitHub Pages
│   └── update-models.yml             # Daily model data updates
├── vite.config.js                    # Vite configuration
├── svelte.config.js                  # SvelteKit configuration
├── index.html                        # Vanilla JS HTML entry
├── manifest.webmanifest              # PWA manifest
├── package.json                      # Dependencies
├── README.md                         # User-facing documentation
├── PROJECT_STATUS.md                 # Current project status
├── PROJECT_VISION.md                 # Mission and roadmap
└── CLAUDE.md                         # This file
```

---

## Key Conventions and Patterns

### 1. "Smaller is Better" Philosophy
**Core Principle:** Environmental sustainability through model efficiency

**Implementation:**
- `ModelSelector.rankBySize()` in `src/lib/recommendation/ModelSelector.js:23-45`
- Ranks models by tier: lightweight (priority 1) > standard (priority 2) > advanced (priority 3)
- Within each tier, smaller models rank higher
- Returns top 3 recommendations per category

**Example:**
```javascript
// Tier-based ranking with size sorting
const ranked = ModelSelector.rankBySize(models);
// Result: [lightweight 50MB, lightweight 80MB, standard 150MB]
```

### 2. Classification Pipeline
**Multi-Stage Fallback Strategy** for robustness:

1. **LLM Classification** (Primary) - `LLMTaskClassifier.js:45-120`
   - Llama 3.2 1B-Instruct via transformers.js
   - 95.2% accuracy across 7 categories
   - Browser-based, no API calls

2. **Semantic Similarity** (Fallback 1) - `BrowserTaskClassifier.js:78-145`
   - N-gram matching with task keywords
   - Confidence-based scoring

3. **Keyword Matching** (Fallback 2) - `BrowserTaskClassifier.js:156-189`
   - Direct keyword lookup
   - Category priority list

4. **Default Category** (Final Fallback)
   - Returns "natural_language_processing" with low confidence

### 3. Environmental Scoring System
**Three-Tier Impact Scale** - `EnvironmentalImpactCalculator.js:12-35`

| Score | Energy Consumption | Model Size | Priority |
|-------|-------------------|------------|----------|
| 1 (Low) | <0.1 kWh/day | <100MB | Highest |
| 2 (Medium) | 0.1-1.0 kWh/day | <500MB | Medium |
| 3 (High) | >1.0 kWh/day | <2000MB | Lowest |

**Calculation factors:**
- Model size (primary)
- Deployment options
- Framework efficiency
- Hardware requirements

### 4. Data Structure Organization

#### Models Data (`src/lib/data/models.json`)
```json
{
  "category": {
    "subcategory": {
      "tier": [
        {
          "id": "unique-id",
          "name": "Model Name",
          "huggingFaceId": "org/model-name",
          "description": "...",
          "sizeMB": 50,
          "accuracy": 0.95,
          "environmentalScore": 1,
          "deploymentOptions": ["browser", "edge"],
          "frameworks": ["transformers.js"],
          "lastUpdated": "2025-01-15"
        }
      ]
    }
  }
}
```

**Categories (7):**
1. `computer_vision` - Image classification, object detection, segmentation
2. `natural_language_processing` - Text classification, sentiment, NER, translation
3. `speech_processing` - Speech recognition, text-to-speech
4. `time_series` - Forecasting, anomaly detection
5. `recommendation_systems` - Collaborative filtering, content-based
6. `reinforcement_learning` - Game playing, robot control
7. `data_preprocessing` - Data cleaning, normalization

**Tiers (3):**
- `lightweight`: <100MB (environmentalScore: 1)
- `standard`: <500MB (environmentalScore: 2)
- `advanced`: <2000MB (environmentalScore: 3)

#### Tasks Data (`src/lib/data/tasks.json`)
```json
{
  "category": {
    "subcategory": {
      "label": "Display Name",
      "description": "What this task does",
      "keywords": ["keyword1", "keyword2"],
      "examples": ["example1", "example2"]
    }
  }
}
```

### 5. Component Architecture

#### Svelte Component Patterns
- **Reactive Declarations:** Use `$:` for derived state
- **Event Handlers:** Prefix with `handle` (e.g., `handleSubmit`)
- **Props:** Destructure in component script section
- **Stores:** Use Svelte stores for global state (if needed)

**Example from TaskInput.svelte:**
```svelte
<script>
  let taskDescription = '';
  $: charCount = taskDescription.length;
  $: isValid = charCount >= 10 && charCount <= 500;

  function handleSubmit() {
    dispatch('submit', { taskDescription });
  }
</script>
```

### 6. Testing Patterns

#### Fast Tests (CI-Friendly)
**Location:** `tests/acceptance.test.js`, `tests/integration.test.js`
**Purpose:** Quick validation for CI/CD pipelines
**Run Time:** ~2 seconds

```javascript
// Example pattern
import { describe, test, expect } from 'vitest';
import { ModelSelector } from '../src/lib/recommendation/ModelSelector.js';

describe('ModelSelector', () => {
  test('should rank models by tier and size', () => {
    const models = [/* test data */];
    const ranked = ModelSelector.rankBySize(models);
    expect(ranked[0].tier).toBe('lightweight');
  });
});
```

#### LLM Tests (Local Only)
**Location:** `tests/llm-classification.test.js`
**Purpose:** Validate 95.2% classification accuracy
**Run Time:** ~3 minutes (downloads 1.2GB model first run)

**Important:** DO NOT run in CI/CD - only for local validation

```bash
# Run LLM tests locally
RUN_LLM_TESTS=true npm run test:llm
```

### 7. Accessibility Requirements
**All UI components MUST include:**
- ARIA labels and roles
- Keyboard navigation (Tab, Enter, Ctrl+Enter)
- Screen reader announcements (aria-live regions)
- Focus management
- High contrast mode support
- Reduced motion preferences

**Reference:** `src/routes/+page.svelte:125-180` for implementation patterns

### 8. PWA Capabilities
**Required Features:**
- Service worker registration
- Offline functionality
- Installability via manifest
- Responsive design (mobile-first)
- Fast load times (<1s)

**Configuration:**
- `manifest.webmanifest` - PWA metadata
- `static/` directory - Service worker assets
- `vite.config.js` - Build configuration

---

## Development Workflows

### Standard Development Flow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test: `npm run dev` + `npm test`
3. Build and verify: `npm run build` + `npm run preview`
4. Commit changes: `git commit -m "feat: your feature"`
5. Push and create PR: `git push origin feature/your-feature`

### Working with Model Data
1. **Update Models:** `npm run update-models`
   - Fetches latest data from Hugging Face Hub
   - Updates `src/lib/data/models.json`
   - See `src/lib/aggregation/ModelAggregator.js` for logic

2. **Dry Run:** `npm run update-models:dry-run`
   - Preview changes without saving
   - Useful for validation

3. **Manual Editing:**
   - Edit `src/lib/data/models.json` directly
   - Follow structure: category → subcategory → tier → models[]
   - Validate with `npm test`

### Task Management Commands
```bash
/create-prd [feature]           # Create Product Requirements Document
/generate-tasks [prd-file]      # Generate task list from PRD
/process-task-list [task-file]  # Execute tasks step-by-step
```

**Workflow:**
1. **Plan:** `/create-prd` creates PRD in `/tasks` directory
2. **Break Down:** `/generate-tasks` creates implementation tasks
3. **Execute:** `/process-task-list` implements features systematically

---

## Important Files Reference

### Core Application Files
| File | Lines | Purpose | Key Functions |
|------|-------|---------|---------------|
| `src/routes/+page.svelte` | 300+ | Main UI & application logic | Classification, recommendation display |
| `src/lib/recommendation/ModelSelector.js` | 120 | Model ranking algorithm | `rankBySize()`, `filterByCategory()` |
| `src/lib/classification/LLMTaskClassifier.js` | 200+ | Browser LLM classification | `classify()`, `initialize()` |
| `src/lib/environmental/EnvironmentalImpactCalculator.js` | 90 | Environmental scoring | `calculateScore()`, `getImpactLevel()` |

### Configuration Files
| File | Purpose | Key Settings |
|------|---------|--------------|
| `vite.config.js` | Vite build configuration | WebGPU headers, transformers.js exclusions |
| `svelte.config.js` | SvelteKit configuration | Static adapter, output directory |
| `package.json` | Dependencies and scripts | All npm commands |
| `manifest.webmanifest` | PWA configuration | App name, icons, theme |

### Data Files
| File | Size | Purpose | Update Frequency |
|------|------|---------|------------------|
| `src/lib/data/models.json` | 2090 lines | Model database | Daily via GitHub Actions |
| `src/lib/data/tasks.json` | 166 lines | Task taxonomy | Manual as needed |

### Documentation Files
| File | Purpose | Audience |
|------|---------|----------|
| `README.md` | User-facing documentation | End users, contributors |
| `CLAUDE.md` | AI assistant guidance | AI assistants (this file) |
| `PROJECT_STATUS.md` | Current project status | Team, stakeholders |
| `PROJECT_VISION.md` | Mission and roadmap | Team, contributors |
| `CONTRIBUTING.md` | Contribution guidelines | Contributors |
| `docs/adrs/*.md` | Architecture decisions | Developers, architects |

---

## Code Style Guidelines

### JavaScript/Svelte
1. **ES Modules:** Always use `import/export` syntax
2. **Naming Conventions:**
   - Files: PascalCase for components, camelCase for utilities
   - Functions: camelCase (e.g., `calculateScore`)
   - Constants: UPPER_SNAKE_CASE (e.g., `MAX_SIZE_MB`)
   - Classes: PascalCase (e.g., `ModelSelector`)

3. **Error Handling:**
   - Use try/catch for async operations
   - Provide fallbacks for classification failures
   - Log errors with context

4. **Comments:**
   - JSDoc for public functions
   - Inline comments for complex logic
   - TODOs with context and GitHub issue links

### Svelte Components
1. **Structure Order:**
   ```svelte
   <script>
     // Imports
     // Props
     // State
     // Reactive declarations
     // Functions
     // Lifecycle
   </script>

   <!-- Markup -->

   <style>
     /* Component styles */
   </style>
   ```

2. **Reactivity:**
   - Use `$:` for derived state
   - Avoid side effects in reactive statements
   - Keep reactive logic simple

3. **Event Handling:**
   - Use custom events with `createEventDispatcher`
   - Prefix handlers with `handle`
   - Prevent default when needed

---

## Testing Guidelines

### Test Structure
```javascript
describe('ComponentOrModule', () => {
  test('should do specific thing', () => {
    // Arrange
    const input = /* setup */;

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### What to Test
1. **Core Logic:**
   - Model ranking algorithms
   - Classification accuracy
   - Environmental scoring
   - Data validation

2. **Edge Cases:**
   - Empty inputs
   - Invalid data
   - Fallback scenarios
   - Boundary conditions

3. **Integration:**
   - Data loading
   - Component interaction
   - End-to-end workflows

### What NOT to Test in CI
- LLM accuracy tests (too slow, downloads large model)
- Browser-specific rendering (requires headless browser)
- Visual regression tests (requires snapshot infrastructure)

---

## Deployment Process

### Automated Deployment (GitHub Actions)
**Trigger:** Push to `main` branch

**Workflow:** `.github/workflows/deploy.yml`
1. Checkout code
2. Install dependencies
3. Run tests (`npm test` - fast tests only)
4. Build application (`npm run build`)
5. Deploy to GitHub Pages

**Requirements:**
- Tests must pass
- Build must succeed
- GitHub Pages enabled in repository settings

### Manual Deployment
```bash
# 1. Build the application
npm run build

# 2. Contents of dist/ directory are ready to deploy
# 3. Upload to any static hosting provider
```

**Compatible Hosting:**
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Any static file server

---

## Common Tasks

### Adding a New Model Category
1. Edit `src/lib/data/tasks.json`:
   ```json
   "new_category": {
     "subcategory_name": {
       "label": "Display Name",
       "description": "What it does",
       "keywords": ["keyword1", "keyword2"],
       "examples": ["example1"]
     }
   }
   ```

2. Edit `src/lib/data/models.json`:
   ```json
   "new_category": {
     "subcategory_name": {
       "lightweight": [],
       "standard": [],
       "advanced": []
     }
   }
   ```

3. Add test cases in `tests/integration.test.js`
4. Update documentation

### Adding a New Model
1. Determine category and tier
2. Add to `src/lib/data/models.json`:
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
3. Run tests: `npm test`
4. Verify in UI: `npm run dev`

### Debugging Classification Issues
1. Check browser console for LLM initialization
2. Verify task input length (10-500 characters)
3. Test with known keywords from `tasks.json`
4. Check fallback chain in `BrowserTaskClassifier.js`
5. Validate confidence scores (should be >0.5)

### Performance Optimization
**Key Metrics:**
- Bundle size: Target <50KB gzipped
- Load time: Target <1 second
- LLM initialization: ~2-3 seconds acceptable

**Optimization Techniques:**
1. Code splitting (already implemented via Vite)
2. Lazy loading for LLM (loads on first use)
3. Static data files (no API calls)
4. Minimal dependencies (only transformers.js)

---

## Special Considerations

### WebGPU Configuration
**Required Headers** in `vite.config.js:15-20`:
```javascript
headers: {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin'
}
```

**Purpose:** Enables WebGPU for hardware-accelerated inference
**Fallback:** WASM if WebGPU unavailable

### transformers.js Exclusions
**Configuration** in `vite.config.js:22-28`:
```javascript
optimizeDeps: {
  exclude: ['@huggingface/transformers']
}
```

**Purpose:** Prevents Vite from optimizing transformers.js (breaks WASM loading)

### Browser Compatibility
**Minimum Requirements:**
- Chrome/Edge 113+ (WebGPU support)
- Firefox 115+ (WASM fallback)
- Safari 16.4+ (WASM fallback)
- Modern mobile browsers

**Progressive Enhancement:**
- WebGPU → WASM → CPU fallback chain
- Offline support via service worker
- Responsive design for all screen sizes

---

## Troubleshooting

### Common Issues

**Issue:** LLM tests failing with "Model not found"
**Solution:** First run downloads 1.2GB model - ensure adequate disk space and internet

**Issue:** Build fails with "transformers.js" error
**Solution:** Verify `optimizeDeps.exclude` in vite.config.js

**Issue:** Classification always returns low confidence
**Solution:** Check input length (must be 10-500 chars) and LLM initialization status

**Issue:** WebGPU not working
**Solution:** Verify CORS headers in vite.config.js, check browser compatibility

**Issue:** GitHub Pages deployment fails
**Solution:** Verify GitHub Pages enabled, check Actions logs, ensure tests pass

---

## Resources

### Documentation
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Vite Docs](https://vitejs.dev/)
- [transformers.js Docs](https://huggingface.co/docs/transformers.js)
- [Vitest Docs](https://vitest.dev/)

### Project-Specific Docs
- `docs/adrs/` - Architecture Decision Records
- `docs/ENVIRONMENTAL_METHODOLOGY.md` - Impact calculation details
- `docs/MODEL_CURATION_PROCESS.md` - How to curate model data
- `PROJECT_VISION.md` - Long-term roadmap

### External Resources
- Hugging Face Hub - Model source
- GitHub Actions - CI/CD documentation
- Web.dev PWA Guide - Progressive Web App best practices

---

## Key Principles for AI Assistants

### When Working on This Project

1. **Environmental Focus First**
   - Always prioritize smaller, more efficient models
   - Consider environmental impact in all recommendations
   - Follow the "smaller is better" philosophy

2. **Maintain High Accuracy**
   - 95.2% classification accuracy is the baseline
   - Test changes against LLM test suite
   - Validate classification improvements empirically

3. **Accessibility is Non-Negotiable**
   - All features must be keyboard accessible
   - Screen reader support required
   - Test with assistive technologies

4. **Keep It Static**
   - No backend/API dependencies
   - All processing client-side
   - Maintain <50KB bundle size

5. **Test Before Committing**
   - Run `npm test` (fast tests)
   - Build and preview (`npm run build && npm run preview`)
   - Only run LLM tests locally, not in CI

6. **Document Decisions**
   - Create ADRs for architectural changes
   - Update this file when patterns change
   - Keep README.md user-focused

7. **Progressive Enhancement**
   - Support multiple browsers
   - Provide fallbacks (LLM → semantic → keyword)
   - Graceful degradation for older browsers

---

## Version History

**v0.1.0** (Current)
- MVP complete with 95.2% classification accuracy
- Browser-based LLM (Llama 3.2 1B)
- 7 task categories, 3 model tiers
- PWA with offline support
- Automated GitHub Pages deployment

**Roadmap:**
- v1.1: Enhanced model database, UI improvements
- v1.2: Advanced environmental calculations
- v2.0: Additional categories, advanced features

---

**Last Updated:** 2025-01-15
**Maintained By:** Model Selector Contributors
**License:** MIT
