import React from 'react';

export default function AuditLogs({ logs }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-900/30 text-red-200';
      case 'warning':
        return 'bg-yellow-900/30 text-yellow-200';
      case 'info':
        return 'bg-blue-900/30 text-blue-200';
      default:
        return 'bg-gray-700 text-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">📋 Audit Logs</h2>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs && logs.length > 0 ? (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-lg ${getSeverityColor(log.severity)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">{log.action}</p>
                  <p className="text-sm opacity-75">{log.description}</p>
                  <p className="text-xs opacity-50 mt-1">
                    User: {log.user_email} | IP: {log.ip_address}
                  </p>
                </div>
                <span className="text-xs whitespace-nowrap ml-2">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-8">No logs found</p>
        )}
      </div>
    </div>
  );
}
