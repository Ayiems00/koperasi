import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User } from '../types/auth';
import { User as UserIcon, Edit } from 'lucide-react';
import Modal from '../components/Modal';

 

const Profile = () => {
  const { user: authUser } = useAuth(); // Context user might be stale if updated
  const [user, setUser] = useState<User | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    field: 'name', // name, phone (if exists), branch?
    newValue: ''
  });

  useEffect(() => {
    // Fetch latest user data from backend to ensure freshness
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        // Fallback to auth context
        if (authUser) setUser(authUser);
      }
    };
    fetchMe();
  }, [authUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/request-change', formData);
      alert('Change request submitted successfully. It will be reviewed by an admin.');
      setIsModalOpen(false);
      setFormData({ field: 'name', newValue: '' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error submitting request');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <UserIcon className="text-green-600" />
        My Profile
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <div className="flex items-center mb-6">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-3xl">
            {user.name.charAt(0)}
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500">@{user.username}</p>
            <span className={`mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
            }`}>
                {user.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Branch</label>
            <p className="text-lg font-medium text-gray-900">{user.branch || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Position</label>
            <p className="text-lg font-medium text-gray-900">{user.position || '-'}</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
          >
            <Edit className="mr-2" size={16} />
            Request Profile Change
          </button>
          <p className="mt-2 text-xs text-gray-500 text-center">
            Profile changes require admin approval.
          </p>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request Profile Change"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Field to Change</label>
            <select
              value={formData.field}
              onChange={(e) => setFormData({...formData, field: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            >
              <option value="name">Full Name</option>
              <option value="branch">Branch</option>
              <option value="position">Position</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Value</label>
            <input
              type="text"
              required
              value={formData.newValue}
              onChange={(e) => setFormData({...formData, newValue: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              placeholder="Enter new value"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
