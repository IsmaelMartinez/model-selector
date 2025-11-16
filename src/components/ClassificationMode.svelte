<script>
  import { onMount } from 'svelte';
  import { getClassificationMode, saveClassificationMode } from '../lib/storage/preferences.js';

  // Props
  export let mode = 'fast'; // 'fast' or 'ensemble'
  export let onModeChange = () => {}; // Callback when mode changes

  // Load saved mode on mount
  onMount(() => {
    const savedMode = getClassificationMode();
    mode = savedMode;
  });

  // Handle mode change
  function handleModeChange(newMode) {
    mode = newMode;
    saveClassificationMode(newMode);
    onModeChange(newMode);
  }
</script>

<div class="classification-mode">
  <label class="mode-label">
    Classification Mode:
    <span class="info-icon" title="Fast mode uses single classification (~0.4s). Ensemble mode uses 3 parallel classifications with majority voting for higher accuracy (~2s).">
      ℹ️
    </span>
  </label>

  <div class="mode-options">
    <label class="mode-option">
      <input
        type="radio"
        name="classification-mode"
        value="fast"
        checked={mode === 'fast'}
        onchange={() => handleModeChange('fast')}
        aria-label="Fast mode - single classification"
      />
      <span class="mode-name">Fast</span>
      <span class="mode-desc">(~0.4s, 95.2% accuracy)</span>
    </label>

    <label class="mode-option">
      <input
        type="radio"
        name="classification-mode"
        value="ensemble"
        checked={mode === 'ensemble'}
        onchange={() => handleModeChange('ensemble')}
        aria-label="Ensemble mode - 3x parallel with voting"
      />
      <span class="mode-name">Ensemble</span>
      <span class="mode-desc">(~2s, 98%+ accuracy)</span>
    </label>
  </div>
</div>

<style>
  .classification-mode {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--bg-secondary, #f5f5f5);
    border-radius: 8px;
  }

  .mode-label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--text-primary, #333);
  }

  .info-icon {
    cursor: help;
    font-size: 0.9em;
    opacity: 0.7;
  }

  .mode-options {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .mode-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .mode-option:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .mode-option input[type="radio"] {
    cursor: pointer;
    width: 18px;
    height: 18px;
  }

  .mode-name {
    font-weight: 500;
    color: var(--text-primary, #333);
  }

  .mode-desc {
    font-size: 0.85em;
    color: var(--text-secondary, #666);
  }

  /* Accessibility: Focus styles */
  .mode-option input[type="radio"]:focus {
    outline: 2px solid var(--primary-color, #007bff);
    outline-offset: 2px;
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .mode-options {
      flex-direction: column;
      gap: 0.75rem;
    }

    .mode-desc {
      display: block;
      margin-left: 1.5rem;
      margin-top: 0.25rem;
    }
  }
</style>
