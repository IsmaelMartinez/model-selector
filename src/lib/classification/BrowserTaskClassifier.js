/**
 * Browser-Compatible Enhanced Task Classification System
 * Client-side version without Node.js dependencies
 */

import tasksData from '../data/tasks.json' assert { type: 'json' };

export class BrowserTaskClassifier {
  constructor(options = {}) {
    this.apiKey = options.apiKey;
    this.taskTaxonomy = tasksData.taskTaxonomy;
    this.mappingRules = tasksData.taskMappingRules;
    
    // Build enhanced keyword index from taxonomy
    this.keywordIndex = this.buildKeywordIndex();
    this.categoryPriority = this.buildCategoryPriority();
    
    // Classification thresholds
    this.confidenceThresholds = {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    };
    
    // Performance tracking
    this.stats = {
      totalClassifications: 0,
      methodUsage: {
        api: 0,
        semantic: 0,
        keyword: 0,
        fallback: 0
      }
    };
  }

  /**
   * Main classification method with enhanced multi-tier approach
   */
  async classify(taskDescription, options = {}) {
    this.stats.totalClassifications++;
    
    const result = {
      input: taskDescription,
      predictions: [],
      subcategoryPredictions: [],
      method: '',
      confidence: 0,
      confidenceLevel: 'low',
      timestamp: new Date().toISOString(),
      processingTime: 0
    };

    const startTime = Date.now();

    try {
      // Method 1: Hugging Face API Zero-shot Classification (if available)
      if (!options.offline && this.apiKey) {
        const apiResult = await this.classifyWithAPI(taskDescription);
        if (apiResult.success && apiResult.confidence > 0.6) {
          result.predictions = apiResult.predictions;
          result.subcategoryPredictions = apiResult.subcategoryPredictions;
          result.method = 'huggingface_api';
          result.confidence = apiResult.confidence;
          result.confidenceLevel = this.getConfidenceLevel(apiResult.confidence);
          this.stats.methodUsage.api++;
          return this.finalizeResult(result, startTime);
        }
      }

      // Method 2: Enhanced Semantic Similarity
      const semanticResult = this.classifyWithEnhancedSemantics(taskDescription);
      if (semanticResult.confidence > 0.5) {
        result.predictions = semanticResult.predictions;
        result.subcategoryPredictions = semanticResult.subcategoryPredictions;
        result.method = 'enhanced_semantic';
        result.confidence = semanticResult.confidence;
        result.confidenceLevel = this.getConfidenceLevel(semanticResult.confidence);
        this.stats.methodUsage.semantic++;
        return this.finalizeResult(result, startTime);
      }

      // Method 3: Enhanced Keyword Classification
      const keywordResult = this.classifyWithEnhancedKeywords(taskDescription);
      result.predictions = keywordResult.predictions;
      result.subcategoryPredictions = keywordResult.subcategoryPredictions;
      result.method = 'enhanced_keyword';
      result.confidence = keywordResult.confidence;
      result.confidenceLevel = this.getConfidenceLevel(keywordResult.confidence);
      this.stats.methodUsage.keyword++;
      return this.finalizeResult(result, startTime);

    } catch (error) {
      console.error('Classification error:', error);
      
      // Ultimate fallback with priority-based suggestions
      result.predictions = this.getFallbackPredictions();
      result.method = 'priority_fallback';
      result.confidence = 0.1;
      result.confidenceLevel = 'low';
      result.error = error.message;
      this.stats.methodUsage.fallback++;
      return this.finalizeResult(result, startTime);
    }
  }

  /**
   * Build keyword index from task taxonomy
   */
  buildKeywordIndex() {
    const index = {};
    
    for (const [category, categoryData] of Object.entries(this.taskTaxonomy)) {
      for (const [subcategory, subcategoryData] of Object.entries(categoryData.subcategories)) {
        const keywords = subcategoryData.keywords || [];
        
        // Add category and subcategory as implicit keywords
        const allKeywords = [
          ...keywords,
          category.replace(/_/g, ' '),
          subcategory.replace(/_/g, ' '),
          categoryData.label.toLowerCase(),
          subcategoryData.label.toLowerCase()
        ];
        
        for (const keyword of allKeywords) {
          const normalizedKeyword = this.normalizeKeyword(keyword);
          if (!index[normalizedKeyword]) {
            index[normalizedKeyword] = [];
          }
          
          index[normalizedKeyword].push({
            category,
            subcategory,
            categoryLabel: categoryData.label,
            subcategoryLabel: subcategoryData.label,
            weight: this.calculateKeywordWeight(keyword, keywords),
            isExact: keywords.includes(keyword)
          });
        }
      }
    }
    
    return index;
  }

  /**
   * Build category priority mapping
   */
  buildCategoryPriority() {
    const priority = {};
    const order = this.mappingRules.priorityOrder || [];
    
    order.forEach((category, index) => {
      priority[category] = order.length - index; // Higher number = higher priority
    });
    
    return priority;
  }

  /**
   * Calculate keyword weight based on specificity and context
   */
  calculateKeywordWeight(keyword, allKeywords) {
    // More specific (longer) keywords get higher weight
    const lengthWeight = Math.min(keyword.split(' ').length / 3, 1);
    
    // Less common keywords get higher weight
    const rarityWeight = 1 / Math.sqrt(allKeywords.length);
    
    return 0.5 + (lengthWeight * 0.3) + (rarityWeight * 0.2);
  }

  /**
   * Enhanced Hugging Face API Classification
   */
  async classifyWithAPI(taskDescription) {
    console.log('🔄 Attempting Hugging Face API classification...');
    
    try {
      // Get category labels for zero-shot classification
      const categoryLabels = Object.entries(this.taskTaxonomy).map(([key, data]) => data.label);
      
      const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-mnli', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: taskDescription,
          parameters: { 
            candidate_labels: categoryLabels,
            multi_label: false
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Convert API results to our format
      const predictions = this.convertAPIResults(data);
      const subcategoryPredictions = await this.getSubcategoryPredictions(taskDescription, predictions);
      
      return {
        success: true,
        predictions,
        subcategoryPredictions,
        confidence: Math.max(...predictions.map(p => p.score))
      };
      
    } catch (error) {
      console.log(`   ⚠️ API classification failed: ${error.message}`);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Enhanced Semantic Similarity Classification
   */
  classifyWithEnhancedSemantics(taskDescription) {
    console.log('🔄 Using enhanced semantic similarity classification...');
    
    const text = this.preprocessText(taskDescription);
    const categoryScores = {};
    const subcategoryScores = {};
    
    // Enhanced semantic matching with multiple techniques
    for (const [keyword, matches] of Object.entries(this.keywordIndex)) {
      const similarity = this.calculateSemanticSimilarity(text, keyword);
      
      if (similarity > 0.1) {
        for (const match of matches) {
          const score = similarity * match.weight;
          
          // Aggregate category scores
          if (!categoryScores[match.category]) {
            categoryScores[match.category] = { score: 0, matches: 0, label: match.categoryLabel };
          }
          categoryScores[match.category].score += score;
          categoryScores[match.category].matches++;
          
          // Aggregate subcategory scores
          const subcatKey = `${match.category}.${match.subcategory}`;
          if (!subcategoryScores[subcatKey]) {
            subcategoryScores[subcatKey] = { 
              score: 0, 
              matches: 0, 
              category: match.category,
              subcategory: match.subcategory,
              label: match.subcategoryLabel
            };
          }
          subcategoryScores[subcatKey].score += score;
          subcategoryScores[subcatKey].matches++;
        }
      }
    }
    
    // Normalize and rank predictions
    const predictions = this.normalizePredictions(categoryScores);
    const subcategoryPredictions = this.normalizeSubcategoryPredictions(subcategoryScores);
    
    return {
      predictions,
      subcategoryPredictions,
      confidence: predictions[0]?.score || 0
    };
  }

  /**
   * Enhanced Keyword Classification
   */
  classifyWithEnhancedKeywords(taskDescription) {
    console.log('🔄 Using enhanced keyword classification...');
    
    const text = this.preprocessText(taskDescription);
    const words = text.split(/\s+/);
    const bigrams = this.generateBigrams(words);
    const trigrams = this.generateTrigrams(words);
    
    const categoryScores = {};
    const subcategoryScores = {};
    
    // Match unigrams, bigrams, and trigrams
    const allNgrams = [...words, ...bigrams, ...trigrams];
    
    for (const ngram of allNgrams) {
      const normalizedNgram = this.normalizeKeyword(ngram);
      const matches = this.keywordIndex[normalizedNgram] || [];
      
      for (const match of matches) {
        const score = match.weight * (match.isExact ? 1.5 : 1.0);
        
        // Aggregate category scores
        if (!categoryScores[match.category]) {
          categoryScores[match.category] = { score: 0, matches: 0, label: match.categoryLabel };
        }
        categoryScores[match.category].score += score;
        categoryScores[match.category].matches++;
        
        // Aggregate subcategory scores
        const subcatKey = `${match.category}.${match.subcategory}`;
        if (!subcategoryScores[subcatKey]) {
          subcategoryScores[subcatKey] = { 
            score: 0, 
            matches: 0, 
            category: match.category,
            subcategory: match.subcategory,
            label: match.subcategoryLabel
          };
        }
        subcategoryScores[subcatKey].score += score;
        subcategoryScores[subcatKey].matches++;
      }
    }
    
    // Apply priority weighting
    for (const [category, data] of Object.entries(categoryScores)) {
      const priority = this.categoryPriority[category] || 1;
      data.score *= (1 + priority * 0.1);
    }
    
    const predictions = this.normalizePredictions(categoryScores);
    const subcategoryPredictions = this.normalizeSubcategoryPredictions(subcategoryScores);
    
    // Return fallback if no matches
    if (predictions.length === 0) {
      return this.getFallbackClassification();
    }
    
    return {
      predictions,
      subcategoryPredictions,
      confidence: predictions[0]?.score || 0
    };
  }

  /**
   * Calculate semantic similarity between text and keyword
   */
  calculateSemanticSimilarity(text, keyword) {
    // Jaccard similarity based on word overlap
    const textWords = new Set(text.split(/\s+/));
    const keywordWords = new Set(keyword.split(/\s+/));
    
    const intersection = new Set([...textWords].filter(x => keywordWords.has(x)));
    const union = new Set([...textWords, ...keywordWords]);
    
    const jaccardSimilarity = intersection.size / union.size;
    
    // Substring matching for partial matches
    const containsKeyword = text.includes(keyword) ? 0.5 : 0;
    const containsPartial = keywordWords.size > 1 && [...keywordWords].some(word => text.includes(word)) ? 0.3 : 0;
    
    // Combined similarity with weights
    return (jaccardSimilarity * 0.5) + containsKeyword + containsPartial;
  }

  /**
   * Convert API results to our prediction format
   */
  convertAPIResults(apiData) {
    const predictions = [];
    
    for (let i = 0; i < apiData.labels.length; i++) {
      const label = apiData.labels[i];
      const score = apiData.scores[i];
      
      // Find corresponding category key
      const categoryKey = Object.entries(this.taskTaxonomy).find(([key, data]) => 
        data.label === label
      )?.[0];
      
      if (categoryKey) {
        predictions.push({
          category: categoryKey,
          label: label,
          score: score
        });
      }
    }
    
    return predictions.slice(0, 3);
  }

  /**
   * Get subcategory predictions (simplified for browser)
   */
  async getSubcategoryPredictions(taskDescription, categoryPredictions) {
    const subcategoryPredictions = [];
    
    // Use enhanced keyword matching for subcategories
    const text = this.preprocessText(taskDescription);
    
    for (const prediction of categoryPredictions.slice(0, 2)) {
      const categoryData = this.taskTaxonomy[prediction.category];
      if (!categoryData) continue;
      
      const subcategoryScores = {};
      
      for (const [subcategoryKey, subcategoryData] of Object.entries(categoryData.subcategories)) {
        const keywords = subcategoryData.keywords || [];
        let score = 0;
        
        for (const keyword of keywords) {
          if (text.includes(keyword.toLowerCase())) {
            score += 1;
          }
        }
        
        if (score > 0) {
          subcategoryScores[subcategoryKey] = {
            score: score * prediction.score,
            label: subcategoryData.label
          };
        }
      }
      
      // Add top subcategories for this category
      const sortedSubcategories = Object.entries(subcategoryScores)
        .map(([key, data]) => ({
          category: prediction.category,
          subcategory: key,
          label: data.label,
          score: data.score
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);
      
      subcategoryPredictions.push(...sortedSubcategories);
    }
    
    return subcategoryPredictions;
  }

  /**
   * Normalize category predictions
   */
  normalizePredictions(categoryScores) {
    const predictions = Object.entries(categoryScores)
      .map(([category, data]) => ({
        category,
        label: data.label,
        score: data.score / Math.max(1, data.matches), // Normalize by match count
        matchCount: data.matches
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    // Normalize scores to sum to 1
    const totalScore = predictions.reduce((sum, p) => sum + p.score, 0);
    if (totalScore > 0) {
      predictions.forEach(p => p.score = Math.min(1, p.score / totalScore));
    }
    
    return predictions;
  }

  /**
   * Normalize subcategory predictions
   */
  normalizeSubcategoryPredictions(subcategoryScores) {
    const predictions = Object.entries(subcategoryScores)
      .map(([key, data]) => ({
        category: data.category,
        subcategory: data.subcategory,
        label: data.label,
        score: data.score / Math.max(1, data.matches),
        matchCount: data.matches
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    return predictions;
  }

  /**
   * Get fallback predictions based on priority
   */
  getFallbackPredictions() {
    const priorityOrder = this.mappingRules.priorityOrder || ['natural_language_processing', 'computer_vision', 'data_preprocessing'];
    
    return priorityOrder.slice(0, 3).map((category, index) => {
      const categoryData = this.taskTaxonomy[category];
      return {
        category,
        label: categoryData?.label || category,
        score: 0.3 - (index * 0.1)
      };
    });
  }

  /**
   * Get fallback classification result
   */
  getFallbackClassification() {
    return {
      predictions: this.getFallbackPredictions(),
      subcategoryPredictions: [],
      confidence: 0.2
    };
  }

  /**
   * Preprocess text for classification
   */
  preprocessText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Normalize keyword for indexing
   */
  normalizeKeyword(keyword) {
    return keyword
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generate bigrams from words
   */
  generateBigrams(words) {
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
      bigrams.push(`${words[i]} ${words[i + 1]}`);
    }
    return bigrams;
  }

  /**
   * Generate trigrams from words
   */
  generateTrigrams(words) {
    const trigrams = [];
    for (let i = 0; i < words.length - 2; i++) {
      trigrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
    return trigrams;
  }

  /**
   * Get confidence level label
   */
  getConfidenceLevel(confidence) {
    if (confidence >= this.confidenceThresholds.high) return 'high';
    if (confidence >= this.confidenceThresholds.medium) return 'medium';
    return 'low';
  }

  /**
   * Finalize classification result
   */
  finalizeResult(result, startTime) {
    result.processingTime = Date.now() - startTime;
    return result;
  }

  /**
   * Get classification statistics
   */
  getStats() {
    return {
      ...this.stats,
      accuracyEstimates: {
        api: '85-95%',
        semantic: '75-85%',
        keyword: '65-75%',
        fallback: '40-60%'
      },
      totalCategories: Object.keys(this.taskTaxonomy).length,
      totalSubcategories: Object.values(this.taskTaxonomy).reduce((sum, cat) => 
        sum + Object.keys(cat.subcategories).length, 0
      ),
      keywordIndexSize: Object.keys(this.keywordIndex).length
    };
  }

  /**
   * Get detailed category information
   */
  getCategoryInfo(categoryKey) {
    const categoryData = this.taskTaxonomy[categoryKey];
    if (!categoryData) return null;
    
    return {
      key: categoryKey,
      label: categoryData.label,
      description: categoryData.description,
      subcategories: Object.entries(categoryData.subcategories).map(([key, data]) => ({
        key,
        label: data.label,
        description: data.description,
        keywords: data.keywords,
        examples: data.examples
      })),
      priority: this.categoryPriority[categoryKey] || 0
    };
  }

  /**
   * Suggest improvements for low-confidence classifications
   */
  suggestImprovements(result) {
    const suggestions = [];
    
    if (result.confidence < 0.3) {
      suggestions.push('Task description is too vague. Try adding more specific details about what you want to accomplish.');
    }
    
    if (result.confidence < 0.5) {
      suggestions.push('Consider mentioning the type of data you\'re working with (text, images, audio, etc.).');
    }
    
    if (result.method === 'priority_fallback') {
      suggestions.push('No clear task indicators found. Try using keywords like "classify", "detect", "generate", or "predict".');
    }
    
    // Suggest specific categories if partially matched
    if (result.predictions.length > 0 && result.confidence < 0.6) {
      const topCategory = result.predictions[0];
      const categoryInfo = this.getCategoryInfo(topCategory.category);
      
      if (categoryInfo) {
        suggestions.push(`This seems related to ${categoryInfo.label}. Try using terms like: ${categoryInfo.subcategories.map(s => s.keywords.slice(0, 2).join(', ')).join(' or ')}.`);
      }
    }
    
    return suggestions;
  }
}

// Export browser-compatible classifier
export const browserTaskClassifier = new BrowserTaskClassifier();