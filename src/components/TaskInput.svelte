<script>
  import { createEventDispatcher } from 'svelte';
  
  export let taskDescription = '';
  export let isLoading = false;
  export let error = null;
  
  const dispatch = createEventDispatcher();
  
  let textareaElement;
  let characterCount = 0;
  const maxLength = 500;
  let isFocused = false;
  
  $: characterCount = taskDescription.length;
  $: isNearLimit = characterCount > maxLength * 0.8;
  $: isOverLimit = characterCount > maxLength;
  
  function handleSubmit(event) {
    event.preventDefault();
    
    if (!taskDescription.trim()) {
      error = 'Please describe your AI task first.';
      textareaElement?.focus();
      return;
    }
    
    if (isOverLimit) {
      error = `Description too long (${characterCount}/${maxLength}). Please shorten it.`;
      textareaElement?.focus();
      return;
    }
    
    error = null;
    dispatch('submit', { taskDescription: taskDescription.trim() });
  }
  
  function handleInput() {
    if (error) error = null;
  }
  
  function handleKeydown(event) {
    if (event.ctrlKey && event.key === 'Enter') {
      handleSubmit(event);
    }
  }

  const exampleQueries = [
    "Classify customer support tickets by urgency",
    "Detect objects in security camera footage",
    "Analyze sentiment in product reviews",
    "Generate text summaries for articles",
  ];

  function useExample(example) {
    taskDescription = example;
    textareaElement?.focus();
  }
</script>

<form on:submit={handleSubmit} class="task-form" novalidate>
  <div class="input-wrapper" class:focused={isFocused} class:has-error={error}>
    <label for="task-description" class="sr-only">Describe your AI task</label>
    
    <textarea
      id="task-description"
      bind:this={textareaElement}
      bind:value={taskDescription}
      on:input={handleInput}
      on:keydown={handleKeydown}
      on:focus={() => isFocused = true}
      on:blur={() => isFocused = false}
      placeholder="Describe your AI task... e.g., 'Classify customer reviews by sentiment'"
      rows="3"
      maxlength={maxLength}
      required
      aria-describedby="task-help"
      aria-invalid={error ? 'true' : 'false'}
      disabled={isLoading}
    ></textarea>
    
    <div class="input-footer">
      <span class="char-count" class:warning={isNearLimit} class:error={isOverLimit}>
        {characterCount}/{maxLength}
      </span>
      <span class="keyboard-hint">
        <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to submit
      </span>
    </div>
  </div>
  
  {#if error}
    <div class="error-message" role="alert">
      <span class="error-icon">⚠️</span>
      {error}
    </div>
  {/if}

  <div class="examples-section">
    <span class="examples-label">Try:</span>
    <div class="examples-list">
      {#each exampleQueries as example}
        <button 
          type="button" 
          class="example-chip"
          on:click={() => useExample(example)}
          disabled={isLoading}
        >
          {example}
        </button>
      {/each}
    </div>
  </div>
  
  <button 
    type="submit" 
    class="submit-button"
    disabled={isLoading || !taskDescription.trim() || isOverLimit}
  >
    {#if isLoading}
      <svg class="spinner" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="40 60" />
      </svg>
      <span>Finding models...</span>
    {:else}
      <span>Find Eco-Friendly Models</span>
      <span class="arrow">→</span>
    {/if}
  </button>
</form>

<style>
  .task-form {
    margin-bottom: 2rem;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .input-wrapper {
    position: relative;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    transition: all 0.2s ease;
    overflow: hidden;
  }

  .input-wrapper.focused {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }

  .input-wrapper.has-error {
    border-color: #ef4444;
  }

  textarea {
    width: 100%;
    padding: 1.25rem 1.25rem 0.75rem;
    background: transparent;
    border: none;
    color: #e8f5e9;
    font-family: inherit;
    font-size: 1.1rem;
    line-height: 1.6;
    resize: none;
    min-height: 100px;
  }

  textarea::placeholder {
    color: #4b5563;
  }

  textarea:focus {
    outline: none;
  }

  textarea:disabled {
    color: #6b7280;
    cursor: not-allowed;
  }

  .input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(0, 0, 0, 0.2);
  }

  .char-count {
    font-size: 0.75rem;
    color: #4b5563;
    font-variant-numeric: tabular-nums;
  }

  .char-count.warning {
    color: #f59e0b;
  }

  .char-count.error {
    color: #ef4444;
  }

  .keyboard-hint {
    font-size: 0.75rem;
    color: #4b5563;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  kbd {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    padding: 0.15rem 0.4rem;
    font-size: 0.7rem;
    font-family: inherit;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding: 0.75rem 1rem;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    color: #fca5a5;
    font-size: 0.875rem;
  }

  .error-icon {
    flex-shrink: 0;
  }

  .examples-section {
    margin: 1.25rem 0;
  }

  .examples-label {
    display: block;
    font-size: 0.75rem;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
  }

  .examples-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .example-chip {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    padding: 0.4rem 0.85rem;
    color: #94a3b8;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .example-chip:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.3);
    color: #34d399;
  }

  .example-chip:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .submit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    padding: 1.1rem 1.5rem;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .submit-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
  }

  .submit-button:hover:not(:disabled)::before {
    opacity: 1;
  }

  .submit-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-button:disabled {
    background: #1f2937;
    color: #4b5563;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .submit-button .arrow {
    transition: transform 0.2s ease;
  }

  .submit-button:hover:not(:disabled) .arrow {
    transform: translateX(4px);
  }

  .spinner {
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @media (max-width: 640px) {
    .examples-list {
      gap: 0.4rem;
    }

    .example-chip {
      font-size: 0.75rem;
      padding: 0.35rem 0.7rem;
    }

    .keyboard-hint {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .input-wrapper,
    .submit-button,
    .example-chip,
    .spinner {
      transition: none;
      animation: none;
    }
  }
</style>
