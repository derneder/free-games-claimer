export default function SystemStats({ stats }) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">
          <div className="text-4xl mb-2">📊</div>
          <p>No statistics available</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: '👥',
      color: 'bg-blue-900',
      trend: `+${stats.newUsersThisMonth || 0} this month`,
    },
    {
      title: 'Total Games',
      value: stats.totalGames || 0,
      icon: '🎮',
      color: 'bg-green-900',
      trend: `+${stats.newGamesThisMonth || 0} this month`,
    },
    {
      title: 'Total Value',
      value: `$${(stats.totalValue || 0).toFixed(2)}`,
      icon: '💰',
      color: 'bg-yellow-900',
      trend: `Avg: $${((stats.totalValue || 0) / Math.max(stats.totalUsers || 1, 1)).toFixed(2)} per user`,
    },
    {
      title: 'Active Sessions',
      value: stats.activeSessions || 0,
      icon: '📡',
      color: 'bg-purple-900',
      trend: `System uptime: ${stats.uptime || 'N/A'}`,
    },
  ];

  const sourceData = stats.gamesBySource || [];
  const platformData = stats.gamesByPlatform || [];

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} bg-opacity-20 border border-opacity-20 ${card.color.replace('bg-', 'border-')} rounded-lg p-6`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-1">{card.title}</p>
                <p className="text-white text-3xl font-bold">{card.value}</p>
              </div>
              <div className="text-4xl opacity-50">{card.icon}</div>
            </div>
            <p className="text-gray-500 text-xs">{card.trend}</p>
          </div>
        ))}
      </div>

      {/* Source Distribution */}
      <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-6">
        <h3 className="text-white font-semibold text-lg mb-4">📊 Games by Source</h3>
        {sourceData.length > 0 ? (
          <div className="space-y-3">
            {sourceData.map((source, index) => {
              const percentage =
                sourceData.length > 0
                  ? (
                      (source.count /
                        sourceData.reduce((sum, s) => sum + s.count, 0)) *
                      100
                    ).toFixed(1)
                  : 0;

              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300 font-semibold">
                      {source.source.charAt(0).toUpperCase() + source.source.slice(1)}
                    </span>
                    <span className="text-white font-bold">{source.count} games</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        ['epic', 'gog', 'steam', 'prime'][index % 4] === 'epic'
                          ? 'bg-blue-500'
                          : ['epic', 'gog', 'steam', 'prime'][index % 4] === 'gog'
                            ? 'bg-yellow-500'
                            : ['epic', 'gog', 'steam', 'prime'][index % 4] === 'steam'
                              ? 'bg-gray-300'
                              : 'bg-purple-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{percentage}%</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">No data available</p>
        )}
      </div>

      {/* Platform Distribution */}
      <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-6">
        <h3 className="text-white font-semibold text-lg mb-4">🖥️ Games by Platform</h3>
        {platformData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platformData.map((platform, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-4 text-center border border-gray-600"
              >
                <p className="text-gray-400 text-sm mb-1">
                  {platform.platform === 'windows'
                    ? '🪟 Windows'
                    : platform.platform === 'mac'
                      ? '🍎 macOS'
                      : '🐧 Linux'}
                </p>
                <p className="text-white text-2xl font-bold">{platform.count}</p>
                <p className="text-gray-500 text-xs mt-2">
                  {(
                    (platform.count /
                      platformData.reduce((sum, p) => sum + p.count, 0)) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No data available</p>
        )}
      </div>

      {/* System Health */}
      <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-6">
        <h3 className="text-white font-semibold text-lg mb-4">⚕️ System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Database Connection</span>
              <span className="text-green-400 font-semibold">✅ Healthy</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="h-2 rounded-full bg-green-500" style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Redis Cache</span>
              <span className="text-green-400 font-semibold">✅ Healthy</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="h-2 rounded-full bg-green-500" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}