/**
 * Configuration for Embedding Validation Spikes
 * Central configuration for all validation experiments
 */

export const SPIKE_CONFIG = {
  // Models to benchmark in Spike 1
  models: [
    {
      name: 'Xenova/all-MiniLM-L6-v2',
      expectedSizeMB: 23,
      description: 'Most popular, good baseline'
    },
    {
      name: 'Xenova/bge-small-en-v1.5',
      expectedSizeMB: 33,
      description: 'BAAI model, strong performance'
    },
    {
      name: 'Xenova/gte-small',
      expectedSizeMB: 33,
      description: 'Alibaba model, competitive'
    },
    {
      name: 'Xenova/e5-small-v2',
      expectedSizeMB: 33,
      description: 'Microsoft model, good for retrieval'
    }
  ],

  // Success criteria
  successCriteria: {
    minAccuracy: 0.85,           // >= 85% accuracy required
    maxModelSizeMB: 35,          // < 35MB model size
    minConfidenceThreshold: 0.70, // 70% minimum confidence
    desktopLoadTimeMs: 3000,     // < 3s desktop cold start
    mobileLoadTimeMs: 5000,      // < 5s mobile cold start
    desktopInferenceMs: 100,     // < 100ms desktop inference
    mobileInferenceMs: 200       // < 200ms mobile inference
  },

  // Spike 2: Threshold calibration
  thresholdCalibration: {
    thresholdsToTest: [0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90],
    kValuesToTest: [3, 5, 7, 10],
    votingMethods: ['simple', 'weighted']
  },

  // Spike 3: Coverage analysis
  coverageAnalysis: {
    exampleCounts: [5, 10, 20, 50],
    categories: 7 // Number of categories in taxonomy
  },

  // Spike 4: Performance testing
  performanceTests: {
    coldStartIterations: 3,
    warmStartIterations: 10,
    inferenceIterations: 50
  },

  // Test data configuration
  testData: {
    // Additional edge cases to test beyond tasks.json
    edgeCases: [
      { input: 'analyze data', expectedCategory: null, description: 'Too vague' },
      { input: 'process images', expectedCategory: 'computer_vision', description: 'Ambiguous' },
      { input: 'detect things', expectedCategory: null, description: 'Missing context' },
      { input: 'ML task', expectedCategory: null, description: 'No useful signal' },
      { input: 'help me with AI', expectedCategory: null, description: 'Generic request' },
      { input: 'build a model', expectedCategory: null, description: 'Vague' },
      { input: 'classify dog breeds in photos', expectedCategory: 'computer_vision', description: 'Clear CV task' },
      { input: 'detect spam emails', expectedCategory: 'natural_language_processing', description: 'Clear NLP task' },
      { input: 'predict stock prices', expectedCategory: 'time_series', description: 'Clear time series task' },
      { input: 'convert speech to text', expectedCategory: 'speech_processing', description: 'Clear speech task' },
      { input: 'recommend movies to users', expectedCategory: 'recommendation_systems', description: 'Clear recommendation task' },
      { input: 'train a robot to walk', expectedCategory: 'reinforcement_learning', description: 'Clear RL task' },
      { input: 'clean missing values in dataset', expectedCategory: 'data_preprocessing', description: 'Clear preprocessing task' }
    ]
  },

  // Output configuration
  output: {
    directory: 'validation-results',
    formats: ['json', 'console']
  }
};

export default SPIKE_CONFIG;

