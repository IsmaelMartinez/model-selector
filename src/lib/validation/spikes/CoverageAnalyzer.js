/**
 * Spike 3: Example Coverage Analysis
 * Determines optimal number of examples per category
 */

import { EmbeddingClassifier } from '../shared/EmbeddingClassifier.js';
import { TestDataGenerator } from '../shared/TestDataGenerator.js';
import { ReportGenerator } from '../shared/ReportGenerator.js';
import { SPIKE_CONFIG } from '../spike-config.js';

export class CoverageAnalyzer {
  constructor(options = {}) {
    this.modelName = options.modelName || SPIKE_CONFIG.models[0].name;
    this.exampleCounts = options.exampleCounts || SPIKE_CONFIG.coverageAnalysis.exampleCounts;
    this.testDataGenerator = new TestDataGenerator();
    this.reportGenerator = new ReportGenerator();
    this.results = null;
  }

  /**
   * Run coverage analysis experiments
   * @returns {Object} - Coverage analysis results
   */
  async run() {
    console.log('\n🚀 SPIKE 3: EXAMPLE COVERAGE ANALYSIS');
    console.log('='.repeat(50));
    console.log(`Using model: ${this.modelName}`);
    console.log(`Testing example counts: ${this.exampleCounts.join(', ')}`);

    // Get all examples and test data
    const allExamples = this.testDataGenerator.getAllExamples();
    const categoryStats = this.testDataGenerator.getCategoryStats();
    const edgeCases = this.testDataGenerator.getEdgeCases();

    console.log(`\n📊 Available Data:`);
    console.log(`  - Total examples: ${allExamples.length}`);
    console.log(`  - Categories: ${Object.keys(categoryStats).length}`);
    for (const [category, stats] of Object.entries(categoryStats)) {
      console.log(`    - ${category}: ${stats.total} examples`);
    }

    // Run coverage experiments
    const coveragePoints = [];

    for (const count of this.exampleCounts) {
      console.log(`\n📦 Testing with ${count} examples per category...`);
      
      const result = await this.testCoverageLevel(count, allExamples, edgeCases);
      coveragePoints.push(result);
      
      console.log(`  ✓ Accuracy: ${(result.accuracy * 100).toFixed(1)}%`);
      console.log(`  ✓ Total examples used: ${result.totalExamples}`);
    }

    // Analyze per-category performance
    console.log('\nAnalyzing per-category accuracy...');
    const categoryAnalysis = await this.analyzePerCategory(allExamples, edgeCases);

    // Find diminishing returns point
    const diminishingPoint = this.findDiminishingReturns(coveragePoints);

    // Identify weak categories (those needing more examples)
    const weakCategories = this.identifyWeakCategories(categoryAnalysis);

    // Calculate storage estimates
    const storageEstimates = this.estimateStorage(coveragePoints);

    // Build results
    this.results = {
      modelName: this.modelName,
      coveragePoints,
      categoryAnalysis,
      diminishingReturnsAt: diminishingPoint,
      weakCategories,
      storageEstimates,
      recommendation: this.generateRecommendation(coveragePoints, diminishingPoint, weakCategories)
    };

    // Print coverage analysis table
    this.reportGenerator.generateCoverageTable(coveragePoints);

    // Print category analysis
    this.printCategoryAnalysis(categoryAnalysis);

    // Generate report
    await this.reportGenerator.generateReport('coverage', this.results);

    return this.results;
  }

  /**
   * Test accuracy at a specific coverage level
   */
  async testCoverageLevel(examplesPerCategory, allExamples, edgeCases) {
    // Sample N examples per category
    const trainExamples = this.testDataGenerator.sampleExamplesPerCategory(
      examplesPerCategory, 
      { seed: 42, allowDuplicates: false }
    );

    // Create held-out test set (examples not in training)
    const trainTexts = new Set(trainExamples.map(e => e.text));
    const testExamples = allExamples.filter(e => !trainTexts.has(e.text));

    // If not enough held-out examples, use all examples with different seed
    const testSet = testExamples.length > 20 
      ? testExamples 
      : this.testDataGenerator.sampleExamplesPerCategory(10, { seed: 123 });

    // Initialize classifier with training examples
    const classifier = new EmbeddingClassifier({
      modelName: this.modelName,
      topK: 5,
      votingMethod: 'weighted'
    });

    await classifier.initialize(trainExamples);

    // Test on held-out examples
    let correct = 0;
    let total = 0;
    const perCategoryResults = {};

    for (const testExample of testSet) {
      const result = await classifier.classify(testExample.text);
      total++;

      const expected = testExample.category || testExample.expectedCategory;
      
      if (!perCategoryResults[expected]) {
        perCategoryResults[expected] = { correct: 0, total: 0 };
      }
      perCategoryResults[expected].total++;

      if (result.category === expected) {
        correct++;
        perCategoryResults[expected].correct++;
      }
    }

    // Also test edge cases
    let edgeCaseCorrect = 0;
    for (const edgeCase of edgeCases) {
      const result = await classifier.classify(edgeCase.text);
      
      if (edgeCase.expectedCategory === null) {
        // Vague inputs should have low confidence
        if (result.confidence < 0.70) {
          edgeCaseCorrect++;
        }
      } else if (result.category === edgeCase.expectedCategory) {
        edgeCaseCorrect++;
      }
    }

    return {
      examplesPerCategory,
      totalExamples: trainExamples.length,
      testSetSize: total,
      accuracy: correct / total,
      perCategoryAccuracy: Object.entries(perCategoryResults).map(([cat, stats]) => ({
        category: cat,
        accuracy: stats.correct / stats.total,
        correct: stats.correct,
        total: stats.total
      })),
      edgeCaseAccuracy: edgeCaseCorrect / edgeCases.length,
      edgeCasesCorrect: edgeCaseCorrect,
      edgeCasesTotal: edgeCases.length
    };
  }

  /**
   * Analyze accuracy for each category separately
   */
  async analyzePerCategory(allExamples, edgeCases) {
    // Use all available examples
    const classifier = new EmbeddingClassifier({
      modelName: this.modelName,
      topK: 5,
      votingMethod: 'weighted'
    });

    await classifier.initialize(allExamples);

    const categoryResults = {};

    // Group test examples by category
    const byCategory = {};
    for (const example of allExamples) {
      if (!byCategory[example.category]) {
        byCategory[example.category] = [];
      }
      byCategory[example.category].push(example);
    }

    // Test each category
    for (const [category, examples] of Object.entries(byCategory)) {
      let correct = 0;
      let totalConfidence = 0;
      const confusionWith = {};

      for (const example of examples.slice(0, 30)) { // Sample for efficiency
        const result = await classifier.classify(example.text);
        totalConfidence += result.confidence;

        if (result.category === category) {
          correct++;
        } else {
          confusionWith[result.category] = (confusionWith[result.category] || 0) + 1;
        }
      }

      const sampleSize = Math.min(examples.length, 30);

      categoryResults[category] = {
        accuracy: correct / sampleSize,
        avgConfidence: totalConfidence / sampleSize,
        sampleSize,
        totalExamples: examples.length,
        confusionWith: Object.entries(confusionWith)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cat, count]) => ({ category: cat, count }))
      };
    }

    return categoryResults;
  }

  /**
   * Find the point of diminishing returns
   */
  findDiminishingReturns(coveragePoints) {
    const THRESHOLD = 0.02; // 2% improvement threshold

    for (let i = 1; i < coveragePoints.length; i++) {
      const improvement = coveragePoints[i].accuracy - coveragePoints[i - 1].accuracy;
      
      if (improvement < THRESHOLD) {
        return {
          examplesPerCategory: coveragePoints[i - 1].examplesPerCategory,
          accuracy: coveragePoints[i - 1].accuracy,
          nextLevelImprovement: improvement
        };
      }
    }

    // If no diminishing returns found, return last point
    const last = coveragePoints[coveragePoints.length - 1];
    return {
      examplesPerCategory: last.examplesPerCategory,
      accuracy: last.accuracy,
      nextLevelImprovement: null
    };
  }

  /**
   * Identify categories that need more examples
   */
  identifyWeakCategories(categoryAnalysis) {
    const WEAK_THRESHOLD = 0.80; // Below 80% is considered weak

    return Object.entries(categoryAnalysis)
      .filter(([_, stats]) => stats.accuracy < WEAK_THRESHOLD)
      .map(([category, stats]) => ({
        category,
        accuracy: stats.accuracy,
        avgConfidence: stats.avgConfidence,
        confusedWith: stats.confusionWith,
        recommendation: `Add more examples distinguishing ${category} from ${stats.confusionWith[0]?.category || 'other categories'}`
      }))
      .sort((a, b) => a.accuracy - b.accuracy);
  }

  /**
   * Estimate storage requirements
   */
  estimateStorage(coveragePoints) {
    // Estimate based on embedding dimensions (384 for MiniLM)
    const EMBEDDING_DIM = 384;
    const BYTES_PER_FLOAT = 4;
    const METADATA_OVERHEAD = 100; // bytes per example

    return coveragePoints.map(p => {
      const embeddingsBytes = p.totalExamples * EMBEDDING_DIM * BYTES_PER_FLOAT;
      const metadataBytes = p.totalExamples * METADATA_OVERHEAD;
      const totalBytes = embeddingsBytes + metadataBytes;

      return {
        examplesPerCategory: p.examplesPerCategory,
        totalExamples: p.totalExamples,
        embeddingsSizeKB: Math.round(embeddingsBytes / 1024),
        totalSizeKB: Math.round(totalBytes / 1024),
        accuracy: p.accuracy
      };
    });
  }

  /**
   * Generate recommendation
   */
  generateRecommendation(coveragePoints, diminishingPoint, weakCategories) {
    let recommendation = '';

    if (diminishingPoint) {
      recommendation += `Use ${diminishingPoint.examplesPerCategory} examples per category `;
      recommendation += `(${(diminishingPoint.accuracy * 100).toFixed(1)}% accuracy). `;
    }

    if (weakCategories.length > 0) {
      recommendation += `Focus on improving: ${weakCategories.map(w => w.category).join(', ')}. `;
    }

    // Check if we need more data
    const bestAccuracy = Math.max(...coveragePoints.map(p => p.accuracy));
    if (bestAccuracy < 0.85) {
      recommendation += 'Consider adding more diverse examples to reach 85% target. ';
    }

    return recommendation.trim();
  }

  /**
   * Print category analysis
   */
  printCategoryAnalysis(categoryAnalysis) {
    console.log('\n📊 PER-CATEGORY ANALYSIS:');
    console.log('-'.repeat(70));
    console.log(
      'Category'.padEnd(30) +
      'Accuracy'.padEnd(12) +
      'Confidence'.padEnd(12) +
      'Most Confused With'.padEnd(20)
    );
    console.log('-'.repeat(70));

    const sorted = Object.entries(categoryAnalysis)
      .sort((a, b) => a[1].accuracy - b[1].accuracy);

    for (const [category, stats] of sorted) {
      const confused = stats.confusionWith[0]?.category || '-';
      const accuracyStr = `${(stats.accuracy * 100).toFixed(1)}%`;
      const confStr = `${(stats.avgConfidence * 100).toFixed(1)}%`;
      
      // Mark weak categories
      const marker = stats.accuracy < 0.80 ? '⚠️ ' : '  ';
      
      console.log(
        `${marker}${category.substring(0, 27).padEnd(28)}` +
        `${accuracyStr.padEnd(12)}` +
        `${confStr.padEnd(12)}` +
        `${confused.padEnd(20)}`
      );
    }

    console.log('-'.repeat(70));
  }

  /**
   * Get optimal example count
   */
  getOptimalCount() {
    if (!this.results) return null;
    
    return {
      examplesPerCategory: this.results.diminishingReturnsAt?.examplesPerCategory,
      expectedAccuracy: this.results.diminishingReturnsAt?.accuracy,
      weakCategories: this.results.weakCategories.map(w => w.category)
    };
  }
}

/**
 * Run coverage analysis as standalone script
 */
export async function runCoverageAnalysis(modelName) {
  const analyzer = new CoverageAnalyzer({ modelName });
  return await analyzer.run();
}

export default CoverageAnalyzer;

