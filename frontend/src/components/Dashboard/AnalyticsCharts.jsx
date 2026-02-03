import { useState, useEffect } from 'react';
import {
  LineChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api.js';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded p-2 shadow-lg">
        <p className="text-gray-300 text-xs font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-xs font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsCharts() {
  const [activityData, setActivityData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [platformData, setPlatformData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const [activityRes, distRes, platformRes] = await Promise.all([
        api.get(`/analytics/activity?period=${period}`),
        api.get('/analytics/distribution'),
        api.get('/analytics/stats'),
      ]);

      setActivityData(activityRes.data || []);

      const dist = (distRes.data?.distribution || []).map((item) => ({
        name: item.source?.toUpperCase() || 'Unknown',
        value: item.count,
      }));
      setDistributionData(dist);

      const platforms = (platformRes.data?.byPlatform || []).map((item) => ({
        name: item.platform === 'windows' ? 'Windows' : item.platform === 'mac' ? 'macOS' : 'Linux',
        value: item.count,
      }));
      setPlatformData(platforms);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400 text-center">
          <div className="animate-spin text-4xl mb-2">⏳</div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
        ❌ {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">📅 Select Period</h3>
        <div className="flex gap-2 flex-wrap">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {p === 'week' ? '📆 This Week' : p === 'month' ? '📅 This Month' : '📋 This Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Line Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">📈 Games Added Over Time</h2>
        {activityData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#d1d5db' }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Games Added"
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-8">No data available</p>
        )}
      </div>

      {/* Distribution and Platform - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution Pie Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">🎯 Distribution by Source</h2>
          {distributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, _value, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                  }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">No data available</p>
          )}
        </div>

        {/* Platform Distribution Bar Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">🖥️ Distribution by Platform</h2>
          {platformData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#d1d5db' }} />
                <Bar dataKey="value" fill="#10b981" name="Games" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">📋 Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Games (All Time)</p>
            <p className="text-white text-2xl font-bold">
              {activityData.reduce((sum, item) => sum + (item.count || 0), 0)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Top Source</p>
            <p className="text-white text-2xl font-bold">
              {distributionData.length > 0 ? distributionData[0].name : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Main Platform</p>
            <p className="text-white text-2xl font-bold">
              {platformData.length > 0 ? platformData[0].name : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Last Updated</p>
            <p className="text-white text-lg font-bold">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
