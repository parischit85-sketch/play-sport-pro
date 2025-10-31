/**
 * @fileoverview NotificationAnalyticsDashboard - Dashboard React per analytics push notifications
 *
 * Features:
 * - Real-time metrics display
 * - Funnel visualization (sent → delivered → clicked → converted)
 * - Channel performance comparison
 * - A/B test results
 * - Time range selector
 * - Auto-refresh ogni 30 secondi
 * - Export CSV/JSON
 *
 * @author Play Sport Pro Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
} from 'recharts';
import { notificationAnalytics, NOTIFICATION_CATEGORIES } from '@/services/notificationAnalytics';
import './NotificationAnalyticsDashboard.css';

/**
 * Color palette per charts
 */
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

const CHANNEL_COLORS = {
  push: COLORS.primary,
  email: COLORS.success,
  sms: COLORS.warning,
  'in-app': COLORS.purple,
};

/**
 * NotificationAnalyticsDashboard Component
 */
export default function NotificationAnalyticsDashboard() {
  // State
  const [timeRange, setTimeRange] = useState('60'); // minuti
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [funnelData, setFunnelData] = useState(null);
  const [channelPerformance, setChannelPerformance] = useState([]);
  const [abTestResults, setABTestResults] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  /**
   * Load dashboard data
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Real-time dashboard metrics
      const metrics = await notificationAnalytics.getDashboardMetrics(parseInt(timeRange));
      setDashboardMetrics(metrics);

      // Funnel analytics (ultimi 7 giorni)
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

      if (selectedCategory && selectedCategory !== 'all') {
        const funnel = await notificationAnalytics.getFunnelAnalytics(
          selectedCategory,
          startDate,
          endDate
        );
        setFunnelData(funnel);
      }

      // Channel performance (ultimi 7 giorni)
      const channels = await notificationAnalytics.getChannelPerformance(startDate, endDate);
      setChannelPerformance(channels);

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  /**
   * Load A/B test results
   */
  const loadABTestResults = async (testId) => {
    try {
      const results = await notificationAnalytics.getABTestResults(testId);
      setABTestResults(results);
    } catch (error) {
      console.error('Error loading A/B test results:', error);
    }
  };

  /**
   * Export data to CSV
   */
  const exportToCSV = () => {
    if (!dashboardMetrics) return;

    const csv = [
      ['Metric', 'Value'],
      ['Sent', dashboardMetrics.summary.sent],
      ['Delivered', dashboardMetrics.summary.delivered],
      ['Clicked', dashboardMetrics.summary.clicked],
      ['Converted', dashboardMetrics.summary.converted],
      ['Delivery Rate', dashboardMetrics.summary.deliveryRate],
      ['CTR', dashboardMetrics.summary.ctr],
      ['Conversion Rate', dashboardMetrics.summary.conversionRate],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-analytics-${new Date().toISOString()}.csv`;
    a.click();
  };

  /**
   * Export data to JSON
   */
  const exportToJSON = () => {
    const data = {
      dashboardMetrics,
      funnelData,
      channelPerformance,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-analytics-${new Date().toISOString()}.json`;
    a.click();
  };

  // Effects
  useEffect(() => {
    loadDashboardData();
  }, [timeRange, selectedCategory]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // 30 secondi

    return () => clearInterval(interval);
  }, [autoRefresh, timeRange, selectedCategory]);

  // Loading state
  if (loading && !dashboardMetrics) {
    return (
      <div className="analytics-dashboard loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>📊 Notification Analytics</h1>

        <div className="dashboard-controls">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-selector"
          >
            <option value="15">Last 15 minutes</option>
            <option value="60">Last hour</option>
            <option value="180">Last 3 hours</option>
            <option value="720">Last 12 hours</option>
            <option value="1440">Last 24 hours</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-selector"
          >
            <option value="all">All Categories</option>
            {Object.values(NOTIFICATION_CATEGORIES).map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          {/* Auto Refresh Toggle */}
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh (30s)</span>
          </label>

          {/* Export Buttons */}
          <button onClick={exportToCSV} className="btn-export">
            📥 Export CSV
          </button>
          <button onClick={exportToJSON} className="btn-export">
            📥 Export JSON
          </button>

          {/* Last Update */}
          <span className="last-update">Last update: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="metrics-summary">
        <MetricCard
          title="Sent"
          value={dashboardMetrics?.summary.sent || 0}
          icon="📤"
          color={COLORS.primary}
        />
        <MetricCard
          title="Delivered"
          value={dashboardMetrics?.summary.delivered || 0}
          subtitle={`${dashboardMetrics?.summary.deliveryRate || '0%'} delivery rate`}
          icon="✅"
          color={COLORS.success}
        />
        <MetricCard
          title="Clicked"
          value={dashboardMetrics?.summary.clicked || 0}
          subtitle={`${dashboardMetrics?.summary.ctr || '0%'} CTR`}
          icon="👆"
          color={COLORS.warning}
        />
        <MetricCard
          title="Converted"
          value={dashboardMetrics?.summary.converted || 0}
          subtitle={`${dashboardMetrics?.summary.conversionRate || '0%'} conversion`}
          icon="💰"
          color={COLORS.purple}
        />
        <MetricCard
          title="Failed"
          value={dashboardMetrics?.summary.failed || 0}
          subtitle={`${dashboardMetrics?.summary.errorRate || '0%'} error rate`}
          icon="❌"
          color={COLORS.danger}
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Funnel Chart */}
        {funnelData && (
          <div className="chart-card funnel-card">
            <h3>Conversion Funnel - {funnelData.type}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { stage: 'Sent', value: funnelData.funnel.sent, fill: COLORS.primary },
                  { stage: 'Delivered', value: funnelData.funnel.delivered, fill: COLORS.success },
                  { stage: 'Clicked', value: funnelData.funnel.clicked, fill: COLORS.warning },
                  { stage: 'Converted', value: funnelData.funnel.converted, fill: COLORS.purple },
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
            <div className="funnel-stats">
              <p>
                Delivery Rate: <strong>{funnelData.rates.deliveryRate}</strong>
              </p>
              <p>
                CTR: <strong>{funnelData.rates.ctr}</strong>
              </p>
              <p>
                Conversion Rate: <strong>{funnelData.rates.conversionRate}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Channel Performance */}
        {channelPerformance.length > 0 && (
          <div className="chart-card channel-card">
            <h3>Channel Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill={COLORS.primary} name="Sent" />
                <Bar dataKey="delivered" fill={COLORS.success} name="Delivered" />
                <Bar dataKey="clicked" fill={COLORS.warning} name="Clicked" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Channel Distribution Pie */}
        {dashboardMetrics?.byChannel && (
          <div className="chart-card pie-card">
            <h3>Notifications by Channel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(dashboardMetrics.byChannel).map(([channel, stats]) => ({
                    name: channel,
                    value: stats.sent,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {Object.keys(dashboardMetrics.byChannel).map((channel, index) => (
                    <Cell key={channel} fill={CHANNEL_COLORS[channel] || COLORS.primary} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Distribution */}
        {dashboardMetrics?.byCategory && (
          <div className="chart-card category-card">
            <h3>Notifications by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(dashboardMetrics.byCategory).map(([category, count]) => ({
                  category,
                  count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.purple} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Channel Performance Table */}
      {channelPerformance.length > 0 && (
        <div className="performance-table-card">
          <h3>Detailed Channel Metrics</h3>
          <table className="performance-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th>Sent</th>
                <th>Delivered</th>
                <th>Failed</th>
                <th>Clicked</th>
                <th>Delivery Rate</th>
                <th>CTR</th>
                <th>Avg Latency</th>
                <th>P95 Latency</th>
                <th>Total Cost</th>
                <th>Avg Cost</th>
              </tr>
            </thead>
            <tbody>
              {channelPerformance.map((channel) => (
                <tr key={channel.channel}>
                  <td>
                    <span
                      className="channel-badge"
                      style={{ backgroundColor: CHANNEL_COLORS[channel.channel] }}
                    >
                      {channel.channel}
                    </span>
                  </td>
                  <td>{channel.sent}</td>
                  <td>{channel.delivered}</td>
                  <td>{channel.failed}</td>
                  <td>{channel.clicked}</td>
                  <td className={parseFloat(channel.deliveryRate) >= 95 ? 'success' : 'warning'}>
                    {channel.deliveryRate}
                  </td>
                  <td>{channel.ctr}</td>
                  <td>{channel.avgLatency}</td>
                  <td>{channel.p95Latency}</td>
                  <td>{channel.totalCost}</td>
                  <td>{channel.avgCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Events */}
      {dashboardMetrics?.recentEvents && dashboardMetrics.recentEvents.length > 0 && (
        <div className="recent-events-card">
          <h3>Recent Events (Live)</h3>
          <div className="events-list">
            {dashboardMetrics.recentEvents.map((event, index) => (
              <div key={index} className="event-item">
                <span className="event-type">{event.event}</span>
                <span className="event-user">{event.userId}</span>
                <span className="event-channel">{event.channel}</span>
                <span className="event-time">{new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* A/B Test Results (if loaded) */}
      {abTestResults && (
        <div className="ab-test-results-card">
          <h3>A/B Test Results: {abTestResults.testId}</h3>
          <div className="ab-test-summary">
            <p>
              Winner: <strong>{abTestResults.winner}</strong>
            </p>
            <p>
              Confidence: <strong>{abTestResults.confidence}</strong>
            </p>
            <p>
              Sample Size: <strong>{abTestResults.sampleSize}</strong>
            </p>
          </div>
          <table className="ab-test-table">
            <thead>
              <tr>
                <th>Variant</th>
                <th>Sent</th>
                <th>Delivered</th>
                <th>Clicked</th>
                <th>Converted</th>
                <th>Delivery Rate</th>
                <th>CTR</th>
                <th>Conversion Rate</th>
                <th>Total Value</th>
                <th>Avg Value</th>
              </tr>
            </thead>
            <tbody>
              {abTestResults.variants.map((variant) => (
                <tr
                  key={variant.variant}
                  className={variant.variant === abTestResults.winner ? 'winner' : ''}
                >
                  <td>
                    {variant.variant}
                    {variant.variant === abTestResults.winner && ' 🏆'}
                  </td>
                  <td>{variant.sent}</td>
                  <td>{variant.delivered}</td>
                  <td>{variant.clicked}</td>
                  <td>{variant.converted}</td>
                  <td>{variant.deliveryRate}</td>
                  <td>{variant.ctr}</td>
                  <td>{variant.conversionRate}</td>
                  <td>{variant.totalValue}</td>
                  <td>{variant.avgValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * MetricCard Component
 */
function MetricCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="metric-card" style={{ borderLeftColor: color }}>
      <div className="metric-icon" style={{ color }}>
        {icon}
      </div>
      <div className="metric-content">
        <h4>{title}</h4>
        <p className="metric-value">{value.toLocaleString()}</p>
        {subtitle && <p className="metric-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
