/**
 * Environmental Impact Scoring System
 * Provides reasonable estimates for AI model environmental impact
 */

export class EnvironmentalImpactCalculator {
  constructor() {
    // Base power consumption estimates (watts) by deployment type
    this.basePowerConsumption = {
      mobile: 2,      // Mobile device inference
      browser: 15,    // Laptop/desktop browser
      cloud: 50,      // Cloud instance
      gpu: 250        // GPU server
    };

    // Model complexity multipliers based on architecture
    this.complexityMultipliers = {
      cnn: 1.0,            // Baseline
      transformer: 1.5,    // Attention overhead
      diffusion: 2.0,      // Iterative process
      quantized: 0.6       // Optimized
    };
  }

  /**
   * Calculate environmental impact score (1-3) for a model
   */
  calculateImpact(model, deploymentScenario = {}) {
    const deployment = deploymentScenario.deployment || this.inferDeploymentType(model);
    const dailyKWh = this.calculateDailyKWh(model, deployment);
    const environmentalScore = this.calculateEnvironmentalScore(dailyKWh);
    
    return {
      environmentalScore,
      dailyKWh,
      deployment,
      scoreLabel: this.getScoreLabel(environmentalScore)
    };
  }

  /**
   * Calculate daily kWh usage for a model
   */
  calculateDailyKWh(model, deployment) {
    const basePower = this.basePowerConsumption[deployment] || this.basePowerConsumption.cloud;
    const sizeMB = model.sizeMB || 100;
    const modelType = this.inferModelType(model);
    
    // Simple power estimation: base power × size factor × architecture factor
    const sizeMultiplier = Math.log10(sizeMB / 10) + 1; // Base 10MB = 1x
    const typeMultiplier = this.complexityMultipliers[modelType] || 1.0;
    const powerWatts = basePower * sizeMultiplier * typeMultiplier;
    
    // Assume 8 hours/day, 10 inferences/hour usage
    const dailyKWh = (powerWatts * 8 * 10) / (3600 * 1000); // Convert to kWh
    
    return dailyKWh;
  }

  /**
   * Calculate environmental score (1-3) based on daily kWh
   */
  calculateEnvironmentalScore(dailyKWh) {
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
    
    // Infer from size
    if (sizeMB < 50) return 'mobile';
    if (sizeMB < 200) return 'browser';
    return 'cloud';
  }

  /**
   * Infer model architecture type from name/description
   */
  inferModelType(model) {
    const text = `${model.name} ${model.description || ''}`.toLowerCase();
    
    if (text.includes('transformer') || text.includes('bert') || text.includes('gpt')) return 'transformer';
    if (text.includes('diffusion') || text.includes('stable') || text.includes('dalle')) return 'diffusion';
    if (text.includes('quantized') || text.includes('int8') || text.includes('fp16')) return 'quantized';
    
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
    
    return comparisons;
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
}

// Export singleton instance
export const environmentalCalculator = new EnvironmentalImpactCalculator();