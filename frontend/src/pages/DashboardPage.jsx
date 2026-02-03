/**
 * Dashboard Page
 * 
 * User dashboard showing games and statistics.
 */

import { useState, useEffect } from 'react';
import { gamesService } from '../services/gamesService';
import LoadingSpinner from '../components/Common/LoadingSpinner';

function DashboardPage() {
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [gamesData, statsData] = await Promise.all([
        gamesService.getGames(1, 10),
        gamesService.getStats(),
      ]);
      setGames(gamesData.data);
      setStats(statsData.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div className="py-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <div className="text-gray-600 text-sm font-medium">Total Games</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalGames}</div>
          </div>
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <div className="text-gray-600 text-sm font-medium">Total Value</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">${stats.totalValue}</div>
          </div>
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <div className="text-gray-600 text-sm font-medium">Avg. Value</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              ${(stats.totalValue / (stats.totalGames || 1)).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Games List */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Recent Games</h2>
        </div>
        <div className="divide-y">
          {games.length > 0 ? (
            games.map((game) => (
              <div key={game.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{game.title}</h3>
                    {game.description && (
                      <p className="text-gray-600 text-sm mt-1">{game.description}</p>
                    )}
                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                      <span>Price: ${game.price}</span>
                      <span>Claimed: {new Date(game.claimedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {game.image && (
                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-600">
              No games claimed yet. Start claiming free games!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
