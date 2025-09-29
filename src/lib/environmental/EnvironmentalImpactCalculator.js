/**
 * Environmental Impact Scoring System
 * Provides reasonable estimates for AI model environmental impact
 */

export class EnvironmentalImpactCalculator {
  constructor() {
    // Base power consumption estimates (watts) by deployment type
    this.basePowerConsumption = {
      mobile: 2,      // Mobile device inference
      edge: 8,        // Edge device (Raspberry Pi, etc.)
      browser: 15,    // Laptop/desktop browser
      cloud: 50,      // Cloud instance
      server: 100,    // Dedicated server
      gpu: 250        // GPU server
    };

    // Carbon intensity by deployment scenario (g CO2/kWh)
    this.carbonIntensity = {
      mobile: 400,    // Battery-powered, mixed grid
      edge: 500,      // Small edge devices, average grid
      browser: 450,   // Personal computing, mixed grid
      cloud: 350,     // Modern data centers, some renewable
      server: 400,    // Traditional data centers
      gpu: 600        // High-performance computing, intensive
    };

    // Model complexity multipliers based on architecture
    this.complexityMultipliers = {
      transformer: 1.5,     // Attention-heavy models
      cnn: 1.0,            // Standard convolutional models
      rnn: 1.2,            // Recurrent models
      diffusion: 2.0,      // Diffusion models (very compute-intensive)
      ensemble: 1.8,       // Multiple model systems
      distilled: 0.7,      // Knowledge distillation models
      quantized: 0.6,      // Quantized models
      pruned: 0.8          // Pruned models
    };

    // Inference frequency categories
    this.usagePatterns = {
      batch: { inferencePerHour: 100, label: 'Batch Processing' },
      interactive: { inferencePerHour: 10, label: 'Interactive Use' },
      realtime: { inferencePerHour: 3600, label: 'Real-time Processing' },
      periodic: { inferencePerHour: 1, label: 'Periodic Analysis' }
    };
  }

  /**
   * Calculate comprehensive environmental impact for a model
   */
  calculateImpact(model, deploymentScenario = {}) {
    const scenario = {
      deployment: deploymentScenario.deployment || this.inferDeploymentType(model),
      usagePattern: deploymentScenario.usagePattern || 'interactive',
      hoursPerDay: deploymentScenario.hoursPerDay || 8,
      daysPerWeek: deploymentScenario.daysPerWeek || 5,
      optimizations: deploymentScenario.optimizations || []
    };

    // Step 1: Calculate base power consumption
    const basePower = this.calculateBasePowerConsumption(model, scenario);
    
    // Step 2: Apply model complexity multipliers
    const adjustedPower = this.applyComplexityMultipliers(basePower, model, scenario);
    
    // Step 3: Calculate carbon emissions
    const carbonEmissions = this.calculateCarbonEmissions(adjustedPower, scenario);
    
    // Step 4: Calculate usage-based metrics
    const usageMetrics = this.calculateUsageMetrics(adjustedPower, carbonEmissions, scenario);
    
    // Step 5: Determine environmental score (1-3)
    const environmentalScore = this.calculateEnvironmentalScore(usageMetrics);
    
    return {
      environmentalScore,
      powerConsumption: {
        inferenceWatts: adjustedPower,
        hourlyWatts: usageMetrics.hourlyPower,
        dailyKWh: usageMetrics.dailyKWh,
        weeklyKWh: usageMetrics.weeklyKWh
      },
      carbonFootprint: {
        perInference: carbonEmissions.perInference,
        hourly: carbonEmissions.hourly,
        daily: carbonEmissions.daily,
        weekly: carbonEmissions.weekly
      },
      scenario,
      methodology: this.getMethodologyInfo(),
      lastCalculated: new Date().toISOString()
    };
  }

  /**
   * Calculate base power consumption based on model size and type
   */
  calculateBasePowerConsumption(model, scenario) {
    const deploymentBasePower = this.basePowerConsumption[scenario.deployment] || this.basePowerConsumption.cloud;
    
    // Size-based scaling (logarithmic relationship)
    const sizeMB = model.sizeMB || 100;
    const sizeMultiplier = Math.log10(sizeMB / 10) + 1; // Base 10MB = 1x
    
    // Model type inference from name/description
    const modelType = this.inferModelType(model);
    const typeMultiplier = this.complexityMultipliers[modelType] || 1.0;
    
    return deploymentBasePower * sizeMultiplier * typeMultiplier;
  }

  /**
   * Apply complexity multipliers based on model characteristics
   */
  applyComplexityMultipliers(basePower, model, scenario) {
    let adjustedPower = basePower;
    
    // Apply optimization reductions
    for (const optimization of scenario.optimizations) {
      switch (optimization) {
        case 'quantization':
          adjustedPower *= this.complexityMultipliers.quantized;
          break;
        case 'pruning':
          adjustedPower *= this.complexityMultipliers.pruned;
          break;
        case 'distillation':
          adjustedPower *= this.complexityMultipliers.distilled;
          break;
      }
    }
    
    return Math.max(1, adjustedPower); // Minimum 1W
  }

  /**
   * Calculate carbon emissions based on power consumption
   */
  calculateCarbonEmissions(powerWatts, scenario) {
    const carbonIntensity = this.carbonIntensity[scenario.deployment] || this.carbonIntensity.cloud;
    
    // Convert watts to kWh and calculate CO2
    const kWhPerInference = (powerWatts * 0.1) / 1000; // Assume 0.1 hour per inference
    const gCO2PerInference = kWhPerInference * carbonIntensity;
    
    const usagePattern = this.usagePatterns[scenario.usagePattern];
    const inferencePerHour = usagePattern.inferencePerHour;
    
    return {
      perInference: gCO2PerInference,
      hourly: gCO2PerInference * inferencePerHour,
      daily: gCO2PerInference * inferencePerHour * scenario.hoursPerDay,
      weekly: gCO2PerInference * inferencePerHour * scenario.hoursPerDay * scenario.daysPerWeek
    };
  }

  /**
   * Calculate comprehensive usage metrics
   */
  calculateUsageMetrics(powerWatts, carbonEmissions, scenario) {
    const usagePattern = this.usagePatterns[scenario.usagePattern];
    const inferencePerHour = usagePattern.inferencePerHour;
    
    const hourlyPower = (powerWatts * inferencePerHour) / 3600; // Average hourly watts
    const dailyKWh = (hourlyPower * scenario.hoursPerDay) / 1000;
    const weeklyKWh = dailyKWh * scenario.daysPerWeek;
    
    return {
      hourlyPower,
      dailyKWh,
      weeklyKWh,
      inferencePerHour
    };
  }

  /**
   * Calculate environmental score (1-3) based on impact metrics
   */
  calculateEnvironmentalScore(usageMetrics) {
    const dailyKWh = usageMetrics.dailyKWh;
    
    // Scoring thresholds based on daily energy consumption
    if (dailyKWh < 0.1) return 1;      // Low impact: < 0.1 kWh/day
    if (dailyKWh < 1.0) return 2;      // Medium impact: 0.1-1.0 kWh/day
    return 3;                          // High impact: > 1.0 kWh/day
  }

  /**
   * Infer deployment type from model characteristics
   */
  inferDeploymentType(model) {
    const sizeMB = model.sizeMB || 100;
    const deploymentOptions = model.deploymentOptions || [];
    
    // Check explicit deployment options
    if (deploymentOptions.includes('browser')) return 'browser';
    if (deploymentOptions.includes('mobile')) return 'mobile';
    if (deploymentOptions.includes('edge')) return 'edge';
    
    // Infer from size
    if (sizeMB < 50) return 'mobile';
    if (sizeMB < 200) return 'browser';
    if (sizeMB < 1000) return 'cloud';
    return 'server';
  }

  /**
   * Infer model architecture type from name/description
   */
  inferModelType(model) {
    const text = `${model.name} ${model.description || ''}`.toLowerCase();
    
    if (text.includes('transformer') || text.includes('bert') || text.includes('gpt')) return 'transformer';
    if (text.includes('diffusion') || text.includes('stable') || text.includes('dalle')) return 'diffusion';
    if (text.includes('cnn') || text.includes('resnet') || text.includes('mobilenet')) return 'cnn';
    if (text.includes('rnn') || text.includes('lstm') || text.includes('gru')) return 'rnn';
    if (text.includes('distil')) return 'distilled';
    if (text.includes('ensemble')) return 'ensemble';
    
    return 'cnn'; // Default assumption
  }

  /**
   * Compare environmental impact between models
   */
  compareModels(models, deploymentScenario = {}) {
    const comparisons = models.map(model => ({
      model: model,
      impact: this.calculateImpact(model, deploymentScenario)
    }));
    
    // Sort by environmental score (lower is better)
    comparisons.sort((a, b) => a.impact.environmentalScore - b.impact.environmentalScore);
    
    return {
      comparisons,
      summary: {
        mostEfficient: comparisons[0],
        leastEfficient: comparisons[comparisons.length - 1],
        averageScore: comparisons.reduce((sum, c) => sum + c.impact.environmentalScore, 0) / comparisons.length,
        totalModels: comparisons.length
      }
    };
  }

  /**
   * Calculate environmental savings from optimization
   */
  calculateOptimizationSavings(model, baseScenario, optimizedScenario) {
    const baseImpact = this.calculateImpact(model, baseScenario);
    const optimizedImpact = this.calculateImpact(model, optimizedScenario);
    
    const powerSavings = baseImpact.powerConsumption.dailyKWh - optimizedImpact.powerConsumption.dailyKWh;
    const carbonSavings = baseImpact.carbonFootprint.daily - optimizedImpact.carbonFootprint.daily;
    const percentSavings = ((baseImpact.carbonFootprint.daily - optimizedImpact.carbonFootprint.daily) / baseImpact.carbonFootprint.daily) * 100;
    
    return {
      baseImpact,
      optimizedImpact,
      savings: {
        dailyKWh: powerSavings,
        dailyGCO2: carbonSavings,
        percentReduction: percentSavings,
        weeklyKWh: powerSavings * baseScenario.daysPerWeek || 5,
        weeklyGCO2: carbonSavings * baseScenario.daysPerWeek || 5
      }
    };
  }

  /**
   * Generate environmental recommendations
   */
  generateRecommendations(model, currentScenario = {}) {
    const currentImpact = this.calculateImpact(model, currentScenario);
    const recommendations = [];
    
    // Size-based recommendations
    if (model.sizeMB > 500) {
      recommendations.push({
        type: 'model_selection',
        priority: 'high',
        title: 'Consider a smaller model variant',
        description: `This model (${model.sizeMB}MB) has high environmental impact. Look for distilled or compressed versions.`,
        potentialSaving: '30-60%'
      });
    }
    
    // Deployment recommendations
    if (currentScenario.deployment === 'server' && model.sizeMB < 200) {
      recommendations.push({
        type: 'deployment',
        priority: 'medium',
        title: 'Consider edge deployment',
        description: 'This model is small enough for edge deployment, which typically has lower environmental impact.',
        potentialSaving: '40-70%'
      });
    }
    
    // Optimization recommendations
    if (!currentScenario.optimizations || currentScenario.optimizations.length === 0) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Apply model optimizations',
        description: 'Consider quantization, pruning, or knowledge distillation to reduce environmental impact.',
        potentialSaving: '20-50%'
      });
    }
    
    // Usage pattern recommendations
    if (currentScenario.usagePattern === 'realtime') {
      recommendations.push({
        type: 'usage',
        priority: 'high',
        title: 'Optimize inference frequency',
        description: 'Real-time processing has high environmental cost. Consider batch processing or caching strategies.',
        potentialSaving: '50-80%'
      });
    }
    
    return {
      currentImpact,
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
    };
  }

  /**
   * Get methodology information
   */
  getMethodologyInfo() {
    return {
      version: '1.0',
      approach: 'Size and deployment-based estimation',
      assumptions: [
        'Power consumption scales logarithmically with model size',
        'Carbon intensity varies by deployment infrastructure',
        'Optimization techniques provide multiplicative improvements',
        'Usage patterns affect total environmental impact'
      ],
      limitations: [
        'Estimates are approximations for comparative purposes',
        'Actual impact depends on specific hardware and usage',
        'Carbon intensity varies by geographic location',
        'Does not account for training emissions (inference only)'
      ],
      dataSources: [
        'Academic research on AI model energy consumption',
        'Cloud provider sustainability reports',
        'Industry benchmarks for hardware efficiency'
      ],
      lastUpdated: '2025-09-29'
    };
  }

  /**
   * Format impact for display
   */
  formatImpact(impact, options = {}) {
    const format = options.format || 'summary';
    const precision = options.precision || 2;
    
    if (format === 'summary') {
      return {
        score: impact.environmentalScore,
        scoreLabel: this.getScoreLabel(impact.environmentalScore),
        dailyEnergy: `${impact.powerConsumption.dailyKWh.toFixed(precision)} kWh`,
        dailyCarbon: `${impact.carbonFootprint.daily.toFixed(precision)} g CO₂`,
        efficiency: this.getEfficiencyRating(impact.environmentalScore)
      };
    }
    
    if (format === 'detailed') {
      return {
        environmentalScore: impact.environmentalScore,
        scoreDescription: this.getScoreDescription(impact.environmentalScore),
        powerMetrics: {
          perInference: `${impact.powerConsumption.inferenceWatts.toFixed(precision)} W`,
          daily: `${impact.powerConsumption.dailyKWh.toFixed(precision)} kWh`,
          weekly: `${impact.powerConsumption.weeklyKWh.toFixed(precision)} kWh`
        },
        carbonMetrics: {
          perInference: `${impact.carbonFootprint.perInference.toFixed(precision)} g CO₂`,
          daily: `${impact.carbonFootprint.daily.toFixed(precision)} g CO₂`,
          weekly: `${impact.carbonFootprint.weekly.toFixed(precision)} g CO₂`
        },
        scenario: impact.scenario,
        methodology: impact.methodology
      };
    }
    
    return impact;
  }

  /**
   * Get score label
   */
  getScoreLabel(score) {
    switch (score) {
      case 1: return 'Low Impact';
      case 2: return 'Medium Impact';
      case 3: return 'High Impact';
      default: return 'Unknown';
    }
  }

  /**
   * Get score description
   */
  getScoreDescription(score) {
    switch (score) {
      case 1: return 'Minimal energy consumption, suitable for edge devices and frequent use';
      case 2: return 'Moderate energy consumption, good for cloud deployment with reasonable usage';
      case 3: return 'Significant energy consumption, best for specialized applications with careful usage planning';
      default: return 'Environmental impact assessment unavailable';
    }
  }

  /**
   * Get efficiency rating
   */
  getEfficiencyRating(score) {
    switch (score) {
      case 1: return 'Excellent';
      case 2: return 'Good';
      case 3: return 'Fair';
      default: return 'Unknown';
    }
  }
}

// Export singleton instance
export const environmentalCalculator = new EnvironmentalImpactCalculator();