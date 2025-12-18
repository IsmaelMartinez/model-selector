/**
 * Environmental Impact Utilities
 * Helper functions for integrating environmental scoring with model data
 * 
 * NOTE: Environmental scores are a simple size-based heuristic (smaller = more efficient).
 * They are intended for rough comparison only, not as precise measurements.
 */

import { environmentalCalculator } from './EnvironmentalImpactCalculator.js';

/**
 * Enhance model data with environmental impact score
 * @param {Object} model - Model object with sizeMB
 * @returns {Object} Model with environmental data added
 */
export function enhanceModelWithEnvironmentalData(model) {
  const impact = environmentalCalculator.calculateImpact(model);
  
  return {
    ...model,
    environmental: {
      score: impact.environmentalScore,
      label: impact.scoreLabel,
      tier: impact.tier
    }
  };
}

/**
 * Get environmental comparison for a list of models
 * @param {Array} models - Models to compare
 * @returns {Object} Comparison results
 */
export function getEnvironmentalComparison(models) {
  const comparisons = environmentalCalculator.compareModels(models);
  
  const mostEfficient = comparisons[0];
  const leastEfficient = comparisons[comparisons.length - 1];
  
  return {
    models: comparisons.map((c, index) => ({
      ...c.model,
      environmental: {
        score: c.impact.environmentalScore,
        label: c.impact.scoreLabel,
        rank: index + 1
      }
    })),
    summary: {
      mostEfficient: mostEfficient ? {
        name: mostEfficient.model.name,
        score: mostEfficient.impact.environmentalScore,
        label: mostEfficient.impact.scoreLabel
      } : null,
      leastEfficient: leastEfficient ? {
        name: leastEfficient.model.name,
        score: leastEfficient.impact.environmentalScore,
        label: leastEfficient.impact.scoreLabel
      } : null,
      totalModels: models.length
    }
  };
}

/**
 * Get environmental insights for user decision making
 * @param {Array} models - Models to analyze
 * @returns {Object} Insights and recommendations
 */
export function getEnvironmentalInsights(models) {
  const insights = {
    summary: {
      totalModels: models.length,
      lowImpactCount: 0,
      mediumImpactCount: 0,
      highImpactCount: 0
    },
    recommendations: [],
    tips: []
  };
  
  // Calculate impacts and categorize
  const modelsWithImpact = models.map(model => {
    const impact = environmentalCalculator.calculateImpact(model);
    return { model, impact };
  });
  
  // Count by impact level
  modelsWithImpact.forEach(({ impact }) => {
    if (impact.environmentalScore === 1) insights.summary.lowImpactCount++;
    else if (impact.environmentalScore === 2) insights.summary.mediumImpactCount++;
    else insights.summary.highImpactCount++;
  });
  
  // Generate top 3 eco-friendly recommendations
  const sortedByImpact = modelsWithImpact
    .sort((a, b) => {
      const scoreDiff = a.impact.environmentalScore - b.impact.environmentalScore;
      if (scoreDiff !== 0) return scoreDiff;
      return (a.model.sizeMB || 0) - (b.model.sizeMB || 0);
    })
    .slice(0, 3);
  
  insights.recommendations = sortedByImpact.map(({ model, impact }, index) => ({
    rank: index + 1,
    model: {
      id: model.id,
      name: model.name,
      tier: model.tier || 'unknown',
      sizeMB: model.sizeMB
    },
    score: impact.environmentalScore,
    label: impact.scoreLabel,
    reason: generateRecommendationReason(model, impact)
  }));
  
  // Generate tips
  insights.tips = generateEnvironmentalTips(modelsWithImpact);
  
  return insights;
}

/**
 * Generate recommendation reason based on model characteristics
 */
function generateRecommendationReason(model, impact) {
  const reasons = [];
  
  if (impact.environmentalScore === 1) {
    reasons.push('Lightweight model with low resource requirements');
  } else if (impact.environmentalScore === 2) {
    reasons.push('Balanced size and capability');
  }
  
  if (model.sizeMB && model.sizeMB < 100) {
    reasons.push('Very compact size');
  }
  
  if (model.deploymentOptions) {
    if (model.deploymentOptions.includes('browser')) {
      reasons.push('Can run in browser');
    }
    if (model.deploymentOptions.includes('mobile')) {
      reasons.push('Mobile-friendly');
    }
    if (model.deploymentOptions.includes('edge')) {
      reasons.push('Edge deployment ready');
    }
  }
  
  return reasons.length > 0 ? reasons.join(', ') : 'Efficient option for your task';
}

/**
 * Generate environmental tips based on model selection
 */
function generateEnvironmentalTips(modelsWithImpact) {
  const tips = [];
  
  // Check if user is considering only large models
  const hasOnlyAdvanced = modelsWithImpact.every(({ model }) => 
    model.tier === 'advanced' || model.tier === 'xlarge'
  );
  
  if (hasOnlyAdvanced && modelsWithImpact.length > 0) {
    tips.push({
      category: 'selection',
      title: 'Consider lighter alternatives',
      description: 'All selected models are in advanced tiers. Lightweight or standard models may meet your accuracy needs with lower resource usage.'
    });
  }
  
  // Check for very large models
  const hasVeryLarge = modelsWithImpact.some(({ model }) => 
    model.sizeMB && model.sizeMB > 10000
  );
  
  if (hasVeryLarge) {
    tips.push({
      category: 'optimization',
      title: 'Large model detected',
      description: 'Consider quantized versions of large models to reduce size while maintaining most accuracy.'
    });
  }
  
  // General tip
  tips.push({
    category: 'general',
    title: 'Smaller is generally greener',
    description: 'When accuracy requirements allow, choosing a smaller model reduces compute resources and energy usage.'
  });
  
  return tips.slice(0, 3);
}

/**
 * Format environmental data for display components
 * @param {Object} environmentalData - Environmental data object
 * @param {string} displayType - 'card', 'badge', or 'detailed'
 * @returns {Object} Formatted data for display
 */
export function formatEnvironmentalForDisplay(environmentalData, displayType = 'card') {
  if (!environmentalData) return null;
  
  const score = environmentalData.score;
  
  switch (displayType) {
    case 'card':
      return {
        score,
        label: getScoreIcon(score) + ' ' + getScoreLabel(score),
        color: getScoreColor(score)
      };
      
    case 'badge':
      return {
        text: getScoreLabel(score),
        icon: getScoreIcon(score),
        color: getScoreColor(score)
      };
      
    case 'detailed':
      return environmentalData;
      
    default:
      return environmentalData;
  }
}

/**
 * Get color for environmental score
 */
function getScoreColor(score) {
  switch (score) {
    case 1: return 'green';
    case 2: return 'yellow';  
    case 3: return 'red';
    default: return 'gray';
  }
}

/**
 * Get icon for environmental score
 */
function getScoreIcon(score) {
  switch (score) {
    case 1: return '🌱';
    case 2: return '⚡';
    case 3: return '🔥';
    default: return '❓';
  }
}

/**
 * Get label for environmental score
 */
function getScoreLabel(score) {
  switch (score) {
    case 1: return 'Low Impact';
    case 2: return 'Medium Impact';
    case 3: return 'High Impact';
    default: return 'Unknown Impact';
  }
}
