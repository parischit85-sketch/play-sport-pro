/**
 * BookingAnalyticsDashboard Component - CHK-305
 *
 * Advanced analytics dashboard for booking patterns, revenue, and court utilization.
 * Features:
 * - Revenue trends visualization (daily, weekly, monthly)
 * - Time slots heatmap (most popular hours)
 * - Court utilization metrics
 * - User behavior analysis
 * - Export to CSV/PDF
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  TrendingUp,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Download,
  X,
  Filter,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@config/firebase';
import { format, subDays, startOfDay, endOfDay, parse } from 'date-fns';
import { it } from 'date-fns/locale';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const BookingAnalyticsDashboard = ({ isOpen, onClose, clubId }) => {
  const [dateRange, setDateRange] = useState('7days'); // 7days, 30days, 90days, custom
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingsData, setBookingsData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('revenue'); // revenue, bookings, users

  // Fetch bookings data
  useEffect(() => {
    if (!isOpen || !clubId) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const endDate = new Date();
        let startDate;

        switch (dateRange) {
          case '7days':
            startDate = subDays(endDate, 7);
            break;
          case '30days':
            startDate = subDays(endDate, 30);
            break;
          case '90days':
            startDate = subDays(endDate, 90);
            break;
          case 'custom':
            if (customStartDate && customEndDate) {
              startDate = parse(customStartDate, 'yyyy-MM-dd', new Date());
              endDate.setTime(parse(customEndDate, 'yyyy-MM-dd', new Date()).getTime());
            } else {
              startDate = subDays(endDate, 30);
            }
            break;
          default:
            startDate = subDays(endDate, 30);
        }

        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef,
          where('clubId', '==', clubId),
          where('createdAt', '>=', startOfDay(startDate)),
          where('createdAt', '<=', endOfDay(endDate))
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBookingsData(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isOpen, clubId, dateRange, customStartDate, customEndDate]);

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!bookingsData.length) {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        uniqueUsers: 0,
        avgBookingValue: 0,
        revenueTrend: [],
        timeSlotsHeatmap: {},
        courtUtilization: {},
        topUsers: [],
        statusDistribution: {},
      };
    }

    // Total metrics
    const totalRevenue = bookingsData.reduce((sum, b) => sum + (b.price || 0), 0);
    const totalBookings = bookingsData.length;
    const uniqueUsers = new Set(bookingsData.map((b) => b.userId)).size;
    const avgBookingValue = totalRevenue / totalBookings;

    // Revenue trend by date
    const revenueByDate = {};
    bookingsData.forEach((booking) => {
      const date = format(booking.createdAt.toDate(), 'yyyy-MM-dd');
      revenueByDate[date] = (revenueByDate[date] || 0) + (booking.price || 0);
    });

    const revenueTrend = Object.entries(revenueByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({
        date: format(parse(date, 'yyyy-MM-dd', new Date()), 'dd MMM', { locale: it }),
        revenue,
      }));

    // Time slots heatmap (hour of day)
    const timeSlotsHeatmap = {};
    bookingsData.forEach((booking) => {
      if (booking.startTime) {
        const hour = format(booking.startTime.toDate(), 'HH');
        timeSlotsHeatmap[hour] = (timeSlotsHeatmap[hour] || 0) + 1;
      }
    });

    // Court utilization
    const courtUtilization = {};
    bookingsData.forEach((booking) => {
      const courtId = booking.courtId || 'unknown';
      if (!courtUtilization[courtId]) {
        courtUtilization[courtId] = { bookings: 0, revenue: 0 };
      }
      courtUtilization[courtId].bookings += 1;
      courtUtilization[courtId].revenue += booking.price || 0;
    });

    // Top users by bookings
    const userBookings = {};
    bookingsData.forEach((booking) => {
      const userId = booking.userId || 'unknown';
      if (!userBookings[userId]) {
        userBookings[userId] = { count: 0, revenue: 0, userName: booking.userName || 'Unknown' };
      }
      userBookings[userId].count += 1;
      userBookings[userId].revenue += booking.price || 0;
    });

    const topUsers = Object.entries(userBookings)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([userId, data]) => ({ userId, ...data }));

    // Status distribution
    const statusDistribution = {};
    bookingsData.forEach((booking) => {
      const status = booking.status || 'unknown';
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
    });

    return {
      totalRevenue,
      totalBookings,
      uniqueUsers,
      avgBookingValue,
      revenueTrend,
      timeSlotsHeatmap,
      courtUtilization,
      topUsers,
      statusDistribution,
    };
  }, [bookingsData]);

  // Chart configurations
  const revenueTrendChart = {
    labels: analytics.revenueTrend.map((d) => d.date),
    datasets: [
      {
        label: 'Revenue (€)',
        data: analytics.revenueTrend.map((d) => d.revenue),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const timeSlotsHeatmapChart = {
    labels: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
    datasets: [
      {
        label: 'Bookings per Hour',
        data: Array.from({ length: 24 }, (_, i) => {
          const hour = i.toString().padStart(2, '0');
          return analytics.timeSlotsHeatmap[hour] || 0;
        }),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const courtUtilizationChart = {
    labels: Object.keys(analytics.courtUtilization),
    datasets: [
      {
        label: 'Bookings',
        data: Object.values(analytics.courtUtilization).map((c) => c.bookings),
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(168, 85, 247, 0.7)',
        ],
      },
    ],
  };

  const statusDistributionChart = {
    labels: Object.keys(analytics.statusDistribution).map((s) => {
      const statusLabels = {
        confirmed: 'Confermati',
        pending: 'In attesa',
        cancelled: 'Cancellati',
        completed: 'Completati',
      };
      return statusLabels[s] || s;
    }),
    datasets: [
      {
        data: Object.values(analytics.statusDistribution),
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(59, 130, 246, 0.7)',
        ],
      },
    ],
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Court', 'Time', 'Price', 'Status'];
    const rows = bookingsData.map((b) => [
      format(b.createdAt.toDate(), 'dd/MM/yyyy'),
      b.userName || 'Unknown',
      b.courtName || 'Unknown',
      b.startTime ? format(b.startTime.toDate(), 'HH:mm') : 'N/A',
      `€${b.price?.toFixed(2) || '0.00'}`,
      b.status || 'unknown',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Booking Analytics
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Revenue trends, court utilization, and user behavior
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Date Range:
              </span>
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>

            {dateRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-gray-600 dark:text-gray-400">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </>
            )}

            <button
              onClick={exportToCSV}
              className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8 opacity-80" />
                    <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">
                      Total
                    </span>
                  </div>
                  <p className="text-3xl font-bold">€{analytics.totalRevenue.toFixed(2)}</p>
                  <p className="text-sm opacity-80 mt-1">Total Revenue</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-8 h-8 opacity-80" />
                    <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">
                      Count
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{analytics.totalBookings}</p>
                  <p className="text-sm opacity-80 mt-1">Total Bookings</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 opacity-80" />
                    <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">
                      Unique
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{analytics.uniqueUsers}</p>
                  <p className="text-sm opacity-80 mt-1">Unique Users</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 opacity-80" />
                    <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">
                      Average
                    </span>
                  </div>
                  <p className="text-3xl font-bold">€{analytics.avgBookingValue.toFixed(2)}</p>
                  <p className="text-sm opacity-80 mt-1">Avg Booking Value</p>
                </div>
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Revenue Trend
                  </h3>
                  <Line
                    data={revenueTrendChart}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context) => `€${context.parsed.y.toFixed(2)}`,
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => `€${value}`,
                          },
                        },
                      },
                    }}
                  />
                </div>

                {/* Time Slots Heatmap */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Time Slots Heatmap
                  </h3>
                  <Bar
                    data={timeSlotsHeatmapChart}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        y: { beginAtZero: true },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Court Utilization */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Court Utilization
                  </h3>
                  <Doughnut
                    data={courtUtilizationChart}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'right' },
                      },
                    }}
                  />
                </div>

                {/* Status Distribution */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Booking Status
                  </h3>
                  <Doughnut
                    data={statusDistributionChart}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'right' },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Top Users Table */}
              <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Top 10 Users by Bookings
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          #
                        </th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          User
                        </th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Bookings
                        </th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topUsers.map((user, index) => (
                        <tr
                          key={user.userId}
                          className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                            {index + 1}
                          </td>
                          <td className="p-3 text-sm text-gray-900 dark:text-white font-medium">
                            {user.userName}
                          </td>
                          <td className="p-3 text-sm text-gray-900 dark:text-white text-right">
                            {user.count}
                          </td>
                          <td className="p-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                            €{user.revenue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingAnalyticsDashboard;
