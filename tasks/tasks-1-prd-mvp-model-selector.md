# Tasks for MVP Model Selector

Based on PRD: `1-prd-mvp-model-selector.md`

**MVP Approach**: Keep it simple and focused. Chrome-first, reasonable estimates for environmental impact, basic accessibility. Prove the concept works before adding complexity.

## Parent Task 1: Research & Discovery Phase
- [x] 1.1 Survey Hugging Face task classification models
- [x] 1.2 Test Hugging Face API access and data formats
- [x] 1.3 Research Papers with Code API capabilities (optional - use if easily accessible)
- [x] 1.4 Prototype simple classification pipeline
- [x] 1.5 Create sample task taxonomy and model mappings
- [x] 1.6 Validate technical feasibility of aggregation approach

## Parent Task 2: Data Structure & Pipeline Implementation
- [x] 2.1 Design and implement tiered data structure (browser/local)
- [x] 2.2 Create model metadata aggregation system
- [x] 2.3 Create simple environmental impact scoring system (reasonable estimates)
- [x] 2.4 Build task classification logic (OSS model or keyword fallback)
- [ ] 2.5 Create initial curated dataset with 10+ task categories
- [ ] 2.6 Implement "smaller is better" model selection logic

## Parent Task 3: Frontend Implementation
- [ ] 3.1 Enhance task input interface with accessibility features
- [ ] 3.2 Implement tiered recommendation display system
- [ ] 3.3 Create model comparison cards with environmental impact
- [ ] 3.4 Add basic responsive design (mobile-friendly but not optimized)
- [ ] 3.5 Implement basic keyboard navigation
- [ ] 3.6 Add semantic HTML structure and proper headings

## Parent Task 4: Core Application Logic
- [ ] 4.1 Implement task classification engine
- [ ] 4.2 Build recommendation engine with tier prioritization
- [ ] 4.3 Create model filtering and ranking system
- [ ] 4.4 Implement client-side data processing
- [ ] 4.5 Add error handling and fallback mechanisms
- [ ] 4.6 Ensure reasonable recommendation response time (<3 seconds acceptable for MVP)

## Parent Task 5: Testing & Quality Assurance
- [ ] 5.1 Create test suite for task classification accuracy
- [ ] 5.2 Test tiered recommendation logic with sample inputs
- [ ] 5.3 Create reasonable environmental impact estimates (defer scientific validation)
- [ ] 5.4 Test basic accessibility (keyboard navigation, semantic HTML)
- [ ] 5.5 Test Chrome compatibility (defer other browsers for later iterations)
- [ ] 5.6 Check basic performance metrics (reasonable bundle size and load time)

## Parent Task 6: Deployment & Documentation
- [ ] 6.1 Set up GitHub Actions for automated deployment
- [ ] 6.2 Configure SvelteKit for static site generation
- [ ] 6.3 Create lean deployment documentation
- [ ] 6.4 Set up GitHub Pages deployment
- [ ] 6.5 Test deployment pipeline and verify HTTPS
- [ ] 6.6 Create basic user documentation and examples

## Relevant Files

### New Files to Create:
- `src/lib/data/models.json` - Curated model dataset with tiered structure
- `src/lib/data/tasks.json` - Task categories and keywords mapping
- `src/lib/classification/TaskClassifier.js` - Task classification logic
- `src/lib/recommendation/RecommendationEngine.js` - Core recommendation logic
- `src/lib/recommendation/ModelSelector.js` - "Smaller is better" selection logic
- `src/lib/utils/EnvironmentalImpact.js` - Environmental scoring utilities
- `src/components/TaskInput.svelte` - Enhanced input interface component
- `src/components/RecommendationDisplay.svelte` - Tiered recommendation display
- `src/components/ModelCard.svelte` - Individual model recommendation card
- `src/styles/accessibility.css` - Basic accessibility styles
- `.github/workflows/deploy.yml` - GitHub Actions deployment workflow
- `docs/DEPLOYMENT.md` - Lean deployment documentation

### Files to Modify:
- `src/App.svelte` - Update to use new component architecture
- `package.json` - Add any needed dependencies for data processing
- `vite.config.js` - Ensure static site generation configuration
- `README.md` - Update with MVP information and usage instructions

## Notes

### Architecture Decisions:
- Start with keyword-based classification, upgrade to OSS model if research proves viable
- Prioritize browser-compatible models first, then local deployment options
- Use static JSON files for model data (no real-time API calls during usage)
- Focus on environmental impact as key differentiator

### Key Constraints (MVP Focus):
- No external API calls during usage (all client-side processing)
- <2MB bundle size target (reasonable effort, not strict requirement)
- Basic accessibility (semantic HTML, keyboard navigation)
- Chrome browser compatibility
- 10+ task categories minimum for MVP

### Research Priorities (MVP Focus):
1. Investigate existing Hugging Face models for task classification
2. Determine browser-compatible model formats (focus on what's readily available)
3. Find reasonable environmental impact estimates (don't need scientific precision)
4. Test feasibility of static data aggregation approach
5. Keep research timeboxed - use what's easily accessible, defer complex research

### Success Criteria (MVP Focus):
- User can get relevant model recommendations in <30 seconds
- 8/10 developers find recommendations useful (manual testing)
- Works in Chrome browser
- Basic keyboard navigation works
- Environmental estimates are reasonable (not scientifically validated)