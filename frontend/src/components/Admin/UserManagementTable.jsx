import React from 'react';

export default function UserManagementTable({ users, onAction }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4">ID</th>
            <th className="text-left py-3 px-4">Email</th>
            <th className="text-left py-3 px-4">Username</th>
            <th className="text-left py-3 px-4">Role</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">2FA</th>
            <th className="text-left py-3 px-4">Joined</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
              <td className="py-3 px-4">{user.id}</td>
              <td className="py-3 px-4">{user.email}</td>
              <td className="py-3 px-4">@{user.username}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-sm ${
                  user.role === 'admin' ? 'bg-red-900 text-red-200' : 'bg-blue-900 text-blue-200'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-sm ${
                  user.is_active ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                }`}>
                  {user.is_active ? '✅ Active' : '❌ Inactive'}
                </span>
              </td>
              <td className="py-3 px-4">
                {user.two_factor_enabled ? '🔐 Enabled' : '🔓 Disabled'}
              </td>
              <td className="py-3 px-4 text-sm text-gray-400">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  {user.is_active ? (
                    <button
                      onClick={() => onAction(user.id, 'deactivate')}
                      className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
                    >
                      🔒 Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => onAction(user.id, 'activate')}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                    >
                      ✅ Activate
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Are you sure? This action cannot be undone.')) {
                        onAction(user.id, 'delete');
                      }
                    }}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
