// =============================================
// FILE: src/lib/queryAnalyzer.js
// ADVANCED FIRESTORE QUERY ANALYSIS & OPTIMIZATION
// =============================================

import { getDocs, query, collection, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase.js';

export class QueryAnalyzer {
  constructor() {
    this.queryLog = [];
    this.performanceMetrics = new Map();
    this.indexUsage = new Map();
    this.costEstimator = new FirestoreCostEstimator();
  }

  // Analyze query performance and suggest optimizations
  async analyzeQuery(collectionPath, queryParams) {
    const startTime = performance.now();
    const queryId = this.generateQueryId(collectionPath, queryParams);
    
    try {
      // Execute the query
      const firestoreQuery = this.buildQuery(collectionPath, queryParams);
      const snapshot = await getDocs(firestoreQuery);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      const docsRead = snapshot.size;
      
      // Log query execution
      const queryMetrics = {
        id: queryId,
        collectionPath,
        queryParams,
        executionTime,
        docsRead,
        timestamp: new Date(),
        cost: this.costEstimator.calculateCost(docsRead),
      };
      
      this.queryLog.push(queryMetrics);
      this.updatePerformanceMetrics(queryId, queryMetrics);
      
      // Analyze for optimization opportunities
      const analysis = this.performQueryAnalysis(queryMetrics);
      
      return {
        data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        metrics: queryMetrics,
        analysis,
        suggestions: this.generateOptimizationSuggestions(queryMetrics, analysis),
      };
    } catch (error) {
      this.logQueryError(queryId, error);
      throw error;
    }
  }

  buildQuery(collectionPath, queryParams) {
    let firestoreQuery = collection(db, collectionPath);
    
    if (queryParams.where) {
      queryParams.where.forEach(([field, operator, value]) => {
        firestoreQuery = query(firestoreQuery, where(field, operator, value));
      });
    }
    
    if (queryParams.orderBy) {
      queryParams.orderBy.forEach(([field, direction = 'asc']) => {
        firestoreQuery = query(firestoreQuery, orderBy(field, direction));
      });
    }
    
    if (queryParams.limit) {
      firestoreQuery = query(firestoreQuery, limit(queryParams.limit));
    }
    
    return firestoreQuery;
  }

  generateQueryId(collectionPath, queryParams) {
    const queryString = JSON.stringify({ collectionPath, ...queryParams });
    return btoa(queryString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  updatePerformanceMetrics(queryId, metrics) {
    if (!this.performanceMetrics.has(queryId)) {
      this.performanceMetrics.set(queryId, {
        count: 0,
        totalTime: 0,
        totalDocsRead: 0,
        avgTime: 0,
        avgDocsRead: 0,
        maxTime: 0,
        minTime: Infinity,
      });
    }
    
    const existing = this.performanceMetrics.get(queryId);
    existing.count++;
    existing.totalTime += metrics.executionTime;
    existing.totalDocsRead += metrics.docsRead;
    existing.avgTime = existing.totalTime / existing.count;
    existing.avgDocsRead = existing.totalDocsRead / existing.count;
    existing.maxTime = Math.max(existing.maxTime, metrics.executionTime);
    existing.minTime = Math.min(existing.minTime, metrics.executionTime);
  }

  performQueryAnalysis(metrics) {
    const analysis = {
      efficiency: this.analyzeEfficiency(metrics),
      indexUsage: this.analyzeIndexUsage(metrics),
      cost: this.analyzeCost(metrics),
      patterns: this.analyzePatterns(metrics),
    };
    
    return analysis;
  }

  analyzeEfficiency(metrics) {
    const { executionTime, docsRead, queryParams } = metrics;
    const efficiency = {
      score: 0,
      issues: [],
      recommendations: [],
    };
    
    // Execution time analysis
    if (executionTime > 2000) {
      efficiency.issues.push('Very slow query (>2s)');
      efficiency.recommendations.push('Consider adding composite indexes');
    } else if (executionTime > 1000) {
      efficiency.issues.push('Slow query (>1s)');
      efficiency.recommendations.push('Optimize query structure or add indexes');
    }
    
    // Document read analysis
    if (docsRead > 1000) {
      efficiency.issues.push('High document read count');
      efficiency.recommendations.push('Add pagination or more specific filters');
    }
    
    // Query structure analysis
    if (!queryParams.limit) {
      efficiency.issues.push('Unlimited query');
      efficiency.recommendations.push('Add limit() to prevent excessive reads');
    }
    
    if (queryParams.where && queryParams.where.length === 0) {
      efficiency.issues.push('No filters applied');
      efficiency.recommendations.push('Add where() clauses to reduce result set');
    }
    
    // Calculate efficiency score
    let score = 100;
    score -= executionTime > 2000 ? 40 : executionTime > 1000 ? 20 : 0;
    score -= docsRead > 1000 ? 30 : docsRead > 500 ? 15 : 0;
    score -= !queryParams.limit ? 15 : 0;
    score -= efficiency.issues.length * 5;
    
    efficiency.score = Math.max(0, score);
    return efficiency;
  }

  analyzeIndexUsage(metrics) {
    const { collectionPath, queryParams } = metrics;
    const indexAnalysis = {
      requiredIndexes: [],
      missingIndexes: [],
      recommendations: [],
    };
    
    if (queryParams.where && queryParams.orderBy) {
      const fields = [
        ...queryParams.where.map(([field]) => field),
        ...queryParams.orderBy.map(([field]) => field),
      ];
      
      if (fields.length > 1) {
        const indexDef = {
          collectionGroup: collectionPath.split('/').pop(),
          queryScope: "COLLECTION",
          fields: fields.map(field => ({ fieldPath: field, order: "ASCENDING" })),
        };
        
        indexAnalysis.requiredIndexes.push(indexDef);
        indexAnalysis.recommendations.push(
          `Composite index needed for fields: ${fields.join(', ')}`
        );
      }
    }
    
    return indexAnalysis;
  }

  analyzeCost(metrics) {
    const { docsRead } = metrics;
    const dailyReads = this.estimateDailyReads(metrics);
    const monthlyCost = this.costEstimator.calculateMonthlyCost(dailyReads);
    
    return {
      currentRead: docsRead,
      estimatedDailyReads: dailyReads,
      estimatedMonthlyCost: monthlyCost,
      recommendations: monthlyCost > 10 ? [
        'High cost query - consider optimization',
        'Implement caching for frequently accessed data',
        'Add more specific filters to reduce reads',
      ] : [],
    };
  }

  analyzePatterns(metrics) {
    const queryId = this.generateQueryId(metrics.collectionPath, metrics.queryParams);
    const historical = this.performanceMetrics.get(queryId);
    
    if (!historical || historical.count < 3) {
      return { insufficient_data: true };
    }
    
    return {
      frequency: historical.count,
      avgExecutionTime: historical.avgTime,
      avgDocsRead: historical.avgDocsRead,
      performanceTrend: this.calculateTrend(queryId),
      cachingOpportunity: historical.count > 10 && historical.avgTime > 500,
    };
  }

  calculateTrend(queryId) {
    const recentQueries = this.queryLog
      .filter(q => this.generateQueryId(q.collectionPath, q.queryParams) === queryId)
      .slice(-10);
    
    if (recentQueries.length < 5) return 'insufficient_data';
    
    const firstHalf = recentQueries.slice(0, Math.floor(recentQueries.length / 2));
    const secondHalf = recentQueries.slice(Math.floor(recentQueries.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, q) => sum + q.executionTime, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, q) => sum + q.executionTime, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change > 0.2) return 'degrading';
    if (change < -0.2) return 'improving';
    return 'stable';
  }

  estimateDailyReads(metrics) {
    const queryId = this.generateQueryId(metrics.collectionPath, metrics.queryParams);
    const historical = this.performanceMetrics.get(queryId);
    
    if (!historical || historical.count < 2) {
      return metrics.docsRead * 10; // Conservative estimate
    }
    
    // Calculate frequency based on historical data
    const timeSpan = Date.now() - this.queryLog.find(q => 
      this.generateQueryId(q.collectionPath, q.queryParams) === queryId
    )?.timestamp?.getTime();
    
    if (!timeSpan || timeSpan === 0) return metrics.docsRead * 10;
    
    const queriesPerDay = (historical.count / (timeSpan / (1000 * 60 * 60 * 24)));
    return queriesPerDay * historical.avgDocsRead;
  }

  generateOptimizationSuggestions(metrics, analysis) {
    const suggestions = [];
    
    // Efficiency suggestions
    if (analysis.efficiency.score < 70) {
      suggestions.push({
        type: 'performance',
        priority: 'high',
        title: 'Poor Query Performance',
        description: 'This query is performing poorly and needs optimization',
        actions: analysis.efficiency.recommendations,
      });
    }
    
    // Index suggestions
    if (analysis.indexUsage.requiredIndexes.length > 0) {
      suggestions.push({
        type: 'indexing',
        priority: 'high',
        title: 'Missing Indexes',
        description: 'Composite indexes required for optimal performance',
        actions: analysis.indexUsage.recommendations,
        indexDefinitions: analysis.indexUsage.requiredIndexes,
      });
    }
    
    // Cost optimization
    if (analysis.cost.estimatedMonthlyCost > 5) {
      suggestions.push({
        type: 'cost',
        priority: 'medium',
        title: 'High Cost Query',
        description: `Estimated monthly cost: $${analysis.cost.estimatedMonthlyCost.toFixed(2)}`,
        actions: analysis.cost.recommendations,
      });
    }
    
    // Caching suggestions
    if (analysis.patterns.cachingOpportunity) {
      suggestions.push({
        type: 'caching',
        priority: 'medium',
        title: 'Caching Opportunity',
        description: 'This query is executed frequently and would benefit from caching',
        actions: [
          'Implement client-side caching',
          'Consider pre-loading data',
          'Use real-time subscriptions for live data',
        ],
      });
    }
    
    return suggestions;
  }

  logQueryError(queryId, error) {
    this.queryLog.push({
      id: queryId,
      error: error.message,
      code: error.code,
      timestamp: new Date(),
      type: 'error',
    });
  }

  // Get comprehensive performance report
  getPerformanceReport() {
    const totalQueries = this.queryLog.length;
    const totalCost = this.queryLog.reduce((sum, q) => sum + (q.cost || 0), 0);
    const avgExecutionTime = this.queryLog.reduce((sum, q) => sum + (q.executionTime || 0), 0) / totalQueries;
    
    const slowQueries = this.queryLog.filter(q => q.executionTime > 1000);
    const highCostQueries = this.queryLog.filter(q => q.cost > 0.01);
    
    return {
      summary: {
        totalQueries,
        totalCost: totalCost.toFixed(4),
        avgExecutionTime: avgExecutionTime.toFixed(2),
        slowQueries: slowQueries.length,
        highCostQueries: highCostQueries.length,
      },
      slowQueries: slowQueries.slice(-10),
      highCostQueries: highCostQueries.slice(-10),
      recommendations: this.generateGlobalRecommendations(),
    };
  }

  generateGlobalRecommendations() {
    const recommendations = [];
    const metrics = Array.from(this.performanceMetrics.values());
    
    const slowQueries = metrics.filter(m => m.avgTime > 1000).length;
    const highVolumeQueries = metrics.filter(m => m.avgDocsRead > 100).length;
    
    if (slowQueries > 0) {
      recommendations.push({
        type: 'performance',
        message: `${slowQueries} query patterns are consistently slow. Consider adding indexes.`,
      });
    }
    
    if (highVolumeQueries > 0) {
      recommendations.push({
        type: 'optimization',
        message: `${highVolumeQueries} queries read large amounts of data. Implement pagination.`,
      });
    }
    
    return recommendations;
  }

  // Export analytics data
  exportAnalytics() {
    return {
      queryLog: this.queryLog,
      performanceMetrics: Array.from(this.performanceMetrics.entries()),
      timestamp: new Date(),
    };
  }

  // Clear old data to prevent memory leaks
  cleanup(olderThanMs = 24 * 60 * 60 * 1000) { // 24 hours default
    const cutoff = Date.now() - olderThanMs;
    this.queryLog = this.queryLog.filter(q => q.timestamp && q.timestamp.getTime() > cutoff);
  }
}

class FirestoreCostEstimator {
  constructor() {
    // Firestore pricing (as of 2024)
    this.readCost = 0.06 / 100000; // $0.06 per 100K reads
    this.writeCost = 0.18 / 100000; // $0.18 per 100K writes
    this.deleteCost = 0.02 / 100000; // $0.02 per 100K deletes
  }

  calculateCost(reads, writes = 0, deletes = 0) {
    return (reads * this.readCost) + (writes * this.writeCost) + (deletes * this.deleteCost);
  }

  calculateMonthlyCost(dailyReads, dailyWrites = 0, dailyDeletes = 0) {
    const monthlyReads = dailyReads * 30;
    const monthlyWrites = dailyWrites * 30;
    const monthlyDeletes = dailyDeletes * 30;
    
    return this.calculateCost(monthlyReads, monthlyWrites, monthlyDeletes);
  }

  estimateIndexCost(indexFields, docCount = 1000) {
    // Each index entry costs approximately the same as a document read
    return this.calculateCost(indexFields * docCount);
  }
}

export const queryAnalyzer = new QueryAnalyzer();
export { FirestoreCostEstimator };