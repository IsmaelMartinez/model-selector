/**
 * ModelSelector - Simple "smaller is better" model selection logic
 * Prioritizes lightweight models and smaller sizes within each tier
 */

export class ModelSelector {
  constructor(modelsData) {
    this.modelsData = modelsData;
  }

  /**
   * Select best models for a task using "smaller is better" logic
   * @param {string} category - Main category (e.g., 'computer_vision')
   * @param {string} subcategory - Subcategory (e.g., 'image_classification')
   * @param {number} maxResults - Maximum number of models to return
   * @returns {Array} Array of recommended models, prioritized by size efficiency
   */
  selectModels(category, subcategory, maxResults = 3) {
    const models = this.getTaskModels(category, subcategory);
    return this.rankBySize(models).slice(0, maxResults);
  }

  /**
   * Get all models for a specific task, organized by tier
   * @param {string} category - Main category
   * @param {string} subcategory - Subcategory  
   * @returns {Array} Flat array of all models for the task with tier info
   */
  getTaskModels(category, subcategory) {
    const taskData = this.modelsData.models[category]?.[subcategory];
    if (!taskData) return [];
    
    const tiers = ['lightweight', 'standard', 'advanced'];
    return tiers.flatMap((tier, index) => 
      (taskData[tier] || []).map(model => ({
        ...model, 
        tier, 
        tierPriority: index,
        category,
        subcategory
      }))
    );
  }

  /**
   * Rank models by "smaller is better" logic:
   * 1. Tier priority (lightweight > standard > advanced)
   * 2. Size within tier (smaller > larger)
   * @param {Array} models - Models to rank
   * @returns {Array} Models ranked by efficiency (best first)
   */
  rankBySize(models) {
    return models.sort((a, b) => 
      a.tierPriority - b.tierPriority || a.sizeMB - b.sizeMB
    );
  }
}

export default ModelSelector;