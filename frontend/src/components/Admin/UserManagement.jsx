import { useState, useEffect } from 'react';
import api from '../../services/api.js';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery, filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20,
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (filterRole !== 'all') {
        params.append('role', filterRole);
      }

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.users || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to deactivate user "${username}"?`)) {
      return;
    }

    try {
      await api.patch(`/admin/users/${userId}/deactivate`);
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: false } : u)));
    } catch (err) {
      console.error('Error deactivating user:', err);
      alert('Failed to deactivate user');
    }
  };

  const handleActivate = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to activate user "${username}"?`)) {
      return;
    }

    try {
      await api.patch(`/admin/users/${userId}/activate`);
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: true } : u)));
    } catch (err) {
      console.error('Error activating user:', err);
      alert('Failed to activate user');
    }
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm font-semibold">
          ✅ Active
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-red-900 text-red-300 rounded-full text-sm font-semibold">
        ❌ Inactive
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-900 text-purple-300',
      user: 'bg-blue-900 text-blue-300',
    };

    const icons = {
      admin: '👑',
      user: '👤',
    };

    return (
      <span className={`px-3 py-1 ${colors[role]} rounded-full text-sm font-semibold`}>
        {icons[role]} {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">
          <div className="animate-spin text-2xl mb-2">⏳</div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-700 rounded-lg p-4 space-y-4">
        <h3 className="text-white font-semibold">🔍 Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Search by email or username
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="john@example.com or john_doe"
              className="w-full px-4 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Filter by role</label>
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
          ❌ {error}
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-700 border-b border-gray-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Username</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold text-center">Games</th>
              <th className="px-4 py-3 font-semibold text-center">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                >
                  <td className="px-4 py-3 text-white">{user.email}</td>
                  <td className="px-4 py-3 text-white">{user.username}</td>
                  <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                  <td className="px-4 py-3 text-center text-white">{user.games_count || 0}</td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(user.is_active)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {user.is_active ? (
                        <button
                          onClick={() => handleDeactivate(user.id, user.username)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-semibold"
                          title="Deactivate"
                        >
                          🔐 Lock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(user.id, user.username)}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-semibold"
                          title="Activate"
                        >
                          🔓 Unlock
                        </button>
                      )}
                    </div>
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
