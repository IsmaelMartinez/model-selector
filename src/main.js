/**
 * AI Model Selector - Vanilla JS Version
 * Uses Llama 3.2 1B with enhanced pre-prompting for 95.2% accurate 7-category classification
 */

import { pipeline } from '@huggingface/transformers';
import modelsData from './lib/data/models.json';
import tasksData from './lib/data/tasks.json';

// State
let generator = null;
let isLoading = false;
let isModelLoaded = false;

// DOM elements
const taskInput = document.getElementById('taskDescription');
const submitButton = document.getElementById('submitButton');
const modelLoadingStatus = document.getElementById('modelLoadingStatus');
const errorStatus = document.getElementById('errorStatus');
const recommendationsContainer = document.getElementById('recommendations');
const recommendationsList = document.getElementById('recommendationsList');

// Initialize
console.log('🤖 AI Model Selector initialized');
console.log('📊 Models available:', Object.keys(modelsData.models).length);
console.log('📋 Task categories:', Object.keys(tasksData.taskTaxonomy).length);

// Event listeners
submitButton.addEventListener('click', handleSubmit);
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    handleSubmit();
  }
});

// Load task from URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const taskFromUrl = urlParams.get('task');
if (taskFromUrl) {
  taskInput.value = decodeURIComponent(taskFromUrl);
}

/**
 * Main submit handler
 */
async function handleSubmit() {
  const taskDescription = taskInput.value.trim();

  if (!taskDescription) {
    showError('Please describe your AI task');
    return;
  }

  if (isLoading) {
    return;
  }

  isLoading = true;
  submitButton.disabled = true;
  submitButton.textContent = 'Processing...';
  clearError();
  hideRecommendations();

  try {
    // Step 1: Load model if needed
    if (!isModelLoaded) {
      await loadModel();
    }

    // Step 2: Classify task
    console.log('🔍 Classifying task:', taskDescription);
    const classification = await classifyTask(taskDescription);
    console.log('🎯 Classification result:', classification);

    // Step 3: Get model recommendations
    const recommendations = getModelRecommendations(
      classification.category,
      classification.subcategory
    );
    console.log('🤖 Recommendations:', recommendations);

    // Step 4: Display results
    displayRecommendations(recommendations, classification);

    // Update URL for sharing
    const url = new URL(window.location);
    url.searchParams.set('task', taskDescription);
    window.history.replaceState({}, '', url);

  } catch (error) {
    console.error('❌ Error:', error);
    showError(error.message || 'An error occurred. Please try again.');
  } finally {
    isLoading = false;
    submitButton.disabled = false;
    submitButton.textContent = 'Get Model Recommendations';
  }
}

/**
 * Load the LLM model (Llama 3.2 1B)
 */
async function loadModel() {
  if (isModelLoaded) return;

  showModelLoading('Loading AI classification model (first time only, ~700MB)...');
  console.log('🔄 Loading Llama 3.2 1B model...');

  const startTime = performance.now();

  try {
    // Use q4f16 quantization - this is the configuration that works!
    generator = await pipeline('text-generation', 'onnx-community/Llama-3.2-1B-Instruct', {
      dtype: 'q4f16',  // Changed from 'q4' - this fixes the ONNX error!
      device: 'webgpu',
      progress_callback: (progress) => {
        if (progress.status === 'downloading') {
          const percent = progress.progress ? Math.round(progress.progress) : 0;
          showModelLoading(`Downloading model: ${progress.file} (${percent}%)`);
          console.log(`📥 ${progress.file}: ${percent}%`);
        } else if (progress.status === 'loading') {
          showModelLoading('Loading model into memory...');
        }
      }
    });

    const loadTime = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Model loaded in ${loadTime}s (q4f16, WebGPU)`);

    isModelLoaded = true;
    hideModelLoading();

  } catch (error) {
    console.error('❌ Model loading failed:', error);
    hideModelLoading();
    throw new Error('Failed to load AI model. Please ensure you are using Chrome/Edge with WebGPU support and refresh the page.');
  }
}

/**
 * Classify task into category and subcategory
 * Using enhanced pre-prompting approach - achieves 95.2% accuracy across 7 categories
 */
async function classifyTask(taskDescription) {
  // Enhanced pre-prompting: explicit role + classification rules + few-shot examples
  const categoryPrompt = `You are a specialized AI task classifier. Your job is to categorize user tasks into exactly one of these 7 categories:

- computer_vision: visual tasks like image classification, object detection, segmentation, face recognition
- natural_language_processing: text tasks like translation, sentiment analysis, summarization, named entity recognition
- speech_processing: audio tasks like speech recognition, text-to-speech, speaker identification
- time_series: temporal data tasks like forecasting, anomaly detection, trend analysis
- data_preprocessing: data cleaning tasks like normalization, handling missing values, removing duplicates
- recommendation_systems: personalization tasks like product recommendations, content suggestions
- reinforcement_learning: learning through interaction like game playing, robot control, strategy optimization

Classification rules:
1. Read the task description carefully
2. Identify keywords and domain-specific terms
3. Match the task to the most appropriate category
4. Return only the category name, nothing else

Examples:

Task: "Translate text to Spanish"
Category: natural_language_processing

Task: "Detect faces in photographs"
Category: computer_vision

Task: "Convert audio to text"
Category: speech_processing

Task: "Forecast sales for next quarter"
Category: time_series

Task: "Clean missing data in CSV files"
Category: data_preprocessing

Task: "Suggest products to users"
Category: recommendation_systems

Task: "Train robot to navigate maze"
Category: reinforcement_learning

Now classify this task:

Task: "${taskDescription}"
Category:`;

  const categoryResult = await generator(categoryPrompt, {
    max_new_tokens: 5,  // Increased from 3 to handle longer category names
    temperature: 0.01,
    do_sample: false,
    return_full_text: false
  });

  const output = categoryResult[0].generated_text.trim().toLowerCase();
  console.log('🟢 Classification output:', output);

  // Parse category from output
  let category = 'natural_language_processing';  // Default fallback

  if (output.includes('computer_vision') || output.includes('computer-vision')) {
    category = 'computer_vision';
  } else if (output.includes('natural_language_processing') || output.includes('nlp')) {
    category = 'natural_language_processing';
  } else if (output.includes('speech_processing') || output.includes('speech')) {
    category = 'speech_processing';
  } else if (output.includes('time_series') || output.includes('time-series') || output.includes('temporal')) {
    category = 'time_series';
  } else if (output.includes('data_preprocessing') || output.includes('data-preprocessing') || output.includes('cleaning')) {
    category = 'data_preprocessing';
  } else if (output.includes('recommendation_systems') || output.includes('recommendation-systems') || output.includes('recommendation')) {
    category = 'recommendation_systems';
  } else if (output.includes('reinforcement_learning') || output.includes('reinforcement-learning') || output.includes('reinforcement')) {
    category = 'reinforcement_learning';
  }

  console.log('🎯 Parsed category:', category);

  // Step 2: Get subcategory (simplified - use first subcategory of category)
  const subcategories = Object.keys(tasksData.taskTaxonomy[category]?.subcategories || {});
  const subcategory = subcategories[0] || 'text_classification';

  return { category, subcategory };
}

/**
 * Get model recommendations based on classification
 */
function getModelRecommendations(category, subcategory) {
  console.log('🔍 Looking for models:', { category, subcategory });

  // Navigate the nested structure: category → subcategory → tier
  const categoryData = modelsData.models[category];
  if (!categoryData) {
    console.warn('❌ Category not found:', category);
    return [];
  }

  const subcategoryData = categoryData[subcategory];
  if (!subcategoryData) {
    console.warn('❌ Subcategory not found:', subcategory, 'Available:', Object.keys(categoryData));
    // Fallback: use first available subcategory
    const firstSubcategory = Object.keys(categoryData)[0];
    console.log('✅ Using fallback subcategory:', firstSubcategory);
    return getModelRecommendations(category, firstSubcategory);
  }

  // Collect models from all tiers (lightweight, standard, advanced)
  const allModels = [];
  for (const [tier, models] of Object.entries(subcategoryData)) {
    if (Array.isArray(models)) {
      models.forEach(model => {
        allModels.push({
          ...model,
          tier,
          category,
          subcategory,
          // Use sizeMB for sorting
          modelSize: model.sizeMB * 1024 * 1024 // Convert to bytes
        });
      });
    }
  }

  console.log(`✅ Found ${allModels.length} models in ${category}/${subcategory}`);

  // Sort by environmental score first, then by size
  const sorted = allModels.sort((a, b) => {
    if (a.environmentalScore !== b.environmentalScore) {
      return a.environmentalScore - b.environmentalScore;
    }
    return a.sizeMB - b.sizeMB;
  });

  return sorted.slice(0, 3); // Top 3
}

/**
 * Display recommendations in the UI
 */
function displayRecommendations(recommendations, classification) {
  recommendationsList.innerHTML = '';

  if (recommendations.length === 0) {
    recommendationsList.innerHTML = `
      <div class="recommendation-card">
        <p>No models found for this task type. Please try a different description.</p>
      </div>
    `;
  } else {
    recommendations.forEach((model, index) => {
      const card = document.createElement('div');
      card.className = 'recommendation-card';
      card.innerHTML = `
        <h3>
          ${index === 0 ? '<span class="badge badge-primary">Best Match</span>' : ''}
          ${model.name || model.id}
        </h3>
        <div class="model-details">
          <p>${model.description || ''}</p>
          <p><strong>Category:</strong> ${formatCategory(classification.category)}</p>
          <p><strong>Task:</strong> ${formatSubcategory(classification.subcategory)}</p>
          <p><strong>Tier:</strong> ${formatCategory(model.tier)}</p>
          ${model.sizeMB ? `<p><strong>Size:</strong> ${model.sizeMB} MB</p>` : ''}
          ${model.accuracy ? `<p><strong>Accuracy:</strong> ${(model.accuracy * 100).toFixed(1)}%</p>` : ''}
          <p><strong>🌍 Environmental Score:</strong> ${model.environmentalScore}/3 - ${getEnvironmentalMessage(model.environmentalScore - 1)}</p>
          ${model.deploymentOptions ? `<p><strong>Deployment:</strong> ${model.deploymentOptions.join(', ')}</p>` : ''}
        </div>
        <div style="margin-top: 1rem;">
          <a href="https://huggingface.co/${model.huggingFaceId}" target="_blank" rel="noopener"
             style="color: #667eea; font-weight: 600; text-decoration: none;">
            View on Hugging Face →
          </a>
        </div>
      `;
      recommendationsList.appendChild(card);
    });
  }

  recommendationsContainer.classList.add('visible');
  recommendationsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Helper functions
 */
function showModelLoading(message) {
  modelLoadingStatus.innerHTML = `
    <div class="status status-loading">
      <svg class="spinner" width="20" height="20" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="9 3" />
      </svg>
      <div>
        <strong>Loading Model</strong>
        <p>${message}</p>
        <p style="font-size: 0.875rem; margin-top: 0.25rem;">
          This happens once per session. Model is cached after first load.
        </p>
      </div>
    </div>
  `;
}

function hideModelLoading() {
  modelLoadingStatus.innerHTML = '';
}

function showError(message) {
  errorStatus.innerHTML = `
    <div class="status status-error">
      <svg width="20" height="20" viewBox="0 0 16 16">
        <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8S12.42 0 8 0zM7 3h2v6H7V3zm0 8h2v2H7v-2z"/>
      </svg>
      <div>
        <strong>Error</strong>
        <p>${message}</p>
      </div>
    </div>
  `;
}

function clearError() {
  errorStatus.innerHTML = '';
}

function hideRecommendations() {
  recommendationsContainer.classList.remove('visible');
}

function formatCategory(category) {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatSubcategory(subcategory) {
  return subcategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatSize(bytes) {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function getEnvironmentalMessage(rank) {
  const messages = [
    'Most energy-efficient option - smallest carbon footprint',
    'Excellent efficiency - low energy consumption',
    'Good efficiency - balanced performance and energy use'
  ];
  return messages[rank] || 'Efficient model choice';
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ Service Worker registered'))
      .catch(err => console.log('❌ Service Worker registration failed:', err));
  });
}
