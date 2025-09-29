/**
 * Classification Utilities
 * Helper functions for integrating task classification with model recommendations
 */

import { browserTaskClassifier } from './BrowserTaskClassifier.js';

/**
 * Classify user task and get model recommendations
 */
export async function classifyAndRecommend(taskDescription, dataStructure, options = {}) {
  const classificationResult = await browserTaskClassifier.classify(taskDescription, options);
  
  const recommendations = {
    task: {
      input: classificationResult.input,
      predictions: classificationResult.predictions,
      subcategoryPredictions: classificationResult.subcategoryPredictions,
      confidence: classificationResult.confidence,
      confidenceLevel: classificationResult.confidenceLevel,
      method: classificationResult.method,
      processingTime: classificationResult.processingTime
    },
    models: [],
    suggestions: []
  };

  // Get model recommendations based on top predictions
  for (const prediction of classificationResult.predictions.slice(0, 2)) {
    const categoryModels = dataStructure.getModelsByCategory(prediction.category);
    
    if (categoryModels.length > 0) {
      recommendations.models.push({
        category: prediction.category,
        categoryLabel: prediction.label,
        confidence: prediction.score,
        models: categoryModels.slice(0, 5) // Top 5 models per category
      });
    }
  }

  // Get subcategory-specific recommendations
  for (const subPrediction of classificationResult.subcategoryPredictions.slice(0, 2)) {
    const subcategoryModels = dataStructure.getModelsByCategory(
      subPrediction.category, 
      subPrediction.subcategory
    );
    
    if (subcategoryModels.length > 0) {
      recommendations.models.push({
        category: subPrediction.category,
        subcategory: subPrediction.subcategory,
        categoryLabel: subPrediction.label,
        confidence: subPrediction.score,
        models: subcategoryModels.slice(0, 3)
      });
    }
  }

  // Generate suggestions for improvement if confidence is low
  if (classificationResult.confidence < 0.6) {
    recommendations.suggestions = browserTaskClassifier.suggestImprovements(classificationResult);
  }

  return recommendations;
}

/**
 * Get tier-based recommendations prioritizing environmental impact
 */
export function getTierBasedRecommendations(classifications, dataStructure, options = {}) {
  const tierPreference = options.tierPreference || ['lightweight', 'standard', 'advanced'];
  const maxPerTier = options.maxPerTier || 3;
  const recommendations = [];

  for (const classification of classifications) {
    for (const tier of tierPreference) {
      const tierModels = dataStructure.getModelsByTier(tier, {
        category: classification.category
      });
      
      if (tierModels.length > 0) {
        recommendations.push({
          tier,
          category: classification.category,
          categoryLabel: classification.label,
          confidence: classification.score,
          models: tierModels.slice(0, maxPerTier),
          environmentalImpact: dataStructure.models.tiers[tier]?.environmentalScore || 2
        });
      }
    }
  }

  // Sort by environmental impact (lower first) and confidence
  return recommendations.sort((a, b) => {
    const envDiff = a.environmentalImpact - b.environmentalImpact;
    if (Math.abs(envDiff) > 0.1) return envDiff;
    return b.confidence - a.confidence;
  });
}

/**
 * Format classification results for display
 */
export function formatClassificationForDisplay(classificationResult, options = {}) {
  const format = options.format || 'detailed';
  
  if (format === 'summary') {
    return {
      primaryCategory: classificationResult.predictions[0]?.label || 'Unknown',
      confidence: `${Math.round(classificationResult.confidence * 100)}%`,
      confidenceLevel: classificationResult.confidenceLevel,
      method: classificationResult.method,
      processingTime: classificationResult.processingTime
    };
  }
  
  if (format === 'detailed') {
    return {
      input: classificationResult.input,
      predictions: classificationResult.predictions.map(pred => ({
        category: pred.label,
        confidence: `${Math.round(pred.score * 100)}%`,
        score: pred.score
      })),
      subcategories: classificationResult.subcategoryPredictions?.map(pred => ({
        category: pred.label,
        confidence: `${Math.round(pred.score * 100)}%`,
        score: pred.score
      })) || [],
      overall: {
        confidence: `${Math.round(classificationResult.confidence * 100)}%`,
        confidenceLevel: classificationResult.confidenceLevel,
        method: classificationResult.method,
        processingTime: `${classificationResult.processingTime}ms`
      }
    };
  }
  
  return classificationResult;
}

/**
 * Get classification confidence badge
 */
export function getConfidenceBadge(confidence, confidenceLevel) {
  const badges = {
    high: { color: 'green', icon: '✅', text: 'High Confidence' },
    medium: { color: 'yellow', icon: '⚡', text: 'Medium Confidence' },
    low: { color: 'orange', icon: '⚠️', text: 'Low Confidence' }
  };
  
  const badge = badges[confidenceLevel] || badges.low;
  
  return {
    ...badge,
    percentage: `${Math.round(confidence * 100)}%`,
    tooltip: `Classification confidence: ${Math.round(confidence * 100)}%`
  };
}

/**
 * Suggest alternative task descriptions for better classification
 */
export function suggestAlternativeDescriptions(originalDescription, classificationResult) {
  const suggestions = [];
  
  if (classificationResult.confidence < 0.3) {
    suggestions.push({
      type: 'specific',
      description: `"${originalDescription}" → Add more specific details about your data type and goal`,
      examples: [
        'I want to classify customer support emails by urgency level',
        'Detect defective products in manufacturing photos',
        'Generate marketing copy from product specifications'
      ]
    });
  }
  
  if (classificationResult.predictions.length > 0) {
    const topCategory = classificationResult.predictions[0];
    const categoryInfo = browserTaskClassifier.getCategoryInfo(topCategory.category);
    
    if (categoryInfo) {
      suggestions.push({
        type: 'category_specific',
        category: categoryInfo.label,
        description: `Try using ${categoryInfo.label} terminology`,
        keywords: categoryInfo.subcategories.reduce((acc, sub) => {
          acc.push(...(sub.keywords || []).slice(0, 3));
          return acc;
        }, []).slice(0, 6)
      });
    }
  }
  
  return suggestions;
}

/**
 * Calculate classification accuracy metrics (for testing/validation)
 */
export function calculateClassificationMetrics(testResults) {
  const metrics = {
    totalTests: testResults.length,
    highConfidence: 0,
    mediumConfidence: 0,
    lowConfidence: 0,
    averageConfidence: 0,
    averageProcessingTime: 0,
    methodDistribution: {},
    categoryDistribution: {}
  };
  
  let totalConfidence = 0;
  let totalProcessingTime = 0;
  
  for (const result of testResults) {
    // Confidence levels
    if (result.confidenceLevel === 'high') metrics.highConfidence++;
    else if (result.confidenceLevel === 'medium') metrics.mediumConfidence++;
    else metrics.lowConfidence++;
    
    // Averages
    totalConfidence += result.confidence;
    totalProcessingTime += result.processingTime || 0;
    
    // Method distribution
    const method = result.method;
    metrics.methodDistribution[method] = (metrics.methodDistribution[method] || 0) + 1;
    
    // Category distribution
    if (result.predictions.length > 0) {
      const topCategory = result.predictions[0].category || result.predictions[0].label;
      metrics.categoryDistribution[topCategory] = (metrics.categoryDistribution[topCategory] || 0) + 1;
    }
  }
  
  metrics.averageConfidence = totalConfidence / metrics.totalTests;
  metrics.averageProcessingTime = totalProcessingTime / metrics.totalTests;
  
  // Calculate percentages
  metrics.highConfidencePercent = (metrics.highConfidence / metrics.totalTests) * 100;
  metrics.mediumConfidencePercent = (metrics.mediumConfidence / metrics.totalTests) * 100;
  metrics.lowConfidencePercent = (metrics.lowConfidence / metrics.totalTests) * 100;
  
  return metrics;
}

/**
 * Validate classification result quality
 */
export function validateClassificationQuality(classificationResult, expectedCategory = null) {
  const quality = {
    isValid: true,
    issues: [],
    score: 0,
    recommendations: []
  };
  
  // Check if predictions exist
  if (!classificationResult.predictions || classificationResult.predictions.length === 0) {
    quality.isValid = false;
    quality.issues.push('No predictions generated');
    return quality;
  }
  
  // Check confidence levels
  if (classificationResult.confidence < 0.3) {
    quality.issues.push('Very low confidence classification');
    quality.recommendations.push('Consider providing more specific task description');
  } else if (classificationResult.confidence < 0.6) {
    quality.issues.push('Low confidence classification');
    quality.recommendations.push('Add more details about data type and desired outcome');
  }
  
  // Check against expected category if provided
  if (expectedCategory) {
    const topPrediction = classificationResult.predictions[0];
    const isCorrect = topPrediction.category === expectedCategory || 
                     topPrediction.label.toLowerCase() === expectedCategory.toLowerCase();
    
    if (!isCorrect) {
      quality.issues.push(`Expected ${expectedCategory}, got ${topPrediction.label}`);
      quality.score -= 0.5;
    } else {
      quality.score += classificationResult.confidence;
    }
  } else {
    quality.score = classificationResult.confidence;
  }
  
  // Check processing time
  if (classificationResult.processingTime > 1000) {
    quality.issues.push('Slow processing time');
  }
  
  quality.score = Math.max(0, Math.min(1, quality.score));
  
  return quality;
}

/**
 * Merge multiple classification results (for ensemble approaches)
 */
export function mergeClassificationResults(results, weights = null) {
  if (results.length === 0) return null;
  if (results.length === 1) return results[0];
  
  const defaultWeights = results.map(() => 1 / results.length);
  const actualWeights = weights || defaultWeights;
  
  const mergedPredictions = {};
  let totalConfidence = 0;
  let totalProcessingTime = 0;
  
  // Aggregate predictions
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const weight = actualWeights[i];
    
    totalConfidence += result.confidence * weight;
    totalProcessingTime += result.processingTime || 0;
    
    for (const prediction of result.predictions) {
      const key = prediction.category || prediction.label;
      if (!mergedPredictions[key]) {
        mergedPredictions[key] = {
          category: prediction.category,
          label: prediction.label,
          score: 0,
          count: 0
        };
      }
      mergedPredictions[key].score += prediction.score * weight;
      mergedPredictions[key].count++;
    }
  }
  
  // Sort and format final predictions
  const finalPredictions = Object.values(mergedPredictions)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  
  return {
    input: results[0].input,
    predictions: finalPredictions,
    confidence: totalConfidence,
    confidenceLevel: totalConfidence >= 0.8 ? 'high' : totalConfidence >= 0.6 ? 'medium' : 'low',
    method: 'ensemble',
    processingTime: totalProcessingTime,
    timestamp: new Date().toISOString(),
    ensembleInfo: {
      resultCount: results.length,
      weights: actualWeights,
      methods: results.map(r => r.method)
    }
  };
}