import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import UserManagement from './UserManagement';
import SystemStats from './SystemStats';
import ActivityLogs from './ActivityLogs';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'stats', label: '📋 Statistics', icon: '📋' },
    { id: 'users', label: '👥 Users', icon: '👥' },
    { id: 'logs', label: '📋 Logs', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">🔧 Admin Panel</h1>
        <p className="text-gray-400">Manage users, view statistics, and monitor system activity</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
          ❌ {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
        {loading && activeTab === 'stats' ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">
              <div className="animate-spin text-2xl mb-2">⏳</div>
              <p>Loading statistics...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'stats' && stats && <SystemStats stats={stats} />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'logs' && <ActivityLogs />}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
