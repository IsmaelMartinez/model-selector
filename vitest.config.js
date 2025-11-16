import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Exclude LLM tests from default test run (CI/CD)
    // These tests require large model downloads and are slow
    // Run them locally with: npm run test:llm
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/llm-classification.test.js',
      '**/ensemble-validation.test.js'
    ],
    // Allow tests to run for up to 10 seconds
    testTimeout: 10000
  }
});
