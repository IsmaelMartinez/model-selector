/**
 * Classifier Configuration
 * Central configuration for the task classification system
 */

export const CLASSIFIER_CONFIG = {
  // Primary embedding model (MiniLM - 23MB, 98.3% accuracy)
  embedding: {
    modelName: 'Xenova/all-MiniLM-L6-v2',
    modelSize: '23MB',
    expectedAccuracy: 0.983,
    topK: 5,
    votingMethod: 'weighted',
    confidenceThreshold: 0.70, // Below this, show generic models
  },
  
  // Confidence thresholds
  confidence: {
    high: 0.85,    // Very confident - show specific models
    medium: 0.70,  // Confident enough - show models
    low: 0.40,     // Not confident - show generic models
    minimum: 0.70, // Below this, fall back to generic
  },
  
  // Performance targets
  performance: {
    maxLoadTimeDesktop: 3000, // 3 seconds
    maxLoadTimeMobile: 5000,  // 5 seconds
    maxInferenceTime: 100,    // 100ms per classification
  },
  
  // Categories (for fallback ordering)
  categories: [
    'natural_language_processing',
    'computer_vision',
    'speech_processing',
    'time_series',
    'recommendation_systems',
    'reinforcement_learning',
    'data_preprocessing'
  ],
  
  // Messages
  messages: {
    loading: 'Loading AI classifier (~23MB)...',
    downloading: (percent) => `Downloading classifier: ${percent}%`,
    ready: 'Classifier ready',
    lowConfidence: 'Showing general-purpose models (low confidence in classification)',
    error: 'Classification unavailable, showing popular models'
  }
};

// Export individual values for convenience
export const MODEL_NAME = CLASSIFIER_CONFIG.embedding.modelName;
export const CONFIDENCE_THRESHOLD = CLASSIFIER_CONFIG.confidence.minimum;
export const TOP_K = CLASSIFIER_CONFIG.embedding.topK;

export default CLASSIFIER_CONFIG;
