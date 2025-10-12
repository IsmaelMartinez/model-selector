/**
 * Model Metadata Aggregation System
 * Aggregates model information from multiple sources for quarterly updates
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ModelAggregator {
  constructor(options = {}) {
    this.huggingFaceToken = options.huggingFaceToken || process.env.HF_TOKEN;
    this.dataPath = options.dataPath || join(__dirname, '../data');
    this.sources = {
      huggingface: true,
      papersWithCode: options.includePapersWithCode || false
    };
    
    // Load current data
    this.currentModels = this.loadCurrentModels();
    this.currentTasks = this.loadCurrentTasks();
    
    // Aggregation statistics
    this.stats = {
      processed: 0,
      added: 0,
      updated: 0,
      errors: 0,
      startTime: null
    };
  }

  /**
   * Load current models.json file
   */
  loadCurrentModels() {
    try {
      const modelsPath = join(this.dataPath, 'models.json');
      return JSON.parse(readFileSync(modelsPath, 'utf8'));
    } catch (error) {
      console.warn('⚠️ Could not load current models.json, starting fresh');
      return this.getDefaultModelsStructure();
    }
  }

  /**
   * Load current tasks.json file
   */
  loadCurrentTasks() {
    try {
      const tasksPath = join(this.dataPath, 'tasks.json');
      return JSON.parse(readFileSync(tasksPath, 'utf8'));
    } catch (error) {
      console.warn('⚠️ Could not load current tasks.json');
      return null;
    }
  }

  /**
   * Main aggregation method - updates model dataset from multiple sources
   */
  async aggregateModels(options = {}) {
    console.log('🚀 Starting model metadata aggregation...\n');
    this.stats.startTime = Date.now();

    const config = {
      maxModelsPerCategory: options.maxModelsPerCategory || 10,
      includeUpdated: options.includeUpdated || true,
      validateAccuracy: options.validateAccuracy || true,
      dryRun: options.dryRun || false,
      categories: options.categories || this.getDefaultCategories()
    };

    try {
      // Step 1: Fetch models from Hugging Face
      console.log('📡 Fetching models from Hugging Face Hub...');
      const hfModels = await this.fetchHuggingFaceModels(config.categories);
      console.log(`   Found ${hfModels.length} potential models\n`);

      // Step 2: Process and categorize models
      console.log('🔄 Processing and categorizing models...');
      const processedModels = await this.processModels(hfModels, config);
      console.log(`   Processed ${processedModels.length} models\n`);

      // Step 3: Organize into tiers
      console.log('📊 Organizing models into performance tiers...');
      const tieredModels = this.organizeIntoTiers(processedModels);
      this.logTierSummary(tieredModels);

      // Step 4: Validate and merge with existing data
      console.log('✅ Validating and merging with existing dataset...');
      const mergedData = this.mergeWithExistingData(tieredModels, config);

      // Step 5: Save updated dataset (if not dry run)
      if (!config.dryRun) {
        console.log('💾 Saving updated model dataset...');
        this.saveModelsData(mergedData);
        console.log('   ✅ Dataset saved successfully\n');
      } else {
        console.log('🧪 Dry run complete - no files modified\n');
      }

      // Print summary statistics
      this.printAggregationSummary();

      return {
        success: true,
        stats: this.stats,
        data: mergedData
      };

    } catch (error) {
      console.error('❌ Aggregation failed:', error.message);
      return {
        success: false,
        error: error.message,
        stats: this.stats
      };
    }
  }

  /**
   * Fetch models from Hugging Face Hub API
   */
  async fetchHuggingFaceModels(categories) {
    const allModels = [];

    for (const category of categories) {
      try {
        console.log(`   Fetching ${category.task} models...`);

        const url = new URL('https://huggingface.co/api/models');
        // Use pipeline_tag instead of filter for newer API
        url.searchParams.set('pipeline_tag', category.task);
        url.searchParams.set('sort', 'downloads');
        url.searchParams.set('direction', '-1'); // Descending
        url.searchParams.set('limit', '20'); // Reduced from 50 to avoid rate limits

        const headers = {};
        if (this.huggingFaceToken) {
          headers['Authorization'] = `Bearer ${this.huggingFaceToken}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const models = await response.json();

        console.log(`   Found ${models.length} ${category.task} models`);

        // Add category information to each model
        const categorizedModels = models.map(model => ({
          ...model,
          sourceCategory: category.category,
          sourceSubcategory: category.subcategory,
          sourceTask: category.task
        }));

        allModels.push(...categorizedModels);
        this.stats.processed += models.length;

        // Rate limiting - be more conservative
        await this.sleep(500);

      } catch (error) {
        console.warn(`   ⚠️ Failed to fetch ${category.task}: ${error.message}`);
        this.stats.errors++;
      }
    }

    return allModels;
  }

  /**
   * Process raw models into our standardized format
   */
  async processModels(rawModels, config) {
    const processed = [];

    for (const rawModel of rawModels) {
      try {
        // Skip models without sufficient metadata
        if (!rawModel.id || !rawModel.downloads) {
          continue;
        }

        // Get detailed model info
        const modelInfo = await this.getDetailedModelInfo(rawModel.id);
        
        // Extract and validate metadata
        const processedModel = await this.extractModelMetadata(rawModel, modelInfo);
        
        if (processedModel && this.validateModelData(processedModel)) {
          processed.push(processedModel);
        }

      } catch (error) {
        console.warn(`   ⚠️ Failed to process ${rawModel.id}: ${error.message}`);
        this.stats.errors++;
      }
    }

    return processed;
  }

  /**
   * Get detailed model information from Hugging Face
   */
  async getDetailedModelInfo(modelId) {
    try {
      const url = `https://huggingface.co/api/models/${modelId}`;
      const headers = {};
      
      if (this.huggingFaceToken) {
        headers['Authorization'] = `Bearer ${this.huggingFaceToken}`;
      }

      const response = await fetch(url, { headers });
      
      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract and standardize model metadata
   */
  async extractModelMetadata(rawModel, detailedInfo) {
    // Estimate model size (simplified logic)
    const sizeMB = this.estimateModelSize(rawModel, detailedInfo);
    
    // Determine tier based on size
    const tier = this.determineTier(sizeMB);
    
    // Extract accuracy if available (simplified)
    const accuracy = this.extractAccuracy(rawModel, detailedInfo);
    
    // Calculate environmental score using comprehensive system
    const environmentalScore = await this.calculateEnvironmentalScore(sizeMB, {
      sizeMB,
      name: this.extractModelName(rawModel),
      description: this.extractDescription(rawModel, detailedInfo),
      deploymentOptions: this.determineDeploymentOptions(sizeMB, rawModel)
    });
    
    // Determine deployment options based on size and model type
    const deploymentOptions = this.determineDeploymentOptions(sizeMB, rawModel);
    
    // Extract supported frameworks
    const frameworks = this.extractFrameworks(rawModel, detailedInfo);

    return {
      id: this.generateModelId(rawModel),
      name: this.extractModelName(rawModel),
      huggingFaceId: rawModel.id,
      description: this.extractDescription(rawModel, detailedInfo),
      sizeMB: sizeMB,
      accuracy: accuracy,
      environmentalScore: environmentalScore,
      deploymentOptions: deploymentOptions,
      frameworks: frameworks,
      lastUpdated: rawModel.lastModified || new Date().toISOString().split('T')[0],
      
      // Internal metadata for processing
      category: rawModel.sourceCategory,
      subcategory: rawModel.sourceSubcategory,
      tier: tier,
      downloads: rawModel.downloads || 0,
      likes: rawModel.likes || 0
    };
  }

  /**
   * Organize processed models into performance tiers
   */
  organizeIntoTiers(processedModels) {
    const tiered = {
      computer_vision: {
        image_classification: { lightweight: [], standard: [], advanced: [] },
        object_detection: { lightweight: [], standard: [], advanced: [] }
      },
      natural_language_processing: {
        text_classification: { lightweight: [], standard: [], advanced: [] },
        sentiment_analysis: { lightweight: [], standard: [], advanced: [] },
        text_generation: { lightweight: [], standard: [], advanced: [] }
      },
      speech_processing: {
        speech_recognition: { lightweight: [], standard: [], advanced: [] },
        text_to_speech: { lightweight: [], standard: [], advanced: [] }
      },
      time_series: {
        forecasting: { lightweight: [], standard: [], advanced: [] }
      }
    };

    for (const model of processedModels) {
      const { category, subcategory, tier } = model;
      
      if (tiered[category] && tiered[category][subcategory] && tiered[category][subcategory][tier]) {
        // Remove processing metadata before adding to tiers
        const cleanModel = { ...model };
        delete cleanModel.category;
        delete cleanModel.subcategory;
        delete cleanModel.tier;
        delete cleanModel.downloads;
        delete cleanModel.likes;
        
        tiered[category][subcategory][tier].push(cleanModel);
      }
    }

    // Sort models within each tier by relevance (downloads, accuracy, size)
    this.sortModelsInTiers(tiered);

    return tiered;
  }

  /**
   * Merge new data with existing dataset
   */
  mergeWithExistingData(newTieredModels, config) {
    const merged = {
      ...this.currentModels,
      lastUpdated: new Date().toISOString().split('T')[0],
      models: { ...this.currentModels.models }
    };

    // Merge each category/subcategory/tier
    for (const [category, subcategories] of Object.entries(newTieredModels)) {
      if (!merged.models[category]) {
        merged.models[category] = {};
      }

      for (const [subcategory, tiers] of Object.entries(subcategories)) {
        if (!merged.models[category][subcategory]) {
          merged.models[category][subcategory] = {};
        }

        for (const [tier, models] of Object.entries(tiers)) {
          if (models.length > 0) {
            // Keep best models from existing + new (limit per tier)
            const existing = merged.models[category][subcategory][tier] || [];
            const combined = [...existing, ...models];
            
            // Remove duplicates based on huggingFaceId
            const deduped = this.deduplicateModels(combined);
            
            // Sort and limit
            const sorted = this.sortModelsByRelevance(deduped);
            merged.models[category][subcategory][tier] = sorted.slice(0, 5); // Max 5 per tier
            
            // Update statistics
            const newCount = models.length;
            const existingCount = existing.length;
            if (newCount > 0) {
              this.stats.added += Math.max(0, merged.models[category][subcategory][tier].length - existingCount);
            }
          }
        }
      }
    }

    return merged;
  }

  // === Utility Methods ===

  /**
   * Estimate model size in MB (simplified heuristic)
   */
  estimateModelSize(rawModel, detailedInfo) {
    // Try to get actual size from model info
    if (detailedInfo && detailedInfo.safetensors) {
      const totalSize = Object.values(detailedInfo.safetensors.metadata || {})
        .reduce((sum, file) => sum + (file.size || 0), 0);
      if (totalSize > 0) {
        return Math.round(totalSize / (1024 * 1024)); // Convert to MB
      }
    }

    // Fallback: estimate based on model name/type
    const modelName = rawModel.id.toLowerCase();
    
    if (modelName.includes('nano') || modelName.includes('tiny')) return 8;
    if (modelName.includes('small') || modelName.includes('mobile')) return 25;
    if (modelName.includes('base') && !modelName.includes('large')) return 150;
    if (modelName.includes('medium')) return 400;
    if (modelName.includes('large')) return 800;
    if (modelName.includes('xl') || modelName.includes('xxl')) return 1500;
    
    return 100; // Default estimate
  }

  /**
   * Determine performance tier based on size
   */
  determineTier(sizeMB) {
    if (sizeMB < 100) return 'lightweight';
    if (sizeMB < 500) return 'standard';
    return 'advanced';
  }

  /**
   * Calculate environmental impact score using comprehensive calculator
   */
  async calculateEnvironmentalScore(sizeMB, model = null) {
    // Use the comprehensive environmental calculator if available
    try {
      // Import dynamically to avoid circular dependencies
      const { environmentalCalculator } = await import('../environmental/EnvironmentalImpactCalculator.js');

      const testModel = model || {
        sizeMB,
        deploymentOptions: sizeMB < 100 ? ['browser', 'edge'] : sizeMB < 500 ? ['cloud'] : ['server']
      };

      const impact = environmentalCalculator.calculateImpact(testModel);
      return impact.environmentalScore;
    } catch (error) {
      // Fallback to simple size-based calculation
      if (sizeMB < 100) return 1; // Low impact
      if (sizeMB < 500) return 2; // Medium impact
      return 3; // High impact
    }
  }

  /**
   * Determine deployment options based on model characteristics
   */
  determineDeploymentOptions(sizeMB, rawModel) {
    const options = [];
    
    if (sizeMB < 50) {
      options.push('browser', 'mobile', 'edge');
    } else if (sizeMB < 200) {
      options.push('edge', 'cloud');
    }
    
    if (sizeMB < 1000) {
      options.push('cloud', 'server');
    } else {
      options.push('server');
    }
    
    return options;
  }

  /**
   * Extract supported frameworks (simplified)
   */
  extractFrameworks(rawModel, detailedInfo) {
    const frameworks = [];
    
    // Check for common framework indicators
    if (detailedInfo) {
      if (detailedInfo.library_name === 'transformers') frameworks.push('PyTorch', 'TensorFlow');
      if (detailedInfo.library_name === 'pytorch') frameworks.push('PyTorch');
      if (detailedInfo.library_name === 'tensorflow') frameworks.push('TensorFlow');
    }
    
    // Default frameworks for popular models
    if (frameworks.length === 0) {
      frameworks.push('PyTorch');
      if (rawModel.id.includes('tensorflow')) frameworks.push('TensorFlow');
    }
    
    return frameworks;
  }

  /**
   * Generate standardized model ID
   */
  generateModelId(rawModel) {
    return rawModel.id.replace(/[\/\\]/g, '_').toLowerCase();
  }

  /**
   * Extract clean model name
   */
  extractModelName(rawModel) {
    const parts = rawModel.id.split('/');
    return parts[parts.length - 1].replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Extract model description
   */
  extractDescription(rawModel, detailedInfo) {
    if (detailedInfo && detailedInfo.cardData && detailedInfo.cardData.description) {
      return detailedInfo.cardData.description.slice(0, 150);
    }
    
    // Generate basic description
    const name = this.extractModelName(rawModel);
    const task = rawModel.sourceTask.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `${name} model for ${task.toLowerCase()}`;
  }

  /**
   * Extract accuracy metrics (simplified)
   */
  extractAccuracy(rawModel, detailedInfo) {
    // This would be more sophisticated in production
    // For now, return a reasonable estimate based on model characteristics
    const modelName = rawModel.id.toLowerCase();
    
    if (modelName.includes('large')) return 0.85;
    if (modelName.includes('base')) return 0.78;
    if (modelName.includes('small') || modelName.includes('mobile')) return 0.72;
    
    return 0.75; // Default
  }

  /**
   * Validate model data completeness
   */
  validateModelData(model) {
    const required = ['id', 'name', 'huggingFaceId', 'sizeMB', 'environmentalScore'];
    return required.every(field => model[field] !== undefined && model[field] !== null);
  }

  /**
   * Remove duplicate models based on huggingFaceId
   */
  deduplicateModels(models) {
    const seen = new Set();
    return models.filter(model => {
      if (seen.has(model.huggingFaceId)) {
        return false;
      }
      seen.add(model.huggingFaceId);
      return true;
    });
  }

  /**
   * Sort models by relevance (downloads, accuracy, size)
   */
  sortModelsByRelevance(models) {
    return models.sort((a, b) => {
      // Prioritize accuracy, then smaller size, then downloads
      const accuracyDiff = (b.accuracy || 0) - (a.accuracy || 0);
      if (Math.abs(accuracyDiff) > 0.05) return accuracyDiff;
      
      const sizeDiff = a.sizeMB - b.sizeMB; // Smaller is better
      if (Math.abs(sizeDiff) > 50) return sizeDiff;
      
      return (b.downloads || 0) - (a.downloads || 0);
    });
  }

  /**
   * Sort models within tiers
   */
  sortModelsInTiers(tiered) {
    for (const [category, subcategories] of Object.entries(tiered)) {
      for (const [subcategory, tiers] of Object.entries(subcategories)) {
        for (const [tier, models] of Object.entries(tiers)) {
          tiered[category][subcategory][tier] = this.sortModelsByRelevance(models);
        }
      }
    }
  }

  /**
   * Save updated models data
   */
  saveModelsData(data) {
    const modelsPath = join(this.dataPath, 'models.json');
    writeFileSync(modelsPath, JSON.stringify(data, null, 2), 'utf8');
  }

  /**
   * Get default model categories to fetch
   */
  getDefaultCategories() {
    return [
      { category: 'computer_vision', subcategory: 'image_classification', task: 'image-classification' },
      { category: 'computer_vision', subcategory: 'object_detection', task: 'object-detection' },
      { category: 'natural_language_processing', subcategory: 'text_classification', task: 'text-classification' },
      { category: 'natural_language_processing', subcategory: 'sentiment_analysis', task: 'text-classification' },
      { category: 'natural_language_processing', subcategory: 'text_generation', task: 'text-generation' },
      { category: 'speech_processing', subcategory: 'speech_recognition', task: 'automatic-speech-recognition' },
      { category: 'speech_processing', subcategory: 'text_to_speech', task: 'text-to-speech' },
      { category: 'time_series', subcategory: 'forecasting', task: 'time-series-forecasting' }
    ];
  }

  /**
   * Get default models structure
   */
  getDefaultModelsStructure() {
    return {
      version: "1.0",
      lastUpdated: new Date().toISOString().split('T')[0],
      tiers: {
        lightweight: {
          label: "Lightweight Models",
          description: "Small, efficient models optimized for minimal resource usage",
          priority: 1,
          maxSizeMB: 100,
          environmentalScore: 1
        },
        standard: {
          label: "Standard Models", 
          description: "Balanced models offering good performance with reasonable resource usage",
          priority: 2,
          maxSizeMB: 500,
          environmentalScore: 2
        },
        advanced: {
          label: "Advanced Models",
          description: "Large, high-performance models for complex tasks",
          priority: 3,
          maxSizeMB: 2000,
          environmentalScore: 3
        }
      },
      models: {},
      environmentalImpact: {
        scoringCriteria: {
          "1": {
            label: "Low Impact",
            description: "Minimal energy consumption, suitable for edge devices",
            estimatedCO2gPerInference: "< 0.1",
            powerConsumptionW: "< 5"
          },
          "2": {
            label: "Medium Impact", 
            description: "Moderate energy consumption, cloud deployment recommended",
            estimatedCO2gPerInference: "0.1 - 1.0",
            powerConsumptionW: "5 - 50"
          },
          "3": {
            label: "High Impact",
            description: "Significant energy consumption, specialized hardware recommended",
            estimatedCO2gPerInference: "> 1.0",
            powerConsumptionW: "> 50"  
          }
        },
        methodology: "Estimates based on model size, complexity, and typical deployment scenarios. Values are approximations for comparative purposes."
      },
      selectionRules: {
        defaultTierPriority: ["lightweight", "standard", "advanced"],
        environmentalWeighting: 0.4,
        accuracyWeighting: 0.4,
        deploymentWeighting: 0.2,
        maxRecommendations: 3
      }
    };
  }

  /**
   * Print tier summary
   */
  logTierSummary(tiered) {
    for (const [category, subcategories] of Object.entries(tiered)) {
      for (const [subcategory, tiers] of Object.entries(subcategories)) {
        const counts = {
          lightweight: tiers.lightweight.length,
          standard: tiers.standard.length,
          advanced: tiers.advanced.length
        };
        const total = counts.lightweight + counts.standard + counts.advanced;
        
        if (total > 0) {
          console.log(`   ${category}/${subcategory}: L:${counts.lightweight} S:${counts.standard} A:${counts.advanced}`);
        }
      }
    }
    console.log();
  }

  /**
   * Print aggregation summary
   */
  printAggregationSummary() {
    const duration = Date.now() - this.stats.startTime;
    
    console.log('📈 Aggregation Summary:');
    console.log(`   Processed: ${this.stats.processed} models`);
    console.log(`   Added: ${this.stats.added} new models`);
    console.log(`   Updated: ${this.stats.updated} existing models`);
    console.log(`   Errors: ${this.stats.errors} failed models`);
    console.log(`   Duration: ${Math.round(duration / 1000)}s\n`);
  }

  /**
   * Sleep utility for rate limiting
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for CLI usage
export default ModelAggregator;