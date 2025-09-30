/**
 * Zero-shot classification testing with current task taxonomy
 * Tests both DistilBERT and BART models against our 7-category system
 */

import { DistilBERTMNLIEvaluator } from './distilbert-mnli-evaluation.js';
import { BARTMNLIEvaluator } from './bart-mnli-evaluation.js';
import tasksData from '../data/tasks.json' assert { type: 'json' };

export class TaxonomyClassificationTester {
  constructor() {
    this.distilbertEvaluator = new DistilBERTMNLIEvaluator();
    this.bartEvaluator = new BARTMNLIEvaluator();
    
    // Extract categories from the actual taxonomy
    this.taskCategories = Object.keys(tasksData.taskTaxonomy).map(key => 
      tasksData.taskTaxonomy[key].label
    );
    
    this.taxonomyTestCases = this.generateTaxonomyTestCases();
  }

  generateTaxonomyTestCases() {
    // Generate test cases based on our actual task taxonomy
    const testCases = [];
    
    // Computer Vision tests
    testCases.push(
      { input: 'Classify dog breeds from photos', expected: 'Computer Vision', subcategory: 'Image Classification' },
      { input: 'Detect objects in surveillance camera feeds', expected: 'Computer Vision', subcategory: 'Object Detection' },
      { input: 'Segment medical images for tumor detection', expected: 'Computer Vision', subcategory: 'Semantic Segmentation' },
      { input: 'Count stars in NASA telescope images', expected: 'Computer Vision', subcategory: 'Object Detection' },
      { input: 'Categorize satellite images by terrain type', expected: 'Computer Vision', subcategory: 'Image Classification' }
    );

    // Natural Language Processing tests
    testCases.push(
      { input: 'Analyze sentiment of product reviews', expected: 'Natural Language Processing', subcategory: 'Sentiment Analysis' },
      { input: 'Classify customer support tickets by priority', expected: 'Natural Language Processing', subcategory: 'Text Classification' },
      { input: 'Generate automated responses for chatbots', expected: 'Natural Language Processing', subcategory: 'Text Generation' },
      { input: 'Extract person names from legal documents', expected: 'Natural Language Processing', subcategory: 'Named Entity Recognition' },
      { input: 'Categorize news articles by topic', expected: 'Natural Language Processing', subcategory: 'Text Classification' }
    );

    // Speech Processing tests
    testCases.push(
      { input: 'Convert meeting recordings to text', expected: 'Speech Processing', subcategory: 'Speech Recognition' },
      { input: 'Generate voice narration for audiobooks', expected: 'Speech Processing', subcategory: 'Text to Speech' },
      { input: 'Transcribe podcast episodes for subtitles', expected: 'Speech Processing', subcategory: 'Speech Recognition' },
      { input: 'Create voice assistants with speech synthesis', expected: 'Speech Processing', subcategory: 'Text to Speech' }
    );

    // Time Series Analysis tests
    testCases.push(
      { input: 'Forecast quarterly sales revenue', expected: 'Time Series Analysis', subcategory: 'Time Series Forecasting' },
      { input: 'Detect fraud in credit card transactions', expected: 'Time Series Analysis', subcategory: 'Anomaly Detection' },
      { input: 'Predict stock price movements', expected: 'Time Series Analysis', subcategory: 'Time Series Forecasting' },
      { input: 'Monitor server performance for anomalies', expected: 'Time Series Analysis', subcategory: 'Anomaly Detection' }
    );

    // Recommendation Systems tests
    testCases.push(
      { input: 'Recommend movies based on user preferences', expected: 'Recommendation Systems', subcategory: 'Collaborative Filtering' },
      { input: 'Suggest products similar to customer purchases', expected: 'Recommendation Systems', subcategory: 'Content-Based Filtering' },
      { input: 'Build personalized news feed recommendations', expected: 'Recommendation Systems', subcategory: 'Content-Based Filtering' },
      { input: 'Match users with similar viewing habits', expected: 'Recommendation Systems', subcategory: 'Collaborative Filtering' }
    );

    // Reinforcement Learning tests
    testCases.push(
      { input: 'Train AI to play chess through trial and error', expected: 'Reinforcement Learning', subcategory: 'Game Playing' },
      { input: 'Develop robot arm control for manufacturing', expected: 'Reinforcement Learning', subcategory: 'Robotics Control' },
      { input: 'Create autonomous navigation for drones', expected: 'Reinforcement Learning', subcategory: 'Robotics Control' },
      { input: 'Build game-playing AI for video games', expected: 'Reinforcement Learning', subcategory: 'Game Playing' }
    );

    // Data Preprocessing tests
    testCases.push(
      { input: 'Clean customer database by removing duplicates', expected: 'Data Preprocessing', subcategory: 'Data Cleaning' },
      { input: 'Engineer features from raw sensor data', expected: 'Data Preprocessing', subcategory: 'Feature Engineering' },
      { input: 'Handle missing values in survey responses', expected: 'Data Preprocessing', subcategory: 'Data Cleaning' },
      { input: 'Normalize and scale financial datasets', expected: 'Data Preprocessing', subcategory: 'Feature Engineering' }
    );

    return testCases;
  }

  async testModelWithTaxonomy(modelEvaluator, modelName) {
    console.log(`Testing ${modelName} with task taxonomy...`);
    
    const results = {
      modelName: modelName,
      totalTests: this.taxonomyTestCases.length,
      categoryAccuracy: {},
      subcategoryAccuracy: {},
      overallAccuracy: 0,
      confidenceDistribution: { high: 0, medium: 0, low: 0 },
      detailedResults: [],
      processingTimes: []
    };

    // Initialize category tracking
    this.taskCategories.forEach(category => {
      results.categoryAccuracy[category] = { correct: 0, total: 0, accuracy: 0 };
    });

    let totalCorrect = 0;
    let totalInferenceTime = 0;

    // Test each case
    for (const testCase of this.taxonomyTestCases) {
      const startTime = performance.now();
      const classification = await modelEvaluator.classifyText(testCase.input, this.taskCategories);
      const endTime = performance.now();
      
      const inferenceTime = endTime - startTime;
      totalInferenceTime += inferenceTime;
      
      const isCorrect = classification.success && classification.topLabel === testCase.expected;
      if (isCorrect) totalCorrect++;

      // Track category accuracy
      results.categoryAccuracy[testCase.expected].total++;
      if (isCorrect) {
        results.categoryAccuracy[testCase.expected].correct++;
      }

      // Track confidence distribution
      if (classification.success) {
        const confidence = classification.topScore;
        if (confidence >= 0.8) results.confidenceDistribution.high++;
        else if (confidence >= 0.6) results.confidenceDistribution.medium++;
        else results.confidenceDistribution.low++;
      }

      results.detailedResults.push({
        input: testCase.input,
        expected: testCase.expected,
        expectedSubcategory: testCase.subcategory,
        predicted: classification.topLabel,
        confidence: classification.topScore,
        correct: isCorrect,
        inferenceTime: inferenceTime,
        allScores: classification.result?.scores || []
      });

      results.processingTimes.push(inferenceTime);
    }

    // Calculate final metrics
    results.overallAccuracy = (totalCorrect / this.taxonomyTestCases.length) * 100;
    results.averageInferenceTime = totalInferenceTime / this.taxonomyTestCases.length;

    // Calculate per-category accuracy
    Object.keys(results.categoryAccuracy).forEach(category => {
      const categoryData = results.categoryAccuracy[category];
      categoryData.accuracy = categoryData.total > 0 ? (categoryData.correct / categoryData.total) * 100 : 0;
    });

    return results;
  }

  async runFullTaxonomyTest() {
    console.log('Running full taxonomy classification test...');
    
    const testResults = {
      taxonomyInfo: {
        totalCategories: this.taskCategories.length,
        categories: this.taskCategories,
        totalTestCases: this.taxonomyTestCases.length
      },
      distilbertResults: null,
      bartResults: null,
      comparison: null
    };

    try {
      // Load both models
      console.log('Loading DistilBERT...');
      const distilbertLoad = await this.distilbertEvaluator.loadModel();
      if (!distilbertLoad.success) {
        throw new Error(`Failed to load DistilBERT: ${distilbertLoad.error}`);
      }

      console.log('Loading BART...');
      const bartLoad = await this.bartEvaluator.loadModel();
      if (!bartLoad.success) {
        console.warn(`BART failed to load: ${bartLoad.error}`);
      }

      // Test DistilBERT
      testResults.distilbertResults = await this.testModelWithTaxonomy(
        this.distilbertEvaluator, 
        'DistilBERT MNLI'
      );

      // Test BART if loaded successfully
      if (bartLoad.success) {
        testResults.bartResults = await this.testModelWithTaxonomy(
          this.bartEvaluator, 
          'BART MNLI'
        );

        // Generate comparison
        testResults.comparison = this.compareResults(
          testResults.distilbertResults, 
          testResults.bartResults
        );
      }

      return testResults;

    } catch (error) {
      console.error('Error in taxonomy test:', error);
      throw error;
    }
  }

  compareResults(distilbertResults, bartResults) {
    if (!bartResults) return null;

    const comparison = {
      accuracyWinner: distilbertResults.overallAccuracy >= bartResults.overallAccuracy ? 'DistilBERT' : 'BART',
      speedWinner: distilbertResults.averageInferenceTime <= bartResults.averageInferenceTime ? 'DistilBERT' : 'BART',
      categoryWinners: {},
      confidenceComparison: {
        distilbert: distilbertResults.confidenceDistribution,
        bart: bartResults.confidenceDistribution
      },
      overallRecommendation: ''
    };

    // Compare per-category performance
    this.taskCategories.forEach(category => {
      const distilbertAcc = distilbertResults.categoryAccuracy[category].accuracy;
      const bartAcc = bartResults.categoryAccuracy[category].accuracy;
      comparison.categoryWinners[category] = distilbertAcc >= bartAcc ? 'DistilBERT' : 'BART';
    });

    // Generate recommendation
    const accuracyDiff = Math.abs(distilbertResults.overallAccuracy - bartResults.overallAccuracy);
    const speedDiff = Math.abs(distilbertResults.averageInferenceTime - bartResults.averageInferenceTime);

    if (accuracyDiff < 5 && speedDiff > 1000) {
      comparison.overallRecommendation = `${comparison.speedWinner} recommended for similar accuracy but better speed`;
    } else if (accuracyDiff > 10) {
      comparison.overallRecommendation = `${comparison.accuracyWinner} recommended for significantly better accuracy`;
    } else {
      comparison.overallRecommendation = 'Both models show similar performance - choose based on size constraints';
    }

    return comparison;
  }

  // Generate test cases that might be problematic for classification
  generateEdgeCases() {
    return [
      { input: 'analyze', expected: 'ambiguous' },
      { input: 'I need help with my project', expected: 'ambiguous' },
      { input: 'Process data using machine learning and computer vision', expected: 'multi-category' },
      { input: 'Build an AI system that can see, hear, and understand text', expected: 'multi-category' },
      { input: 'Create visualizations of time series forecasting results', expected: 'multi-category' }
    ];
  }
}

// Export for browser testing
if (typeof window !== 'undefined') {
  window.TaxonomyClassificationTester = TaxonomyClassificationTester;
}