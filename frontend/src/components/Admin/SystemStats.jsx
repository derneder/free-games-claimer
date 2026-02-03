import React from 'react';

export default function SystemStats({ stats }) {
  const StatCard = ({ icon, label, value, trend, color }) => (
    <div className="bg-gray-700 rounded-lg p-6 flex-1 min-w-[200px]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${
              trend > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% this week
            </p>
          )}
        </div>
        <div className={`text-3xl ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">System Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="👥"
          label="Total Users"
          value={stats?.users?.total || 0}
          trend={stats?.users?.trend}
          color="text-blue-400"
        />
        <StatCard
          icon="🟢"
          label="Active Users"
          value={stats?.users?.active || 0}
          trend={stats?.users?.activeTrend}
          color="text-green-400"
        />
        <StatCard
          icon="🎮"
          label="Total Games"
          value={stats?.games?.total || 0}
          trend={stats?.games?.trend}
          color="text-purple-400"
        />
        <StatCard
          icon="💵"
          label="Total Value"
          value={`$${stats?.games?.totalValue || 0}`}
          trend={stats?.games?.valueTrend}
          color="text-green-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Distribution */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Games by Source</h3>
          <div className="space-y-3">
            {stats?.gamesBySource?.map((source) => (
              <div key={source.name} className="flex items-center justify-between">
                <span className="text-gray-300">{source.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(source.count / stats?.games?.total) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-right w-12 text-sm">{source.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Registrations (7d)</span>
              <span className="font-bold">{stats?.activity?.registrations || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Logins (24h)</span>
              <span className="font-bold">{stats?.activity?.logins || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Games Added (7d)</span>
              <span className="font-bold">{stats?.activity?.gamesAdded || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Failed Logins (24h)</span>
              <span className="font-bold text-red-400">{stats?.activity?.failedLogins || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Database Size */}
      <div className="mt-6 bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Database & Cache</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Database Size</p>
            <p className="text-xl font-bold mt-1">{stats?.db?.size || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Cache Keys</p>
            <p className="text-xl font-bold mt-1">{stats?.cache?.keys || 0}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Cache Hit Rate</p>
            <p className="text-xl font-bold mt-1">{stats?.cache?.hitRate || 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
