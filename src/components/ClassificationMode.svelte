<script>
  import { onMount } from 'svelte';
  import { getClassificationMode, saveClassificationMode } from '../lib/storage/preferences.js';

  /** @type {'fast'|'ensemble'} - Current classification mode */
  export let mode = 'fast';
  
  /** @type {(mode: 'fast'|'ensemble') => void} - Callback when mode changes */
  export let onModeChange = () => {};

  onMount(() => {
    const savedMode = getClassificationMode();
    mode = savedMode;
  });

  function handleModeChange(newMode) {
    mode = newMode;
    saveClassificationMode(newMode);
    onModeChange(newMode);
  }
</script>

<div class="mode-card">
  <div class="mode-header">
    <div class="mode-title">
      <span class="mode-icon">⚡</span>
      <span>Classification Mode</span>
    </div>
  </div>

  <div class="mode-options">
    <button 
      class="mode-option" 
      class:active={mode === 'fast'}
      on:click={() => handleModeChange('fast')}
      aria-pressed={mode === 'fast'}
    >
      <div class="option-header">
        <span class="option-icon">🚀</span>
        <span class="option-name">Fast</span>
      </div>
      <div class="option-stats">
        <span class="stat">~2ms</span>
        <span class="dot">•</span>
        <span class="stat">1 match</span>
      </div>
    </button>

    <button 
      class="mode-option" 
      class:active={mode === 'ensemble'}
      on:click={() => handleModeChange('ensemble')}
      aria-pressed={mode === 'ensemble'}
    >
      <div class="option-header">
        <span class="option-icon">🎯</span>
        <span class="option-name">Voting</span>
      </div>
      <div class="option-stats">
        <span class="stat">~2ms</span>
        <span class="dot">•</span>
        <span class="stat">5 votes</span>
      </div>
    </button>
  </div>

  <p class="mode-description">
    {#if mode === 'fast'}
      Uses closest match only for quick results.
    {:else}
      5 similar examples vote for higher accuracy.
    {/if}
  </p>
</div>

<style>
  .mode-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.25rem;
    transition: border-color 0.2s ease;
  }

  .mode-card:hover {
    border-color: rgba(255, 255, 255, 0.12);
  }

  .mode-header {
    margin-bottom: 1rem;
  }

  .mode-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #e8f5e9;
    font-size: 0.9rem;
  }

  .mode-icon {
    font-size: 1rem;
  }

  .mode-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .mode-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    padding: 0.75rem 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mode-option:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .mode-option.active {
    background: rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.4);
  }

  .mode-option:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
  }

  .option-header {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .option-icon {
    font-size: 1rem;
  }

  .option-name {
    font-weight: 600;
    color: #e8f5e9;
    font-size: 0.85rem;
  }

  .option-stats {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.7rem;
    color: #64748b;
  }

  .mode-option.active .option-stats {
    color: #34d399;
  }

  .dot {
    opacity: 0.5;
  }

  .mode-description {
    margin: 0;
    font-size: 0.75rem;
    color: #4b5563;
    text-align: center;
    line-height: 1.4;
  }

  @media (prefers-reduced-motion: reduce) {
    .mode-option {
      transition: none;
    }
  }
</style>
