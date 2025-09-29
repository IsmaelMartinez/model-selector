<script>
  import { createEventDispatcher } from 'svelte';
  
  export let taskDescription = '';
  export let isLoading = false;
  export let error = null;
  
  const dispatch = createEventDispatcher();
  
  let textareaElement;
  let characterCount = 0;
  const maxLength = 500;
  
  $: characterCount = taskDescription.length;
  $: isNearLimit = characterCount > maxLength * 0.8;
  $: isOverLimit = characterCount > maxLength;
  
  function handleSubmit(event) {
    event.preventDefault();
    
    if (!taskDescription.trim()) {
      error = 'Please describe your AI task before getting recommendations.';
      textareaElement?.focus();
      return;
    }
    
    if (isOverLimit) {
      error = `Task description is too long (${characterCount}/${maxLength} characters). Please shorten it.`;
      textareaElement?.focus();
      return;
    }
    
    error = null;
    dispatch('submit', { taskDescription: taskDescription.trim() });
  }
  
  function handleInput() {
    // Clear error when user starts typing
    if (error) {
      error = null;
    }
  }
  
  function handleKeydown(event) {
    // Submit on Ctrl+Enter
    if (event.ctrlKey && event.key === 'Enter') {
      handleSubmit(event);
    }
  }
</script>

<form on:submit={handleSubmit} class="task-input-form" novalidate>
  <div class="input-group">
    <label for="task-description" class="visually-required">
      Describe your AI task
      <span class="required-indicator" aria-label="required">*</span>
    </label>
    
    <div class="textarea-container">
      <textarea
        id="task-description"
        bind:this={textareaElement}
        bind:value={taskDescription}
        on:input={handleInput}
        on:keydown={handleKeydown}
        placeholder="Example: I want to classify customer support tickets by urgency level"
        rows="4"
        maxlength={maxLength}
        required
        aria-describedby="task-description-help {error ? 'task-description-error' : ''} character-count"
        aria-invalid={error ? 'true' : 'false'}
        class:error={error}
        class:near-limit={isNearLimit && !isOverLimit}
        class:over-limit={isOverLimit}
        disabled={isLoading}
      ></textarea>
      
      <div class="character-count" id="character-count" aria-live="polite">
        <span class:warning={isNearLimit} class:error={isOverLimit}>
          {characterCount}/{maxLength}
        </span>
      </div>
    </div>
    
    <div id="task-description-help" class="help-text">
      Be specific about your task. Examples: "classify images of animals", "analyze sentiment in reviews", "detect objects in photos"
      <br>
      <kbd>Ctrl + Enter</kbd> to submit quickly
    </div>
    
    {#if error}
      <div id="task-description-error" class="error-message" role="alert" aria-live="assertive">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
          <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8S12.42 0 8 0zM7 3h2v6H7V3zm0 8h2v2H7v-2z"/>
        </svg>
        {error}
      </div>
    {/if}
  </div>
  
  <button 
    type="submit" 
    class="submit-button"
    disabled={isLoading || !taskDescription.trim() || isOverLimit}
    aria-describedby="submit-button-help"
  >
    {#if isLoading}
      <svg class="spinner" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="9 3" />
      </svg>
      Getting Recommendations...
    {:else}
      Get AI Model Recommendations
    {/if}
  </button>
  
  <div id="submit-button-help" class="help-text">
    We'll analyze your task and recommend the most environmentally efficient AI models
  </div>
</form>

<style>
  .task-input-form {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .input-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: #2d3748;
  }
  
  .required-indicator {
    color: #e53e3e;
    font-weight: normal;
  }
  
  .textarea-container {
    position: relative;
  }
  
  textarea {
    width: 100%;
    padding: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.5;
    resize: vertical;
    min-height: 120px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    background: #ffffff;
  }
  
  textarea:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }
  
  textarea.near-limit {
    border-color: #ed8936;
  }
  
  textarea.over-limit,
  textarea.error {
    border-color: #e53e3e;
  }
  
  textarea:disabled {
    background-color: #f7fafc;
    color: #a0aec0;
    cursor: not-allowed;
  }
  
  .character-count {
    position: absolute;
    bottom: 0.5rem;
    right: 0.75rem;
    font-size: 0.875rem;
    color: #718096;
    pointer-events: none;
  }
  
  .character-count .warning {
    color: #ed8936;
    font-weight: 500;
  }
  
  .character-count .error {
    color: #e53e3e;
    font-weight: 600;
  }
  
  .help-text {
    font-size: 0.875rem;
    color: #718096;
    margin-top: 0.5rem;
    line-height: 1.4;
  }
  
  .help-text kbd {
    background: #edf2f7;
    border: 1px solid #cbd5e0;
    border-radius: 3px;
    padding: 2px 4px;
    font-size: 0.75rem;
    font-family: monospace;
  }
  
  .error-message {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding: 0.75rem;
    background-color: #fed7d7;
    border: 1px solid #feb2b2;
    border-radius: 6px;
    color: #c53030;
    font-size: 0.875rem;
    line-height: 1.4;
  }
  
  .error-message svg {
    flex-shrink: 0;
    margin-top: 0.125rem;
  }
  
  .submit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 56px;
  }
  
  .submit-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
  }
  
  .submit-button:active:not(:disabled) {
    transform: translateY(0);
  }
  
  .submit-button:disabled {
    background: #cbd5e0;
    color: #a0aec0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* Focus visible improvements for better keyboard navigation */
  .submit-button:focus-visible {
    outline: 2px solid #4299e1;
    outline-offset: 2px;
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    textarea {
      border-width: 2px;
    }
    
    .submit-button {
      border: 2px solid transparent;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    textarea,
    .submit-button {
      transition: none;
    }
    
    .spinner {
      animation: none;
    }
  }
</style>