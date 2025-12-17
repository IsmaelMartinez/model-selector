/**
 * Spike 4: Cold Start Performance Testing
 * Validates load times and inference performance
 */

import { EmbeddingClassifier } from '../shared/EmbeddingClassifier.js';
import { TestDataGenerator } from '../shared/TestDataGenerator.js';
import { ReportGenerator } from '../shared/ReportGenerator.js';
import { SPIKE_CONFIG } from '../spike-config.js';

export class PerformanceTester {
  constructor(options = {}) {
    this.modelName = options.modelName || SPIKE_CONFIG.models[0].name;
    this.config = SPIKE_CONFIG.performanceTests;
    this.successCriteria = SPIKE_CONFIG.successCriteria;
    this.testDataGenerator = new TestDataGenerator();
    this.reportGenerator = new ReportGenerator();
    this.results = null;
  }

  /**
   * Run performance tests
   * @returns {Object} - Performance test results
   */
  async run() {
    console.log('\n🚀 SPIKE 4: COLD START PERFORMANCE TESTING');
    console.log('='.repeat(50));
    console.log(`Using model: ${this.modelName}`);

    // Get test data
    const allExamples = this.testDataGenerator.getAllExamples();
    const testInputs = this.getTestInputs();

    console.log(`\n📊 Test Configuration:`);
    console.log(`  - Cold start iterations: ${this.config.coldStartIterations}`);
    console.log(`  - Warm start iterations: ${this.config.warmStartIterations}`);
    console.log(`  - Inference iterations: ${this.config.inferenceIterations}`);

    // Test cold start (model loading from scratch)
    console.log('\n⏱️  Testing cold start performance...');
    const coldStartResults = await this.testColdStart(allExamples);

    // Test warm start (model already in memory, re-initializing)
    console.log('\n⏱️  Testing warm start performance...');
    const warmStartResults = await this.testWarmStart(allExamples);

    // Test inference performance
    console.log('\n⏱️  Testing inference performance...');
    const inferenceResults = await this.testInference(allExamples, testInputs);

    // Test lazy loading strategy
    console.log('\n⏱️  Testing lazy loading strategy...');
    const lazyLoadingResults = await this.testLazyLoading(allExamples, testInputs);

    // Test memory usage (estimate)
    console.log('\n💾 Estimating memory usage...');
    const memoryEstimate = this.estimateMemoryUsage(allExamples);

    // Build results
    this.results = {
      modelName: this.modelName,
      coldStart: coldStartResults,
      warmStart: warmStartResults,
      inference: inferenceResults,
      lazyLoading: lazyLoadingResults,
      memory: memoryEstimate,
      // Summary metrics
      coldLoadMs: coldStartResults.avgMs,
      warmLoadMs: warmStartResults.avgMs,
      inferenceMs: inferenceResults.avgMs,
      lazyLoadingViable: lazyLoadingResults.viable,
      // Success criteria checks
      meetsDesktopTarget: this.checkDesktopTargets(coldStartResults, inferenceResults),
      meetsMobileTarget: this.checkMobileTargets(coldStartResults, inferenceResults),
      recommendations: this.generateRecommendations(coldStartResults, inferenceResults, lazyLoadingResults)
    };

    // Print results
    this.printPerformanceResults();

    // Generate report
    await this.reportGenerator.generateReport('performance', this.results);

    return this.results;
  }

  /**
   * Test cold start (loading model from scratch)
   */
  async testColdStart(examples) {
    const times = [];

    for (let i = 0; i < this.config.coldStartIterations; i++) {
      console.log(`    Iteration ${i + 1}/${this.config.coldStartIterations}...`);
      
      // Create fresh classifier instance
      const classifier = new EmbeddingClassifier({
        modelName: this.modelName,
        topK: 5
      });

      const startTime = Date.now();
      await classifier.initialize(examples);
      const endTime = Date.now();

      times.push(endTime - startTime);

      // Force garbage collection hint (not guaranteed in JS)
      classifier.reset();
    }

    return {
      iterations: this.config.coldStartIterations,
      times,
      minMs: Math.min(...times),
      maxMs: Math.max(...times),
      avgMs: times.reduce((a, b) => a + b, 0) / times.length,
      medianMs: this.median(times)
    };
  }

  /**
   * Test warm start (model cached, re-initializing references)
   */
  async testWarmStart(examples) {
    // First, do a cold start to cache the model
    const classifier = new EmbeddingClassifier({
      modelName: this.modelName,
      topK: 5
    });
    await classifier.initialize(examples);

    const times = [];

    for (let i = 0; i < this.config.warmStartIterations; i++) {
      // Create new classifier but model should be cached
      const warmClassifier = new EmbeddingClassifier({
        modelName: this.modelName,
        topK: 5
      });

      const startTime = Date.now();
      await warmClassifier.initialize(examples);
      const endTime = Date.now();

      times.push(endTime - startTime);
    }

    return {
      iterations: this.config.warmStartIterations,
      times: times.slice(0, 5), // Only store first 5 for report
      minMs: Math.min(...times),
      maxMs: Math.max(...times),
      avgMs: times.reduce((a, b) => a + b, 0) / times.length,
      medianMs: this.median(times)
    };
  }

  /**
   * Test inference performance
   */
  async testInference(examples, testInputs) {
    // Initialize classifier once
    const classifier = new EmbeddingClassifier({
      modelName: this.modelName,
      topK: 5
    });
    await classifier.initialize(examples);

    const times = [];

    // Warm up with a few classifications
    for (let i = 0; i < 3; i++) {
      await classifier.classify(testInputs[i % testInputs.length]);
    }

    // Measure inference times
    for (let i = 0; i < this.config.inferenceIterations; i++) {
      const input = testInputs[i % testInputs.length];
      
      const startTime = Date.now();
      await classifier.classify(input);
      const endTime = Date.now();

      times.push(endTime - startTime);
    }

    // Calculate percentiles
    const sortedTimes = [...times].sort((a, b) => a - b);
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

    return {
      iterations: this.config.inferenceIterations,
      minMs: Math.min(...times),
      maxMs: Math.max(...times),
      avgMs: times.reduce((a, b) => a + b, 0) / times.length,
      medianMs: this.median(times),
      p50Ms: p50,
      p95Ms: p95,
      p99Ms: p99
    };
  }

  /**
   * Test lazy loading strategy
   * (Keyword match first, then fallback to embeddings)
   */
  async testLazyLoading(examples, testInputs) {
    const results = {
      viable: true,
      keywordMatchTime: 0,
      embeddingFallbackTime: 0,
      totalWithLazyLoad: 0,
      totalWithoutLazyLoad: 0
    };

    // Simulate keyword matching (very fast)
    const keywordTimes = [];
    for (const input of testInputs.slice(0, 10)) {
      const start = Date.now();
      this.simulateKeywordMatch(input);
      keywordTimes.push(Date.now() - start);
    }
    results.keywordMatchTime = keywordTimes.reduce((a, b) => a + b, 0) / keywordTimes.length;

    // Measure time to load embedding model on fallback
    const fallbackStart = Date.now();
    const classifier = new EmbeddingClassifier({
      modelName: this.modelName,
      topK: 5
    });
    await classifier.initialize(examples);
    results.embeddingFallbackTime = Date.now() - fallbackStart;

    // Calculate totals
    // Scenario: 70% of queries handled by keywords, 30% need embeddings
    const keywordPercentage = 0.70;
    results.totalWithLazyLoad = 
      (results.keywordMatchTime * keywordPercentage) + 
      ((results.embeddingFallbackTime + results.keywordMatchTime) * (1 - keywordPercentage));

    results.totalWithoutLazyLoad = results.embeddingFallbackTime;

    // Lazy loading is viable if it provides meaningful improvement
    results.viable = results.totalWithLazyLoad < results.totalWithoutLazyLoad * 0.8;
    results.improvement = 1 - (results.totalWithLazyLoad / results.totalWithoutLazyLoad);

    return results;
  }

  /**
   * Simulate keyword matching (for lazy loading test)
   */
  simulateKeywordMatch(input) {
    const keywords = ['classify', 'detect', 'recognize', 'predict', 'analyze', 'generate'];
    const lowercaseInput = input.toLowerCase();
    
    for (const keyword of keywords) {
      if (lowercaseInput.includes(keyword)) {
        return { matched: true, keyword };
      }
    }
    
    return { matched: false };
  }

  /**
   * Estimate memory usage
   */
  estimateMemoryUsage(examples) {
    // Estimates based on typical transformer model sizes
    const modelSizeEstimates = {
      'Xenova/all-MiniLM-L6-v2': 23,
      'Xenova/bge-small-en-v1.5': 33,
      'Xenova/gte-small': 33,
      'Xenova/e5-small-v2': 33
    };

    const modelSizeMB = modelSizeEstimates[this.modelName] || 30;
    
    // Embedding storage: examples * dimensions * 4 bytes
    const embeddingDim = 384;
    const embeddingStorageMB = (examples.length * embeddingDim * 4) / (1024 * 1024);

    // Runtime overhead estimate (tensors, buffers, etc.)
    const runtimeOverheadMB = modelSizeMB * 0.3;

    return {
      modelSizeMB,
      embeddingStorageMB: Math.round(embeddingStorageMB * 100) / 100,
      runtimeOverheadMB: Math.round(runtimeOverheadMB * 100) / 100,
      totalEstimateMB: Math.round((modelSizeMB + embeddingStorageMB + runtimeOverheadMB) * 100) / 100,
      exampleCount: examples.length
    };
  }

  /**
   * Get test inputs for inference testing
   */
  getTestInputs() {
    return [
      'classify images of dogs',
      'detect objects in photos',
      'analyze sentiment in reviews',
      'predict stock prices',
      'convert speech to text',
      'recommend movies to users',
      'clean data for analysis',
      'detect spam emails',
      'identify faces in pictures',
      'forecast weather patterns',
      'transcribe audio recordings',
      'categorize news articles',
      'extract entities from text',
      'segment medical images',
      'generate product descriptions'
    ];
  }

  /**
   * Check if results meet desktop targets
   */
  checkDesktopTargets(coldStart, inference) {
    return (
      coldStart.avgMs <= this.successCriteria.desktopLoadTimeMs &&
      inference.avgMs <= this.successCriteria.desktopInferenceMs
    );
  }

  /**
   * Check if results meet mobile targets
   */
  checkMobileTargets(coldStart, inference) {
    return (
      coldStart.avgMs <= this.successCriteria.mobileLoadTimeMs &&
      inference.avgMs <= this.successCriteria.mobileInferenceMs
    );
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(coldStart, inference, lazyLoading) {
    const recommendations = [];

    // Cold start recommendations
    if (coldStart.avgMs > this.successCriteria.desktopLoadTimeMs) {
      if (lazyLoading.viable) {
        recommendations.push('Use lazy loading strategy to defer model loading until needed.');
      }
      recommendations.push('Consider preloading model during idle time.');
      recommendations.push('Implement loading indicator for user feedback.');
    }

    // Inference recommendations
    if (inference.avgMs > this.successCriteria.desktopInferenceMs) {
      recommendations.push('Reduce topK value to speed up similarity search.');
      recommendations.push('Consider using a smaller embedding model.');
    }

    // Memory recommendations
    if (coldStart.avgMs > 5000) {
      recommendations.push('Implement service worker for model caching.');
      recommendations.push('Consider code splitting to load model asynchronously.');
    }

    // If meeting targets
    if (recommendations.length === 0) {
      recommendations.push('Performance targets met. Proceed with implementation.');
    }

    return recommendations;
  }

  /**
   * Calculate median
   */
  median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Print performance results
   */
  printPerformanceResults() {
    console.log('\n📊 PERFORMANCE RESULTS:');
    console.log('='.repeat(60));

    console.log('\n⏱️  COLD START (Model Loading):');
    console.log(`   Average: ${this.results.coldStart.avgMs.toFixed(0)}ms`);
    console.log(`   Median:  ${this.results.coldStart.medianMs.toFixed(0)}ms`);
    console.log(`   Range:   ${this.results.coldStart.minMs}-${this.results.coldStart.maxMs}ms`);
    console.log(`   Target:  ${this.successCriteria.desktopLoadTimeMs}ms (desktop) / ${this.successCriteria.mobileLoadTimeMs}ms (mobile)`);
    console.log(`   Status:  ${this.results.meetsDesktopTarget ? '✅ Meets desktop target' : '❌ Exceeds desktop target'}`);

    console.log('\n⚡ WARM START (Cached Model):');
    console.log(`   Average: ${this.results.warmStart.avgMs.toFixed(0)}ms`);
    console.log(`   Median:  ${this.results.warmStart.medianMs.toFixed(0)}ms`);

    console.log('\n🔄 INFERENCE:');
    console.log(`   Average: ${this.results.inference.avgMs.toFixed(1)}ms`);
    console.log(`   P50:     ${this.results.inference.p50Ms}ms`);
    console.log(`   P95:     ${this.results.inference.p95Ms}ms`);
    console.log(`   P99:     ${this.results.inference.p99Ms}ms`);
    console.log(`   Target:  ${this.successCriteria.desktopInferenceMs}ms (desktop) / ${this.successCriteria.mobileInferenceMs}ms (mobile)`);

    console.log('\n🔀 LAZY LOADING STRATEGY:');
    console.log(`   Keyword match time: ${this.results.lazyLoading.keywordMatchTime.toFixed(1)}ms`);
    console.log(`   Embedding fallback: ${this.results.lazyLoading.embeddingFallbackTime.toFixed(0)}ms`);
    console.log(`   Viable: ${this.results.lazyLoading.viable ? '✅ Yes' : '❌ No'}`);
    if (this.results.lazyLoading.improvement > 0) {
      console.log(`   Improvement: ${(this.results.lazyLoading.improvement * 100).toFixed(0)}% faster average`);
    }

    console.log('\n💾 MEMORY ESTIMATE:');
    console.log(`   Model size:    ${this.results.memory.modelSizeMB}MB`);
    console.log(`   Embeddings:    ${this.results.memory.embeddingStorageMB}MB`);
    console.log(`   Total:         ~${this.results.memory.totalEstimateMB}MB`);

    console.log('\n💡 RECOMMENDATIONS:');
    for (const rec of this.results.recommendations) {
      console.log(`   • ${rec}`);
    }

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Get summary for reports
   */
  getSummary() {
    if (!this.results) return null;

    return {
      coldLoadMs: this.results.coldLoadMs,
      warmLoadMs: this.results.warmLoadMs,
      inferenceMs: this.results.inferenceMs,
      meetsDesktopTarget: this.results.meetsDesktopTarget,
      meetsMobileTarget: this.results.meetsMobileTarget,
      lazyLoadingViable: this.results.lazyLoadingViable
    };
  }
}

/**
 * Run performance tests as standalone script
 */
export async function runPerformanceTests(modelName) {
  const tester = new PerformanceTester({ modelName });
  return await tester.run();
}

export default PerformanceTester;

