<script>
  import { createEventDispatcher } from 'svelte';
  
  export let options = [];
  export let originalDescription = '';
  
  const dispatch = createEventDispatcher();
  
  function handleSelect(option) {
    dispatch('select', {
      category: option.category,
      originalDescription: originalDescription
    });
  }
  
  function handleSkip() {
    dispatch('skip');
  }
</script>

<div class="clarification-container">
  <div class="clarification-card">
    <div class="clarification-header">
      <div class="icon-wrapper">
        <span class="icon">🤔</span>
      </div>
      <div>
        <h2>Let's narrow it down</h2>
        <p class="original-query">
          You asked: <span>"{originalDescription}"</span>
        </p>
      </div>
    </div>
    
    <p class="clarification-prompt">
      What type of data or task are you working with?
    </p>
    
    <div class="options-grid">
      {#each options as option, index}
        <button 
          class="option-card"
          on:click={() => handleSelect(option)}
          style="animation-delay: {index * 50}ms"
        >
          <span class="option-label">{option.label}</span>
          <span class="option-desc">{option.desc}</span>
          <span class="option-arrow">→</span>
        </button>
      {/each}
    </div>
    
    <div class="clarification-footer">
      <button class="skip-button" on:click={handleSkip}>
        Skip — let AI decide
      </button>
    </div>
  </div>
</div>

<style>
  .clarification-container {
    margin-bottom: 2rem;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .clarification-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    padding: 2rem;
    backdrop-filter: blur(10px);
  }

  .clarification-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(16, 185, 129, 0.15);
    border-radius: 12px;
    flex-shrink: 0;
  }

  .icon {
    font-size: 1.5rem;
  }

  h2 {
    margin: 0 0 0.25rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: #e8f5e9;
  }

  .original-query {
    margin: 0;
    font-size: 0.875rem;
    color: #64748b;
  }

  .original-query span {
    color: #94a3b8;
    font-style: italic;
  }

  .clarification-prompt {
    font-size: 1rem;
    color: #94a3b8;
    margin: 0 0 1.5rem;
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .option-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    position: relative;
    padding: 1rem 1.25rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    animation: fadeIn 0.3s ease-out backwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .option-card:hover {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    transform: translateY(-2px);
  }

  .option-card:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  }

  .option-label {
    font-size: 1rem;
    font-weight: 600;
    color: #e8f5e9;
  }

  .option-desc {
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.4;
  }

  .option-arrow {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.25rem;
    color: #10b981;
    opacity: 0;
    transition: all 0.2s ease;
  }

  .option-card:hover .option-arrow {
    opacity: 1;
    transform: translateY(-50%) translateX(4px);
  }

  .clarification-footer {
    display: flex;
    justify-content: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .skip-button {
    background: none;
    border: none;
    color: #64748b;
    font-size: 0.875rem;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .skip-button:hover {
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.05);
  }

  .skip-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
  }

  @media (max-width: 640px) {
    .clarification-card {
      padding: 1.5rem;
    }

    .options-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

