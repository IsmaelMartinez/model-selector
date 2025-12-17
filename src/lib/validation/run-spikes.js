#!/usr/bin/env node

/**
 * CLI Runner for Embedding Validation Spikes
 * 
 * Usage:
 *   node run-spikes.js [spike] [options]
 * 
 * Spikes:
 *   all         Run all spikes (default)
 *   benchmark   Spike 1: Embedding model benchmark
 *   threshold   Spike 2: Threshold calibration
 *   coverage    Spike 3: Example coverage analysis
 *   performance Spike 4: Cold start performance
 * 
 * Options:
 *   --model <name>  Specify model for spikes 2-4 (default: best from spike 1)
 *   --help          Show this help message
 */

import { EmbeddingBenchmark } from './spikes/EmbeddingBenchmark.js';
import { ThresholdCalibrator } from './spikes/ThresholdCalibrator.js';
import { CoverageAnalyzer } from './spikes/CoverageAnalyzer.js';
import { PerformanceTester } from './spikes/PerformanceTester.js';
import { SPIKE_CONFIG } from './spike-config.js';
import fs from 'fs';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);

function showHelp() {
  console.log(`
Embedding Validation Spikes - CLI Runner

Usage:
  node run-spikes.js [spike] [options]

Spikes:
  all           Run all spikes (default)
  benchmark     Spike 1: Embedding model benchmark
  threshold     Spike 2: Threshold calibration
  coverage      Spike 3: Example coverage analysis
  performance   Spike 4: Cold start performance

Options:
  --model <name>  Specify model for spikes 2-4
                  Default: Xenova/all-MiniLM-L6-v2
  --help          Show this help message

Examples:
  node run-spikes.js                          # Run all spikes
  node run-spikes.js benchmark                # Run only spike 1
  node run-spikes.js threshold --model Xenova/bge-small-en-v1.5
  node run-spikes.js coverage
  node run-spikes.js performance

Output:
  Results are saved to validation-results/ directory
  Both JSON and console output are generated
`);
}

function parseArgs(args) {
  const options = {
    spike: 'all',
    model: SPIKE_CONFIG.models[0].name,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--model' || arg === '-m') {
      options.model = args[++i];
    } else if (!arg.startsWith('-')) {
      options.spike = arg;
    }
  }

  return options;
}

async function ensureOutputDir() {
  const dir = SPIKE_CONFIG.output.directory;
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

async function runBenchmark() {
  console.log('\n' + '═'.repeat(60));
  console.log('  SPIKE 1: EMBEDDING MODEL BENCHMARK');
  console.log('═'.repeat(60));
  
  const benchmark = new EmbeddingBenchmark();
  return await benchmark.run();
}

async function runThreshold(modelName) {
  console.log('\n' + '═'.repeat(60));
  console.log('  SPIKE 2: THRESHOLD CALIBRATION');
  console.log('═'.repeat(60));
  
  const calibrator = new ThresholdCalibrator({ modelName });
  return await calibrator.run();
}

async function runCoverage(modelName) {
  console.log('\n' + '═'.repeat(60));
  console.log('  SPIKE 3: EXAMPLE COVERAGE ANALYSIS');
  console.log('═'.repeat(60));
  
  const analyzer = new CoverageAnalyzer({ modelName });
  return await analyzer.run();
}

async function runPerformance(modelName) {
  console.log('\n' + '═'.repeat(60));
  console.log('  SPIKE 4: COLD START PERFORMANCE');
  console.log('═'.repeat(60));
  
  const tester = new PerformanceTester({ modelName });
  return await tester.run();
}

async function runAllSpikes(modelName) {
  const results = {
    startTime: new Date().toISOString(),
    spikes: {}
  };

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     EMBEDDING VALIDATION SPIKES - FULL TEST SUITE          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // Spike 1: Benchmark
    results.spikes.benchmark = await runBenchmark();
    
    // Use best model from benchmark for remaining spikes
    const bestModel = results.spikes.benchmark.models.find(m => m.isBest);
    const selectedModel = bestModel?.name || modelName;
    console.log(`\n📌 Using model for remaining spikes: ${selectedModel}`);

    // Spike 2: Threshold
    results.spikes.threshold = await runThreshold(selectedModel);

    // Spike 3: Coverage
    results.spikes.coverage = await runCoverage(selectedModel);

    // Spike 4: Performance
    results.spikes.performance = await runPerformance(selectedModel);

  } catch (error) {
    console.error('\n❌ Error during spike execution:', error.message);
    results.error = error.message;
  }

  results.endTime = new Date().toISOString();

  // Generate summary
  console.log('\n' + '═'.repeat(60));
  console.log('  FINAL SUMMARY');
  console.log('═'.repeat(60));

  generateFinalSummary(results);

  // Save combined results
  const outputPath = path.join(SPIKE_CONFIG.output.directory, `all-spikes-${Date.now()}.json`);
  await fs.promises.writeFile(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Full results saved to: ${outputPath}`);

  return results;
}

function generateFinalSummary(results) {
  console.log('\n📊 SPIKE RESULTS OVERVIEW:\n');

  // Spike 1 Summary
  if (results.spikes.benchmark) {
    const b = results.spikes.benchmark;
    const bestModel = b.models?.find(m => m.isBest);
    console.log('Spike 1 - Model Benchmark:');
    if (bestModel) {
      const status = bestModel.meetsSuccessCriteria ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${status} Best: ${bestModel.name}`);
      console.log(`        Accuracy: ${(bestModel.accuracy * 100).toFixed(1)}%, Size: ${bestModel.sizeMB}MB`);
    } else {
      console.log('  ❓ No results');
    }
  }

  // Spike 2 Summary
  if (results.spikes.threshold) {
    const t = results.spikes.threshold;
    console.log('\nSpike 2 - Threshold Calibration:');
    console.log(`  ℹ️  Recommended threshold: ${t.recommendedThreshold}`);
    console.log(`      Recommended k: ${t.recommendedK}`);
    console.log(`      Voting method: ${t.votingMethod}`);
  }

  // Spike 3 Summary
  if (results.spikes.coverage) {
    const c = results.spikes.coverage;
    console.log('\nSpike 3 - Coverage Analysis:');
    console.log(`  ℹ️  Optimal examples/category: ${c.diminishingReturnsAt?.examplesPerCategory || 'TBD'}`);
    if (c.weakCategories?.length > 0) {
      console.log(`  ⚠️  Weak categories: ${c.weakCategories.map(w => w.category).join(', ')}`);
    }
  }

  // Spike 4 Summary
  if (results.spikes.performance) {
    const p = results.spikes.performance;
    const desktopStatus = p.meetsDesktopTarget ? '✅' : '❌';
    const mobileStatus = p.meetsMobileTarget ? '✅' : '❌';
    console.log('\nSpike 4 - Performance:');
    console.log(`  ${desktopStatus} Desktop target (cold: <3s, inference: <100ms)`);
    console.log(`  ${mobileStatus} Mobile target (cold: <5s, inference: <200ms)`);
    console.log(`      Actual: cold ${p.coldLoadMs?.toFixed(0) || '?'}ms, inference ${p.inferenceMs?.toFixed(0) || '?'}ms`);
  }

  // Overall recommendation
  console.log('\n' + '-'.repeat(60));
  console.log('OVERALL RECOMMENDATION:');
  
  const allPass = 
    results.spikes.benchmark?.models?.[0]?.meetsSuccessCriteria &&
    results.spikes.performance?.meetsDesktopTarget;

  if (allPass) {
    console.log('  ✅ All critical criteria met. Proceed with implementation.');
  } else {
    console.log('  ⚠️  Some criteria not met. Review recommendations in detailed reports.');
  }
}

// Main execution
async function main() {
  const options = parseArgs(args);

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  console.log('\n🔬 Embedding Validation Spikes');
  console.log('━'.repeat(40));

  await ensureOutputDir();

  const startTime = Date.now();

  try {
    switch (options.spike) {
      case 'benchmark':
        await runBenchmark();
        break;
      case 'threshold':
        await runThreshold(options.model);
        break;
      case 'coverage':
        await runCoverage(options.model);
        break;
      case 'performance':
        await runPerformance(options.model);
        break;
      case 'all':
      default:
        await runAllSpikes(options.model);
        break;
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✨ Completed in ${duration}s`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

