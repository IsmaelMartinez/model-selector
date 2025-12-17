/**
 * Spike 2: Threshold Calibration
 * Finds optimal similarity threshold for 70% confidence cutoff
 */

import { EmbeddingClassifier } from '../shared/EmbeddingClassifier.js';
import { TestDataGenerator } from '../shared/TestDataGenerator.js';
import { ReportGenerator } from '../shared/ReportGenerator.js';
import { SPIKE_CONFIG } from '../spike-config.js';

export class ThresholdCalibrator {
  constructor(options = {}) {
    this.modelName = options.modelName || SPIKE_CONFIG.models[0].name;
    this.thresholds = options.thresholds || SPIKE_CONFIG.thresholdCalibration.thresholdsToTest;
    this.kValues = options.kValues || SPIKE_CONFIG.thresholdCalibration.kValuesToTest;
    this.votingMethods = options.votingMethods || SPIKE_CONFIG.thresholdCalibration.votingMethods;
    this.testDataGenerator = new TestDataGenerator();
    this.reportGenerator = new ReportGenerator();
    this.results = null;
  }

  /**
   * Run threshold calibration experiments
   * @returns {Object} - Calibration results
   */
  async run() {
    console.log('\n🚀 SPIKE 2: THRESHOLD CALIBRATION');
    console.log('='.repeat(50));
    console.log(`Using model: ${this.modelName}`);

    // Generate test data
    const allExamples = this.testDataGenerator.getAllExamples();
    const edgeCases = this.testDataGenerator.getEdgeCases();
    const testCases = [...allExamples, ...edgeCases];

    console.log(`\n📊 Test Data: ${testCases.length} total cases`);

    // Initialize classifier
    const classifier = new EmbeddingClassifier({
      modelName: this.modelName,
      topK: 5,
      votingMethod: 'weighted'
    });

    console.log('\nInitializing classifier...');
    const initResult = await classifier.initialize(allExamples);
    
    if (!initResult.success) {
      throw new Error(`Failed to initialize classifier: ${initResult.error}`);
    }

    // Collect all classification results with detailed scores
    console.log('\nCollecting classification results...');
    const classifications = await this.collectClassifications(classifier, testCases);

    // Analyze different threshold values
    console.log('\nAnalyzing thresholds...');
    const thresholdAnalysis = this.analyzeThresholds(classifications);

    // Analyze different k values
    console.log('\nAnalyzing k values...');
    const kAnalysis = await this.analyzeKValues(classifier, allExamples, testCases);

    // Analyze voting methods
    console.log('\nAnalyzing voting methods...');
    const votingAnalysis = await this.analyzeVotingMethods(classifier, allExamples, testCases);

    // Find optimal configuration
    const optimal = this.findOptimalConfiguration(thresholdAnalysis, kAnalysis, votingAnalysis);

    // Build results
    this.results = {
      modelName: this.modelName,
      totalTestCases: testCases.length,
      thresholdAnalysis,
      kAnalysis,
      votingAnalysis,
      recommendedThreshold: optimal.threshold,
      recommendedK: optimal.k,
      votingMethod: optimal.votingMethod,
      thresholdFor70Percent: this.findThresholdForAccuracy(thresholdAnalysis, 0.70),
      scoreDistribution: this.getScoreDistribution(classifications)
    };

    // Print threshold analysis table
    this.reportGenerator.generateThresholdTable(thresholdAnalysis);

    // Generate report
    await this.reportGenerator.generateReport('threshold', this.results);

    return this.results;
  }

  /**
   * Collect classification results for all test cases
   */
  async collectClassifications(classifier, testCases) {
    const classifications = [];

    for (const testCase of testCases) {
      const result = await classifier.classify(testCase.text);
      
      classifications.push({
        input: testCase.text,
        expectedCategory: testCase.category || testCase.expectedCategory,
        predictedCategory: result.category,
        confidence: result.confidence,
        topCategories: result.topCategories,
        isCorrect: result.category === (testCase.category || testCase.expectedCategory),
        isEdgeCase: testCase.source === 'edge_case',
        isVague: testCase.expectedCategory === null
      });
    }

    return classifications;
  }

  /**
   * Analyze accuracy at different threshold values
   */
  analyzeThresholds(classifications) {
    const analysis = [];

    for (const threshold of this.thresholds) {
      let truePositives = 0;
      let falsePositives = 0;
      let trueNegatives = 0;
      let falseNegatives = 0;
      let aboveThreshold = 0;
      let correctAboveThreshold = 0;

      for (const c of classifications) {
        const meetsThreshold = c.confidence >= threshold;
        
        if (meetsThreshold) {
          aboveThreshold++;
          if (c.isCorrect) {
            truePositives++;
            correctAboveThreshold++;
          } else {
            falsePositives++;
          }
        } else {
          if (c.isVague || !c.isCorrect) {
            // Correctly rejected uncertain case
            trueNegatives++;
          } else {
            // Incorrectly rejected correct case
            falseNegatives++;
          }
        }
      }

      const precision = truePositives / (truePositives + falsePositives) || 0;
      const recall = truePositives / (truePositives + falseNegatives) || 0;
      const f1 = 2 * (precision * recall) / (precision + recall) || 0;
      const accuracy = correctAboveThreshold / aboveThreshold || 0;
      const coverage = aboveThreshold / classifications.length;

      analysis.push({
        threshold,
        accuracy,
        precision,
        recall,
        f1,
        coverage,
        truePositives,
        falsePositives,
        trueNegatives,
        falseNegatives,
        aboveThreshold,
        correctAboveThreshold
      });
    }

    return analysis;
  }

  /**
   * Analyze accuracy with different k values
   */
  async analyzeKValues(classifier, examples, testCases) {
    const analysis = [];

    for (const k of this.kValues) {
      let correct = 0;
      let total = 0;

      for (const testCase of testCases.slice(0, 50)) { // Sample for efficiency
        const result = await classifier.classify(testCase.text, { topK: k });
        total++;
        if (result.category === (testCase.category || testCase.expectedCategory)) {
          correct++;
        }
      }

      analysis.push({
        k,
        accuracy: correct / total,
        sampleSize: total
      });
    }

    return analysis;
  }

  /**
   * Analyze accuracy with different voting methods
   */
  async analyzeVotingMethods(classifier, examples, testCases) {
    const analysis = [];

    for (const method of this.votingMethods) {
      let correct = 0;
      let total = 0;
      let totalConfidence = 0;

      for (const testCase of testCases.slice(0, 50)) { // Sample for efficiency
        const result = await classifier.classify(testCase.text, { votingMethod: method });
        total++;
        totalConfidence += result.confidence;
        if (result.category === (testCase.category || testCase.expectedCategory)) {
          correct++;
        }
      }

      analysis.push({
        method,
        accuracy: correct / total,
        avgConfidence: totalConfidence / total,
        sampleSize: total
      });
    }

    return analysis;
  }

  /**
   * Find optimal configuration
   */
  findOptimalConfiguration(thresholdAnalysis, kAnalysis, votingAnalysis) {
    // Find threshold that gives best F1 score while maintaining 70%+ accuracy
    const validThresholds = thresholdAnalysis.filter(t => 
      t.accuracy >= 0.70 && t.coverage >= 0.5
    );

    const bestThreshold = validThresholds.reduce((best, t) => 
      (!best || t.f1 > best.f1) ? t : best, null
    );

    // Find best k value
    const bestK = kAnalysis.reduce((best, k) => 
      (!best || k.accuracy > best.accuracy) ? k : best, null
    );

    // Find best voting method
    const bestVoting = votingAnalysis.reduce((best, v) => 
      (!best || v.accuracy > best.accuracy) ? v : best, null
    );

    return {
      threshold: bestThreshold?.threshold || 0.70,
      k: bestK?.k || 5,
      votingMethod: bestVoting?.method || 'weighted'
    };
  }

  /**
   * Find threshold that achieves target accuracy
   */
  findThresholdForAccuracy(thresholdAnalysis, targetAccuracy) {
    // Find lowest threshold that achieves target accuracy
    const passing = thresholdAnalysis.filter(t => t.accuracy >= targetAccuracy);
    if (passing.length === 0) return null;
    
    // Return lowest threshold that meets criteria
    return Math.min(...passing.map(t => t.threshold));
  }

  /**
   * Get distribution of confidence scores
   */
  getScoreDistribution(classifications) {
    const correct = classifications.filter(c => c.isCorrect).map(c => c.confidence);
    const incorrect = classifications.filter(c => !c.isCorrect && !c.isVague).map(c => c.confidence);
    const vague = classifications.filter(c => c.isVague).map(c => c.confidence);

    return {
      correct: {
        min: Math.min(...correct),
        max: Math.max(...correct),
        mean: correct.reduce((a, b) => a + b, 0) / correct.length,
        median: this.median(correct),
        count: correct.length
      },
      incorrect: {
        min: Math.min(...incorrect),
        max: Math.max(...incorrect),
        mean: incorrect.reduce((a, b) => a + b, 0) / incorrect.length || 0,
        median: this.median(incorrect),
        count: incorrect.length
      },
      vague: {
        min: Math.min(...vague),
        max: Math.max(...vague),
        mean: vague.reduce((a, b) => a + b, 0) / vague.length || 0,
        median: this.median(vague),
        count: vague.length
      }
    };
  }

  /**
   * Calculate median of array
   */
  median(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Get recommended configuration
   */
  getRecommendation() {
    if (!this.results) return null;
    
    return {
      threshold: this.results.recommendedThreshold,
      k: this.results.recommendedK,
      votingMethod: this.results.votingMethod,
      thresholdFor70Percent: this.results.thresholdFor70Percent
    };
  }
}

/**
 * Run threshold calibration as standalone script
 */
export async function runThresholdCalibration(modelName) {
  const calibrator = new ThresholdCalibrator({ modelName });
  return await calibrator.run();
}

export default ThresholdCalibrator;

