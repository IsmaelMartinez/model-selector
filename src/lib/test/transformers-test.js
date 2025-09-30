/**
 * Test file to verify Transformers.js v3+ integration
 * This file will be used to validate the library works in our environment
 */

import { pipeline } from '@huggingface/transformers';

export async function testTransformersIntegration() {
  try {
    console.log('Testing Transformers.js integration...');
    
    // Test basic pipeline creation
    const classifier = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
    
    // Test basic inference
    const result = await classifier('I love this library!');
    
    console.log('Transformers.js test successful:', result);
    return {
      success: true,
      result: result,
      message: 'Transformers.js integration working correctly'
    };
    
  } catch (error) {
    console.error('Transformers.js test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Transformers.js integration failed'
    };
  }
}

// Export for testing in browser environment
if (typeof window !== 'undefined') {
  window.testTransformersIntegration = testTransformersIntegration;
}