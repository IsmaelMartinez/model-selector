/**
 * Test Data Generator
 * Generates test cases from tasks.json for validation experiments
 */

import tasksData from '../../data/tasks.json' with { type: 'json' };
import { SPIKE_CONFIG } from '../spike-config.js';

export class TestDataGenerator {
  constructor() {
    this.taxonomy = tasksData.taskTaxonomy;
    this.mappingRules = tasksData.taskMappingRules;
    this.edgeCases = SPIKE_CONFIG.testData.edgeCases;
  }

  /**
   * Extract all examples from tasks.json
   * @param {Object} options - Options for extraction
   * @param {boolean} options.includeKeywords - Include keyword-derived examples (default: false)
   * @param {boolean} options.onlyGoodKeywords - Only include multi-word keywords as-is (default: true)
   * @returns {Array} - Array of { text, category, subcategory, source }
   */
  getAllExamples(options = {}) {
    const { includeKeywords = false, onlyGoodKeywords = true } = options;
    const examples = [];
    
    for (const [category, categoryData] of Object.entries(this.taxonomy)) {
      for (const [subcategory, subcategoryData] of Object.entries(categoryData.subcategories)) {
        // Add explicit examples (these are always good quality)
        if (subcategoryData.examples) {
          for (const example of subcategoryData.examples) {
            examples.push({
              text: example,
              category,
              subcategory,
              source: 'example'
            });
          }
        }
        
        // Optionally add keywords
        if (includeKeywords && subcategoryData.keywords) {
          for (const keyword of subcategoryData.keywords) {
            if (onlyGoodKeywords) {
              // Only use keywords that are already good phrases (3+ words)
              // or are well-known terms that stand alone
              const wordCount = keyword.split(' ').length;
              const isGoodPhrase = wordCount >= 3 || 
                this.isStandaloneKeyword(keyword);
              
              if (isGoodPhrase) {
                examples.push({
                  text: keyword,
                  category,
                  subcategory,
                  source: 'keyword'
                });
              }
            } else {
              // Legacy behavior: convert all keywords to phrases (NOT recommended)
              const phrase = this.keywordToPhrase(keyword, categoryData.label, subcategoryData.label);
              examples.push({
                text: phrase,
                category,
                subcategory,
                source: 'keyword'
              });
            }
          }
        }
      }
    }
    
    return examples;
  }

  /**
   * Check if a keyword is a well-known standalone term
   * @param {string} keyword - Keyword to check
   * @returns {boolean} - True if it's a good standalone term
   */
  isStandaloneKeyword(keyword) {
    const standaloneTerms = [
      // Well-known task types
      'sentiment analysis', 'object detection', 'image classification',
      'speech recognition', 'text classification', 'named entity recognition',
      'semantic segmentation', 'anomaly detection', 'fraud detection',
      'collaborative filtering', 'feature engineering', 'data cleaning',
      // Well-known techniques
      'time series forecasting', 'speech to text', 'text to speech',
      'image segmentation', 'voice recognition'
    ];
    return standaloneTerms.includes(keyword.toLowerCase());
  }

  /**
   * Convert a keyword to a more natural phrase
   * @param {string} keyword - Raw keyword
   * @param {string} categoryLabel - Category label
   * @param {string} subcategoryLabel - Subcategory label
   * @returns {string} - Natural phrase
   */
  keywordToPhrase(keyword, categoryLabel, subcategoryLabel) {
    // Some keywords are already phrases
    if (keyword.includes(' ')) {
      return keyword;
    }
    
    // For single words, create a task-like phrase
    const taskPhrases = [
      `${keyword} task`,
      `perform ${keyword}`,
      `I need to ${keyword}`,
      `${keyword} for my project`
    ];
    
    // Return a deterministic phrase based on keyword hash
    const hash = keyword.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return taskPhrases[hash % taskPhrases.length];
  }

  /**
   * Get examples grouped by category
   * @returns {Object} - { category: [examples] }
   */
  getExamplesByCategory() {
    const examples = this.getAllExamples();
    const grouped = {};
    
    for (const example of examples) {
      if (!grouped[example.category]) {
        grouped[example.category] = [];
      }
      grouped[example.category].push(example);
    }
    
    return grouped;
  }

  /**
   * Sample N examples per category
   * @param {number} n - Number of examples per category
   * @param {Object} options - Sampling options
   * @returns {Array} - Sampled examples
   */
  sampleExamplesPerCategory(n, options = {}) {
    const grouped = this.getExamplesByCategory();
    const sampled = [];
    const seed = options.seed || 42;
    
    for (const [category, examples] of Object.entries(grouped)) {
      // Deterministic shuffle based on seed
      const shuffled = this.seededShuffle([...examples], seed);
      
      // Take up to n examples
      const categoryExamples = shuffled.slice(0, n);
      sampled.push(...categoryExamples);
      
      // If we don't have enough, duplicate some
      if (categoryExamples.length < n && options.allowDuplicates) {
        let i = 0;
        while (sampled.filter(e => e.category === category).length < n) {
          sampled.push({ ...examples[i % examples.length] });
          i++;
        }
      }
    }
    
    return sampled;
  }

  /**
   * Generate leave-one-out cross-validation splits
   * @returns {Array} - Array of { train, test } splits
   */
  generateLeaveOneOutSplits() {
    const examples = this.getAllExamples();
    const splits = [];
    
    for (let i = 0; i < examples.length; i++) {
      const test = examples[i];
      const train = [...examples.slice(0, i), ...examples.slice(i + 1)];
      splits.push({ train, test });
    }
    
    return splits;
  }

  /**
   * Generate k-fold cross-validation splits
   * @param {number} k - Number of folds
   * @returns {Array} - Array of { train, test } splits
   */
  generateKFoldSplits(k = 5) {
    const examples = this.seededShuffle([...this.getAllExamples()], 42);
    const foldSize = Math.ceil(examples.length / k);
    const splits = [];
    
    for (let i = 0; i < k; i++) {
      const testStart = i * foldSize;
      const testEnd = Math.min(testStart + foldSize, examples.length);
      const test = examples.slice(testStart, testEnd);
      const train = [...examples.slice(0, testStart), ...examples.slice(testEnd)];
      splits.push({ train, test });
    }
    
    return splits;
  }

  /**
   * Get edge cases for testing
   * @returns {Array} - Edge case test cases
   */
  getEdgeCases() {
    return this.edgeCases.map(ec => ({
      text: ec.input,
      expectedCategory: ec.expectedCategory,
      description: ec.description,
      source: 'edge_case'
    }));
  }

  /**
   * Get all test cases (examples + edge cases)
   * @returns {Array} - All test cases
   */
  getAllTestCases() {
    return [
      ...this.getAllExamples(),
      ...this.getEdgeCases()
    ];
  }

  /**
   * Get category statistics
   * @returns {Object} - Statistics per category
   */
  getCategoryStats() {
    const grouped = this.getExamplesByCategory();
    const stats = {};
    
    for (const [category, examples] of Object.entries(grouped)) {
      const exampleSources = examples.filter(e => e.source === 'example');
      const keywordSources = examples.filter(e => e.source === 'keyword');
      
      stats[category] = {
        total: examples.length,
        fromExamples: exampleSources.length,
        fromKeywords: keywordSources.length,
        subcategories: [...new Set(examples.map(e => e.subcategory))].length
      };
    }
    
    return stats;
  }

  /**
   * Seeded random shuffle (Fisher-Yates)
   * @param {Array} array - Array to shuffle
   * @param {number} seed - Random seed
   * @returns {Array} - Shuffled array
   */
  seededShuffle(array, seed) {
    const random = this.seededRandom(seed);
    
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    
    return array;
  }

  /**
   * Create a seeded random number generator
   * @param {number} seed - Random seed
   * @returns {Function} - Random function
   */
  seededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 1103515245 + 12345) % 2147483648;
      return state / 2147483648;
    };
  }

  /**
   * Generate synthetic examples by paraphrasing
   * @param {number} count - Number of synthetic examples per category
   * @returns {Array} - Synthetic examples
   */
  generateSyntheticExamples(count = 5) {
    const templates = {
      computer_vision: [
        'analyze images to find {object}',
        'detect {object} in photos',
        'classify images by {attribute}',
        'identify {object} in pictures',
        'recognize {object} from camera'
      ],
      natural_language_processing: [
        'analyze text for {attribute}',
        'extract {entity} from documents',
        'classify text by {attribute}',
        'understand {language} text',
        'process written {content}'
      ],
      speech_processing: [
        'convert {audio} to text',
        'recognize {language} speech',
        'transcribe {audio} recordings',
        'generate speech from {content}',
        'analyze {audio} content'
      ],
      time_series: [
        'predict future {metric}',
        'forecast {metric} trends',
        'detect anomalies in {metric}',
        'analyze temporal {data}',
        'predict {metric} patterns'
      ],
      recommendation_systems: [
        'recommend {items} to users',
        'suggest {items} based on preferences',
        'personalize {content} recommendations',
        'match users with {items}',
        'find similar {items}'
      ],
      reinforcement_learning: [
        'train agent to {action}',
        'optimize {process} through learning',
        'learn optimal {strategy}',
        'control {system} autonomously',
        'play {game} using AI'
      ],
      data_preprocessing: [
        'clean {data} for analysis',
        'prepare {data} for training',
        'transform {features} in dataset',
        'handle missing {values}',
        'normalize {data} values'
      ]
    };

    const placeholders = {
      object: ['faces', 'cars', 'animals', 'products', 'defects'],
      attribute: ['sentiment', 'topic', 'category', 'intent', 'quality'],
      entity: ['names', 'dates', 'locations', 'organizations', 'keywords'],
      language: ['English', 'multiple', 'natural', 'spoken', 'written'],
      content: ['text', 'documents', 'articles', 'messages', 'reviews'],
      audio: ['voice', 'speech', 'audio', 'recording', 'sound'],
      metric: ['sales', 'prices', 'demand', 'traffic', 'usage'],
      data: ['time series', 'sequential', 'temporal', 'historical', 'sensor'],
      items: ['movies', 'products', 'songs', 'articles', 'books'],
      action: ['walk', 'navigate', 'play', 'optimize', 'control'],
      process: ['routing', 'scheduling', 'allocation', 'planning', 'decisions'],
      strategy: ['policy', 'behavior', 'actions', 'moves', 'decisions'],
      system: ['robot', 'vehicle', 'game', 'process', 'agent'],
      game: ['chess', 'video games', 'board games', 'strategy games', 'puzzles'],
      features: ['numerical', 'categorical', 'text', 'image', 'mixed'],
      values: ['values', 'data points', 'entries', 'records', 'samples']
    };

    const synthetic = [];

    for (const [category, categoryTemplates] of Object.entries(templates)) {
      for (let i = 0; i < count; i++) {
        const template = categoryTemplates[i % categoryTemplates.length];
        const text = template.replace(/\{(\w+)\}/g, (match, key) => {
          const options = placeholders[key] || [key];
          return options[i % options.length];
        });
        
        synthetic.push({
          text,
          category,
          subcategory: null,
          source: 'synthetic'
        });
      }
    }

    return synthetic;
  }
}

export default TestDataGenerator;

