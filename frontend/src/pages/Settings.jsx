import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    publicProfile: false,
  });

  const handleChange = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">⚙️ Settings</h1>
          </div>

          <div className="p-6 space-y-6">
            {/* Profile */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={() => handleChange('notifications')}
                    className="mr-3"
                  />
                  <span className="text-gray-700">Enable notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.emailUpdates}
                    onChange={() => handleChange('emailUpdates')}
                    className="mr-3"
                  />
                  <span className="text-gray-700">Receive email updates</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.publicProfile}
                    onChange={() => handleChange('publicProfile')}
                    className="mr-3"
                  />
                  <span className="text-gray-700">Make profile public</span>
                </label>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t">
              <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
