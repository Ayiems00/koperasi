import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Shield } from 'lucide-react';

interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
  user: { username: string; role: string };
  oldValue: string | null;
  newValue: string | null;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Shield className="text-purple-600" />
        System Audit Logs
      </h1>
      
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded mb-4 text-sm">
        Compliance: All recorded allowances are cooperative-approved allowances and do not represent salary, wages, or payroll under employment contracts, in accordance with cooperative governance practices.
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Time</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">User</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Action</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Entity</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Details</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {loading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(log.timestamp).toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' })}
                    </td>
                    <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{log.user.username}</div>
                    <div className="text-xs text-gray-500">{log.user.role}</div>
                    </td>
                    <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                        log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {log.action}
                    </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                    {log.entity} <span className="text-xs text-gray-400">#{log.entityId}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-md truncate" title={log.details || ''}>
                    {log.details}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
