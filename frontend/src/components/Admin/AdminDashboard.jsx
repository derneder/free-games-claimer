import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import UserManagementTable from './UserManagementTable';
import SystemStats from './SystemStats';
import AuditLogs from './AuditLogs';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Проверка админа
  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      window.location.href = '/dashboard';
    }
  }, [user, isLoading]);

  // Загрузи данные
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, usersRes, logsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=50'),
        api.get('/admin/logs?limit=50')
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setLogs(logsRes.data.logs);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      if (action === 'deactivate') {
        await api.patch(`/admin/users/${userId}/deactivate`);
      } else if (action === 'activate') {
        await api.patch(`/admin/users/${userId}/activate`);
      } else if (action === 'delete') {
        await api.delete(`/admin/users/${userId}`);
      }
      await fetchData();
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🔧 Admin Dashboard</h1>
        <p className="text-gray-400">Manage users, view system stats, and monitor activities</p>
      </div>

      {/* Refresh Button */}
      <div className="mb-6">
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : '🔄 Refresh Data'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-blue-600' : ''}`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-blue-600' : ''}`}
        >
          👥 Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 ${activeTab === 'logs' ? 'border-b-2 border-blue-600' : ''}`}
        >
          📝 Audit Logs
        </button>
      </div>

      {/* Content */}
      <div className="bg-gray-800 rounded-lg p-6">
        {activeTab === 'overview' && stats && (
          <SystemStats stats={stats} />
        )}
        
        {activeTab === 'users' && (
          <UserManagementTable 
            users={users} 
            onAction={handleUserAction}
          />
        )}
        
        {activeTab === 'logs' && (
          <AuditLogs logs={logs} />
        )}
      </div>
    </div>
  );
}
