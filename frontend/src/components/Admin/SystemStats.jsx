import React from 'react';

export default function SystemStats({ stats }) {
  if (!stats) return null;

  const StatCard = ({ icon, label, value, change }) => (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-sm font-semibold ${
          change >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      </div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="👥"
          label="Total Users"
          value={stats.totalUsers || 0}
          change={stats.userGrowth || 0}
        />
        <StatCard
          icon="🎮"
          label="Games Claimed"
          value={stats.totalGamesClaimed || 0}
          change={stats.gamesGrowth || 0}
        />
        <StatCard
          icon="💰"
          label="Total Value"
          value={`$${(stats.totalValue || 0).toFixed(2)}`}
          change={stats.valueGrowth || 0}
        />
        <StatCard
          icon="🔄"
          label="Active Sessions"
          value={stats.activeSessions || 0}
          change={stats.sessionGrowth || 0}
        />
      </div>

      {/* Server Health */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-4">🔧 Server Health</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span>CPU Usage</span>
              <span className="font-semibold">{stats.cpuUsage || 0}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${stats.cpuUsage || 0}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Memory Usage</span>
              <span className="font-semibold">{stats.memoryUsage || 0}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-yellow-600 h-2 rounded-full"
                style={{ width: `${stats.memoryUsage || 0}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Database Usage</span>
              <span className="font-semibold">{stats.dbUsage || 0}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${stats.dbUsage || 0}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Redis Cache</span>
              <span className="font-semibold">{stats.cacheHitRate || 0}% Hit Rate</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${stats.cacheHitRate || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* API Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4">📊 API Requests (24h)</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Requests</span>
              <span className="font-semibold">{stats.apiRequests24h || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Response Time</span>
              <span className="font-semibold">{stats.avgResponseTime || 0}ms</span>
            </div>
            <div className="flex justify-between">
              <span>Error Rate</span>
              <span className="font-semibold text-red-400">{stats.errorRate || 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4">⚠️ System Alerts</h3>
          <div className="space-y-2">
            {stats.alerts && stats.alerts.length > 0 ? (
              stats.alerts.map((alert, i) => (
                <div key={i} className="text-sm p-2 bg-red-900/50 rounded text-red-200">
                  {alert}
                </div>
              ))
            ) : (
              <p className="text-green-400 text-sm">✅ No active alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
