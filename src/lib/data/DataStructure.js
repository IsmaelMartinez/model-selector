/**
 * Tiered Data Structure for Browser/Local Deployment
 * Provides efficient client-side access to model and task data
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load JSON data files
const modelsData = JSON.parse(readFileSync(join(__dirname, 'models.json'), 'utf8'));
const tasksData = JSON.parse(readFileSync(join(__dirname, 'tasks.json'), 'utf8'));

export class TieredDataStructure {
  constructor() {
    this.models = modelsData;
    this.tasks = tasksData;
    this.indexedData = null;
    this.init();
  }

  /**
   * Initialize data structure with indexing for efficient queries
   */
  init() {
    this.indexedData = {
      // Index models by category and tier for fast lookups
      modelsByCategory: this.buildCategoryIndex(),
      modelsByTier: this.buildTierIndex(),
      modelsByDeployment: this.buildDeploymentIndex(),
      
      // Index tasks for classification
      taskKeywords: this.buildTaskKeywordIndex(),
      taskCategories: this.buildTaskCategoryIndex(),
      
      // Performance metrics
      totalModels: this.countTotalModels(),
      dataSize: this.calculateDataSize()
    };

    console.log('📊 Data structure initialized:', {
      totalModels: this.indexedData.totalModels,
      categories: Object.keys(this.indexedData.modelsByCategory).length,
      dataSize: this.indexedData.dataSize
    });
  }

  /**
   * Build index of models by category and subcategory
   */
  buildCategoryIndex() {
    const index = {};
    
    for (const [category, subcategories] of Object.entries(this.models.models)) {
      index[category] = {};
      
      for (const [subcategory, tiers] of Object.entries(subcategories)) {
        index[category][subcategory] = {
          lightweight: tiers.lightweight || [],
          standard: tiers.standard || [],
          advanced: tiers.advanced || [],
          total: (tiers.lightweight || []).length + 
                 (tiers.standard || []).length + 
                 (tiers.advanced || []).length
        };
      }
    }
    
    return index;
  }

  /**
   * Build index of models by performance tier
   */
  buildTierIndex() {
    const index = {
      lightweight: [],
      standard: [],
      advanced: []
    };
    
    for (const [category, subcategories] of Object.entries(this.models.models)) {
      for (const [subcategory, tiers] of Object.entries(subcategories)) {
        for (const [tier, models] of Object.entries(tiers)) {
          if (index[tier]) {
            index[tier].push(...models.map(model => ({
              ...model,
              category,
              subcategory,
              tier
            })));
          }
        }
      }
    }
    
    return index;
  }

  /**
   * Build index of models by deployment options
   */
  buildDeploymentIndex() {
    const index = {
      browser: [],
      mobile: [],
      edge: [],
      cloud: [],
      server: []
    };
    
    for (const [tier, models] of Object.entries(this.indexedData?.modelsByTier || this.buildTierIndex())) {
      for (const model of models) {
        if (model.deploymentOptions) {
          for (const deployment of model.deploymentOptions) {
            if (index[deployment]) {
              index[deployment].push(model);
            }
          }
        }
      }
    }
    
    return index;
  }

  /**
   * Build keyword index for task classification
   */
  buildTaskKeywordIndex() {
    const index = {};
    
    for (const [category, categoryData] of Object.entries(this.tasks.taskTaxonomy)) {
      for (const [subcategory, subcategoryData] of Object.entries(categoryData.subcategories)) {
        const keywords = subcategoryData.keywords || [];
        
        for (const keyword of keywords) {
          const normalizedKeyword = keyword.toLowerCase();
          if (!index[normalizedKeyword]) {
            index[normalizedKeyword] = [];
          }
          index[normalizedKeyword].push({
            category,
            subcategory,
            confidence: 1.0 // Base confidence, can be adjusted
          });
        }
      }
    }
    
    return index;
  }

  /**
   * Build category index for task classification
   */
  buildTaskCategoryIndex() {
    const index = {};
    
    for (const [category, categoryData] of Object.entries(this.tasks.taskTaxonomy)) {
      index[category] = {
        label: categoryData.label,
        description: categoryData.description,
        subcategories: Object.keys(categoryData.subcategories),
        priority: this.tasks.taskMappingRules.priorityOrder.indexOf(category)
      };
    }
    
    return index;
  }

  /**
   * Count total number of models across all categories
   */
  countTotalModels() {
    let count = 0;
    
    for (const [category, subcategories] of Object.entries(this.models.models)) {
      for (const [subcategory, tiers] of Object.entries(subcategories)) {
        for (const [tier, models] of Object.entries(tiers)) {
          count += models.length;
        }
      }
    }
    
    return count;
  }

  /**
   * Calculate approximate data size for bundle estimation
   */
  calculateDataSize() {
    const modelsSize = JSON.stringify(this.models).length;
    const tasksSize = JSON.stringify(this.tasks).length;
    
    return {
      models: `${(modelsSize / 1024).toFixed(2)} KB`,
      tasks: `${(tasksSize / 1024).toFixed(2)} KB`,
      total: `${((modelsSize + tasksSize) / 1024).toFixed(2)} KB`,
      bytes: modelsSize + tasksSize
    };
  }

  // === Query Methods ===

  /**
   * Get models by category and optional tier filter
   */
  getModelsByCategory(category, subcategory = null, tierFilter = null) {
    const categoryData = this.indexedData.modelsByCategory[category];
    if (!categoryData) return [];

    if (subcategory && categoryData[subcategory]) {
      const subcategoryData = categoryData[subcategory];
      
      if (tierFilter && subcategoryData[tierFilter]) {
        return subcategoryData[tierFilter].map(model => ({
          ...model,
          category,
          subcategory,
          tier: tierFilter
        }));
      }
      
      // Return all tiers for this subcategory
      return [
        ...subcategoryData.lightweight.map(m => ({ ...m, category, subcategory, tier: 'lightweight' })),
        ...subcategoryData.standard.map(m => ({ ...m, category, subcategory, tier: 'standard' })),
        ...subcategoryData.advanced.map(m => ({ ...m, category, subcategory, tier: 'advanced' }))
      ];
    }
    
    // Return all models in category
    const allModels = [];
    for (const [subcat, data] of Object.entries(categoryData)) {
      allModels.push(
        ...data.lightweight.map(m => ({ ...m, category, subcategory: subcat, tier: 'lightweight' })),
        ...data.standard.map(m => ({ ...m, category, subcategory: subcat, tier: 'standard' })),
        ...data.advanced.map(m => ({ ...m, category, subcategory: subcat, tier: 'advanced' }))
      );
    }
    
    return allModels;
  }

  /**
   * Get models by tier with optional filters
   */
  getModelsByTier(tier, options = {}) {
    const tierModels = this.indexedData.modelsByTier[tier] || [];
    
    let filtered = tierModels;
    
    // Filter by category
    if (options.category) {
      filtered = filtered.filter(model => model.category === options.category);
    }
    
    // Filter by deployment options
    if (options.deployment) {
      filtered = filtered.filter(model => 
        model.deploymentOptions && model.deploymentOptions.includes(options.deployment)
      );
    }
    
    // Filter by framework
    if (options.framework) {
      filtered = filtered.filter(model => 
        model.frameworks && model.frameworks.includes(options.framework)
      );
    }
    
    // Filter by size threshold
    if (options.maxSizeMB) {
      filtered = filtered.filter(model => model.sizeMB <= options.maxSizeMB);
    }
    
    // Sort by specified criteria
    if (options.sortBy) {
      filtered = this.sortModels(filtered, options.sortBy, options.sortOrder);
    }
    
    return filtered;
  }

  /**
   * Get models by deployment target
   */
  getModelsByDeployment(deployment, options = {}) {
    const deploymentModels = this.indexedData.modelsByDeployment[deployment] || [];
    
    let filtered = deploymentModels;
    
    // Apply tier preference (lightweight first for browser/mobile)
    if (deployment === 'browser' || deployment === 'mobile') {
      filtered = filtered.sort((a, b) => {
        const tierOrder = { lightweight: 0, standard: 1, advanced: 2 };
        return tierOrder[a.tier] - tierOrder[b.tier];
      });
    }
    
    // Apply other filters
    if (options.category) {
      filtered = filtered.filter(model => model.category === options.category);
    }
    
    if (options.maxEnvironmentalScore) {
      filtered = filtered.filter(model => 
        model.environmentalScore <= options.maxEnvironmentalScore
      );
    }
    
    return filtered;
  }

  /**
   * Search models by keyword
   */
  searchModels(query, options = {}) {
    const searchTerm = query.toLowerCase();
    const allModels = [];
    
    // Collect all models with metadata
    for (const [tier, models] of Object.entries(this.indexedData.modelsByTier)) {
      allModels.push(...models);
    }
    
    // Search in model names and descriptions
    const matches = allModels.filter(model => {
      return (
        model.name.toLowerCase().includes(searchTerm) ||
        model.description.toLowerCase().includes(searchTerm) ||
        model.id.toLowerCase().includes(searchTerm) ||
        model.category.toLowerCase().includes(searchTerm) ||
        model.subcategory.toLowerCase().includes(searchTerm)
      );
    });
    
    // Apply filters
    let filtered = matches;
    
    if (options.tier) {
      filtered = filtered.filter(model => model.tier === options.tier);
    }
    
    if (options.deployment) {
      filtered = filtered.filter(model => 
        model.deploymentOptions && model.deploymentOptions.includes(options.deployment)
      );
    }
    
    // Sort by relevance (exact matches first, then partial matches)
    filtered = filtered.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchTerm ? 1 : 0;
      const bExact = b.name.toLowerCase() === searchTerm ? 1 : 0;
      return bExact - aExact;
    });
    
    return filtered;
  }

  /**
   * Get task classification data for keywords
   */
  getTasksByKeywords(keywords) {
    const results = [];
    
    for (const keyword of keywords) {
      const normalizedKeyword = keyword.toLowerCase();
      const matches = this.indexedData.taskKeywords[normalizedKeyword] || [];
      results.push(...matches);
    }
    
    // Aggregate and sort by confidence
    const aggregated = {};
    for (const result of results) {
      const key = `${result.category}.${result.subcategory}`;
      if (!aggregated[key]) {
        aggregated[key] = { ...result, matchCount: 0 };
      }
      aggregated[key].matchCount++;
      aggregated[key].confidence = Math.min(1.0, aggregated[key].confidence + 0.1);
    }
    
    return Object.values(aggregated)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Sort models by specified criteria
   */
  sortModels(models, sortBy, order = 'asc') {
    const sorted = [...models].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'size':
          comparison = a.sizeMB - b.sizeMB;
          break;
        case 'accuracy':
          comparison = (b.accuracy || 0) - (a.accuracy || 0); // Higher accuracy first
          break;
        case 'environmental':
          comparison = a.environmentalScore - b.environmentalScore; // Lower impact first
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'updated':
          comparison = new Date(b.lastUpdated) - new Date(a.lastUpdated); // Most recent first
          break;
        default:
          comparison = 0;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }

  // === Utility Methods ===

  /**
   * Get summary statistics
   */
  getStats() {
    return {
      totalModels: this.indexedData.totalModels,
      categories: Object.keys(this.indexedData.modelsByCategory).length,
      tiers: {
        lightweight: this.indexedData.modelsByTier.lightweight.length,
        standard: this.indexedData.modelsByTier.standard.length,
        advanced: this.indexedData.modelsByTier.advanced.length
      },
      deploymentOptions: Object.entries(this.indexedData.modelsByDeployment)
        .map(([deployment, models]) => ({
          deployment,
          count: models.length
        })),
      dataSize: this.indexedData.dataSize,
      lastUpdated: this.models.lastUpdated
    };
  }

  /**
   * Validate data structure integrity
   */
  validate() {
    const issues = [];
    
    // Check for missing required fields
    for (const [tier, models] of Object.entries(this.indexedData.modelsByTier)) {
      for (const model of models) {
        const required = ['id', 'name', 'huggingFaceId', 'sizeMB', 'environmentalScore'];
        for (const field of required) {
          if (!model[field] && model[field] !== 0) {
            issues.push(`Missing ${field} in ${model.id || 'unnamed model'}`);
          }
        }
      }
    }
    
    // Check environmental score consistency
    const envScores = this.indexedData.modelsByTier.lightweight
      .concat(this.indexedData.modelsByTier.standard)
      .concat(this.indexedData.modelsByTier.advanced)
      .map(m => m.environmentalScore);
    
    const invalidScores = envScores.filter(score => score < 1 || score > 3);
    if (invalidScores.length > 0) {
      issues.push(`Invalid environmental scores found: ${invalidScores.join(', ')}`);
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// Export singleton instance for app-wide use
export const dataStructure = new TieredDataStructure();