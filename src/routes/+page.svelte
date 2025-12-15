<script>
  import TaskInput from "../components/TaskInput.svelte";
  import RecommendationDisplay from "../components/RecommendationDisplay.svelte";
  import AccuracyFilter from "../components/AccuracyFilter.svelte";
  import ClassificationMode from "../components/ClassificationMode.svelte";
  import ClarificationFlow from "../components/ClarificationFlow.svelte";
  import { LLMTaskClassifier } from "../lib/classification/LLMTaskClassifier.js";
  import { BrowserTaskClassifier } from "../lib/classification/BrowserTaskClassifier.js";
  import { ModelSelector } from "../lib/recommendation/ModelSelector.js";

  // Import data
  import modelsData from "../lib/data/models.json";
  import tasksData from "../lib/data/tasks.json";

  // Initialize components
  let taskClassifier;
  let fallbackClassifier;
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
  let accuracyThreshold = 0;
  let totalHidden = 0;
  let classificationMode = "fast";
  let ensembleInfo = null;
  
  // Clarification flow state
  let showClarification = false;
  let clarificationOptions = [];
  let pendingTaskDescription = "";

  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  onMount(async () => {
    try {
      modelSelector = new ModelSelector(modelsData);
      fallbackClassifier = new BrowserTaskClassifier(tasksData);

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
      usingFallback = false;

      console.log("✅ Data pipeline initialized successfully");
    } catch (err) {
      console.error("❌ Failed to initialize data pipeline:", err);
      error = "Failed to initialize the model selector. Please refresh the page.";
    }
  });

  // Check if task needs clarification
  function needsClarification(description) {
    const lowerDesc = description.toLowerCase();
    const ambiguousPatterns = [
      { pattern: /\b(help|assist|work with)\b.*\b(ai|model|ml)\b/i, reason: "general" },
      { pattern: /^(i want to|i need to|help me)\s+\w+$/i, reason: "too_short" },
      { pattern: /\b(process|handle|work with)\s+(data|information)\b/i, reason: "data_ambiguous" },
      { pattern: /\b(analyze|analysis)\b/i, matchMultiple: ["text", "image", "audio", "video", "time", "series"], reason: "analysis_type" },
    ];

    // Check for very short descriptions
    if (description.split(/\s+/).length < 4) {
      return { needs: true, reason: "too_short" };
    }

    // Check ambiguous patterns
    for (const p of ambiguousPatterns) {
      if (p.pattern.test(lowerDesc)) {
        return { needs: true, reason: p.reason };
      }
    }

    return { needs: false };
  }

  // Generate clarification options based on ambiguity
  function generateClarificationOptions(description, reason) {
    const options = {
      general: [
        { label: "📝 Text & Language", desc: "Analyze, generate, or classify text", category: "natural_language_processing" },
        { label: "🖼️ Images & Vision", desc: "Classify, detect, or segment images", category: "computer_vision" },
        { label: "🎤 Speech & Audio", desc: "Transcribe, synthesize, or analyze audio", category: "speech_processing" },
        { label: "📈 Time Series & Forecasting", desc: "Predict trends or detect anomalies", category: "time_series" },
        { label: "🎯 Recommendations", desc: "Suggest products, content, or items", category: "recommendation_systems" },
      ],
      too_short: [
        { label: "📝 Text & Language", desc: "NLP tasks like classification, generation, translation", category: "natural_language_processing" },
        { label: "🖼️ Images & Vision", desc: "Computer vision tasks", category: "computer_vision" },
        { label: "🎤 Speech & Audio", desc: "Audio processing tasks", category: "speech_processing" },
        { label: "📈 Data & Analytics", desc: "Time series, forecasting, anomaly detection", category: "time_series" },
        { label: "🤖 Other AI Tasks", desc: "Reinforcement learning, recommendations", category: "recommendation_systems" },
      ],
      data_ambiguous: [
        { label: "📊 Tabular Data", desc: "Structured data, spreadsheets, databases", category: "data_preprocessing" },
        { label: "📝 Text Data", desc: "Documents, articles, messages", category: "natural_language_processing" },
        { label: "🖼️ Image Data", desc: "Photos, graphics, scans", category: "computer_vision" },
        { label: "📈 Time Series Data", desc: "Sequential measurements over time", category: "time_series" },
      ],
      analysis_type: [
        { label: "📝 Text Analysis", desc: "Sentiment, entities, classification", category: "natural_language_processing" },
        { label: "🖼️ Image Analysis", desc: "Object detection, segmentation", category: "computer_vision" },
        { label: "🎤 Audio Analysis", desc: "Speech recognition, sound classification", category: "speech_processing" },
        { label: "📈 Trend Analysis", desc: "Time series forecasting, patterns", category: "time_series" },
      ],
    };

    return options[reason] || options.general;
  }

  async function handleTaskSubmit(event) {
    const { taskDescription: description } = event.detail;

    if (!taskClassifier || !modelSelector) {
      error = "System not initialized. Please refresh the page.";
      return;
    }

    // Check if clarification is needed
    const clarification = needsClarification(description);
    if (clarification.needs) {
      pendingTaskDescription = description;
      clarificationOptions = generateClarificationOptions(description, clarification.reason);
      showClarification = true;
      return;
    }

    await processTask(description);
  }

  async function handleClarificationSelect(event) {
    const { category, originalDescription } = event.detail;
    showClarification = false;
    
    // Process with the clarified category
    await processTask(originalDescription, category);
  }

  function handleClarificationSkip() {
    showClarification = false;
    processTask(pendingTaskDescription);
  }

  async function processTask(description, forcedCategory = null) {
    isLoading = true;
    error = null;
    recommendations = [];
    taskCategory = "";
    taskSubcategory = "";

    try {
      console.log("🔍 Analyzing task:", description);

      let classificationResult;

      if (forcedCategory) {
        // Use the clarified category directly
        classificationResult = {
          predictions: [{ category: forcedCategory, confidence: 1.0 }],
          subcategoryPredictions: [{ category: forcedCategory, subcategory: getDefaultSubcategory(forcedCategory), confidence: 1.0 }]
        };
        ensembleInfo = null;
      } else {
        try {
          if (!taskClassifier.isReady && !taskClassifier.isLoading && !usingFallback) {
            modelLoadProgress = "Loading AI model (first time only, ~700MB)...";
            isModelLoading = true;
          }

          if (!usingFallback) {
            if (classificationMode === "ensemble") {
              classificationResult = await taskClassifier.classifyEnsemble(description);
              ensembleInfo = {
                votes: classificationResult.ensembleVotes,
                total: classificationResult.ensembleTotal,
                confidence: classificationResult.ensembleConfidence,
                allVotes: classificationResult.allVotes,
              };
            } else {
              classificationResult = await taskClassifier.classify(description);
              ensembleInfo = null;
            }
          } else {
            throw new Error("Using fallback classifier");
          }

          isModelLoading = false;
          modelLoadProgress = "";
        } catch (llmError) {
          console.warn("⚠️ LLM classifier failed, using semantic fallback:", llmError);
          classificationResult = await fallbackClassifier.classify(description);
          usingFallback = true;
          isModelLoading = false;
          modelLoadProgress = "";
        }
      }

      const topPrediction = classificationResult.subcategoryPredictions[0] || classificationResult.predictions[0];

      if (!topPrediction || !topPrediction.category) {
        throw new Error("Could not classify the task. Please try describing it differently.");
      }

      const classification = {
        category: topPrediction.category,
        subcategory: topPrediction.subcategory || getDefaultSubcategory(topPrediction.category),
      };

      taskCategory = classification.category;
      taskSubcategory = classification.subcategory;

      const groupedModels = modelSelector.getTaskModelsGroupedByTier(
        classification.category,
        classification.subcategory,
        accuracyThreshold,
      );

      const filteredRecommendations = [
        ...groupedModels.lightweight.models,
        ...groupedModels.standard.models,
        ...groupedModels.advanced.models,
      ];

      totalHidden = groupedModels.totalHidden;

      if (filteredRecommendations.length === 0) {
        throw new Error(`No models found for ${classification.category}. Try a different task description.`);
      }

      recommendations = filteredRecommendations;

      const currentUrl = new URL(window.location);
      currentUrl.searchParams.set("task", encodeURIComponent(description));
      goto(currentUrl.pathname + currentUrl.search, { replaceState: true, noScroll: true });
    } catch (err) {
      console.error("❌ Error processing task:", err);
      error = err.message || "An error occurred. Please try again.";
    } finally {
      isLoading = false;
    }
  }

  function getDefaultSubcategory(category) {
    const defaults = {
      natural_language_processing: "text_classification",
      computer_vision: "image_classification",
      speech_processing: "speech_recognition",
      time_series: "forecasting",
      recommendation_systems: "collaborative_filtering",
      reinforcement_learning: "game_playing",
      data_preprocessing: "data_cleaning",
    };
    return defaults[category] || "text_classification";
  }

  function handleAccuracyFilterChange(newThreshold) {
    accuracyThreshold = newThreshold;

    if (taskCategory && taskSubcategory && modelSelector) {
      const groupedModels = modelSelector.getTaskModelsGroupedByTier(
        taskCategory,
        taskSubcategory,
        accuracyThreshold,
      );

      const filteredRecommendations = [
        ...groupedModels.lightweight.models,
        ...groupedModels.standard.models,
        ...groupedModels.advanced.models,
      ];

      totalHidden = groupedModels.totalHidden;
      recommendations = filteredRecommendations;
    }
  }

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const taskFromUrl = urlParams.get("task");
    if (taskFromUrl) {
      taskDescription = decodeURIComponent(taskFromUrl);
      setTimeout(() => {
        if (taskClassifier && modelSelector) {
          handleTaskSubmit({ detail: { taskDescription } });
        }
      }, 100);
    }
  });
</script>

<svelte:head>
  <title>Model Selector — Eco-Friendly AI Models</title>
  <meta name="description" content="Find the most environmentally efficient AI models for your task. We prioritize smaller, greener models." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<div class="app">
  <div class="background-effects">
    <div class="glow glow-1"></div>
    <div class="glow glow-2"></div>
    <div class="grid-overlay"></div>
  </div>

  <main>
    <header class="hero">
      <div class="badge">
        <span class="pulse"></span>
        <span>🌱 Eco-First AI</span>
      </div>
      
      <h1>
        <span class="gradient-text">Model Selector</span>
      </h1>
      
      <p class="hero-subtitle">
        Find AI models that are <em>powerful</em> and <em>planet-friendly</em>.
        <br />
        <span class="highlight">Smaller models. Bigger impact.</span>
      </p>

      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-number">200+</span>
          <span class="stat-label">Models</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">7</span>
          <span class="stat-label">Categories</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">95.2%</span>
          <span class="stat-label">Accuracy</span>
        </div>
      </div>
    </header>

    {#if isModelLoading || modelLoadProgress}
      <div class="model-loading-card" role="status">
        <div class="loading-icon">
          <svg class="spinner" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="url(#gradient)" stroke-width="4" stroke-linecap="round" stroke-dasharray="80 120" />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#10b981" />
                <stop offset="100%" stop-color="#34d399" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="loading-content">
          <h3>Loading Llama 3.2 1B</h3>
          <p>{modelLoadProgress || "Preparing AI model..."}</p>
          {#if downloadPercentage > 0}
            <div class="progress-track">
              <div class="progress-fill" style="width: {downloadPercentage}%"></div>
            </div>
          {/if}
          <span class="loading-note">One-time download • Cached for future visits</span>
        </div>
      </div>
    {/if}

    {#if error && !isLoading}
      <div class="error-card" role="alert">
        <div class="error-icon">⚠️</div>
        <div class="error-content">
          <strong>Something went wrong</strong>
          <p>{error}</p>
        </div>
        <button class="error-dismiss" on:click={() => error = null}>✕</button>
      </div>
    {/if}

    {#if showClarification}
      <ClarificationFlow 
        options={clarificationOptions}
        originalDescription={pendingTaskDescription}
        on:select={handleClarificationSelect}
        on:skip={handleClarificationSkip}
      />
    {:else}
      <TaskInput bind:taskDescription {isLoading} on:submit={handleTaskSubmit} />
    {/if}

    <div class="settings-row">
      <ClassificationMode
        bind:mode={classificationMode}
        onModeChange={(newMode) => { classificationMode = newMode; }}
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
        <div class="footer-brand">
          <span class="footer-logo">🌍</span>
          <span>Building sustainable AI, one model at a time</span>
        </div>
        <div class="footer-meta">
          <span>Data from Hugging Face Hub</span>
          <span class="dot">•</span>
          <span>Updated {new Date(modelsData.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
    </footer>
  </main>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    background: #0a0f0d;
    color: #e8f5e9;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  .app {
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }

  /* Background Effects */
  .background-effects {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    opacity: 0.4;
  }

  .glow-1 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, #10b981 0%, transparent 70%);
    top: -200px;
    left: -200px;
    animation: float 20s ease-in-out infinite;
  }

  .glow-2 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, #059669 0%, transparent 70%);
    bottom: -150px;
    right: -150px;
    animation: float 25s ease-in-out infinite reverse;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(50px, 30px); }
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  main {
    position: relative;
    z-index: 1;
    max-width: 1000px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
  }

  /* Hero Section */
  .hero {
    text-align: center;
    margin-bottom: 3rem;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 100px;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #34d399;
    margin-bottom: 1.5rem;
  }

  .pulse {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
  }

  h1 {
    font-size: clamp(2.5rem, 8vw, 4.5rem);
    font-weight: 800;
    margin: 0 0 1rem;
    letter-spacing: -0.03em;
  }

  .gradient-text {
    background: linear-gradient(135deg, #ffffff 0%, #10b981 50%, #34d399 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    color: #94a3b8;
    margin: 0 0 2rem;
    line-height: 1.8;
  }

  .hero-subtitle em {
    color: #e8f5e9;
    font-style: normal;
    font-weight: 600;
  }

  .highlight {
    display: inline-block;
    margin-top: 0.5rem;
    color: #10b981;
    font-weight: 600;
  }

  .stats-bar {
    display: inline-flex;
    align-items: center;
    gap: 2rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1rem 2rem;
    backdrop-filter: blur(10px);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: #10b981;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .stat-divider {
    width: 1px;
    height: 30px;
    background: rgba(255, 255, 255, 0.1);
  }

  /* Loading Card */
  .model-loading-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    backdrop-filter: blur(10px);
  }

  .loading-icon {
    flex-shrink: 0;
  }

  .spinner {
    width: 48px;
    height: 48px;
    animation: spin 1.5s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .loading-content {
    flex: 1;
  }

  .loading-content h3 {
    margin: 0 0 0.25rem;
    font-size: 1rem;
    font-weight: 600;
    color: #34d399;
  }

  .loading-content p {
    margin: 0 0 0.75rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }

  .progress-track {
    height: 6px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #34d399);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .loading-note {
    font-size: 0.75rem;
    color: #64748b;
  }

  /* Error Card */
  .error-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 16px;
    padding: 1.25rem;
    margin-bottom: 2rem;
  }

  .error-icon {
    font-size: 1.5rem;
  }

  .error-content {
    flex: 1;
  }

  .error-content strong {
    display: block;
    color: #fca5a5;
    margin-bottom: 0.25rem;
  }

  .error-content p {
    margin: 0;
    color: #fecaca;
    font-size: 0.875rem;
  }

  .error-dismiss {
    background: none;
    border: none;
    color: #f87171;
    cursor: pointer;
    padding: 0.25rem;
    font-size: 1rem;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .error-dismiss:hover {
    opacity: 1;
  }

  /* Settings Row */
  .settings-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 768px) {
    .settings-row {
      grid-template-columns: 1fr;
    }
  }

  /* Footer */
  .app-footer {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .footer-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    text-align: center;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: #94a3b8;
  }

  .footer-logo {
    font-size: 1.25rem;
  }

  .footer-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #64748b;
  }

  .dot {
    opacity: 0.5;
  }

  /* Responsive */
  @media (max-width: 640px) {
    main {
      padding: 2rem 1rem;
    }

    h1 {
      font-size: 2.5rem;
    }

    .hero-subtitle {
      font-size: 1rem;
    }

    .stats-bar {
      flex-direction: column;
      gap: 1rem;
      padding: 1.5rem;
    }

    .stat-divider {
      width: 40px;
      height: 1px;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .glow-1, .glow-2, .pulse, .spinner {
      animation: none;
    }
  }

  @media (prefers-contrast: high) {
    .badge {
      border-width: 2px;
    }
  }
</style>
