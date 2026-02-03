/**
 * Admin Page
 * 
 * Admin dashboard with system stats and user management.
 */

import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/Common/LoadingSpinner';

function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAdmin();
  }, []);

  const loadAdmin = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getUsers(1, 20),
      ]);
      setStats(statsData.data);
      setUsers(usersData.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading admin panel..." />;

  return (
    <div className="py-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* System Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <div className="text-gray-600 text-sm font-medium">Total Users</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
          </div>
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <div className="text-gray-600 text-sm font-medium">Total Games</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalGames}</div>
          </div>
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <div className="text-gray-600 text-sm font-medium">Total Activities</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalActivities}</div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Username</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-600">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
