/**
 * Environmental Impact Utilities
 * Helper functions for integrating environmental calculations with model data
 */

import { environmentalCalculator } from './EnvironmentalImpactCalculator.js';

/**
 * Enhance model data with environmental impact calculations
 */
export function enhanceModelWithEnvironmentalData(model, deploymentScenario = {}) {
  const impact = environmentalCalculator.calculateImpact(model, deploymentScenario);
  
  return {
    ...model,
    environmental: {
      score: impact.environmentalScore,
      impact: environmentalCalculator.formatImpact(impact, { format: 'summary' }),
      detailed: environmentalCalculator.formatImpact(impact, { format: 'detailed' }),
      lastCalculated: impact.lastCalculated
    }
  };
}

/**
 * Get environmental comparison for a list of models
 */
export function getEnvironmentalComparison(models, deploymentScenario = {}) {
  const comparison = environmentalCalculator.compareModels(models, deploymentScenario);
  
  return {
    models: comparison.comparisons.map(c => ({
      ...c.model,
      environmental: {
        score: c.impact.environmentalScore,
        impact: environmentalCalculator.formatImpact(c.impact, { format: 'summary' }),
        rank: comparison.comparisons.indexOf(c) + 1
      }
    })),
    summary: {
      mostEfficient: {
        name: comparison.summary.mostEfficient.model.name,
        score: comparison.summary.mostEfficient.impact.environmentalScore,
        impact: environmentalCalculator.formatImpact(comparison.summary.mostEfficient.impact, { format: 'summary' })
      },
      leastEfficient: {
        name: comparison.summary.leastEfficient.model.name,
        score: comparison.summary.leastEfficient.impact.environmentalScore,
        impact: environmentalCalculator.formatImpact(comparison.summary.leastEfficient.impact, { format: 'summary' })
      },
      averageScore: Math.round(comparison.summary.averageScore * 10) / 10,
      totalModels: comparison.summary.totalModels
    }
  };
}

/**
 * Generate environmental recommendations for models
 */
export function getEnvironmentalRecommendations(models, userScenario = {}) {
  const recommendations = [];
  
  for (const model of models) {
    const modelRecommendations = environmentalCalculator.generateRecommendations(model, userScenario);
    
    if (modelRecommendations.recommendations.length > 0) {
      recommendations.push({
        model: {
          id: model.id,
          name: model.name,
          tier: model.tier
        },
        currentImpact: environmentalCalculator.formatImpact(modelRecommendations.currentImpact, { format: 'summary' }),
        recommendations: modelRecommendations.recommendations
      });
    }
  }
  
  return recommendations;
}

/**
 * Calculate tier-based environmental statistics
 */
export function getTierEnvironmentalStats(tieredModels, deploymentScenario = {}) {
  const stats = {
    lightweight: { models: [], avgScore: 0, avgDailyKWh: 0 },
    standard: { models: [], avgScore: 0, avgDailyKWh: 0 },
    advanced: { models: [], avgScore: 0, avgDailyKWh: 0 }
  };
  
  // Collect models from tiered structure
  for (const [category, subcategories] of Object.entries(tieredModels)) {
    for (const [subcategory, tiers] of Object.entries(subcategories)) {
      for (const [tier, models] of Object.entries(tiers)) {
        if (stats[tier]) {
          stats[tier].models.push(...models.map(m => ({ ...m, category, subcategory })));
        }
      }
    }
  }
  
  // Calculate averages for each tier
  for (const [tier, data] of Object.entries(stats)) {
    if (data.models.length > 0) {
      const impacts = data.models.map(model => 
        environmentalCalculator.calculateImpact(model, deploymentScenario)
      );
      
      data.avgScore = impacts.reduce((sum, impact) => sum + impact.environmentalScore, 0) / impacts.length;
      data.avgDailyKWh = impacts.reduce((sum, impact) => sum + impact.powerConsumption.dailyKWh, 0) / impacts.length;
      data.totalModels = data.models.length;
      
      // Add distribution by score
      data.scoreDistribution = {
        score1: impacts.filter(i => i.environmentalScore === 1).length,
        score2: impacts.filter(i => i.environmentalScore === 2).length,
        score3: impacts.filter(i => i.environmentalScore === 3).length
      };
    }
  }
  
  return stats;
}

/**
 * Get environmental insights for user decision making
 */
export function getEnvironmentalInsights(models, userPreferences = {}) {
  const insights = {
    summary: {
      totalModels: models.length,
      lowImpactCount: 0,
      mediumImpactCount: 0,
      highImpactCount: 0
    },
    recommendations: [],
    comparisons: [],
    tips: []
  };
  
  // Calculate impacts and categorize
  const modelsWithImpact = models.map(model => {
    const impact = environmentalCalculator.calculateImpact(model, userPreferences.deploymentScenario);
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
    .sort((a, b) => a.impact.environmentalScore - b.impact.environmentalScore)
    .slice(0, 3);
  
  insights.recommendations = sortedByImpact.map(({ model, impact }, index) => ({
    rank: index + 1,
    model: {
      id: model.id,
      name: model.name,
      tier: model.tier || 'unknown'
    },
    environmental: environmentalCalculator.formatImpact(impact, { format: 'summary' }),
    reason: generateRecommendationReason(model, impact)
  }));
  
  // Generate comparison insights
  if (modelsWithImpact.length >= 2) {
    const best = modelsWithImpact[0];
    const worst = modelsWithImpact[modelsWithImpact.length - 1];
    
    if (best.impact.environmentalScore !== worst.impact.environmentalScore) {
      const savings = environmentalCalculator.calculateOptimizationSavings(
        worst.model,
        userPreferences.deploymentScenario || {},
        { ...userPreferences.deploymentScenario, optimizations: ['quantization'] }
      );
      
      insights.comparisons.push({
        type: 'best_vs_worst',
        bestModel: best.model.name,
        worstModel: worst.model.name,
        dailyKWhDifference: (worst.impact.powerConsumption.dailyKWh - best.impact.powerConsumption.dailyKWh).toFixed(2),
        dailyCO2Difference: (worst.impact.carbonFootprint.daily - best.impact.carbonFootprint.daily).toFixed(2)
      });
    }
  }
  
  // Generate environmental tips
  insights.tips = generateEnvironmentalTips(modelsWithImpact, userPreferences);
  
  return insights;
}

/**
 * Generate recommendation reason
 */
function generateRecommendationReason(model, impact) {
  const reasons = [];
  
  if (impact.environmentalScore === 1) {
    reasons.push('Low energy consumption');
  }
  
  if (model.sizeMB < 50) {
    reasons.push('Compact model size');
  }
  
  if (model.deploymentOptions && model.deploymentOptions.includes('browser')) {
    reasons.push('Browser-compatible');
  }
  
  if (model.deploymentOptions && model.deploymentOptions.includes('edge')) {
    reasons.push('Edge deployment ready');
  }
  
  return reasons.length > 0 ? reasons.join(', ') : 'Environmentally efficient option';
}

/**
 * Generate environmental tips
 */
function generateEnvironmentalTips(modelsWithImpact, userPreferences) {
  const tips = [];
  
  // Deployment optimization tips
  const hasLargeModels = modelsWithImpact.some(({ model }) => model.sizeMB > 500);
  if (hasLargeModels) {
    tips.push({
      category: 'deployment',
      title: 'Consider model compression',
      description: 'Large models in your selection could benefit from quantization or pruning to reduce environmental impact.',
      impact: 'Can reduce energy consumption by 20-50%'
    });
  }
  
  // Usage pattern tips  
  if (userPreferences.deploymentScenario?.usagePattern === 'realtime') {
    tips.push({
      category: 'usage',
      title: 'Optimize inference frequency',
      description: 'Real-time processing has high environmental cost. Consider caching or batch processing strategies.',
      impact: 'Can reduce energy consumption by 50-80%'
    });
  }
  
  // Tier selection tips
  const hasOnlyAdvanced = modelsWithImpact.every(({ model }) => model.tier === 'advanced');
  if (hasOnlyAdvanced) {
    tips.push({
      category: 'selection',
      title: 'Explore lighter alternatives',
      description: 'All selected models are in the advanced tier. Consider if lightweight or standard models meet your accuracy requirements.',
      impact: 'Can reduce environmental impact significantly'
    });
  }
  
  // General efficiency tip
  tips.push({
    category: 'general',
    title: 'Choose smallest suitable model',
    description: 'The most environmentally friendly approach is to use the smallest model that meets your accuracy requirements.',
    impact: 'Environmental impact scales with model size'
  });
  
  return tips.slice(0, 4); // Limit to 4 tips
}

/**
 * Format environmental data for display components
 */
export function formatEnvironmentalForDisplay(environmentalData, displayType = 'card') {
  if (!environmentalData) return null;
  
  switch (displayType) {
    case 'card':
      return {
        score: environmentalData.score,
        label: getScoreIcon(environmentalData.score) + ' ' + getScoreLabel(environmentalData.score),
        dailyEnergy: environmentalData.impact?.dailyEnergy || 'N/A',
        dailyCarbon: environmentalData.impact?.dailyCarbon || 'N/A',
        efficiency: environmentalData.impact?.efficiency || 'Unknown',
        color: getScoreColor(environmentalData.score)
      };
      
    case 'badge':
      return {
        text: getScoreLabel(environmentalData.score),
        icon: getScoreIcon(environmentalData.score),
        color: getScoreColor(environmentalData.score),
        tooltip: `Daily: ${environmentalData.impact?.dailyEnergy} • ${environmentalData.impact?.dailyCarbon}`
      };
      
    case 'detailed':
      return environmentalData.detailed || environmentalData;
      
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

/**
 * Calculate environmental savings from tier selection
 */
export function calculateTierSavings(currentTier, targetTier, sampleModels) {
  if (!sampleModels[currentTier] || !sampleModels[targetTier]) {
    return null;
  }
  
  const currentModel = sampleModels[currentTier][0]; // Use first model as representative
  const targetModel = sampleModels[targetTier][0];
  
  const currentImpact = environmentalCalculator.calculateImpact(currentModel);
  const targetImpact = environmentalCalculator.calculateImpact(targetModel);
  
  const savings = environmentalCalculator.calculateOptimizationSavings(
    currentModel, 
    {}, 
    { deployment: targetImpact.scenario.deployment }
  );
  
  return {
    currentTier,
    targetTier,
    savings: {
      percentReduction: Math.round(((currentImpact.carbonFootprint.daily - targetImpact.carbonFootprint.daily) / currentImpact.carbonFootprint.daily) * 100),
      dailyKWhSaved: (currentImpact.powerConsumption.dailyKWh - targetImpact.powerConsumption.dailyKWh).toFixed(2),
      dailyCO2Saved: (currentImpact.carbonFootprint.daily - targetImpact.carbonFootprint.daily).toFixed(2)
    }
  };
}