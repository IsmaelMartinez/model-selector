/**
 * Task Classification Pipeline - Enhanced Version
 * Implements multi-method approach with improved accuracy and confidence scoring
 * 
 * @deprecated Use BrowserTaskClassifier for browser environments or EnhancedTaskClassifier for Node.js
 */

import { BrowserTaskClassifier } from './BrowserTaskClassifier.js';

// Re-export BrowserTaskClassifier as TaskClassifier for compatibility
export class TaskClassifier extends BrowserTaskClassifier {
  constructor(options = {}) {
    super(options);
    
    // Legacy compatibility - map old category names to new structure
    this.taskCategories = Object.entries(this.taskTaxonomy).map(([key, data]) => data.label.toLowerCase());
    
    // Legacy compatibility - flatten keywords for old API
    this.categoryKeywords = this.buildLegacyCategoryKeywords();
  }
  
  /**
   * Build legacy category keywords for backwards compatibility
   */
  buildLegacyCategoryKeywords() {
    const legacyKeywords = {};
    
    for (const [category, categoryData] of Object.entries(this.taskTaxonomy)) {
      const label = categoryData.label.toLowerCase();
      legacyKeywords[label] = [];
      
      for (const [subcategory, subcategoryData] of Object.entries(categoryData.subcategories)) {
        legacyKeywords[label].push(...(subcategoryData.keywords || []));
      }
    }
    
    return legacyKeywords;
  }

  /**
   * Enhanced classification method with backward compatibility
   * @param {string} taskDescription - User's task description
   * @param {Object} options - Classification options
   * @returns {Object} Classification result with confidence and method used
   */
  async classify(taskDescription, options = {}) {
    // Use enhanced classification from parent class
    const enhancedResult = await super.classify(taskDescription, options);
    
    // Convert to legacy format for backward compatibility
    const legacyResult = {
      input: enhancedResult.input,
      predictions: enhancedResult.predictions.map(pred => ({
        label: pred.label.toLowerCase(),
        score: pred.score
      })),
      method: enhancedResult.method,
      confidence: enhancedResult.confidence,
      timestamp: enhancedResult.timestamp,
      
      // Add enhanced fields
      subcategoryPredictions: enhancedResult.subcategoryPredictions,
      confidenceLevel: enhancedResult.confidenceLevel,
      processingTime: enhancedResult.processingTime
    };
    
    return legacyResult;
  }

  /**
   * Legacy method compatibility - now uses enhanced methods
   */
  async classifyWithAPI(taskDescription) {
    const result = await super.classifyWithAPI(taskDescription);
    return result;
  }

  /**
   * Legacy method compatibility - now uses enhanced semantic similarity
   */
  classifyWithSemantics(taskDescription) {
    const result = super.classifyWithEnhancedSemantics(taskDescription);
    return {
      predictions: result.predictions.map(pred => ({
        label: pred.label.toLowerCase(),
        score: pred.score
      })),
      confidence: result.confidence
    };
  }

  /**
   * Legacy method compatibility - now uses enhanced keyword classification
   */
  classifyWithKeywords(taskDescription) {
    const result = super.classifyWithEnhancedKeywords(taskDescription);
    return {
      predictions: result.predictions.map(pred => ({
        label: pred.label.toLowerCase(),
        score: pred.score
      })),
      confidence: result.confidence
    };
  }

  /**
   * Get all supported task categories (legacy format)
   */
  getCategories() {
    return this.taskCategories;
  }

  /**
   * Get enhanced method performance info
   */
  getMethodInfo() {
    const stats = super.getStats();
    return {
      methods: [
        {
          name: 'huggingface_api',
          description: 'Zero-shot classification via Hugging Face API',
          accuracy: stats.accuracyEstimates.api,
          requirements: 'API key, internet connection',
          fallback_conditions: 'API failure, rate limits, offline'
        },
        {
          name: 'enhanced_semantic',
          description: 'Advanced semantic similarity with n-gram matching',
          accuracy: stats.accuracyEstimates.semantic,
          requirements: 'None (client-side)',
          fallback_conditions: 'Low confidence (<0.5)'
        },
        {
          name: 'enhanced_keyword',
          description: 'Multi-level keyword matching with priority weighting',
          accuracy: stats.accuracyEstimates.keyword,
          requirements: 'None (client-side)',
          fallback_conditions: 'Always available'
        }
      ],
      totalCategories: stats.totalCategories,
      totalSubcategories: stats.totalSubcategories,
      keywordIndexSize: stats.keywordIndexSize
    };
  }
}