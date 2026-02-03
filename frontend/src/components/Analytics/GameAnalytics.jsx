import { useState, useEffect } from 'react';
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
} from 'recharts';
import api from '../../services/api';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function GameAnalytics() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('7d'); // 7d, 30d, 90d, 1y
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/stats?period=${period}`);
      setData(res.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="text-center py-8">No data available</div>;
  }

  return (
    <div className="w-full bg-gray-900 text-white p-6 rounded-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">📊 Game Analytics</h1>

        {/* Period Selector */}
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded ${
                period === p ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {p === '7d'
                ? 'Last 7 Days'
                : p === '30d'
                  ? 'Last 30 Days'
                  : p === '90d'
                    ? 'Last 90 Days'
                    : 'Last Year'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Games Claimed Over Time */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">🎮 Games Claimed</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailyStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="games_claimed"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Games by Source */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">📦 Games by Source</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.gamesBySource || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {(data.gamesBySource || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Total Value Over Time */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">💰 Total Value ($)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.dailyStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              <Bar dataKey="total_value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Games */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">⭐ Most Popular Games</h2>
          <div className="space-y-2">
            {(data.topGames || []).map((game, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-2 hover:bg-gray-700 rounded"
              >
                <div>
                  <p className="font-semibold">{game.title}</p>
                  <p className="text-sm text-gray-400">{game.source.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{game.claimed_count}x</p>
                  <p className="text-sm text-gray-400">${game.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-400 text-sm">Games Claimed</p>
          <p className="text-3xl font-bold text-blue-400">{data.totalGamesClaimed || 0}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-400 text-sm">Total Value</p>
          <p className="text-3xl font-bold text-green-400">${(data.totalValue || 0).toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-400 text-sm">Active Users</p>
          <p className="text-3xl font-bold text-purple-400">{data.activeUsers || 0}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-400 text-sm">Avg Value/User</p>
          <p className="text-3xl font-bold text-orange-400">
            ${((data.totalValue || 0) / Math.max(data.activeUsers || 1, 1)).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
