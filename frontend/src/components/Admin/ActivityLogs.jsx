import { useState, useEffect } from 'react';
import api from '../../services/api.js';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [page, filterAction]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 50,
      });

      if (filterAction !== 'all') {
        params.append('action', filterAction);
      }

      const response = await api.get(`/admin/logs?${params}`);
      setLogs(response.data.logs || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setError('');
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      user_login: '🔓',
      user_logout: '🔐',
      user_register: '✅',
      game_add: '➕',
      game_delete: '🗑️',
      game_import: '📦',
      admin_action: '🔧',
      settings_change: '⚙️',
      error: '❌',
    };
    return icons[action] || '📋';
  };

  const getActionColor = (action) => {
    if (action.includes('error')) return 'text-red-400';
    if (action.includes('admin')) return 'text-purple-400';
    if (action.includes('delete')) return 'text-orange-400';
    if (action.includes('add') || action.includes('import')) return 'text-green-400';
    if (action.includes('login')) return 'text-blue-400';
    return 'text-gray-400';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">
          <div className="animate-spin text-2xl mb-2">⏳</div>
          <p>Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">🔍 Filter by Action</h3>
        <select
          value={filterAction}
          onChange={(e) => {
            setFilterAction(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-48 px-4 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Actions</option>
          <option value="user_login">🔓 User Login</option>
          <option value="user_logout">🔐 User Logout</option>
          <option value="user_register">✅ User Register</option>
          <option value="game_add">➕ Game Added</option>
          <option value="game_delete">🗑️ Game Deleted</option>
        </select>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
          ❌ {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-gray-300 text-sm">
          <thead className="bg-gray-700 border-b border-gray-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Details</th>
              <th className="px-4 py-3 font-semibold">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                  No activity logs found
                </td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)} {log.action.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">{log.user_email || 'System'}</td>
                  <td className="px-4 py-3 text-gray-400">
                    <span title={log.details}>{log.details}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    <div>{new Date(log.created_at).toLocaleDateString()}</div>
                    <div>{new Date(log.created_at).toLocaleTimeString()}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
          <p className="text-gray-300">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-semibold disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-semibold disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
