<script>
  import TaskInput from "../components/TaskInput.svelte";
  import RecommendationDisplay from "../components/RecommendationDisplay.svelte";
  import AccuracyFilter from "../components/AccuracyFilter.svelte";
  import ClassificationMode from "../components/ClassificationMode.svelte";
  import { LLMTaskClassifier } from "../lib/classification/LLMTaskClassifier.js";
  import { BrowserTaskClassifier } from "../lib/classification/BrowserTaskClassifier.js";
  import { ModelSelector } from "../lib/recommendation/ModelSelector.js";

  // Import data
  import modelsData from "../lib/data/models.json";
  import tasksData from "../lib/data/tasks.json";

  // Initialize components
  let taskClassifier;
  let fallbackClassifier; // Keyword-based fallback
  let modelSelector;
  let usingFallback = false;

  // Component state
  let taskDescription = "";
  let isLoading = false;
  let isModelLoading = false;
  let modelLoadProgress = "";
  let downloadPercentage = 0;
  let recommendations = [];
  let taskCategory = "";
  let taskSubcategory = "";
  let error = null;
  let accuracyThreshold = 0; // Accuracy filter threshold (0-95)
  let totalHidden = 0; // Number of models hidden by filter
  let classificationMode = "fast"; // Classification mode: 'fast' or 'ensemble'
  let ensembleInfo = null; // Ensemble voting information

  // Initialize when component mounts
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  onMount(async () => {
    try {
      // Initialize model selector immediately
      modelSelector = new ModelSelector(modelsData);

      // Initialize fallback classifier (backup)
      fallbackClassifier = new BrowserTaskClassifier(tasksData);

      // Initialize LLM classifier with improved loading
      taskClassifier = new LLMTaskClassifier({
        onProgress: (progress) => {
          if (progress.status === "downloading") {
            modelLoadProgress = `Downloading model: ${progress.progress}%`;
            downloadPercentage = progress.progress;
          } else if (progress.status === "loading") {
            modelLoadProgress = "Loading model into memory...";
            downloadPercentage = 100;
          }
        },
      });
      usingFallback = false; // Try LLM first

      console.log("✅ Data pipeline initialized successfully");
      console.log("🤖 LLM classifier ready (will load on first use)");
      console.log("📊 Available models:", Object.keys(modelsData.models));
      console.log("📋 Available tasks:", Object.keys(tasksData.taskTaxonomy));

      // Optionally preload the model in the background for better UX
      // Uncomment this to load model immediately on page load:
      // preloadModel();
    } catch (err) {
      console.error("❌ Failed to initialize data pipeline:", err);
      error =
        "Failed to initialize the model selector. Please refresh the page.";
    }
  });

  async function preloadModel() {
    if (
      taskClassifier &&
      !taskClassifier.isReady &&
      !taskClassifier.isLoading
    ) {
      try {
        isModelLoading = true;
        modelLoadProgress = "Loading AI classification model...";
        console.log("🔄 Preloading LLM model...");

        await taskClassifier.initialize();

        isModelLoading = false;
        modelLoadProgress = "";
        console.log("✅ Model preloaded successfully");
      } catch (err) {
        console.error("⚠️ Model preload failed (will load on first use):", err);
        isModelLoading = false;
        modelLoadProgress = "";
      }
    }
  }

  async function handleTaskSubmit(event) {
    const { taskDescription: description } = event.detail;

    if (!taskClassifier || !modelSelector) {
      error = "System not initialized. Please refresh the page.";
      return;
    }

    isLoading = true;
    error = null;
    recommendations = [];
    taskCategory = "";
    taskSubcategory = "";

    try {
      console.log("🔍 Analyzing task:", description);

      let classificationResult;

      // Try LLM classifier first
      try {
        // Show model loading status if needed
        if (
          !taskClassifier.isReady &&
          !taskClassifier.isLoading &&
          !usingFallback
        ) {
          modelLoadProgress = "Loading AI model (first time only, ~700MB)...";
          isModelLoading = true;
        }

        // Step 1: Try LLM classification (fast or ensemble mode)
        if (!usingFallback) {
          if (classificationMode === "ensemble") {
            classificationResult =
              await taskClassifier.classifyEnsemble(description);
            console.log(
              "🎯 Ensemble Classification result:",
              classificationResult,
            );

            // Store ensemble voting info for display
            ensembleInfo = {
              votes: classificationResult.ensembleVotes,
              total: classificationResult.ensembleTotal,
              confidence: classificationResult.ensembleConfidence,
              allVotes: classificationResult.allVotes,
            };
          } else {
            classificationResult = await taskClassifier.classify(description);
            console.log("🎯 LLM Classification result:", classificationResult);
            ensembleInfo = null; // Clear ensemble info in fast mode
          }
        } else {
          throw new Error("Using fallback classifier");
        }

        // Success! Clear loading state
        isModelLoading = false;
        modelLoadProgress = "";
      } catch (llmError) {
        console.warn(
          "⚠️ LLM classifier failed, using semantic fallback:",
          llmError,
        );

        // Fall back to semantic classifier
        classificationResult = await fallbackClassifier.classify(description);
        console.log("📝 Fallback classification result:", classificationResult);

        // Remember to use fallback for future requests
        usingFallback = true;
        isModelLoading = false;
        modelLoadProgress = "";

        // Show temporary warning
        if (!error) {
          error =
            "Note: Using semantic classification (LLM unavailable). Results may vary.";
          setTimeout(() => {
            if (error && error.includes("semantic classification")) {
              error = null;
            }
          }, 5000);
        }
      }

      // Extract the best prediction from the result
      const topPrediction =
        classificationResult.subcategoryPredictions[0] ||
        classificationResult.predictions[0];

      if (!topPrediction || !topPrediction.category) {
        throw new Error(
          "Could not classify the task. Please try describing it differently.",
        );
      }

      const classification = {
        category: topPrediction.category,
        subcategory: topPrediction.subcategory,
      };

      // If we still don't have a subcategory, use a reasonable default based on category
      if (!classification.subcategory) {
        const categoryDefaults = {
          natural_language_processing: "text_classification",
          computer_vision: "image_classification",
          speech_processing: "speech_recognition",
          time_series: "forecasting",
          recommendation_systems: "collaborative_filtering",
          reinforcement_learning: "game_playing",
          data_preprocessing: "data_cleaning",
        };
        classification.subcategory =
          categoryDefaults[classification.category] || "text_classification";
      }

      taskCategory = classification.category;
      taskSubcategory = classification.subcategory;

      // Step 2: Get model recommendations with accuracy filtering
      const groupedModels = modelSelector.getTaskModelsGroupedByTier(
        classification.category,
        classification.subcategory,
        accuracyThreshold,
      );

      console.log("🤖 Grouped models:", groupedModels);

      // Flatten the grouped models back into a single array for display
      const filteredRecommendations = [
        ...groupedModels.lightweight.models,
        ...groupedModels.standard.models,
        ...groupedModels.advanced.models,
      ];

      totalHidden = groupedModels.totalHidden;

      if (filteredRecommendations.length === 0) {
        throw new Error(
          `No models found for ${classification.category} → ${classification.subcategory}. This task type may not be supported yet.`,
        );
      }

      recommendations = filteredRecommendations;

      // Update URL for sharing (optional) - using SvelteKit's navigation
      const currentUrl = new URL(window.location);
      currentUrl.searchParams.set("task", encodeURIComponent(description));
      goto(currentUrl.pathname + currentUrl.search, {
        replaceState: true,
        noScroll: true,
      });
    } catch (err) {
      console.error("❌ Error processing task:", err);
      error =
        err.message ||
        "An error occurred while processing your task. Please try again.";
    } finally {
      isLoading = false;
    }
  }

  // Handle accuracy filter change
  function handleAccuracyFilterChange(newThreshold) {
    accuracyThreshold = newThreshold;

    // If we have results, refilter them
    if (taskCategory && taskSubcategory && modelSelector) {
      const groupedModels = modelSelector.getTaskModelsGroupedByTier(
        taskCategory,
        taskSubcategory,
        accuracyThreshold,
      );

      // Flatten the grouped models
      const filteredRecommendations = [
        ...groupedModels.lightweight.models,
        ...groupedModels.standard.models,
        ...groupedModels.advanced.models,
      ];

      totalHidden = groupedModels.totalHidden;
      recommendations = filteredRecommendations;

      console.log(`🔍 Filter changed to ${newThreshold}%:`, {
        shown: filteredRecommendations.length,
        hidden: totalHidden,
      });
    }
  }

  // Load task from URL on mount (for sharing)
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const taskFromUrl = urlParams.get("task");
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
  <title>AI Model Selector - Find the Most Efficient Models for Your Task</title
  >
  <meta
    name="description"
    content="Get personalized AI model recommendations prioritizing environmental efficiency. Find the smallest, most effective models for your machine learning tasks."
  />
</svelte:head>

<main>
  <header class="app-header">
    <h1>
      <span class="icon" aria-hidden="true">🤖</span>
      AI Model Selector
    </h1>
    <p class="tagline">
      Find the most <strong>environmentally efficient</strong> AI models for your
      task
    </p>
    <p class="subtitle">
      We prioritize smaller, more efficient models that reduce energy
      consumption while maintaining performance
    </p>
  </header>

  {#if isModelLoading || modelLoadProgress}
    <div class="model-loading" role="status">
      <svg
        class="spinner"
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 16 16"
      >
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-dasharray="9 3"
        />
      </svg>
      <div>
        <strong>🤖 Loading Llama 3.2 1B Model</strong>
        <p>
          {modelLoadProgress || "Preparing AI model for task classification..."}
        </p>
        {#if downloadPercentage > 0}
          <div class="progress-bar-container">
            <div
              class="progress-bar"
              style="width: {downloadPercentage}%"
            ></div>
          </div>
        {/if}
        <p class="small">
          This happens once per session (~700MB download, cached after first
          use)
        </p>
      </div>
    </div>
  {/if}

  {#if error && !isLoading}
    <div class="global-error" role="alert">
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 16 16">
        <path
          fill="currentColor"
          d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8S12.42 0 8 0zM7 3h2v6H7V3zm0 8h2v2H7v-2z"
        />
      </svg>
      <div>
        <strong>Something went wrong</strong>
        <p>{error}</p>
      </div>
    </div>
  {/if}

  <TaskInput bind:taskDescription {isLoading} on:submit={handleTaskSubmit} />

  <div class="settings-panel">
    <ClassificationMode
      bind:mode={classificationMode}
      onModeChange={(newMode) => {
        classificationMode = newMode;
      }}
    />

    <AccuracyFilter
      threshold={accuracyThreshold}
      onChange={handleAccuracyFilterChange}
    />
  </div>

  <RecommendationDisplay
    {recommendations}
    {taskCategory}
    {taskSubcategory}
    {isLoading}
    {totalHidden}
    {accuracyThreshold}
    {ensembleInfo}
  />

  <footer class="app-footer">
    <div class="footer-content">
      <p>
        <span class="icon" aria-hidden="true">🌍</span>
        <strong>Environmental Focus:</strong> We prioritize models that minimize
        energy consumption and carbon footprint
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
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

  .model-loading {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    max-width: 600px;
    margin: 0 auto 2rem;
    padding: 1rem;
    background-color: #e6fffa;
    border: 1px solid #81e6d9;
    border-radius: 8px;
    color: #234e52;
  }

  .model-loading svg {
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .model-loading strong {
    display: block;
    margin-bottom: 0.25rem;
  }

  .model-loading p {
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
  }

  .model-loading p.small {
    font-size: 0.875rem;
    color: #2c7a7b;
    margin-bottom: 0;
  }

  .progress-bar-container {
    width: 100%;
    height: 8px;
    background-color: #b2f5ea;
    border-radius: 4px;
    margin: 0.5rem 0;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background-color: #319795;
    transition: width 0.3s ease;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
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

  .settings-panel {
    max-width: 600px;
    margin: 0 auto 1.5rem;
    padding: 1rem;
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  .settings-panel :global(.classification-mode) {
    margin: 0 0 1rem 0;
    padding: 0;
    background: transparent;
    border-radius: 0;
  }

  .settings-panel :global(.accuracy-filter) {
    max-width: none;
    margin: 0;
    padding: 1rem 0 0 0;
    background: transparent;
    border: none;
    border-top: 1px solid #e2e8f0;
    border-radius: 0;
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
