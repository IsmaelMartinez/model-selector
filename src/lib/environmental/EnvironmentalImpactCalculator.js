/**
 * Environmental Impact Scoring System
 * 
 * Simple size-based heuristic for comparing AI model environmental impact.
 * 
 * IMPORTANT CAVEAT: This is a rough approximation, not a scientific measurement.
 * Larger models generally require more compute resources and thus more energy,
 * but actual energy consumption depends on many factors not captured here
 * (hardware, batch size, inference time, data center efficiency, etc.)
 */

export class EnvironmentalImpactCalculator {
  /**
   * Size thresholds for environmental scoring (in MB)
   * Aligned with model tier definitions
   */
  static THRESHOLDS = {
    LIGHTWEIGHT: 500,   // ≤500MB = Score 1 (Low Impact)
    STANDARD: 4000      // ≤4GB = Score 2 (Medium Impact)
                        // >4GB = Score 3 (High Impact)
  };

  /**
   * Calculate environmental impact score (1-3) for a model
   * Based purely on model size as a proxy for compute requirements
   * 
   * @param {Object} model - Model with sizeMB property
   * @returns {Object} Impact assessment with score and label
   */
  calculateImpact(model) {
    const sizeMB = model.sizeMB || 0;
    const environmentalScore = this.calculateScoreFromSize(sizeMB);
    
    return {
      environmentalScore,
      sizeMB,
      scoreLabel: this.getScoreLabel(environmentalScore),
      tier: this.getTierFromSize(sizeMB)
    };
  }

  /**
   * Calculate environmental score based purely on size
   * @param {number} sizeMB - Model size in megabytes
   * @returns {number} Score 1-3
   */
  calculateScoreFromSize(sizeMB) {
    if (sizeMB <= EnvironmentalImpactCalculator.THRESHOLDS.LIGHTWEIGHT) return 1;
    if (sizeMB <= EnvironmentalImpactCalculator.THRESHOLDS.STANDARD) return 2;
    return 3;
  }

  /**
   * Get tier name from size
   * @param {number} sizeMB - Model size in megabytes
   * @returns {string} Tier name
   */
  getTierFromSize(sizeMB) {
    if (sizeMB <= EnvironmentalImpactCalculator.THRESHOLDS.LIGHTWEIGHT) return 'lightweight';
    if (sizeMB <= EnvironmentalImpactCalculator.THRESHOLDS.STANDARD) return 'standard';
    return 'advanced';
  }

  /**
   * Compare environmental impact between models
   * @param {Array} models - Array of models to compare
   * @returns {Array} Models sorted by environmental score (lower is better)
   */
  compareModels(models) {
    const comparisons = models.map(model => ({
      model: model,
      impact: this.calculateImpact(model)
    }));
    
    // Sort by environmental score (lower is better), then by size
    comparisons.sort((a, b) => {
      const scoreDiff = a.impact.environmentalScore - b.impact.environmentalScore;
      if (scoreDiff !== 0) return scoreDiff;
      return (a.model.sizeMB || 0) - (b.model.sizeMB || 0);
    });
    
    return comparisons;
  }

  /**
   * Get human-readable label for environmental score
   * @param {number} score - Environmental score (1-3)
   * @returns {string} Label
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
