import { describe, test, expect, beforeAll } from 'vitest';
import { BrowserTaskClassifier } from '../src/lib/classification/BrowserTaskClassifier.js';
import { ModelSelector } from '../src/lib/recommendation/ModelSelector.js';
import modelsData from '../src/lib/data/models.json';
import tasksData from '../src/lib/data/tasks.json';

describe('Task Classification Accuracy', () => {
  let taskClassifier;
  let modelSelector;

  beforeAll(() => {
    taskClassifier = new BrowserTaskClassifier(tasksData);
    modelSelector = new ModelSelector(modelsData);
  });

  describe('Computer Vision Tasks', () => {
    test('should classify image classification tasks correctly', async () => {
      const result = await taskClassifier.classify('I want to classify images of dogs and cats');
      
      expect(result.predictions[0].category).toBe('computer_vision');
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    test('should classify object detection tasks correctly', async () => {
      const result = await taskClassifier.classify('Detect objects in security camera footage');
      
      expect(result.predictions[0].category).toBe('computer_vision');
      expect(result.confidence).toBeGreaterThan(0.3);
    });
  });

  describe('NLP Tasks', () => {
    test('should classify text classification tasks correctly', async () => {
      const result = await taskClassifier.classify('I want to classify customer support tickets by urgency');
      
      expect(result.predictions[0].category).toBe('natural_language_processing');
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    test('should classify sentiment analysis tasks correctly', async () => {
      const result = await taskClassifier.classify('Analyze sentiment in product reviews');
      
      expect(result.predictions[0].category).toBe('natural_language_processing');
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    test('should classify text generation tasks correctly', async () => {
      const result = await taskClassifier.classify('Generate text summaries for articles');
      
      expect(result.predictions[0].category).toBe('natural_language_processing');
      expect(result.confidence).toBeGreaterThan(0.3);
    });
  });

  describe('Speech Processing Tasks', () => {
    test('should classify speech recognition tasks correctly', async () => {
      const result = await taskClassifier.classify('Convert speech to text for meeting transcripts');
      
      expect(result.predictions[0].category).toBe('speech_processing');
      expect(result.confidence).toBeGreaterThan(0.3);
    });
  });

  describe('Time Series Tasks', () => {
    test('should classify forecasting tasks correctly', async () => {
      const result = await taskClassifier.classify('Predict stock prices from historical data');
      
      expect(result.predictions[0].category).toBe('time_series');
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    test('should classify anomaly detection tasks correctly', async () => {
      const result = await taskClassifier.classify('Detect anomalies in server monitoring data');
      
      expect(result.predictions[0].category).toBe('time_series');
      expect(result.confidence).toBeGreaterThan(0.3);
    });
  });

  describe('Fallback Behavior', () => {
    test('should provide fallback predictions for unclear tasks', async () => {
      const result = await taskClassifier.classify('Help me with AI');
      
      expect(result.predictions).toHaveLength(3);
      expect(result.method).toContain('enhanced_keyword');
    });

    test('should handle empty input gracefully', async () => {
      const result = await taskClassifier.classify('');
      
      expect(result.predictions).toHaveLength(3);
      expect(result.confidence).toBeLessThan(0.5);
    });
  });
});

describe('Model Selection Logic', () => {
  let modelSelector;

  beforeAll(() => {
    modelSelector = new ModelSelector(modelsData);
  });

  describe('Smaller is Better Logic', () => {
    test('should prioritize lightweight tier models', () => {
      const models = modelSelector.selectModels('natural_language_processing', 'text_classification', 3);
      
      expect(models).toHaveLength(3);
      
      // First model should be from lightweight tier
      expect(models[0].tier).toBe('lightweight');
      
      // Models should be sorted by tier priority then by size
      for (let i = 1; i < models.length; i++) {
        const current = models[i];
        const previous = models[i - 1];
        
        if (current.tierPriority === previous.tierPriority) {
          // Same tier: smaller size should come first
          expect(current.sizeMB).toBeGreaterThanOrEqual(previous.sizeMB);
        } else {
          // Different tier: lightweight should come before standard/advanced
          expect(current.tierPriority).toBeGreaterThanOrEqual(previous.tierPriority);
        }
      }
    });

    test('should return models for all available task categories', () => {
      const testCases = [
        ['computer_vision', 'image_classification'],
        ['computer_vision', 'object_detection'],
        ['natural_language_processing', 'text_classification'],
        ['natural_language_processing', 'sentiment_analysis'],
        ['speech_processing', 'speech_recognition'],
        ['time_series', 'forecasting']
      ];

      testCases.forEach(([category, subcategory]) => {
        const models = modelSelector.selectModels(category, subcategory, 3);
        expect(models.length).toBeGreaterThan(0);
        
        // All models should have required properties
        models.forEach(model => {
          expect(model).toHaveProperty('id');
          expect(model).toHaveProperty('name');
          expect(model).toHaveProperty('sizeMB');
          expect(model).toHaveProperty('environmentalScore');
          expect(model).toHaveProperty('tier');
          expect(model).toHaveProperty('category', category);
          expect(model).toHaveProperty('subcategory', subcategory);
        });
      });
    });

    test('should handle non-existent task categories gracefully', () => {
      const models = modelSelector.selectModels('non_existent_category', 'non_existent_subcategory', 3);
      expect(models).toHaveLength(0);
    });
  });

  describe('Environmental Impact Prioritization', () => {
    test('should prioritize models with lower environmental scores', () => {
      const models = modelSelector.selectModels('computer_vision', 'image_classification', 5);
      
      // Within same tier, models with lower environmental scores should come first
      const lightweightModels = models.filter(m => m.tier === 'lightweight');
      for (let i = 1; i < lightweightModels.length; i++) {
        expect(lightweightModels[i].environmentalScore)
          .toBeGreaterThanOrEqual(lightweightModels[i - 1].environmentalScore);
      }
    });

    test('should include environmental score in all models', () => {
      const models = modelSelector.selectModels('natural_language_processing', 'text_classification', 3);
      
      models.forEach(model => {
        expect(model.environmentalScore).toBeGreaterThanOrEqual(1);
        expect(model.environmentalScore).toBeLessThanOrEqual(3);
      });
    });
  });
});

describe('Response Time Performance', () => {
  let taskClassifier;
  let modelSelector;

  beforeAll(() => {
    taskClassifier = new BrowserTaskClassifier(tasksData);
    modelSelector = new ModelSelector(modelsData);
  });

  test('should complete classification within 3 seconds', async () => {
    const startTime = Date.now();
    
    const result = await taskClassifier.classify('I want to classify customer support tickets');
    const classification = {
      category: result.subcategoryPredictions[0]?.category || result.predictions[0]?.category,
      subcategory: result.subcategoryPredictions[0]?.subcategory || 'text_classification'
    };
    
    const models = modelSelector.selectModels(classification.category, classification.subcategory, 3);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(3000); // Less than 3 seconds
    expect(models.length).toBeGreaterThan(0);
  });

  test('should handle multiple rapid classifications efficiently', async () => {
    const tasks = [
      'Classify images of animals',
      'Analyze sentiment in reviews',
      'Detect objects in photos',
      'Generate text summaries',
      'Convert speech to text'
    ];

    const startTime = Date.now();
    
    const results = await Promise.all(
      tasks.map(async (task) => {
        const result = await taskClassifier.classify(task);
        const classification = {
          category: result.subcategoryPredictions[0]?.category || result.predictions[0]?.category,
          subcategory: result.subcategoryPredictions[0]?.subcategory || 'text_classification'
        };
        return modelSelector.selectModels(classification.category, classification.subcategory, 3);
      })
    );
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(5000); // All 5 classifications in under 5 seconds
    expect(results).toHaveLength(5);
    results.forEach(models => {
      expect(models.length).toBeGreaterThan(0);
    });
  });
});