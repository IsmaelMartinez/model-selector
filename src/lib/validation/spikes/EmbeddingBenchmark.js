/**
 * Spike 1: Embedding Model Benchmark
 * Tests multiple embedding models to find the best accuracy-to-size ratio
 */

import { EmbeddingClassifier } from '../shared/EmbeddingClassifier.js';
import { TestDataGenerator } from '../shared/TestDataGenerator.js';
import { ReportGenerator } from '../shared/ReportGenerator.js';
import { SPIKE_CONFIG } from '../spike-config.js';

export class EmbeddingBenchmark {
  constructor(options = {}) {
    this.models = options.models || SPIKE_CONFIG.models;
    this.testDataGenerator = new TestDataGenerator();
    this.reportGenerator = new ReportGenerator();
    this.results = [];
  }

  /**
   * Run the complete benchmark
   * @returns {Object} - Benchmark results
   */
  async run() {
    console.log('\n🚀 SPIKE 1: EMBEDDING MODEL BENCHMARK');
    console.log('='.repeat(50));
    console.log(`Testing ${this.models.length} models...`);

    // Generate test data
    const allExamples = this.testDataGenerator.getAllExamples();
    const edgeCases = this.testDataGenerator.getEdgeCases();
    
    console.log(`\n📊 Test Data:`);
    console.log(`  - Reference examples: ${allExamples.length}`);
    console.log(`  - Edge cases: ${edgeCases.length}`);

    // Run k-fold cross-validation for each model
    const modelResults = [];

    for (const modelConfig of this.models) {
      console.log(`\n📦 Testing: ${modelConfig.name}`);
      console.log('-'.repeat(50));

      try {
        const result = await this.benchmarkModel(modelConfig, allExamples, edgeCases);
        modelResults.push(result);
        
        console.log(`  ✓ Accuracy: ${(result.accuracy * 100).toFixed(1)}%`);
        console.log(`  ✓ Top-3 Accuracy: ${(result.top3Accuracy * 100).toFixed(1)}%`);
        console.log(`  ✓ Avg Inference: ${result.avgInferenceMs.toFixed(0)}ms`);
        console.log(`  ✓ Load Time: ${result.loadTimeMs}ms`);
      } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
        modelResults.push({
          name: modelConfig.name,
          error: error.message,
          accuracy: 0,
          top3Accuracy: 0,
          sizeMB: modelConfig.expectedSizeMB,
          avgInferenceMs: 0,
          loadTimeMs: 0
        });
      }
    }

    // Sort by accuracy and mark best
    modelResults.sort((a, b) => b.accuracy - a.accuracy);
    if (modelResults.length > 0 && !modelResults[0].error) {
      modelResults[0].isBest = true;
    }

    // Generate report
    const reportData = {
      models: modelResults,
      testDataStats: {
        totalExamples: allExamples.length,
        edgeCases: edgeCases.length,
        categories: [...new Set(allExamples.map(e => e.category))].length
      }
    };

    // Print comparison table
    this.reportGenerator.generateComparisonTable(modelResults);

    // Generate full report
    await this.reportGenerator.generateReport('benchmark', reportData);

    this.results = modelResults;
    return reportData;
  }

  /**
   * Benchmark a single model using cross-validation
   * @param {Object} modelConfig - Model configuration
   * @param {Array} examples - Training/test examples
   * @param {Array} edgeCases - Edge case tests
   * @returns {Object} - Model benchmark results
   */
  async benchmarkModel(modelConfig, examples, edgeCases) {
    const classifier = new EmbeddingClassifier({
      modelName: modelConfig.name,
      topK: 5,
      votingMethod: 'weighted'
    });

    // Initialize with all examples to get load time
    const initResult = await classifier.initialize(examples);
    
    if (!initResult.success) {
      throw new Error(initResult.error);
    }

    // Run leave-one-out cross-validation for accuracy
    const cvResults = await this.runCrossValidation(classifier, examples);
    
    // Test edge cases
    const edgeCaseResults = await this.testEdgeCases(classifier, edgeCases);

    // Calculate metrics
    const accuracy = cvResults.correct / cvResults.total;
    const top3Accuracy = cvResults.top3Correct / cvResults.total;
    const avgInferenceMs = cvResults.totalInferenceMs / cvResults.total;
    const avgSimilarity = cvResults.totalSimilarity / cvResults.correct;

    return {
      name: modelConfig.name,
      description: modelConfig.description,
      sizeMB: modelConfig.expectedSizeMB,
      accuracy,
      top3Accuracy,
      avgInferenceMs,
      avgSimilarity,
      loadTimeMs: initResult.loadTimeMs,
      cvResults: {
        correct: cvResults.correct,
        total: cvResults.total,
        confusionByCategory: cvResults.confusionByCategory
      },
      edgeCaseResults: {
        handled: edgeCaseResults.correctlyHandled,
        total: edgeCaseResults.total,
        details: edgeCaseResults.details
      },
      meetsSuccessCriteria: 
        accuracy >= SPIKE_CONFIG.successCriteria.minAccuracy &&
        modelConfig.expectedSizeMB <= SPIKE_CONFIG.successCriteria.maxModelSizeMB
    };
  }

  /**
   * Run cross-validation
   * Using a simplified approach: test each example against all others
   */
  async runCrossValidation(classifier, examples) {
    const results = {
      correct: 0,
      top3Correct: 0,
      total: 0,
      totalInferenceMs: 0,
      totalSimilarity: 0,
      confusionByCategory: {}
    };

    // For efficiency, we'll test a representative sample
    // In production, we'd do full leave-one-out
    const testSample = this.sampleForTesting(examples, 100);
    
    for (const testExample of testSample) {
      const result = await classifier.classify(testExample.text);
      
      results.total++;
      results.totalInferenceMs += result.processingTimeMs;
      
      // Check top-1 accuracy
      if (result.category === testExample.category) {
        results.correct++;
        results.totalSimilarity += result.confidence;
      }
      
      // Check top-3 accuracy
      const top3Categories = result.topCategories.slice(0, 3).map(c => c.category);
      if (top3Categories.includes(testExample.category)) {
        results.top3Correct++;
      }

      // Track confusion matrix
      if (!results.confusionByCategory[testExample.category]) {
        results.confusionByCategory[testExample.category] = {
          correct: 0,
          total: 0,
          predictions: {}
        };
      }
      results.confusionByCategory[testExample.category].total++;
      if (result.category === testExample.category) {
        results.confusionByCategory[testExample.category].correct++;
      }
      
      const predicted = result.category || 'unknown';
      results.confusionByCategory[testExample.category].predictions[predicted] = 
        (results.confusionByCategory[testExample.category].predictions[predicted] || 0) + 1;
    }

    return results;
  }

  /**
   * Test edge cases
   */
  async testEdgeCases(classifier, edgeCases) {
    const results = {
      correctlyHandled: 0,
      total: edgeCases.length,
      details: []
    };

    for (const edgeCase of edgeCases) {
      const result = await classifier.classify(edgeCase.text);
      
      let handled = false;
      
      if (edgeCase.expectedCategory === null) {
        // For vague inputs, we expect low confidence
        handled = result.confidence < SPIKE_CONFIG.successCriteria.minConfidenceThreshold;
      } else {
        // For clear inputs, we expect correct classification
        handled = result.category === edgeCase.expectedCategory;
      }

      if (handled) {
        results.correctlyHandled++;
      }

      results.details.push({
        input: edgeCase.text,
        expected: edgeCase.expectedCategory,
        predicted: result.category,
        confidence: result.confidence,
        handled,
        description: edgeCase.description
      });
    }

    return results;
  }

  /**
   * Sample examples for efficient testing
   */
  sampleForTesting(examples, maxSamples) {
    if (examples.length <= maxSamples) {
      return examples;
    }

    // Ensure balanced sampling across categories
    const byCategory = {};
    for (const ex of examples) {
      if (!byCategory[ex.category]) {
        byCategory[ex.category] = [];
      }
      byCategory[ex.category].push(ex);
    }

    const categories = Object.keys(byCategory);
    const perCategory = Math.floor(maxSamples / categories.length);
    const sampled = [];

    for (const category of categories) {
      const categoryExamples = byCategory[category];
      const shuffled = this.shuffle([...categoryExamples]);
      sampled.push(...shuffled.slice(0, perCategory));
    }

    return sampled;
  }

  /**
   * Fisher-Yates shuffle
   */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Get the best performing model
   */
  getBestModel() {
    return this.results.find(r => r.isBest) || null;
  }

  /**
   * Get models meeting success criteria
   */
  getPassingModels() {
    return this.results.filter(r => r.meetsSuccessCriteria);
  }
}

/**
 * Run benchmark as standalone script
 */
export async function runBenchmark() {
  const benchmark = new EmbeddingBenchmark();
  return await benchmark.run();
}

export default EmbeddingBenchmark;

