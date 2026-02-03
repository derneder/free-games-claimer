import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [page, filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, gamesRes] = await Promise.all([
        api.get('/analytics/stats'),
        api.get(`/games?page=${page}&limit=10${filter ? `&source=${filter}` : ''}`),
      ]);
      setStats(statsRes.data);
      setGames(gamesRes.data.games);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">🎮 Free Games Claimer</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.username}</span>
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              ⚙️ Settings
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-2">🎮</div>
              <p className="text-gray-600 text-sm">Total Games</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGames}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-gray-600 text-sm">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-gray-600 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-gray-600 text-sm">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">4.5/5</p>
            </div>
          </div>
        )}

        {/* Games List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">My Games</h2>
              <button
                onClick={fetchData}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                🔄 Refresh
              </button>
            </div>

            <div className="flex gap-2">
              {['', 'epic-games', 'gog', 'steam'].map((source) => (
                <button
                  key={source}
                  onClick={() => {
                    setFilter(source);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    filter === source
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {source ? source.toUpperCase() : 'All'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading games...</div>
          ) : games.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No games found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-t">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Platform</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {games.map((game) => (
                    <tr key={game.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900 font-semibold">{game.title}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          {game.source.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{game.platform}</td>
                      <td className="px-6 py-3 text-sm text-gray-900 font-semibold">${game.steam_price_usd || 0}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {new Date(game.obtained_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
