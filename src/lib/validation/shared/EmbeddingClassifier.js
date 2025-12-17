/**
 * Embedding-based Task Classifier
 * Uses sentence embeddings for similarity-based classification
 */

import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js for Node.js environment
env.allowLocalModels = true;
env.useBrowserCache = false;

export class EmbeddingClassifier {
  constructor(options = {}) {
    this.modelName = options.modelName || 'Xenova/all-MiniLM-L6-v2';
    this.topK = options.topK || 5;
    this.votingMethod = options.votingMethod || 'weighted'; // 'simple' or 'weighted'
    
    this.embedder = null;
    this.referenceEmbeddings = [];
    this.initialized = false;
    
    // Performance metrics
    this.metrics = {
      loadTimeMs: 0,
      embeddingTimeMs: 0,
      classificationCount: 0
    };
  }

  /**
   * Initialize the embedding model and compute reference embeddings
   * @param {Array} referenceExamples - Array of { text, category, subcategory }
   */
  async initialize(referenceExamples) {
    const startTime = Date.now();
    
    console.log(`Loading embedding model: ${this.modelName}...`);
    
    try {
      this.embedder = await pipeline('feature-extraction', this.modelName, {
        quantized: true // Use quantized model for smaller size
      });
      
      const modelLoadTime = Date.now() - startTime;
      console.log(`Model loaded in ${modelLoadTime}ms`);
      
      // Compute embeddings for all reference examples
      console.log(`Computing embeddings for ${referenceExamples.length} reference examples...`);
      const embeddingStartTime = Date.now();
      
      for (const example of referenceExamples) {
        const embedding = await this.getEmbedding(example.text);
        this.referenceEmbeddings.push({
          text: example.text,
          category: example.category,
          subcategory: example.subcategory,
          embedding
        });
      }
      
      this.metrics.loadTimeMs = Date.now() - startTime;
      this.metrics.embeddingTimeMs = Date.now() - embeddingStartTime;
      
      console.log(`Reference embeddings computed in ${this.metrics.embeddingTimeMs}ms`);
      this.initialized = true;
      
      return {
        success: true,
        loadTimeMs: this.metrics.loadTimeMs,
        referenceCount: this.referenceEmbeddings.length
      };
    } catch (error) {
      console.error('Failed to initialize embedding classifier:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get embedding vector for a text input
   * @param {string} text - Input text to embed
   * @returns {Float32Array} - Normalized embedding vector
   */
  async getEmbedding(text) {
    if (!this.embedder) {
      throw new Error('Embedder not initialized. Call initialize() first.');
    }
    
    const output = await this.embedder(text, {
      pooling: 'mean',
      normalize: true
    });
    
    // Extract the embedding array
    return Array.from(output.data);
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {Array} a - First vector
   * @param {Array} b - Second vector
   * @returns {number} - Cosine similarity (0-1)
   */
  cosineSimilarity(a, b) {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;
    
    return dotProduct / denominator;
  }

  /**
   * Classify input text using embedding similarity
   * @param {string} input - Text to classify
   * @param {Object} options - Classification options
   * @returns {Object} - Classification result
   */
  async classify(input, options = {}) {
    if (!this.initialized) {
      throw new Error('Classifier not initialized. Call initialize() first.');
    }
    
    const startTime = Date.now();
    const topK = options.topK || this.topK;
    const votingMethod = options.votingMethod || this.votingMethod;
    
    // Get embedding for input
    const inputEmbedding = await this.getEmbedding(input);
    
    // Calculate similarities with all reference examples
    const similarities = this.referenceEmbeddings.map(ref => ({
      text: ref.text,
      category: ref.category,
      subcategory: ref.subcategory,
      similarity: this.cosineSimilarity(inputEmbedding, ref.embedding)
    }));
    
    // Sort by similarity (highest first)
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    // Get top-k matches
    const topMatches = similarities.slice(0, topK);
    
    // Vote for category
    const categoryVotes = this.aggregateVotes(topMatches, votingMethod);
    
    // Get top categories sorted by score
    const topCategories = Object.entries(categoryVotes)
      .map(([category, score]) => ({ category, score }))
      .sort((a, b) => b.score - a.score);
    
    // Calculate confidence based on top category score
    const confidence = topCategories.length > 0 ? topCategories[0].score : 0;
    const confidenceLevel = this.getConfidenceLevel(confidence);
    
    this.metrics.classificationCount++;
    
    const processingTime = Date.now() - startTime;
    
    return {
      input,
      category: topCategories[0]?.category || null,
      subcategory: this.getMostLikelySubcategory(topMatches, topCategories[0]?.category),
      confidence,
      confidenceLevel,
      topCategories: topCategories.slice(0, 3),
      similarExamples: topMatches.map(m => ({
        text: m.text,
        category: m.category,
        similarity: m.similarity
      })),
      method: 'embedding_similarity',
      votingMethod,
      topK,
      processingTimeMs: processingTime
    };
  }

  /**
   * Aggregate votes from top-k matches
   * @param {Array} matches - Top-k similar examples
   * @param {string} method - 'simple' or 'weighted'
   * @returns {Object} - Category scores
   */
  aggregateVotes(matches, method) {
    const votes = {};
    
    if (method === 'simple') {
      // Simple majority voting
      for (const match of matches) {
        votes[match.category] = (votes[match.category] || 0) + 1;
      }
      // Normalize to 0-1
      const maxVotes = Math.max(...Object.values(votes));
      for (const category in votes) {
        votes[category] = votes[category] / matches.length;
      }
    } else {
      // Weighted voting by similarity score
      let totalWeight = 0;
      for (const match of matches) {
        votes[match.category] = (votes[match.category] || 0) + match.similarity;
        totalWeight += match.similarity;
      }
      // Normalize to 0-1
      if (totalWeight > 0) {
        for (const category in votes) {
          votes[category] = votes[category] / totalWeight;
        }
      }
    }
    
    return votes;
  }

  /**
   * Get most likely subcategory for a given category
   * @param {Array} matches - Top-k matches
   * @param {string} category - Selected category
   * @returns {string|null} - Most likely subcategory
   */
  getMostLikelySubcategory(matches, category) {
    if (!category) return null;
    
    const categoryMatches = matches.filter(m => m.category === category);
    if (categoryMatches.length === 0) return null;
    
    // Count subcategory votes
    const subcategoryVotes = {};
    for (const match of categoryMatches) {
      if (match.subcategory) {
        subcategoryVotes[match.subcategory] = 
          (subcategoryVotes[match.subcategory] || 0) + match.similarity;
      }
    }
    
    // Return most voted subcategory
    const sorted = Object.entries(subcategoryVotes)
      .sort((a, b) => b[1] - a[1]);
    
    return sorted[0]?.[0] || null;
  }

  /**
   * Get confidence level label
   * @param {number} confidence - Confidence score (0-1)
   * @returns {string} - 'high', 'medium', or 'low'
   */
  getConfidenceLevel(confidence) {
    if (confidence >= 0.85) return 'high';
    if (confidence >= 0.70) return 'medium';
    return 'low';
  }

  /**
   * Get classifier metrics
   * @returns {Object} - Performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      modelName: this.modelName,
      referenceCount: this.referenceEmbeddings.length,
      initialized: this.initialized
    };
  }

  /**
   * Reset classifier state
   */
  reset() {
    this.embedder = null;
    this.referenceEmbeddings = [];
    this.initialized = false;
    this.metrics = {
      loadTimeMs: 0,
      embeddingTimeMs: 0,
      classificationCount: 0
    };
  }
}

export default EmbeddingClassifier;

