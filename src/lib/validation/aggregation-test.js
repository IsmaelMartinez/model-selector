/**
 * Technical Feasibility Validation for Static Data Aggregation Approach
 * Tests that our MVP can work entirely client-side without real-time API calls
 */

import { BrowserTaskClassifier } from '../classification/BrowserTaskClassifier.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load static data files
const tasksData = JSON.parse(readFileSync(join(__dirname, '../data/tasks.json'), 'utf8'));
const modelsData = JSON.parse(readFileSync(join(__dirname, '../data/models.json'), 'utf8'));

export class AggregationValidator {
  constructor() {
    this.classifier = new BrowserTaskClassifier();
    this.tasksData = tasksData;
    this.modelsData = modelsData;
  }

  /**
   * Main validation function - tests all aspects of aggregation approach
   */
  async validateTechnicalFeasibility() {
    const results = {
      timestamp: new Date().toISOString(),
      tests: [],
      overallResult: 'PENDING',
      recommendations: []
    };

    console.log('🚀 Starting Technical Feasibility Validation...\n');

    try {
      // Test 1: Static Data Loading
      const dataLoadTest = this.testStaticDataLoading();
      results.tests.push(dataLoadTest);
      console.log(`✅ Test 1 - Static Data Loading: ${dataLoadTest.result}`);

      // Test 2: Classification Pipeline (Offline)
      const classificationTest = await this.testOfflineClassification();
      results.tests.push(classificationTest);
      console.log(`✅ Test 2 - Offline Classification: ${classificationTest.result}`);

      // Test 3: Model Recommendation Generation
      const recommendationTest = this.testModelRecommendation();
      results.tests.push(recommendationTest);
      console.log(`✅ Test 3 - Model Recommendation: ${recommendationTest.result}`);

      // Test 4: Data Structure Validation
      const structureTest = this.testDataStructureIntegrity();
      results.tests.push(structureTest);
      console.log(`✅ Test 4 - Data Structure Integrity: ${structureTest.result}`);

      // Test 5: Performance Estimation
      const performanceTest = this.testPerformanceMetrics();
      results.tests.push(performanceTest);
      console.log(`✅ Test 5 - Performance Metrics: ${performanceTest.result}`);

      // Calculate overall result
      const failedTests = results.tests.filter(test => test.result === 'FAIL');
      results.overallResult = failedTests.length === 0 ? 'PASS' : 'FAIL';

      // Generate recommendations based on results
      results.recommendations = this.generateTechnicalRecommendations(results.tests);

      console.log(`\n🏆 Overall Result: ${results.overallResult}`);
      console.log('\n📋 Technical Recommendations:');
      results.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });

      return results;

    } catch (error) {
      console.error('❌ Validation failed with error:', error);
      results.overallResult = 'ERROR';
      results.error = error.message;
      return results;
    }
  }

  /**
   * Test 1: Verify static JSON files can be loaded and parsed
   */
  testStaticDataLoading() {
    const test = {
      name: 'Static Data Loading',
      result: 'PENDING',
      details: {}
    };

    try {
      // Check tasks.json structure
      test.details.taskDataValid = !!(
        this.tasksData.taskTaxonomy &&
        this.tasksData.taskMappingRules &&
        Object.keys(this.tasksData.taskTaxonomy).length > 0
      );

      // Check models.json structure
      test.details.modelDataValid = !!(
        this.modelsData.models &&
        this.modelsData.tiers &&
        this.modelsData.environmentalImpact
      );

      // Check data sizes (for bundle size estimation)
      const tasksSize = JSON.stringify(this.tasksData).length;
      const modelsSize = JSON.stringify(this.modelsData).length;
      const totalSize = tasksSize + modelsSize;

      test.details.dataSize = {
        tasks: `${(tasksSize / 1024).toFixed(2)} KB`,
        models: `${(modelsSize / 1024).toFixed(2)} KB`,
        total: `${(totalSize / 1024).toFixed(2)} KB`,
        withinBudget: totalSize < 500 * 1024 // 500KB budget for data
      };

      test.result = (
        test.details.taskDataValid &&
        test.details.modelDataValid &&
        test.details.dataSize.withinBudget
      ) ? 'PASS' : 'FAIL';

    } catch (error) {
      test.result = 'FAIL';
      test.details.error = error.message;
    }

    return test;
  }

  /**
   * Test 2: Verify classification works offline without API calls
   */
  async testOfflineClassification() {
    const test = {
      name: 'Offline Classification',
      result: 'PENDING',
      details: { testCases: [] }
    };

    const testCases = [
      'I want to classify customer support emails',
      'Detect objects in security camera footage', 
      'Generate product descriptions from features',
      'Predict stock prices for next month',
      'Convert speech to text for meeting notes'
    ];

    try {
      for (const testCase of testCases) {
        const startTime = Date.now();
        const result = await this.classifier.classify(testCase, { offline: true });
        const duration = Date.now() - startTime;

        const caseResult = {
          input: testCase,
          predictions: result.predictions,
          method: result.method,
          confidence: result.confidence,
          duration: `${duration}ms`,
          success: result.confidence > 0.1 && result.method !== 'huggingface_api'
        };

        test.details.testCases.push(caseResult);
      }

      const successfulCases = test.details.testCases.filter(c => c.success);
      test.details.successRate = `${successfulCases.length}/${testCases.length}`;
      test.result = successfulCases.length >= testCases.length * 0.6 ? 'PASS' : 'FAIL';

    } catch (error) {
      test.result = 'FAIL';
      test.details.error = error.message;
    }

    return test;
  }

  /**
   * Test 3: Verify model recommendations can be generated from static data
   */
  testModelRecommendation() {
    const test = {
      name: 'Model Recommendation Generation',
      result: 'PENDING',
      details: { scenarios: [] }
    };

    try {
      // Test different task scenarios
      const scenarios = [
        { category: 'computer_vision', subcategory: 'image_classification' },
        { category: 'natural_language_processing', subcategory: 'text_classification' },
        { category: 'speech_processing', subcategory: 'speech_recognition' }
      ];

      for (const scenario of scenarios) {
        const models = this.modelsData.models[scenario.category]?.[scenario.subcategory];
        
        if (models) {
          const lightweightModels = models.lightweight || [];
          const standardModels = models.standard || [];
          const advancedModels = models.advanced || [];
          
          const totalModels = lightweightModels.length + standardModels.length + advancedModels.length;
          
          test.details.scenarios.push({
            category: scenario.category,
            subcategory: scenario.subcategory,
            totalModels,
            tiersAvailable: {
              lightweight: lightweightModels.length,
              standard: standardModels.length,
              advanced: advancedModels.length
            },
            hasRecommendations: totalModels > 0
          });
        }
      }

      const validScenarios = test.details.scenarios.filter(s => s.hasRecommendations);
      test.details.coverage = `${validScenarios.length}/${scenarios.length} categories covered`;
      test.result = validScenarios.length >= scenarios.length * 0.8 ? 'PASS' : 'FAIL';

    } catch (error) {
      test.result = 'FAIL';
      test.details.error = error.message;
    }

    return test;
  }

  /**
   * Test 4: Validate data structure integrity and completeness
   */
  testDataStructureIntegrity() {
    const test = {
      name: 'Data Structure Integrity',
      result: 'PENDING',
      details: {}
    };

    try {
      // Check required fields in models
      let modelValidationErrors = [];
      let totalModels = 0;

      for (const [category, subcategories] of Object.entries(this.modelsData.models)) {
        for (const [subcategory, tiers] of Object.entries(subcategories)) {
          for (const [tier, models] of Object.entries(tiers)) {
            for (const model of models) {
              totalModels++;
              const requiredFields = ['id', 'name', 'huggingFaceId', 'sizeMB', 'environmentalScore'];
              for (const field of requiredFields) {
                if (!model[field]) {
                  modelValidationErrors.push(`${category}.${subcategory}.${tier}: Missing ${field} in model ${model.id || 'unnamed'}`);
                }
              }
            }
          }
        }
      }

      test.details.totalModels = totalModels;
      test.details.modelValidationErrors = modelValidationErrors;

      // Check environmental impact mapping
      const envScores = new Set();
      for (const [category, subcategories] of Object.entries(this.modelsData.models)) {
        for (const [subcategory, tiers] of Object.entries(subcategories)) {
          for (const [tier, models] of Object.entries(tiers)) {
            models.forEach(model => envScores.add(model.environmentalScore));
          }
        }
      }

      test.details.environmentalScores = Array.from(envScores).sort();
      test.details.environmentalMappingValid = test.details.environmentalScores.length > 0;

      test.result = (
        modelValidationErrors.length === 0 &&
        totalModels >= 10 &&
        test.details.environmentalMappingValid
      ) ? 'PASS' : 'FAIL';

    } catch (error) {
      test.result = 'FAIL';
      test.details.error = error.message;
    }

    return test;
  }

  /**
   * Test 5: Estimate performance characteristics
   */
  testPerformanceMetrics() {
    const test = {
      name: 'Performance Metrics',
      result: 'PENDING',
      details: {}
    };

    try {
      // Estimate bundle size impact
      const tasksSize = JSON.stringify(this.tasksData).length;
      const modelsSize = JSON.stringify(this.modelsData).length;
      const classifierSize = 5000; // Estimated TaskClassifier.js size
      
      const estimatedBundleImpact = tasksSize + modelsSize + classifierSize;

      test.details.bundleImpact = {
        estimatedAdditionalSize: `${(estimatedBundleImpact / 1024).toFixed(2)} KB`,
        withinMVPBudget: estimatedBundleImpact < 100 * 1024, // 100KB MVP budget
        acceptable: estimatedBundleImpact < 500 * 1024 // 500KB acceptable
      };

      // Test classification speed (approximate)
      const startTime = Date.now();
      this.classifier.classifyWithKeywords('test classification speed');
      const classificationTime = Date.now() - startTime;

      test.details.performance = {
        keywordClassificationTime: `${classificationTime}ms`,
        acceptableSpeed: classificationTime < 100 // <100ms acceptable
      };

      test.result = (
        test.details.bundleImpact.acceptable &&
        test.details.performance.acceptableSpeed
      ) ? 'PASS' : 'FAIL';

    } catch (error) {
      test.result = 'FAIL';
      test.details.error = error.message;
    }

    return test;
  }

  /**
   * Generate technical recommendations based on test results
   */
  generateTechnicalRecommendations(tests) {
    const recommendations = [];

    const dataLoadTest = tests.find(t => t.name === 'Static Data Loading');
    if (dataLoadTest?.result === 'FAIL') {
      recommendations.push('Optimize JSON data structure to reduce bundle size');
    }

    const classificationTest = tests.find(t => t.name === 'Offline Classification');
    if (classificationTest?.result === 'FAIL') {
      recommendations.push('Improve keyword matching algorithms for better offline classification');
    }

    const recommendationTest = tests.find(t => t.name === 'Model Recommendation Generation');
    if (recommendationTest?.result === 'FAIL') {
      recommendations.push('Add more model coverage across task categories');
    }

    const performanceTest = tests.find(t => t.name === 'Performance Metrics');
    if (performanceTest?.details?.bundleImpact?.withinMVPBudget === false) {
      recommendations.push('Consider lazy loading or splitting model data by category');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Static aggregation approach is technically feasible for MVP');
      recommendations.push('Ready to proceed with Parent Task 2 implementation');
    }

    return recommendations;
  }
}

// Export for testing usage
export async function runAggregationValidation() {
  const validator = new AggregationValidator();
  return await validator.validateTechnicalFeasibility();
}