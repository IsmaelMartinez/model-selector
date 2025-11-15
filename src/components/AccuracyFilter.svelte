<script>
  import { onMount } from 'svelte';
  import { getAccuracyThreshold, saveAccuracyThreshold } from '../lib/storage/preferences.js';

  // Props
  export let threshold = 0; // Current threshold value (0-95)
  export let onChange = null; // Callback when threshold changes

  // Internal state
  let showTooltip = false;

  // Constants
  const MIN_THRESHOLD = 50;
  const MAX_THRESHOLD = 95;
  const STEP = 5;

  // Load saved threshold on mount
  onMount(() => {
    const savedThreshold = getAccuracyThreshold();
    if (savedThreshold !== threshold) {
      threshold = savedThreshold;
      notifyChange();
    }
  });

  /**
   * Handle slider value change
   */
  function handleChange(event) {
    const newValue = parseInt(event.target.value, 10);
    threshold = newValue;

    // Save to localStorage
    saveAccuracyThreshold(newValue);

    // Notify parent component
    notifyChange();
  }

  /**
   * Handle reset button click
   */
  function handleReset() {
    threshold = 0;
    saveAccuracyThreshold(0);
    notifyChange();
  }

  /**
   * Notify parent component of change
   */
  function notifyChange() {
    if (onChange && typeof onChange === 'function') {
      onChange(threshold);
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(event) {
    // Home key: set to 0%
    if (event.key === 'Home') {
      event.preventDefault();
      handleReset();
    }
    // End key: set to max (95%)
    else if (event.key === 'End' && threshold > 0) {
      event.preventDefault();
      threshold = MAX_THRESHOLD;
      saveAccuracyThreshold(MAX_THRESHOLD);
      notifyChange();
    }
  }

  // Reactive computed values
  $: isFiltering = threshold > 0;
  $: formattedThreshold = threshold === 0 ? 'All models' : `≥${threshold}%`;
</script>

<div class="accuracy-filter">
  <div class="filter-header">
    <label for="accuracy-threshold">
      Minimum Accuracy
      <button
        type="button"
        class="info-button"
        on:mouseenter={() => showTooltip = true}
        on:mouseleave={() => showTooltip = false}
        on:focus={() => showTooltip = true}
        on:blur={() => showTooltip = false}
        aria-label="Information about accuracy filtering"
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM6.5 5h3v1.5h-1V11H10v1.5H6V11h1.5V6.5H6.5V5zm1-2.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z"/>
        </svg>
      </button>
    </label>

    {#if showTooltip}
      <div class="tooltip" role="tooltip">
        Filter models by their accuracy on standard benchmarks.
        Higher accuracy means better performance, but may come with larger model sizes.
      </div>
    {/if}
  </div>

  <div class="filter-controls">
    <div class="slider-container">
      {#if isFiltering}
        <input
          type="range"
          id="accuracy-threshold"
          min={MIN_THRESHOLD}
          max={MAX_THRESHOLD}
          step={STEP}
          bind:value={threshold}
          on:input={handleChange}
          on:keydown={handleKeydown}
          aria-label="Minimum accuracy threshold"
          aria-valuemin={MIN_THRESHOLD}
          aria-valuemax={MAX_THRESHOLD}
          aria-valuenow={threshold}
          aria-valuetext="{threshold} percent minimum accuracy"
          class="slider active"
        />
      {:else}
        <input
          type="range"
          id="accuracy-threshold"
          min={0}
          max={MAX_THRESHOLD}
          step={STEP}
          value={0}
          on:input={handleChange}
          on:keydown={handleKeydown}
          aria-label="Minimum accuracy threshold"
          aria-valuemin={0}
          aria-valuemax={MAX_THRESHOLD}
          aria-valuenow={0}
          aria-valuetext="Show all models, no filtering"
          class="slider inactive"
          disabled
        />
      {/if}

      <div class="threshold-display" aria-live="polite" aria-atomic="true">
        <span class="threshold-value" class:active={isFiltering}>
          {formattedThreshold}
        </span>
      </div>
    </div>

    <div class="button-group">
      {#if !isFiltering}
        <button
          type="button"
          class="filter-button"
          on:click={() => {
            threshold = 75;
            saveAccuracyThreshold(75);
            notifyChange();
          }}
        >
          Enable Filter
        </button>
      {:else}
        <button
          type="button"
          class="reset-button"
          on:click={handleReset}
          aria-label="Reset filter to show all models"
        >
          Reset
        </button>
      {/if}
    </div>
  </div>

  {#if isFiltering}
    <div class="filter-help" id="filter-help">
      <span class="help-icon" aria-hidden="true">🔍</span>
      Only showing models with ≥{threshold}% accuracy
    </div>
  {/if}
</div>

<style>
  .accuracy-filter {
    max-width: 600px;
    margin: 0 auto 1.5rem;
    padding: 1rem;
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  .filter-header {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 600;
    font-size: 0.95rem;
    color: #2d3748;
    margin: 0;
  }

  .info-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    background: transparent;
    border: none;
    color: #4299e1;
    cursor: help;
    border-radius: 4px;
    transition: color 0.2s ease;
  }

  .info-button:hover,
  .info-button:focus {
    color: #2b6cb0;
    outline: none;
  }

  .info-button:focus-visible {
    outline: 2px solid #4299e1;
    outline-offset: 2px;
  }

  .tooltip {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.5rem;
    padding: 0.75rem;
    background: #2d3748;
    color: white;
    border-radius: 6px;
    font-size: 0.875rem;
    line-height: 1.4;
    max-width: 300px;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .tooltip::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 1rem;
    border: 6px solid transparent;
    border-bottom-color: #2d3748;
  }

  .filter-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .slider-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .slider {
    flex: 1;
    height: 8px;
    border-radius: 4px;
    background: #e2e8f0;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .slider.active {
    background: linear-gradient(to right, #fc8181 0%, #f6ad55 25%, #f6e05e 50%, #68d391 75%, #48bb78 100%);
  }

  .slider.inactive {
    background: #e2e8f0;
    cursor: not-allowed;
    opacity: 0.5;
  }

  .slider:focus-visible {
    outline: 2px solid #4299e1;
    outline-offset: 2px;
  }

  /* Slider thumb - Webkit */
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    border: 3px solid #4299e1;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
  }

  .slider.inactive::-webkit-slider-thumb {
    background: #cbd5e0;
    border-color: #a0aec0;
    cursor: not-allowed;
  }

  /* Slider thumb - Firefox */
  .slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    border: 3px solid #4299e1;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
  }

  .slider::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
  }

  .slider.inactive::-moz-range-thumb {
    background: #cbd5e0;
    border-color: #a0aec0;
    cursor: not-allowed;
  }

  .threshold-display {
    min-width: 100px;
    text-align: right;
  }

  .threshold-value {
    font-size: 1rem;
    font-weight: 600;
    color: #718096;
    transition: color 0.2s ease;
  }

  .threshold-value.active {
    color: #2d3748;
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
  }

  .filter-button,
  .reset-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .filter-button {
    background: #4299e1;
    color: white;
  }

  .filter-button:hover {
    background: #3182ce;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(66, 153, 225, 0.3);
  }

  .reset-button {
    background: #e2e8f0;
    color: #2d3748;
  }

  .reset-button:hover {
    background: #cbd5e0;
  }

  .filter-button:focus-visible,
  .reset-button:focus-visible {
    outline: 2px solid #4299e1;
    outline-offset: 2px;
  }

  .filter-button:active,
  .reset-button:active {
    transform: translateY(0);
  }

  .filter-help {
    margin-top: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: #bee3f8;
    border: 1px solid #90cdf4;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #2c5282;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .help-icon {
    font-size: 1rem;
  }

  /* Touch-friendly sizing for mobile */
  @media (max-width: 640px) {
    .slider::-webkit-slider-thumb,
    .slider::-moz-range-thumb {
      width: 28px;
      height: 28px;
    }

    .filter-button,
    .reset-button {
      padding: 0.75rem 1rem;
      min-height: 44px;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .slider {
      border: 2px solid currentColor;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .slider,
    .slider::-webkit-slider-thumb,
    .slider::-moz-range-thumb,
    .filter-button,
    .reset-button,
    .info-button {
      transition: none;
    }
  }
</style>
