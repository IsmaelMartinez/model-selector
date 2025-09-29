<script>
  import TaskInput from '../components/TaskInput.svelte';
  import RecommendationDisplay from '../components/RecommendationDisplay.svelte';
  import { BrowserTaskClassifier } from '../lib/classification/BrowserTaskClassifier.js';
  import { ModelSelector } from '../lib/recommendation/ModelSelector.js';
  
  // Import data
  import modelsData from '../lib/data/models.json';
  import tasksData from '../lib/data/tasks.json';
  
  // Initialize components
  let taskClassifier;
  let modelSelector;
  
  // Component state
  let taskDescription = '';
  let isLoading = false;
  let recommendations = [];
  let taskCategory = '';
  let taskSubcategory = '';
  let error = null;
  
  // Initialize when component mounts
  import { onMount } from 'svelte';
  
  onMount(() => {
    try {
      taskClassifier = new BrowserTaskClassifier(tasksData);
      modelSelector = new ModelSelector(modelsData);
      console.log('✅ Data pipeline initialized successfully');
      console.log('📊 Available models:', Object.keys(modelsData.models));
      console.log('📋 Available tasks:', Object.keys(tasksData.taskTaxonomy));
    } catch (err) {
      console.error('❌ Failed to initialize data pipeline:', err);
      error = 'Failed to initialize the model selector. Please refresh the page.';
    }
  });
  
  async function handleTaskSubmit(event) {
    const { taskDescription: description } = event.detail;
    
    if (!taskClassifier || !modelSelector) {
      error = 'System not initialized. Please refresh the page.';
      return;
    }
    
    isLoading = true;
    error = null;
    recommendations = [];
    taskCategory = '';
    taskSubcategory = '';
    
    try {
      console.log('🔍 Analyzing task:', description);
      
      // Step 1: Classify the task
      const classificationResult = await taskClassifier.classify(description);
      console.log('📝 Classification result:', classificationResult);
      
      // Extract the best prediction from the result
      const topPrediction = classificationResult.subcategoryPredictions[0] || classificationResult.predictions[0];
      
      if (!topPrediction || !topPrediction.category) {
        throw new Error('Could not classify the task. Please try describing it differently.');
      }
      
      const classification = {
        category: topPrediction.category,
        subcategory: topPrediction.subcategory
      };
      
      // If we still don't have a subcategory, use a reasonable default based on category
      if (!classification.subcategory) {
        const categoryDefaults = {
          'natural_language_processing': 'text_classification',
          'computer_vision': 'image_classification',
          'speech_processing': 'speech_recognition',
          'time_series': 'forecasting',
          'recommendation_systems': 'collaborative_filtering',
          'reinforcement_learning': 'game_playing',
          'data_preprocessing': 'data_cleaning'
        };
        classification.subcategory = categoryDefaults[classification.category] || 'text_classification';
      }
      
      taskCategory = classification.category;
      taskSubcategory = classification.subcategory;
      
      // Step 2: Get model recommendations using our "smaller is better" logic
      const modelRecommendations = modelSelector.selectModels(
        classification.category, 
        classification.subcategory, 
        3 // Get top 3 recommendations
      );
      
      console.log('🤖 Model recommendations:', modelRecommendations);
      
      if (modelRecommendations.length === 0) {
        throw new Error(`No models found for ${classification.category} → ${classification.subcategory}. This task type may not be supported yet.`);
      }
      
      recommendations = modelRecommendations;
      
      // Update URL for sharing (optional)
      const url = new URL(window.location);
      url.searchParams.set('task', encodeURIComponent(description));
      window.history.replaceState({}, '', url);
      
    } catch (err) {
      console.error('❌ Error processing task:', err);
      error = err.message || 'An error occurred while processing your task. Please try again.';
    } finally {
      isLoading = false;
    }
  }
  
  // Load task from URL on mount (for sharing)
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const taskFromUrl = urlParams.get('task');
    if (taskFromUrl) {
      taskDescription = decodeURIComponent(taskFromUrl);
      // Auto-submit after a brief delay to allow initialization
      setTimeout(() => {
        if (taskClassifier && modelSelector) {
          handleTaskSubmit({ detail: { taskDescription } });
        }
      }, 100);
    }
  });
</script>

<svelte:head>
  <title>AI Model Selector - Find the Most Efficient Models for Your Task</title>
  <meta name="description" content="Get personalized AI model recommendations prioritizing environmental efficiency. Find the smallest, most effective models for your machine learning tasks.">
</svelte:head>

<main>
  <header class="app-header">
    <h1>
      <span class="icon" aria-hidden="true">🤖</span>
      AI Model Selector
    </h1>
    <p class="tagline">
      Find the most <strong>environmentally efficient</strong> AI models for your task
    </p>
    <p class="subtitle">
      We prioritize smaller, more efficient models that reduce energy consumption while maintaining performance
    </p>
  </header>
  
  {#if error && !isLoading}
    <div class="global-error" role="alert">
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 16 16">
        <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8S12.42 0 8 0zM7 3h2v6H7V3zm0 8h2v2H7v-2z"/>
      </svg>
      <div>
        <strong>Something went wrong</strong>
        <p>{error}</p>
      </div>
    </div>
  {/if}
  
  <TaskInput 
    bind:taskDescription={taskDescription}
    {isLoading}
    on:submit={handleTaskSubmit}
  />
  
  <RecommendationDisplay 
    {recommendations}
    {taskCategory}
    {taskSubcategory}
    {isLoading}
  />
  
  <footer class="app-footer">
    <div class="footer-content">
      <p>
        <span class="icon" aria-hidden="true">🌍</span>
        <strong>Environmental Focus:</strong> We prioritize models that minimize energy consumption and carbon footprint
      </p>
      <p class="data-info">
        Model data sourced from Hugging Face Hub • Updated {modelsData.lastUpdated}
      </p>
    </div>
  </footer>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #2d3748;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }
  
  main {
    min-height: 100vh;
    background: #f7fafc;
    padding: 2rem 1rem;
  }
  
  .app-header {
    text-align: center;
    max-width: 600px;
    margin: 0 auto 3rem;
  }
  
  .app-header h1 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: #2d3748;
  }
  
  .app-header .icon {
    font-size: 2rem;
  }
  
  .tagline {
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
    color: #4a5568;
  }
  
  .tagline strong {
    color: #38a169;
  }
  
  .subtitle {
    font-size: 1rem;
    color: #718096;
    margin: 0;
    line-height: 1.5;
  }
  
  .global-error {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    max-width: 600px;
    margin: 0 auto 2rem;
    padding: 1rem;
    background-color: #fed7d7;
    border: 1px solid #feb2b2;
    border-radius: 8px;
    color: #c53030;
  }
  
  .global-error svg {
    flex-shrink: 0;
    margin-top: 0.125rem;
  }
  
  .global-error strong {
    display: block;
    margin-bottom: 0.25rem;
  }
  
  .global-error p {
    margin: 0;
    line-height: 1.4;
  }
  
  .app-footer {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
  }
  
  .footer-content {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
    color: #718096;
    font-size: 0.875rem;
  }
  
  .footer-content p {
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .footer-content .icon {
    color: #38a169;
  }
  
  .footer-content strong {
    color: #4a5568;
  }
  
  .data-info {
    font-size: 0.75rem;
    color: #a0aec0;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    main {
      padding: 1rem;
    }
    
    .app-header h1 {
      font-size: 2rem;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .tagline {
      font-size: 1.1rem;
    }
    
    .footer-content p {
      flex-direction: column;
      gap: 0.25rem;
    }
  }
  
  /* Accessibility improvements */
  @media (prefers-reduced-motion: reduce) {
    :global(*),
    :global(*::before),
    :global(*::after) {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    main {
      background: white;
    }
    
    .app-header h1 {
      color: black;
    }
  }
</style>