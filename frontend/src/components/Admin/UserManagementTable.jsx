import React from 'react';

export default function UserManagementTable({ users, onAction }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left">Email</th>
            <th className="px-6 py-3 text-left">Username</th>
            <th className="px-6 py-3 text-center">2FA</th>
            <th className="px-6 py-3 text-center">Status</th>
            <th className="px-6 py-3 text-center">Registered</th>
            <th className="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-700/50">
              <td className="px-6 py-3">
                <a href={`mailto:${user.email}`} className="text-blue-400 hover:underline">
                  {user.email}
                </a>
              </td>
              <td className="px-6 py-3">@{user.username}</td>
              <td className="px-6 py-3 text-center">
                {user.two_factor_enabled ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-200">
                    ✅ Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                    ❌ Disabled
                  </span>
                )}
              </td>
              <td className="px-6 py-3 text-center">
                {user.is_active ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-200">
                    🟢 Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-200">
                    🔴 Inactive
                  </span>
                )}
              </td>
              <td className="px-6 py-3 text-center text-gray-400">
                {formatDate(user.created_at)}
              </td>
              <td className="px-6 py-3 text-center space-x-2">
                {user.is_active ? (
                  <button
                    onClick={() => onAction(user.id, 'deactivate')}
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => onAction(user.id, 'activate')}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                  >
                    Activate
                  </button>
                )}
                <button
                  onClick={() => onAction(user.id, 'delete')}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
