/**
 * Spike Validation Tests
 * Integration tests for embedding validation spikes
 * 
 * These tests verify that the spike infrastructure works correctly.
 * Full spike runs are expensive, so these tests use mocked/limited data.
 * 
 * Run with: npm run test:spikes
 */

import { describe, test, expect, beforeAll, vi } from 'vitest';
import { EmbeddingClassifier } from '../src/lib/validation/shared/EmbeddingClassifier.js';
import { TestDataGenerator } from '../src/lib/validation/shared/TestDataGenerator.js';
import { ReportGenerator } from '../src/lib/validation/shared/ReportGenerator.js';
import { SPIKE_CONFIG } from '../src/lib/validation/spike-config.js';

// Skip tests that require downloading models unless explicitly enabled
const RUN_MODEL_TESTS = process.env.RUN_SPIKE_TESTS === 'true';

describe('Spike Infrastructure', () => {
  describe('SPIKE_CONFIG', () => {
    test('has required model configurations', () => {
      expect(SPIKE_CONFIG.models).toBeDefined();
      expect(SPIKE_CONFIG.models.length).toBeGreaterThanOrEqual(4);
      
      for (const model of SPIKE_CONFIG.models) {
        expect(model.name).toBeDefined();
        expect(model.expectedSizeMB).toBeDefined();
        expect(model.description).toBeDefined();
      }
    });

    test('has success criteria defined', () => {
      const criteria = SPIKE_CONFIG.successCriteria;
      
      expect(criteria.minAccuracy).toBeDefined();
      expect(criteria.minAccuracy).toBeGreaterThanOrEqual(0.7);
      expect(criteria.minAccuracy).toBeLessThanOrEqual(1.0);
      
      expect(criteria.maxModelSizeMB).toBeDefined();
      expect(criteria.maxModelSizeMB).toBeGreaterThan(0);
      
      expect(criteria.minConfidenceThreshold).toBeDefined();
      expect(criteria.minConfidenceThreshold).toBe(0.70);
      
      expect(criteria.desktopLoadTimeMs).toBeDefined();
      expect(criteria.mobileLoadTimeMs).toBeDefined();
    });

    test('has threshold calibration config', () => {
      const config = SPIKE_CONFIG.thresholdCalibration;
      
      expect(config.thresholdsToTest).toBeDefined();
      expect(config.thresholdsToTest.length).toBeGreaterThan(5);
      
      expect(config.kValuesToTest).toBeDefined();
      expect(config.kValuesToTest).toContain(5);
      
      expect(config.votingMethods).toContain('simple');
      expect(config.votingMethods).toContain('weighted');
    });

    test('has edge cases for testing', () => {
      const edgeCases = SPIKE_CONFIG.testData.edgeCases;
      
      expect(edgeCases).toBeDefined();
      expect(edgeCases.length).toBeGreaterThan(5);
      
      // Should have both vague inputs (expectedCategory: null) and clear inputs
      const vagueInputs = edgeCases.filter(e => e.expectedCategory === null);
      const clearInputs = edgeCases.filter(e => e.expectedCategory !== null);
      
      expect(vagueInputs.length).toBeGreaterThan(0);
      expect(clearInputs.length).toBeGreaterThan(0);
    });
  });

  describe('TestDataGenerator', () => {
    let generator;

    beforeAll(() => {
      generator = new TestDataGenerator();
    });

    test('extracts examples from tasks.json', () => {
      const examples = generator.getAllExamples();
      
      expect(examples).toBeDefined();
      // Default now only returns real examples (no keyword-derived garbage)
      expect(examples.length).toBeGreaterThanOrEqual(50);
      expect(examples.length).toBeLessThan(100); // Should be ~59 real examples
      
      // Each example should have required fields
      for (const example of examples) {
        expect(example.text).toBeDefined();
        expect(example.category).toBeDefined();
        expect(example.source).toBe('example'); // Default: only real examples
      }
    });

    test('can include good keywords when requested', () => {
      const withKeywords = generator.getAllExamples({ includeKeywords: true, onlyGoodKeywords: true });
      const withoutKeywords = generator.getAllExamples();
      
      // Should have more examples when including keywords
      expect(withKeywords.length).toBeGreaterThan(withoutKeywords.length);
      
      // All keyword examples should be quality phrases
      const keywordExamples = withKeywords.filter(e => e.source === 'keyword');
      for (const ex of keywordExamples) {
        // Should be multi-word or known standalone term
        expect(ex.text.split(' ').length).toBeGreaterThanOrEqual(2);
      }
    });

    test('groups examples by category', () => {
      const grouped = generator.getExamplesByCategory();
      
      expect(grouped).toBeDefined();
      expect(Object.keys(grouped).length).toBe(7); // 7 categories
      
      const expectedCategories = [
        'computer_vision',
        'natural_language_processing',
        'speech_processing',
        'time_series',
        'recommendation_systems',
        'reinforcement_learning',
        'data_preprocessing'
      ];
      
      for (const category of expectedCategories) {
        expect(grouped[category]).toBeDefined();
        expect(grouped[category].length).toBeGreaterThan(0);
      }
    });

    test('samples N examples per category', () => {
      const n = 5;
      const sampled = generator.sampleExamplesPerCategory(n);
      
      // Count per category
      const counts = {};
      for (const example of sampled) {
        counts[example.category] = (counts[example.category] || 0) + 1;
      }
      
      // Each category should have <= n examples
      for (const count of Object.values(counts)) {
        expect(count).toBeLessThanOrEqual(n);
      }
    });

    test('generates cross-validation splits', () => {
      const splits = generator.generateKFoldSplits(5);
      
      expect(splits.length).toBe(5);
      
      for (const split of splits) {
        expect(split.train).toBeDefined();
        expect(split.test).toBeDefined();
        expect(split.train.length).toBeGreaterThan(split.test.length);
      }
    });

    test('provides category statistics', () => {
      const stats = generator.getCategoryStats();
      
      expect(stats).toBeDefined();
      
      for (const [category, categoryStats] of Object.entries(stats)) {
        expect(categoryStats.total).toBeGreaterThan(0);
        expect(categoryStats.fromExamples).toBeDefined();
        expect(categoryStats.fromKeywords).toBeDefined();
        expect(categoryStats.subcategories).toBeGreaterThan(0);
      }
    });

    test('generates synthetic examples', () => {
      const synthetic = generator.generateSyntheticExamples(3);
      
      expect(synthetic).toBeDefined();
      expect(synthetic.length).toBeGreaterThan(0);
      
      // Should have examples for all categories
      const categories = new Set(synthetic.map(s => s.category));
      expect(categories.size).toBe(7);
    });
  });

  describe('ReportGenerator', () => {
    let generator;

    beforeAll(() => {
      generator = new ReportGenerator({
        outputDir: 'validation-results',
        formats: ['console'] // Skip file output in tests
      });
    });

    test('generates benchmark summary', () => {
      const mockResults = {
        models: [
          { name: 'model-a', accuracy: 0.90, sizeMB: 25, meetsSuccessCriteria: true },
          { name: 'model-b', accuracy: 0.85, sizeMB: 30, meetsSuccessCriteria: true },
          { name: 'model-c', accuracy: 0.75, sizeMB: 40, meetsSuccessCriteria: false }
        ]
      };
      
      const summary = generator.generateSummary('benchmark', mockResults);
      
      expect(summary.totalModels).toBe(3);
      expect(summary.passingModels).toBe(2);
      expect(summary.bestModel).toBeDefined();
      expect(summary.meetsSuccessCriteria).toBe(true);
      expect(summary.recommendation).toBeDefined();
    });

    test('generates threshold summary', () => {
      const mockResults = {
        recommendedThreshold: 0.72,
        recommendedK: 5,
        votingMethod: 'weighted',
        thresholdFor70Percent: 0.65
      };
      
      const summary = generator.generateSummary('threshold', mockResults);
      
      expect(summary.recommendedThreshold).toBe(0.72);
      expect(summary.recommendedK).toBe(5);
      expect(summary.votingMethod).toBe('weighted');
      expect(summary.meetsConfidenceTarget).toBe(true);
    });

    test('generates coverage summary', () => {
      const mockResults = {
        coveragePoints: [
          { examplesPerCategory: 5, accuracy: 0.75 },
          { examplesPerCategory: 10, accuracy: 0.82 },
          { examplesPerCategory: 20, accuracy: 0.85 }
        ],
        weakCategories: [
          { category: 'reinforcement_learning', accuracy: 0.65 }
        ]
      };
      
      const summary = generator.generateSummary('coverage', mockResults);
      
      expect(summary.coveragePoints).toBeDefined();
      expect(summary.coveragePoints.length).toBe(3);
      expect(summary.weakCategories).toBeDefined();
    });

    test('generates performance summary', () => {
      const mockResults = {
        coldLoadMs: 2500,
        warmLoadMs: 500,
        inferenceMs: 80,
        lazyLoadingViable: true
      };
      
      const summary = generator.generateSummary('performance', mockResults);
      
      expect(summary.meetsDesktopTarget).toBe(true);
      expect(summary.meetsMobileTarget).toBe(true);
      expect(summary.lazyLoadingViable).toBe(true);
    });
  });

  describe('EmbeddingClassifier (Unit Tests)', () => {
    test('cosine similarity calculation', () => {
      const classifier = new EmbeddingClassifier();
      
      // Identical vectors
      const v1 = [1, 0, 0];
      expect(classifier.cosineSimilarity(v1, v1)).toBeCloseTo(1.0, 5);
      
      // Orthogonal vectors
      const v2 = [0, 1, 0];
      expect(classifier.cosineSimilarity(v1, v2)).toBeCloseTo(0.0, 5);
      
      // Opposite vectors
      const v3 = [-1, 0, 0];
      expect(classifier.cosineSimilarity(v1, v3)).toBeCloseTo(-1.0, 5);
      
      // Similar vectors
      const v4 = [0.9, 0.1, 0];
      expect(classifier.cosineSimilarity(v1, v4)).toBeGreaterThan(0.9);
    });

    test('vote aggregation - simple voting', () => {
      const classifier = new EmbeddingClassifier();
      
      const matches = [
        { category: 'A', similarity: 0.9 },
        { category: 'A', similarity: 0.8 },
        { category: 'B', similarity: 0.95 },
        { category: 'A', similarity: 0.7 },
        { category: 'B', similarity: 0.6 }
      ];
      
      const votes = classifier.aggregateVotes(matches, 'simple');
      
      // A has 3 votes, B has 2 votes
      expect(votes['A']).toBeGreaterThan(votes['B']);
    });

    test('vote aggregation - weighted voting', () => {
      const classifier = new EmbeddingClassifier();
      
      // Weighted voting sums similarity scores and normalizes
      // A: 0.5 + 0.5 = 1.0, B: 0.99
      // Total weight = 1.99
      // A: 1.0/1.99 ≈ 0.50, B: 0.99/1.99 ≈ 0.50
      const matches = [
        { category: 'A', similarity: 0.5 },
        { category: 'A', similarity: 0.5 },
        { category: 'B', similarity: 0.99 }
      ];
      
      const votes = classifier.aggregateVotes(matches, 'weighted');
      
      // A has total weight 1.0, B has 0.99 - A wins slightly
      expect(votes['A']).toBeGreaterThan(votes['B']);
      
      // Test case where single high weight wins
      const matches2 = [
        { category: 'A', similarity: 0.3 },
        { category: 'B', similarity: 0.95 }
      ];
      
      const votes2 = classifier.aggregateVotes(matches2, 'weighted');
      
      // B has higher weight despite fewer occurrences
      expect(votes2['B']).toBeGreaterThan(votes2['A']);
    });

    test('confidence level assignment', () => {
      const classifier = new EmbeddingClassifier();
      
      expect(classifier.getConfidenceLevel(0.90)).toBe('high');
      expect(classifier.getConfidenceLevel(0.85)).toBe('high');
      expect(classifier.getConfidenceLevel(0.75)).toBe('medium');
      expect(classifier.getConfidenceLevel(0.70)).toBe('medium');
      expect(classifier.getConfidenceLevel(0.50)).toBe('low');
    });

    test('metrics tracking', () => {
      const classifier = new EmbeddingClassifier({ modelName: 'test-model' });
      
      const metrics = classifier.getMetrics();
      
      expect(metrics.modelName).toBe('test-model');
      expect(metrics.loadTimeMs).toBe(0);
      expect(metrics.classificationCount).toBe(0);
      expect(metrics.initialized).toBe(false);
    });

    test('reset clears state', () => {
      const classifier = new EmbeddingClassifier();
      classifier.initialized = true;
      classifier.referenceEmbeddings = [{ text: 'test' }];
      
      classifier.reset();
      
      expect(classifier.initialized).toBe(false);
      expect(classifier.referenceEmbeddings.length).toBe(0);
    });
  });
});

// These tests require downloading models and are slow
// Run with: RUN_SPIKE_TESTS=true npm run test:spikes
describe.skipIf(!RUN_MODEL_TESTS)('EmbeddingClassifier (Model Tests)', () => {
  let classifier;
  let testData;

  beforeAll(async () => {
    const generator = new TestDataGenerator();
    testData = generator.sampleExamplesPerCategory(5);
    
    classifier = new EmbeddingClassifier({
      modelName: SPIKE_CONFIG.models[0].name,
      topK: 5
    });
    
    await classifier.initialize(testData);
  }, 120000); // 2 minute timeout for model download

  test('initializes successfully', () => {
    expect(classifier.initialized).toBe(true);
    expect(classifier.referenceEmbeddings.length).toBeGreaterThan(0);
  });

  test('generates embeddings', async () => {
    const embedding = await classifier.getEmbedding('classify images of dogs');
    
    expect(embedding).toBeDefined();
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBe(384); // MiniLM embedding size
  });

  test('classifies task descriptions', async () => {
    const result = await classifier.classify('detect objects in photos');
    
    expect(result).toBeDefined();
    expect(result.category).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.topCategories).toBeDefined();
    expect(result.similarExamples).toBeDefined();
    expect(result.method).toBe('embedding_similarity');
  });

  test('returns correct category for clear inputs', async () => {
    const testCases = [
      { input: 'classify images of animals', expected: 'computer_vision' },
      { input: 'analyze sentiment in text', expected: 'natural_language_processing' },
      { input: 'convert speech to text', expected: 'speech_processing' }
    ];
    
    for (const testCase of testCases) {
      const result = await classifier.classify(testCase.input);
      expect(result.category).toBe(testCase.expected);
    }
  });

  test('reports low confidence for vague inputs', async () => {
    const vagueInputs = ['analyze data', 'help with AI', 'do something'];
    
    for (const input of vagueInputs) {
      const result = await classifier.classify(input);
      // Vague inputs should have lower confidence
      expect(result.confidence).toBeLessThan(0.9);
    }
  });
});

