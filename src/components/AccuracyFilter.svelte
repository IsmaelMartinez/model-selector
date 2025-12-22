<script>
  import { onMount } from 'svelte';
  import { getAccuracyThreshold, saveAccuracyThreshold } from '../lib/storage/preferences.js';

  /** @type {number} - Current accuracy threshold (0-95, where 0 means no filter) */
  export let threshold = 0;
  
  /** @type {((threshold: number) => void)|null} - Callback when threshold changes */
  export let onChange = null;

  const MIN_THRESHOLD = 75;
  const MAX_THRESHOLD = 95;
  const STEP = 5;

  onMount(() => {
    const savedThreshold = getAccuracyThreshold();
    if (savedThreshold !== threshold) {
      threshold = savedThreshold;
      notifyChange();
    }
  });

  function handleChange(event) {
    const newValue = parseInt(event.target.value, 10);
    threshold = newValue;
    saveAccuracyThreshold(newValue);
    notifyChange();
  }

  function handleReset() {
    threshold = 0;
    saveAccuracyThreshold(0);
    notifyChange();
  }

  function handleEnable() {
    threshold = 75;
    saveAccuracyThreshold(75);
    notifyChange();
  }

  function notifyChange() {
    if (onChange && typeof onChange === 'function') {
      onChange(threshold);
    }
  }

  $: isFiltering = threshold > 0;
  $: displayValue = threshold === 0 ? 'All' : `≥${threshold}%`;
</script>

<div class="filter-card">
  <div class="filter-header">
    <div class="filter-title">
      <span class="filter-icon">📊</span>
      <span>Accuracy Filter</span>
    </div>
    <span class="filter-value" class:active={isFiltering}>
      {displayValue}
    </span>
  </div>

  <div class="filter-body">
    {#if isFiltering}
      <div class="slider-container">
        <input
          type="range"
          min={MIN_THRESHOLD}
          max={MAX_THRESHOLD}
          step={STEP}
          bind:value={threshold}
          on:input={handleChange}
          class="slider"
          aria-label="Minimum accuracy threshold"
        />
        <div class="slider-labels">
          <span>{MIN_THRESHOLD}%</span>
          <span>{MAX_THRESHOLD}%</span>
        </div>
      </div>
      <button class="action-button reset" on:click={handleReset}>
        Reset Filter
      </button>
    {:else}
      <p class="filter-description">
        Filter models by minimum accuracy to find higher-quality options.
      </p>
      <button class="action-button enable" on:click={handleEnable}>
        Enable Filter
      </button>
    {/if}
  </div>
</div>

<style>
  .filter-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.25rem;
    transition: border-color 0.2s ease;
  }

  .filter-card:hover {
    border-color: rgba(255, 255, 255, 0.12);
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .filter-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #e8f5e9;
    font-size: 0.9rem;
  }

  .filter-icon {
    font-size: 1rem;
  }

  .filter-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #64748b;
    padding: 0.25rem 0.6rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    font-variant-numeric: tabular-nums;
  }

  .filter-value.active {
    color: #10b981;
    background: rgba(16, 185, 129, 0.15);
  }

  .filter-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .filter-description {
    margin: 0;
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.4;
  }

  .slider-container {
    width: 100%;
  }

  .slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(to right, #ef4444 0%, #f59e0b 30%, #10b981 100%);
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #e8f5e9;
    border: 3px solid #10b981;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #e8f5e9;
    border: 3px solid #10b981;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .slider:focus {
    outline: none;
  }

  .slider:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 0.35rem;
    font-size: 0.65rem;
    color: #4b5563;
  }

  .action-button {
    width: 100%;
    padding: 0.6rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-button.enable {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  .action-button.enable:hover {
    background: rgba(16, 185, 129, 0.25);
  }

  .action-button.reset {
    background: rgba(255, 255, 255, 0.05);
    color: #94a3b8;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .action-button.reset:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e8f5e9;
  }

  .action-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
  }

  @media (prefers-reduced-motion: reduce) {
    .slider::-webkit-slider-thumb,
    .slider::-moz-range-thumb,
    .action-button {
      transition: none;
    }
  }
</style>
