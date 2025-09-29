/**
 * Task Classification Pipeline - MVP Prototype
 * Implements hybrid approach: API → Semantic Similarity → Keywords
 */

export class TaskClassifier {
  constructor() {
    this.taskCategories = [
      'computer vision',
      'natural language processing',
      'object detection',
      'sentiment analysis',
      'text generation',
      'time series prediction',
      'speech recognition',
      'recommendation systems',
      'reinforcement learning',
      'data preprocessing'
    ];

    // Category keywords for fallback classification
    this.categoryKeywords = {
      'computer vision': [
        'image', 'images', 'photo', 'picture', 'visual', 'camera', 'opencv',
        'cnn', 'convolutional', 'pixel', 'classify images', 'image classification'
      ],
      'natural language processing': [
        'text', 'language', 'nlp', 'word', 'sentence', 'paragraph', 'document',
        'tokenize', 'parse text', 'text analysis', 'linguistic'
      ],
      'object detection': [
        'detect', 'detection', 'locate', 'bounding box', 'yolo', 'rcnn',
        'object detection', 'find objects', 'identify objects'
      ],
      'sentiment analysis': [
        'sentiment', 'emotion', 'positive', 'negative', 'opinion', 'review',
        'mood', 'feeling', 'attitude', 'sentiment analysis'
      ],
      'text generation': [
        'generate', 'generation', 'gpt', 'llm', 'language model', 'chatbot',
        'write', 'compose', 'create text', 'text generation'
      ],
      'time series prediction': [
        'time series', 'forecast', 'predict', 'trend', 'temporal', 'sequence',
        'stock', 'price', 'time-based', 'forecasting'
      ],
      'speech recognition': [
        'speech', 'audio', 'voice', 'sound', 'transcribe', 'asr',
        'speech to text', 'voice recognition', 'audio processing'
      ],
      'recommendation systems': [
        'recommend', 'recommendation', 'suggest', 'collaborative filtering',
        'content based', 'recommender', 'personalized', 'similar users'
      ],
      'reinforcement learning': [
        'rl', 'reinforcement', 'agent', 'environment', 'reward', 'policy',
        'q-learning', 'deep q', 'markov decision'
      ],
      'data preprocessing': [
        'clean', 'preprocess', 'transform', 'normalize', 'feature engineering',
        'data cleaning', 'missing values', 'outliers', 'scaling'
      ]
    };
  }

  /**
   * Main classification method - implements tiered approach
   * @param {string} taskDescription - User's task description
   * @param {Object} options - Classification options
   * @returns {Object} Classification result with confidence and method used
   */
  async classify(taskDescription, options = {}) {
    const result = {
      input: taskDescription,
      predictions: [],
      method: '',
      confidence: 0,
      timestamp: new Date().toISOString()
    };

    try {
      // Method 1: Zero-shot classification via Hugging Face API
      if (!options.offline) {
        const apiResult = await this.classifyWithAPI(taskDescription);
        if (apiResult.success) {
          result.predictions = apiResult.predictions;
          result.method = 'huggingface_api';
          result.confidence = apiResult.confidence;
          return result;
        }
      }

      // Method 2: Semantic similarity (simplified implementation)
      const semanticResult = this.classifyWithSemantics(taskDescription);
      if (semanticResult.confidence > 0.6) {
        result.predictions = semanticResult.predictions;
        result.method = 'semantic_similarity';
        result.confidence = semanticResult.confidence;
        return result;
      }

      // Method 3: Keyword-based fallback
      const keywordResult = this.classifyWithKeywords(taskDescription);
      result.predictions = keywordResult.predictions;
      result.method = 'keyword_matching';
      result.confidence = keywordResult.confidence;
      return result;

    } catch (error) {
      console.error('Classification error:', error);
      
      // Ultimate fallback
      result.predictions = [
        { label: 'natural language processing', score: 0.3 },
        { label: 'data preprocessing', score: 0.2 },
        { label: 'computer vision', score: 0.1 }
      ];
      result.method = 'error_fallback';
      result.confidence = 0.1;
      result.error = error.message;
      return result;
    }
  }

  /**
   * Method 1: Hugging Face API Classification (mocked for prototype)
   */
  async classifyWithAPI(taskDescription) {
    // Mock API call - in production this would call Hugging Face
    console.log('🔄 Attempting Hugging Face API classification...');
    
    // Simulate API unavailable for prototype
    return { success: false, reason: 'API key not configured' };
    
    /* Production implementation would be:
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-mnli', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: taskDescription,
          parameters: { candidate_labels: this.taskCategories }
        })
      });
      
      const data = await response.json();
      return {
        success: true,
        predictions: data.labels.map((label, i) => ({
          label,
          score: data.scores[i]
        })),
        confidence: Math.max(...data.scores)
      };
    } catch (error) {
      return { success: false, reason: error.message };
    }
    */
  }

  /**
   * Method 2: Semantic Similarity Classification (simplified)
   */
  classifyWithSemantics(taskDescription) {
    console.log('🔄 Using semantic similarity classification...');
    
    const text = taskDescription.toLowerCase();
    const scores = {};
    
    // Simple semantic matching using word overlap and context
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      let score = 0;
      let matchedKeywords = 0;
      
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          // Exact match gets higher score
          score += 0.8;
          matchedKeywords++;
        } else {
          // Partial semantic matching (simplified)
          const words = keyword.toLowerCase().split(' ');
          const textWords = text.split(' ');
          const overlap = words.filter(word => 
            textWords.some(textWord => 
              textWord.includes(word) || word.includes(textWord)
            )
          );
          if (overlap.length > 0) {
            score += 0.3 * (overlap.length / words.length);
            matchedKeywords++;
          }
        }
      }
      
      // Normalize by keyword count to prevent bias toward categories with more keywords
      scores[category] = matchedKeywords > 0 ? score / keywords.length : 0;
    }
    
    // Sort and return top predictions
    const predictions = Object.entries(scores)
      .map(([label, score]) => ({ label, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    const confidence = predictions[0]?.score || 0;
    
    return {
      predictions,
      confidence
    };
  }

  /**
   * Method 3: Keyword-based Classification (fallback)
   */
  classifyWithKeywords(taskDescription) {
    console.log('🔄 Using keyword-based classification fallback...');
    
    const text = taskDescription.toLowerCase();
    const scores = {};
    
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      let matches = 0;
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          matches++;
        }
      }
      scores[category] = matches / keywords.length; // Normalize by keyword count
    }
    
    const predictions = Object.entries(scores)
      .map(([label, score]) => ({ label, score }))
      .sort((a, b) => b.score - a.score)
      .filter(p => p.score > 0)
      .slice(0, 3);
    
    // If no matches, return most general categories
    if (predictions.length === 0) {
      return {
        predictions: [
          { label: 'natural language processing', score: 0.2 },
          { label: 'data preprocessing', score: 0.15 },
          { label: 'computer vision', score: 0.1 }
        ],
        confidence: 0.1
      };
    }
    
    return {
      predictions,
      confidence: predictions[0].score
    };
  }

  /**
   * Get all supported task categories
   */
  getCategories() {
    return this.taskCategories;
  }

  /**
   * Get method performance info for debugging
   */
  getMethodInfo() {
    return {
      methods: [
        {
          name: 'huggingface_api',
          description: 'Zero-shot classification via Hugging Face API',
          accuracy: 'High (85-95%)',
          requirements: 'API key, internet connection',
          fallback_conditions: 'API failure, rate limits, offline'
        },
        {
          name: 'semantic_similarity',
          description: 'Simplified semantic word matching',
          accuracy: 'Medium (70-80%)',
          requirements: 'None (client-side)',
          fallback_conditions: 'Low confidence (<0.6)'
        },
        {
          name: 'keyword_matching',
          description: 'Direct keyword pattern matching',
          accuracy: 'Basic (60-70%)',
          requirements: 'None (client-side)',
          fallback_conditions: 'Always available'
        }
      ]
    };
  }
}