# Task List: Model Accuracy Filtering

**PRD Reference**: [3-prd-model-accuracy-filtering.md](./3-prd-model-accuracy-filtering.md)
**Status**: ✅ Complete
**Timeline**: 5-7 days (1 week)
**Complexity**: Low
**Risk Level**: Low
**Completed**: November 15, 2025

---

## Overview

This task list implements a focused accuracy filtering feature that allows users to control the minimum quality threshold for model recommendations. All tasks are designed to be completed systematically with clear acceptance criteria.

**Total Tasks**: 13
**Estimated Effort**: ~28 hours (~5-7 work days)

---

## Day 1-2: UI Components & Foundation (6-7 hours)

### Task 1: Create AccuracyFilter.svelte component
**Effort**: 3 hours

**Description**: Create the main filter component with slider UI

**Implementation Steps**:
- [ ] Create new file: `src/components/AccuracyFilter.svelte`
- [ ] Implement HTML5 range slider (min=50, max=95, step=5)
- [ ] Add current value display (e.g., "≥75%")
- [ ] Add "Reset" button to return to 0%
- [ ] Apply existing design system styles (match project aesthetics)
- [ ] Make component reactive (Svelte stores or props)

**Acceptance Criteria**:
- ✅ Slider adjusts from 50% to 95% in 5% increments
- ✅ Current threshold value displays next to slider
- ✅ Reset button returns slider to 0% (show all)
- ✅ Component follows existing design patterns
- ✅ Visual feedback on slider interaction

**Files**:
- `src/components/AccuracyFilter.svelte` (new)

---

### Task 2: Add localStorage persistence
**Effort**: 2 hours

**Description**: Save and load filter preferences across sessions

**Implementation Steps**:
- [ ] Create/extend storage utilities: `src/lib/storage/preferences.js`
- [ ] Implement `saveAccuracyThreshold(value)` function
- [ ] Implement `loadAccuracyThreshold()` function (default: 0)
- [ ] Save threshold to localStorage on slider change
- [ ] Load saved threshold on component mount
- [ ] Handle localStorage errors gracefully (quota exceeded, disabled)

**Acceptance Criteria**:
- ✅ Threshold saves to localStorage on change
- ✅ Threshold loads from localStorage on page load
- ✅ Default is 0% if no saved value
- ✅ Graceful fallback if localStorage fails
- ✅ Key: `modelSelector.accuracyThreshold`

**Files**:
- `src/lib/storage/preferences.js` (new or extend existing)
- `src/components/AccuracyFilter.svelte` (update)

---

### Task 3: Integrate filter component into main page
**Effort**: 1-2 hours

**Description**: Add the filter to the main application UI

**Implementation Steps**:
- [ ] Import AccuracyFilter in `src/routes/+page.svelte`
- [ ] Position in settings section (above "Get Recommendations" button)
- [ ] Pass threshold value to recommendation display logic
- [ ] Make collapsible on mobile (optional enhancement)
- [ ] Test responsive layout (320px to 1920px width)

**Acceptance Criteria**:
- ✅ Filter displays in appropriate location
- ✅ Filter value updates application state
- ✅ Responsive design works on mobile and desktop
- ✅ No layout breaks or visual glitches

**Files**:
- `src/routes/+page.svelte` (update)

---

## Day 3-4: Filtering Logic & Display (7-8 hours)

### Task 4: Implement accuracy filtering in ModelSelector
**Effort**: 3 hours

**Description**: Add filtering logic to hide models below threshold

**Implementation Steps**:
- [ ] Add `filterByAccuracy(models, threshold)` method to `ModelSelector.js`
- [ ] Apply filter to each tier independently (lightweight/standard/advanced)
- [ ] Handle models with missing accuracy data (treat as 0% or null)
- [ ] Return filtered models + metadata (count hidden per tier)
- [ ] Ensure filtering is fast (<100ms for 100+ models)

**Acceptance Criteria**:
- ✅ Models below threshold are filtered out
- ✅ Models at or above threshold are included
- ✅ Works independently for each tier
- ✅ Handles missing accuracy data gracefully
- ✅ Returns count of hidden models per tier
- ✅ Performance: <100ms filtering time

**Files**:
- `src/lib/recommendation/ModelSelector.js` (update)

**Test Cases**:
```javascript
// Threshold = 0% → All models shown
filterByAccuracy(models, 0) // returns all models

// Threshold = 75% → Only models ≥75% shown
filterByAccuracy([{accuracy: 0.80}, {accuracy: 0.70}], 75)
// returns [{accuracy: 0.80}]

// Missing accuracy data
filterByAccuracy([{accuracy: null}], 50)
// returns [] (treats null as 0%)
```

---

### Task 5: Display accuracy values on recommendation cards
**Effort**: 2 hours

**Description**: Add accuracy badges to model recommendation cards

**Implementation Steps**:
- [ ] Update `RecommendationDisplay.svelte` or model card component
- [ ] Add accuracy badge/label (e.g., "📊 77.2%")
- [ ] Format accuracy as percentage (0.772 → "77.2%")
- [ ] Handle missing accuracy data (display "N/A")
- [ ] Position badge consistently across all cards
- [ ] Ensure mobile-friendly sizing and placement

**Acceptance Criteria**:
- ✅ Accuracy displays on all model cards
- ✅ Format: "📊 XX.X%" or similar
- ✅ Missing data shows "N/A"
- ✅ Consistent positioning across tiers
- ✅ Readable on mobile devices

**Files**:
- `src/components/RecommendationDisplay.svelte` (update)
- Or `src/components/ModelCard.svelte` if separate component exists

---

### Task 6: Show count of filtered models
**Effort**: 2 hours

**Description**: Display feedback about hidden models

**Implementation Steps**:
- [ ] Update `RecommendationDisplay.svelte` to show filter status
- [ ] Display message: "Showing X models (Y hidden by accuracy filter)"
- [ ] Show per-tier if helpful (e.g., "Lightweight: 2 shown, 1 hidden")
- [ ] When all filtered: "No models meet your accuracy threshold. Try lowering the filter."
- [ ] Make message subtle/dismissible (not intrusive)
- [ ] Update message reactively when threshold changes

**Acceptance Criteria**:
- ✅ Shows count of visible and hidden models
- ✅ Clear message when all models filtered
- ✅ Updates instantly when threshold changes
- ✅ Not visually overwhelming
- ✅ Helpful suggestion to lower filter

**Files**:
- `src/components/RecommendationDisplay.svelte` (update)

---

### Task 7: Add accessibility features to filter
**Effort**: 2 hours

**Description**: Ensure filter is fully accessible

**Implementation Steps**:
- [ ] Add keyboard navigation support (arrow keys, Home, End, PageUp, PageDown)
- [ ] Add proper ARIA labels: `aria-label="Minimum accuracy threshold"`
- [ ] Add ARIA value attributes: `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- [ ] Add ARIA live region for threshold changes
- [ ] Test with screen reader (NVDA/VoiceOver/JAWS)
- [ ] Ensure visible focus indicators
- [ ] Test tab order and keyboard flow

**Acceptance Criteria**:
- ✅ Slider works with keyboard (arrow keys to adjust)
- ✅ Screen reader announces threshold changes
- ✅ Proper ARIA attributes present
- ✅ Focus indicators visible
- ✅ Logical tab order
- ✅ Tested with at least one screen reader

**Files**:
- `src/components/AccuracyFilter.svelte` (update)

**Testing**:
- Keyboard: Tab to slider, use arrows to adjust, Enter on reset
- Screen reader: Announces "Accuracy threshold 75 percent" when changed

---

## Day 5: Testing & Quality (6-7 hours)

### Task 8: Add unit tests for filtering logic
**Effort**: 3 hours

**Description**: Test filtering function with various scenarios

**Implementation Steps**:
- [ ] Create test file: `tests/unit/ModelSelector.test.js` or add to existing
- [ ] Test filtering with various thresholds: 0%, 50%, 75%, 95%
- [ ] Test edge cases:
  - All models above threshold (none filtered)
  - All models below threshold (all filtered)
  - Some models filtered per tier
  - Models with missing accuracy data
  - Empty model array
- [ ] Test filter metadata (count of hidden models)
- [ ] Aim for >90% code coverage on new filtering code

**Acceptance Criteria**:
- ✅ All test cases pass
- ✅ Edge cases covered
- ✅ >90% code coverage for new code
- ✅ Tests run fast (<1s)

**Files**:
- `tests/unit/ModelSelector.test.js` (new or update)

**Example Tests**:
```javascript
describe('filterByAccuracy', () => {
  it('returns all models when threshold is 0', () => { ... });
  it('filters models below threshold', () => { ... });
  it('treats missing accuracy as 0%', () => { ... });
  it('works independently per tier', () => { ... });
  it('returns count of hidden models', () => { ... });
});
```

---

### Task 9: Add integration tests for filter UI
**Effort**: 2 hours

**Description**: Test full filter flow from user interaction to results

**Implementation Steps**:
- [ ] Create test file: `tests/integration/accuracy-filter.test.js`
- [ ] Test: Adjust slider → see filtered results
- [ ] Test: Reset button → threshold returns to 0%
- [ ] Test: localStorage persistence → value persists across remounts
- [ ] Test: Filter + classification interaction
- [ ] Use Vitest component testing or Playwright

**Acceptance Criteria**:
- ✅ All integration tests pass
- ✅ Full user flow tested
- ✅ Persistence verified
- ✅ Tests are deterministic (no flaky tests)

**Files**:
- `tests/integration/accuracy-filter.test.js` (new)

---

### Task 10: Test on mobile devices
**Effort**: 2 hours

**Description**: Verify mobile experience

**Implementation Steps**:
- [ ] Test slider interaction with touch gestures
- [ ] Verify layout on small screens (320px width minimum)
- [ ] Test on iOS Safari (if available)
- [ ] Test on Chrome Mobile (Android or emulator)
- [ ] Ensure touch targets ≥44px (Apple/WCAG guidelines)
- [ ] Check accuracy badges readable on mobile
- [ ] Fix any layout or interaction issues found

**Acceptance Criteria**:
- ✅ Slider works smoothly with touch
- ✅ Layout works on 320px width
- ✅ Touch targets meet size guidelines
- ✅ Text is readable (no truncation)
- ✅ No horizontal scrolling issues
- ✅ Tested on at least one mobile browser

**Testing Approach**:
- Use Chrome DevTools device emulation for initial testing
- Test on real device if available (iOS or Android)
- Test portrait and landscape orientations

---

## Day 6-7: Polish & Documentation (6-7 hours)

### Task 11: Add tooltips and help text
**Effort**: 2 hours

**Description**: Provide user guidance and explanation

**Implementation Steps**:
- [ ] Add tooltip to slider: "Filter models by accuracy on standard benchmarks"
- [ ] Add info icon (ℹ️) with expandable explanation
- [ ] Explain what accuracy metric means (brief, 1-2 sentences)
- [ ] Add help text showing current filter status
- [ ] Ensure tooltips are accessible (keyboard triggerable, screen reader compatible)
- [ ] Use existing tooltip component if available

**Acceptance Criteria**:
- ✅ Tooltip explains accuracy metric clearly
- ✅ Info icon provides additional context
- ✅ Tooltips work with keyboard and screen reader
- ✅ Not visually overwhelming
- ✅ Helpful for new users

**Files**:
- `src/components/AccuracyFilter.svelte` (update)
- `src/components/Tooltip.svelte` (if creating new shared component)

---

### Task 12: Update documentation
**Effort**: 2 hours

**Description**: Document the new feature

**Implementation Steps**:
- [ ] Add accuracy filtering section to `README.md`
- [ ] Update `docs/USER_GUIDE.md` with filter usage instructions
- [ ] Document localStorage schema in technical docs
- [ ] Add screenshots of filter UI (optional but helpful)
- [ ] Document accuracy data source in `models.json` structure
- [ ] Update feature list in project documentation

**Acceptance Criteria**:
- ✅ User-facing docs updated (README, user guide)
- ✅ Technical docs updated (localStorage schema)
- ✅ Clear usage instructions
- ✅ Screenshots or examples included (optional)

**Files**:
- `README.md` (update)
- `docs/USER_GUIDE.md` (update or create)
- `docs/DATA_STRUCTURE.md` (update if exists)

**Documentation Sections to Add**:
```markdown
## Accuracy Filtering

Control the quality of model recommendations by setting a minimum accuracy threshold.

### How to Use
1. Adjust the "Minimum Accuracy" slider (50-95%)
2. Only models meeting or exceeding the threshold will be shown
3. Click "Reset" to see all models (0% threshold)
4. Your preference is saved for future visits

### What is Accuracy?
Accuracy shows how often the model makes correct predictions on standard benchmarks...
```

---

### Task 13: Final testing and deployment preparation
**Effort**: 2-3 hours

**Description**: Comprehensive final checks before deployment

**Implementation Steps**:
- [ ] Run full test suite: `npm test`
- [ ] Verify all new tests passing
- [ ] Run build: `npm run build`
- [ ] Check bundle size (should be minimal increase)
- [ ] Test in development: `npm run dev`
- [ ] Test preview build: `npm run preview`
- [ ] Verify no console errors or warnings
- [ ] Do final accessibility check (keyboard + screen reader)
- [ ] Update `PROJECT_STATUS.md` with PRD 3 completion
- [ ] Prepare commit message documenting changes

**Acceptance Criteria**:
- ✅ All tests passing (100% pass rate)
- ✅ Build succeeds with no errors
- ✅ Bundle size increase <50KB (minimal overhead)
- ✅ No console errors in browser
- ✅ Accessibility verified
- ✅ Documentation updated
- ✅ Ready to commit and deploy

**Files**:
- Various (all project files)
- `PROJECT_STATUS.md` (update)

**Deployment Checklist**:
- [ ] Tests passing
- [ ] Build successful
- [ ] Documentation updated
- [ ] Accessibility verified
- [ ] Code reviewed (self or peer)
- [ ] Commit with clear message
- [ ] Push to branch
- [ ] Create PR if using PR workflow
- [ ] Deploy to GitHub Pages
- [ ] Verify live site works

---

## Task Summary

### By Day:
- **Day 1-2**: Tasks 1-3 (UI foundation) - 6-7 hours
- **Day 3-4**: Tasks 4-7 (filtering logic & display) - 9 hours
- **Day 5**: Tasks 8-10 (testing) - 7 hours
- **Day 6-7**: Tasks 11-13 (polish & docs) - 6-7 hours

**Total**: ~28-30 hours (~5-7 work days)

### By Category:
- **Implementation**: 7 tasks (Tasks 1-7)
- **Testing**: 3 tasks (Tasks 8-10)
- **Documentation & Polish**: 3 tasks (Tasks 11-13)

### Critical Path:
1. Must complete Tasks 1-3 before Tasks 4-6 (UI before logic integration)
2. Should complete Task 4 before Tasks 8-9 (logic before testing)
3. Task 13 must be last (final verification)
4. All other tasks have some flexibility in order

---

## Dependencies

**External**:
- None (uses existing infrastructure)

**Internal**:
- Requires `models.json` to have accuracy data (already exists)
- Requires `ModelSelector.js` (already exists)
- Requires recommendation display component (already exists)

**Optional**:
- Existing tooltip component (can create new if needed)
- Existing storage utilities (can create new if needed)

---

## Risk Mitigation

### Risk: Accuracy data missing or inconsistent
**Mitigation**: Handle missing data gracefully (treat as 0%, show "N/A")

### Risk: localStorage quota exceeded
**Mitigation**: Graceful fallback, clear error message, feature still works in session

### Risk: Mobile slider hard to use
**Mitigation**: Test early on devices, use ≥44px touch targets, smooth touch handling

### Risk: Performance issues with filtering
**Mitigation**: Simple array filtering is fast, test with large dataset (100+ models)

### Risk: Accessibility issues
**Mitigation**: Test with keyboard + screen reader early, follow WCAG guidelines

---

## Success Metrics

**Feature is successful when**:
- Users can filter models by accuracy threshold (50-95%)
- Filter setting persists across sessions
- Accuracy displays on all model cards
- Filter works on desktop and mobile
- All tests passing (100%)
- Fully accessible (keyboard + screen reader)
- Documentation complete
- Deployed and live

---

## Ready to Execute

This task list is ready to use with the `/process-task-list` command or manual execution. Each task has:
- ✅ Clear acceptance criteria
- ✅ Effort estimate
- ✅ Implementation steps
- ✅ Files to modify/create
- ✅ Test cases where applicable

**Recommended Approach**:
- Work through tasks sequentially by day
- Mark tasks complete as you finish them
- Commit after each major milestone (Day 2, Day 4, Day 5, Day 7)
- Test incrementally (don't wait until the end)

**Next Step**: Begin with Task 1 (Create AccuracyFilter.svelte component)
