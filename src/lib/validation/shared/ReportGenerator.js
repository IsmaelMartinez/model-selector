/**
 * Report Generator
 * Generates structured reports for validation spike results
 */

import { SPIKE_CONFIG } from '../spike-config.js';
import fs from 'fs';
import path from 'path';

export class ReportGenerator {
  constructor(options = {}) {
    this.outputDir = options.outputDir || SPIKE_CONFIG.output.directory;
    this.formats = options.formats || SPIKE_CONFIG.output.formats;
  }

  /**
   * Generate a complete report for a spike
   * @param {string} spikeName - Name of the spike
   * @param {Object} results - Spike results
   * @param {Object} options - Report options
   */
  async generateReport(spikeName, results, options = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportData = {
      spike: spikeName,
      timestamp: new Date().toISOString(),
      successCriteria: SPIKE_CONFIG.successCriteria,
      results,
      summary: this.generateSummary(spikeName, results)
    };

    // Ensure output directory exists
    await this.ensureOutputDir();

    // Generate reports in requested formats
    for (const format of this.formats) {
      if (format === 'json') {
        await this.writeJsonReport(spikeName, timestamp, reportData);
      }
      if (format === 'console') {
        this.printConsoleReport(spikeName, reportData);
      }
    }

    return reportData;
  }

  /**
   * Generate summary based on spike type
   * @param {string} spikeName - Name of the spike
   * @param {Object} results - Spike results
   * @returns {Object} - Summary data
   */
  generateSummary(spikeName, results) {
    switch (spikeName) {
      case 'benchmark':
        return this.generateBenchmarkSummary(results);
      case 'threshold':
        return this.generateThresholdSummary(results);
      case 'coverage':
        return this.generateCoverageSummary(results);
      case 'performance':
        return this.generatePerformanceSummary(results);
      default:
        return { note: 'Unknown spike type' };
    }
  }

  /**
   * Generate benchmark spike summary
   */
  generateBenchmarkSummary(results) {
    const criteria = SPIKE_CONFIG.successCriteria;
    const models = results.models || [];
    
    const passing = models.filter(m => 
      m.accuracy >= criteria.minAccuracy && 
      m.sizeMB <= criteria.maxModelSizeMB
    );

    const bestModel = models.reduce((best, m) => 
      (!best || m.accuracy > best.accuracy) ? m : best, null
    );

    return {
      totalModels: models.length,
      passingModels: passing.length,
      bestModel: bestModel ? {
        name: bestModel.name,
        accuracy: bestModel.accuracy,
        sizeMB: bestModel.sizeMB
      } : null,
      meetsSuccessCriteria: passing.length > 0,
      recommendation: passing.length > 0 
        ? `Use ${passing[0].name} (${(passing[0].accuracy * 100).toFixed(1)}% accuracy, ${passing[0].sizeMB}MB)`
        : 'No model meets success criteria. Consider relaxing requirements or adding more examples.'
    };
  }

  /**
   * Generate threshold spike summary
   */
  generateThresholdSummary(results) {
    const criteria = SPIKE_CONFIG.successCriteria;
    
    return {
      recommendedThreshold: results.recommendedThreshold,
      recommendedK: results.recommendedK,
      votingMethod: results.votingMethod,
      meetsConfidenceTarget: results.recommendedThreshold >= criteria.minConfidenceThreshold,
      thresholdFor70Percent: results.thresholdFor70Percent,
      recommendation: results.recommendedThreshold 
        ? `Use threshold ${results.recommendedThreshold} with k=${results.recommendedK} (${results.votingMethod} voting)`
        : 'Unable to determine optimal threshold. Review data distribution.'
    };
  }

  /**
   * Generate coverage spike summary
   */
  generateCoverageSummary(results) {
    const coveragePoints = results.coveragePoints || [];
    
    // Find diminishing returns point
    let diminishingPoint = null;
    for (let i = 1; i < coveragePoints.length; i++) {
      const improvement = coveragePoints[i].accuracy - coveragePoints[i-1].accuracy;
      if (improvement < 0.02) { // Less than 2% improvement
        diminishingPoint = coveragePoints[i-1];
        break;
      }
    }

    return {
      coveragePoints: coveragePoints.map(p => ({
        examplesPerCategory: p.examplesPerCategory,
        accuracy: p.accuracy
      })),
      diminishingReturnsAt: diminishingPoint?.examplesPerCategory || null,
      weakCategories: results.weakCategories || [],
      recommendation: diminishingPoint 
        ? `Use ${diminishingPoint.examplesPerCategory} examples per category (${(diminishingPoint.accuracy * 100).toFixed(1)}% accuracy)`
        : 'More examples needed to determine optimal count.'
    };
  }

  /**
   * Generate performance spike summary
   */
  generatePerformanceSummary(results) {
    const criteria = SPIKE_CONFIG.successCriteria;
    
    const meetsDesktop = results.coldLoadMs <= criteria.desktopLoadTimeMs &&
                         results.inferenceMs <= criteria.desktopInferenceMs;
    const meetsMobile = results.coldLoadMs <= criteria.mobileLoadTimeMs &&
                        results.inferenceMs <= criteria.mobileInferenceMs;

    return {
      coldLoadMs: results.coldLoadMs,
      warmLoadMs: results.warmLoadMs,
      inferenceMs: results.inferenceMs,
      meetsDesktopTarget: meetsDesktop,
      meetsMobileTarget: meetsMobile,
      lazyLoadingViable: results.lazyLoadingViable,
      recommendation: meetsDesktop && meetsMobile
        ? 'Performance targets met. Proceed with implementation.'
        : `Performance optimization needed. Cold start: ${results.coldLoadMs}ms, Inference: ${results.inferenceMs}ms`
    };
  }

  /**
   * Write JSON report to file
   */
  async writeJsonReport(spikeName, timestamp, data) {
    const filename = `${spikeName}-${timestamp}.json`;
    const filepath = path.join(this.outputDir, filename);
    
    await fs.promises.writeFile(filepath, JSON.stringify(data, null, 2));
    console.log(`\n📄 Report saved: ${filepath}`);
    
    // Also write a "latest" file for easy access
    const latestPath = path.join(this.outputDir, `${spikeName}-latest.json`);
    await fs.promises.writeFile(latestPath, JSON.stringify(data, null, 2));
  }

  /**
   * Print report to console
   */
  printConsoleReport(spikeName, data) {
    console.log('\n' + '='.repeat(60));
    console.log(`📊 SPIKE REPORT: ${spikeName.toUpperCase()}`);
    console.log('='.repeat(60));
    console.log(`Timestamp: ${data.timestamp}`);
    console.log('-'.repeat(60));
    
    // Print summary
    console.log('\n📋 SUMMARY:');
    for (const [key, value] of Object.entries(data.summary)) {
      if (typeof value === 'object' && value !== null) {
        console.log(`  ${key}:`);
        for (const [subKey, subValue] of Object.entries(value)) {
          console.log(`    ${subKey}: ${this.formatValue(subValue)}`);
        }
      } else {
        console.log(`  ${key}: ${this.formatValue(value)}`);
      }
    }

    // Print success criteria check
    console.log('\n✅ SUCCESS CRITERIA:');
    const criteria = data.successCriteria;
    console.log(`  Min Accuracy: ${(criteria.minAccuracy * 100).toFixed(0)}%`);
    console.log(`  Max Model Size: ${criteria.maxModelSizeMB}MB`);
    console.log(`  Min Confidence: ${(criteria.minConfidenceThreshold * 100).toFixed(0)}%`);
    
    // Print recommendation
    if (data.summary.recommendation) {
      console.log('\n💡 RECOMMENDATION:');
      console.log(`  ${data.summary.recommendation}`);
    }
    
    console.log('\n' + '='.repeat(60));
  }

  /**
   * Format value for console output
   */
  formatValue(value) {
    if (typeof value === 'number') {
      if (value < 1 && value > 0) {
        return `${(value * 100).toFixed(1)}%`;
      }
      return value.toFixed(2);
    }
    if (typeof value === 'boolean') {
      return value ? '✓ Yes' : '✗ No';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  }

  /**
   * Ensure output directory exists
   */
  async ensureOutputDir() {
    try {
      await fs.promises.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Generate comparison report for multiple models
   */
  generateComparisonTable(models) {
    console.log('\n📊 MODEL COMPARISON:');
    console.log('-'.repeat(80));
    console.log(
      'Model'.padEnd(35) +
      'Accuracy'.padEnd(12) +
      'Top-3'.padEnd(10) +
      'Size (MB)'.padEnd(12) +
      'Time (ms)'.padEnd(12)
    );
    console.log('-'.repeat(80));
    
    for (const model of models) {
      const row = 
        model.name.substring(0, 34).padEnd(35) +
        `${(model.accuracy * 100).toFixed(1)}%`.padEnd(12) +
        `${(model.top3Accuracy * 100).toFixed(1)}%`.padEnd(10) +
        `${model.sizeMB.toFixed(1)}`.padEnd(12) +
        `${model.avgInferenceMs.toFixed(0)}`.padEnd(12);
      
      // Highlight best model
      if (model.isBest) {
        console.log(`★ ${row}`);
      } else {
        console.log(`  ${row}`);
      }
    }
    
    console.log('-'.repeat(80));
  }

  /**
   * Generate threshold analysis table
   */
  generateThresholdTable(thresholds) {
    console.log('\n📊 THRESHOLD ANALYSIS:');
    console.log('-'.repeat(60));
    console.log(
      'Threshold'.padEnd(12) +
      'Accuracy'.padEnd(12) +
      'Precision'.padEnd(12) +
      'Recall'.padEnd(12) +
      'F1'.padEnd(12)
    );
    console.log('-'.repeat(60));
    
    for (const t of thresholds) {
      console.log(
        `${t.threshold.toFixed(2)}`.padEnd(12) +
        `${(t.accuracy * 100).toFixed(1)}%`.padEnd(12) +
        `${(t.precision * 100).toFixed(1)}%`.padEnd(12) +
        `${(t.recall * 100).toFixed(1)}%`.padEnd(12) +
        `${(t.f1 * 100).toFixed(1)}%`.padEnd(12)
      );
    }
    
    console.log('-'.repeat(60));
  }

  /**
   * Generate coverage analysis table
   */
  generateCoverageTable(coverage) {
    console.log('\n📊 COVERAGE ANALYSIS:');
    console.log('-'.repeat(50));
    console.log(
      'Examples/Cat'.padEnd(15) +
      'Total'.padEnd(10) +
      'Accuracy'.padEnd(12) +
      'Δ Accuracy'.padEnd(12)
    );
    console.log('-'.repeat(50));
    
    let prevAccuracy = 0;
    for (const c of coverage) {
      const delta = c.accuracy - prevAccuracy;
      console.log(
        `${c.examplesPerCategory}`.padEnd(15) +
        `${c.totalExamples}`.padEnd(10) +
        `${(c.accuracy * 100).toFixed(1)}%`.padEnd(12) +
        `${delta > 0 ? '+' : ''}${(delta * 100).toFixed(1)}%`.padEnd(12)
      );
      prevAccuracy = c.accuracy;
    }
    
    console.log('-'.repeat(50));
  }
}

export default ReportGenerator;

