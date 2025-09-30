/**
 * Evaluation script for Xenova/distilbert-base-uncased-mnli model
 * Tests performance, size, load time, and accuracy for zero-shot classification
 */

import { pipeline } from '@huggingface/transformers';

export class DistilBERTMNLIEvaluator {
  constructor() {
    this.model = null;
    this.modelName = 'Xenova/distilbert-base-uncased-mnli';
    this.taskCategories = [
      'Computer Vision',
      'Natural Language Processing', 
      'Speech Processing',
      'Time Series Analysis',
      'Recommendation Systems',
      'Reinforcement Learning',
      'Data Preprocessing'
    ];
  }

  async loadModel() {
    const startTime = performance.now();
    console.log(`Loading ${this.modelName}...`);
    
    try {
      this.model = await pipeline('zero-shot-classification', this.modelName);
      const loadTime = performance.now() - startTime;
      
      console.log(`Model loaded successfully in ${loadTime.toFixed(2)}ms`);
      return {
        success: true,
        loadTime: loadTime,
        message: `Model loaded in ${loadTime.toFixed(2)}ms`
      };
    } catch (error) {
      console.error('Failed to load model:', error);
      return {
        success: false,
        error: error.message,
        loadTime: performance.now() - startTime
      };
    }
  }

  async classifyText(text, candidateLabels = null) {
    if (!this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    const labels = candidateLabels || this.taskCategories;
    const startTime = performance.now();
    
    try {
      const result = await this.model(text, labels);
      const inferenceTime = performance.now() - startTime;
      
      return {
        success: true,
        result: result,
        inferenceTime: inferenceTime,
        topLabel: result.labels[0],
        topScore: result.scores[0]
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        inferenceTime: performance.now() - startTime
      };
    }
  }

  async runPerformanceBenchmark() {
    console.log('Running performance benchmark for DistilBERT MNLI...');
    
    const testCases = [
      'I need to clean and preprocess customer data from CSV files',
      'Build a chatbot that can answer questions about our products',
      'Detect objects in surveillance camera feeds',
      'Predict stock prices using historical time series data',
      'Convert speech recordings to text transcriptions',
      'Recommend movies to users based on their viewing history',
      'Train a game-playing AI using reinforcement learning'
    ];

    const results = {
      modelLoadResult: null,
      classifications: [],
      averageInferenceTime: 0,
      accuracy: 0,
      modelSize: 'Unknown', // Will be estimated
      memoryUsage: 'Unknown'
    };

    // Load model and measure load time
    results.modelLoadResult = await this.loadModel();
    
    if (!results.modelLoadResult.success) {
      return results;
    }

    // Run classification tests
    let totalInferenceTime = 0;
    
    for (const testCase of testCases) {
      const classification = await this.classifyText(testCase);
      results.classifications.push({
        input: testCase,
        ...classification
      });
      
      if (classification.success) {
        totalInferenceTime += classification.inferenceTime;
      }
    }

    results.averageInferenceTime = totalInferenceTime / testCases.length;

    // Estimate model size (DistilBERT is typically ~255MB)
    results.modelSize = '~255MB (estimated)';
    
    // Memory usage estimation
    if (performance.memory) {
      results.memoryUsage = `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`;
    }

    console.log('Performance benchmark completed:', results);
    return results;
  }

  async testAccuracyWithExpectedResults() {
    const testCases = [
      {
        input: 'I need to clean and preprocess a large dataset of customer reviews',
        expected: 'Data Preprocessing'
      },
      {
        input: 'Build a sentiment analysis model for social media posts',
        expected: 'Natural Language Processing'
      },
      {
        input: 'Implement object detection for autonomous vehicles',
        expected: 'Computer Vision'
      },
      {
        input: 'Predict future sales using historical time series data',
        expected: 'Time Series Analysis'
      },
      {
        input: 'Convert audio recordings to text for accessibility',
        expected: 'Speech Processing'
      },
      {
        input: 'Build a product recommendation system for e-commerce',
        expected: 'Recommendation Systems'
      },
      {
        input: 'Train an AI agent to play chess using trial and error',
        expected: 'Reinforcement Learning'
      }
    ];

    let correct = 0;
    const results = [];

    for (const testCase of testCases) {
      const classification = await this.classifyText(testCase.input);
      const isCorrect = classification.success && 
                       classification.topLabel === testCase.expected;
      
      if (isCorrect) correct++;
      
      results.push({
        input: testCase.input,
        expected: testCase.expected,
        predicted: classification.topLabel,
        confidence: classification.topScore,
        correct: isCorrect,
        ...classification
      });
    }

    const accuracy = (correct / testCases.length) * 100;
    
    return {
      accuracy: accuracy,
      correct: correct,
      total: testCases.length,
      results: results
    };
  }
}

// Export for browser testing
if (typeof window !== 'undefined') {
  window.DistilBERTMNLIEvaluator = DistilBERTMNLIEvaluator;
}