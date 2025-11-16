import { describe, test, expect, beforeAll } from 'vitest';
import { pipeline } from '@huggingface/transformers';

/**
 * VALIDATION SCRIPT: Test if ensemble classification improves accuracy
 *
 * This is a quick prototype to validate PRD 4 assumptions:
 * - Does 5x parallel classification actually improve accuracy?
 * - Does it complete in reasonable time (≤3s)?
 *
 * APPROACH (KISS):
 * - Run same prompt 5 times with different temperatures
 * - Use simple majority voting
 * - Compare accuracy against baseline
 */

const shouldRunLLMTests = process.env.RUN_LLM_TESTS === 'true';
const describeOrSkip = shouldRunLLMTests ? describe : describe.skip;

describeOrSkip('Ensemble Classification Validation', () => {
  let generator = null;
  const TIMEOUT = 60000;

  beforeAll(async () => {
    console.log('🔄 Loading model for ensemble validation...');
    generator = await pipeline('text-generation', 'onnx-community/Llama-3.2-1B-Instruct', {
      dtype: 'q4',
      device: 'cpu'
    });
    console.log('✅ Model loaded');
  }, TIMEOUT);

  /**
   * Simple baseline classification (single call)
   */
  async function classifyBaseline(taskDescription) {
    const prompt = `You are a task classifier. Classify this into one category:
- computer_vision: images, photos, visual
- natural_language_processing: text, language, translation
- speech_processing: audio, speech, voice
- time_series: forecasting, temporal data
- data_preprocessing: data cleaning, normalization
- recommendation_systems: recommendations, suggestions
- reinforcement_learning: learning through interaction, game playing

Task: "${taskDescription}"
Category:`;

    const result = await generator(prompt, {
      max_new_tokens: 5,
      temperature: 0.1,
      do_sample: false,
      return_full_text: false
    });

    return parseCategory(result[0].generated_text.trim().toLowerCase());
  }

  /**
   * Ensemble classification (5x parallel with different temperatures)
   */
  async function classifyEnsemble(taskDescription) {
    const prompt = `You are a task classifier. Classify this into one category:
- computer_vision: images, photos, visual
- natural_language_processing: text, language, translation
- speech_processing: audio, speech, voice
- time_series: forecasting, temporal data
- data_preprocessing: data cleaning, normalization
- recommendation_systems: recommendations, suggestions
- reinforcement_learning: learning through interaction, game playing

Task: "${taskDescription}"
Category:`;

    // Run 5 classifications in parallel with different temperatures
    const temperatures = [0.1, 0.3, 0.5, 0.7, 0.9];

    const startTime = performance.now();
    const promises = temperatures.map(temp =>
      generator(prompt, {
        max_new_tokens: 5,
        temperature: temp,
        do_sample: temp > 0.1, // Only sample for higher temps
        return_full_text: false
      })
    );

    const results = await Promise.all(promises);
    const time = performance.now() - startTime;

    // Parse all categories
    const categories = results.map(r =>
      parseCategory(r[0].generated_text.trim().toLowerCase())
    );

    // Count votes
    const votes = {};
    categories.forEach(cat => {
      votes[cat] = (votes[cat] || 0) + 1;
    });

    // Find winner (majority vote)
    const winner = Object.entries(votes)
      .sort((a, b) => b[1] - a[1])[0];

    const confidence = winner[1] / 5; // 5/5 = 1.0, 4/5 = 0.8, etc.

    return {
      category: winner[0],
      votes: winner[1],
      total: 5,
      confidence,
      allVotes: categories,
      time
    };
  }

  /**
   * Parse category from LLM output
   */
  function parseCategory(output) {
    if (output.includes('computer_vision') || output.includes('computer-vision') || output.includes('vision')) {
      return 'computer_vision';
    } else if (output.includes('speech')) {
      return 'speech_processing';
    } else if (output.includes('time_series') || output.includes('time-series') || output.includes('temporal')) {
      return 'time_series';
    } else if (output.includes('data_preprocessing') || output.includes('preprocessing') || output.includes('cleaning')) {
      return 'data_preprocessing';
    } else if (output.includes('recommendation')) {
      return 'recommendation_systems';
    } else if (output.includes('reinforcement')) {
      return 'reinforcement_learning';
    } else {
      return 'natural_language_processing';
    }
  }

  /**
   * Test cases - subset of most important scenarios
   */
  const testCases = [
    // Clear cases (should work in both)
    { input: 'Detect objects in photos', expected: 'computer_vision' },
    { input: 'Translate text to Spanish', expected: 'natural_language_processing' },
    { input: 'Convert speech to text', expected: 'speech_processing' },

    // Edge cases (may benefit from ensemble)
    { input: 'Predict stock prices over time', expected: 'time_series' },
    { input: 'Clean missing values in dataset', expected: 'data_preprocessing' },
    { input: 'Suggest movies to users', expected: 'recommendation_systems' },
  ];

  test('baseline classification works', async () => {
    const result = await classifyBaseline('Detect objects in photos');
    expect(result).toBe('computer_vision');
  }, 10000);

  test('ensemble classification works', async () => {
    const result = await classifyEnsemble('Detect objects in photos');
    expect(result.category).toBe('computer_vision');
    expect(result.votes).toBeGreaterThanOrEqual(3); // At least majority
    expect(result.time).toBeLessThan(5000); // Should be under 5s

    console.log('Ensemble result:', result);
  }, 15000);

  test('ensemble accuracy validation', async () => {
    console.log('\n🧪 Running accuracy comparison...\n');

    let baselineCorrect = 0;
    let ensembleCorrect = 0;
    const results = [];

    for (const testCase of testCases) {
      const startTime = performance.now();

      // Run baseline
      const baselineResult = await classifyBaseline(testCase.input);
      const baselineTime = performance.now() - startTime;

      // Run ensemble
      const ensembleStart = performance.now();
      const ensembleResult = await classifyEnsemble(testCase.input);
      const ensembleTime = performance.now() - ensembleStart;

      const baselineMatch = baselineResult === testCase.expected;
      const ensembleMatch = ensembleResult.category === testCase.expected;

      if (baselineMatch) baselineCorrect++;
      if (ensembleMatch) ensembleCorrect++;

      const status = {
        input: testCase.input,
        expected: testCase.expected,
        baseline: { result: baselineResult, correct: baselineMatch, time: Math.round(baselineTime) },
        ensemble: {
          result: ensembleResult.category,
          correct: ensembleMatch,
          votes: `${ensembleResult.votes}/5`,
          confidence: ensembleResult.confidence,
          time: Math.round(ensembleTime)
        }
      };

      results.push(status);

      console.log(`Test: "${testCase.input}"`);
      console.log(`  Expected: ${testCase.expected}`);
      console.log(`  Baseline: ${baselineResult} ${baselineMatch ? '✓' : '✗'} (${Math.round(baselineTime)}ms)`);
      console.log(`  Ensemble: ${ensembleResult.category} ${ensembleMatch ? '✓' : '✗'} (${ensembleResult.votes}/5 votes, ${Math.round(ensembleTime)}ms)`);
      console.log('');
    }

    const baselineAccuracy = (baselineCorrect / testCases.length) * 100;
    const ensembleAccuracy = (ensembleCorrect / testCases.length) * 100;

    console.log('📊 RESULTS:');
    console.log(`Baseline accuracy: ${baselineCorrect}/${testCases.length} (${baselineAccuracy.toFixed(1)}%)`);
    console.log(`Ensemble accuracy: ${ensembleCorrect}/${testCases.length} (${ensembleAccuracy.toFixed(1)}%)`);
    console.log(`Improvement: ${(ensembleAccuracy - baselineAccuracy).toFixed(1)}%`);

    // Validation: ensemble should be at least as good as baseline
    expect(ensembleCorrect).toBeGreaterThanOrEqual(baselineCorrect);
  }, 120000);
});
