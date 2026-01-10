import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { User, UserRole, PermissionModule } from '../types/auth';
import { Plus, Edit, User as UserIcon, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

interface ProfileChangeRequest {
  id: number;
  userId: number;
  user: { username: string; name: string };
  field: string;
  oldValue: string;
  newValue: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'permissions'>(isSuperAdmin ? 'permissions' : 'users');
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<ProfileChangeRequest[]>([]);
  const [, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userModules, setUserModules] = useState<PermissionModule[]>([]);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'USER' as UserRole,
    branch: '',
    position: ''
  });

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'requests') {
      fetchRequests();
    } else if (activeTab === 'permissions' && isSuperAdmin) {
      fetchUsers().then(() => {
        const first = users[0];
        if (first) {
          setSelectedUserId(first.id);
          fetchPermissions(first.id);
        }
      });
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get<User[]>('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get<ProfileChangeRequest[]>('/users/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ username: '', password: '', name: '', role: 'USER', branch: '', position: '' });
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't fill password
      name: user.name,
      role: user.role,
      branch: user.branch || '',
      position: user.position || ''
    });
    setIsModalOpen(true);
  };

  const handleRequestAction = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.put(`/users/requests/${id}`, { status });
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error processing request');
    }
  };

  const roles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'FARM_ADMIN', 'POS_USER', 'USER'];
  const MODULE_OPTIONS: PermissionModule['module'][] = [
    'DASHBOARD',
    'INVESTMENT',
    'EXPENSES',
    'POS',
    'INVENTORY',
    'SLAUGHTER',
    'PRODUCTS',
    'REPORTS',
    'USERS',
    'ALLOWANCE',
    'MY_ALLOWANCE',
    'PROFILE',
    'AUDIT'
  ];

  const fetchPermissions = async (userId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/users/${userId}/permissions`);
      const modules: PermissionModule[] = res.data.modules || [];
      const normalized = MODULE_OPTIONS.map(m => {
        const found = modules.find(x => x.module === m);
        return found || { id: 0, userId, module: m, allowed: true };
      });
      setUserModules(normalized);
    } catch (error) {
      setUserModules(MODULE_OPTIONS.map(m => ({ id: 0, userId, module: m, allowed: true })));
    } finally {
      setLoading(false);
    }
  };

  const savePermissions = async () => {
    if (!selectedUserId) return;
    try {
      const payload = { modules: userModules.map(m => ({ module: m.module, allowed: m.allowed })) };
      await api.put(`/users/${selectedUserId}/permissions`, payload);
      alert('Permissions saved');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving permissions');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <UserIcon className="text-green-600" />
          User Management
        </h1>
        <div className="flex bg-gray-200 p-1 rounded-lg">
            <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}
            >
            Users
            </button>
            <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'requests' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}
            >
            Profile Requests
            {requests.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{requests.length}</span>
            )}
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('permissions')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'permissions' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}
              >
                Permissions
              </button>
            )}
        </div>
      </div>

      {activeTab === 'users' && (
        <>
            <div className="mb-4 flex justify-end">
                <button
                onClick={() => {
                    setEditingUser(null);
                    setFormData({ username: '', password: '', name: '', role: 'USER', branch: '', position: '' });
                    setIsModalOpen(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                >
                <Plus size={20} />
                Add User
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch / Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                            {user.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'FINANCE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {user.role}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                        <div>{user.branch || '-'}</div>
                        <div className="text-xs">{user.position}</div>
                        </td>
                        <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                        <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900">
                            <Edit size={18} />
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </>
      )}

      {activeTab === 'requests' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
             {requests.length === 0 ? (
                 <div className="p-8 text-center text-gray-500">No pending profile change requests.</div>
             ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Old Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((req) => (
                        <tr key={req.id}>
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{req.user.name}</div>
                                <div className="text-xs text-gray-500">@{req.user.username}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 uppercase">{req.field}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{req.oldValue || '-'}</td>
                            <td className="px-6 py-4 text-sm font-medium text-blue-600">{req.newValue}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                <button 
                                    onClick={() => handleRequestAction(req.id, 'APPROVED')}
                                    className="text-green-600 hover:text-green-900"
                                    title="Approve"
                                >
                                    <CheckCircle size={20} />
                                </button>
                                <button 
                                    onClick={() => handleRequestAction(req.id, 'REJECTED')}
                                    className="text-red-600 hover:text-red-900"
                                    title="Reject"
                                >
                                    <XCircle size={20} />
                                </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
             )}
          </div>
      )}

      {activeTab === 'permissions' && isSuperAdmin && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-gray-700">Select User</label>
            <select
              value={selectedUserId ?? ''}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedUserId(id);
                fetchPermissions(id);
              }}
              className="mt-1 block rounded-md border-gray-300 shadow-sm p-2 border"
            >
              <option value="" disabled>Select a user</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} (@{u.username}) - {u.role}
                </option>
              ))}
            </select>
          </div>

          {selectedUserId ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">Module Access</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {userModules.map((m, idx) => (
                  <label key={m.module} className="flex items-center gap-2 p-3 border rounded-md">
                    <input
                      type="checkbox"
                      checked={m.allowed}
                      onChange={(e) => {
                        const next = [...userModules];
                        next[idx] = { ...m, allowed: e.target.checked };
                        setUserModules(next);
                      }}
                    />
                    <span className="text-sm font-medium">
                      {m.module === 'POS' ? 'POS System' :
                       m.module === 'INVENTORY' ? 'Inventory' :
                       m.module === 'SLAUGHTER' ? 'Slaughter' :
                       m.module === 'PRODUCTS' ? 'Products' :
                       m.module === 'REPORTS' ? 'Reports' :
                       m.module === 'USERS' ? 'User Management' :
                       m.module === 'INVESTMENT' ? 'Investment' :
                       m.module === 'EXPENSES' ? 'Expenses' :
                       m.module === 'ALLOWANCE' ? 'Allowance' :
                       m.module === 'MY_ALLOWANCE' ? 'My Allowance' :
                       m.module === 'PROFILE' ? 'Profile' :
                       m.module === 'AUDIT' ? 'Audit Logs' : 'Dashboard'}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={savePermissions}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Save Permissions
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Select a user to manage permissions.</div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Create New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              disabled={!!editingUser}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>
          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>
          )}
          {editingUser && (
             <div>
             <label className="block text-sm font-medium text-gray-700">New Password (Leave blank to keep current)</label>
             <input
               type="password"
               value={formData.password}
               onChange={(e) => setFormData({...formData, password: e.target.value})}
               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
             />
           </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({...formData, branch: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="mr-2 px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              {editingUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
