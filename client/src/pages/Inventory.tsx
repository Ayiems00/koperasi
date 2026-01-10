import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Livestock, CreateLivestockData } from '../types/livestock';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';

const Inventory = () => {
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CHICKEN' | 'COW'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<CreateLivestockData>({
    type: 'CHICKEN',
    quantity: 1,
    dateReceived: new Date().toISOString().split('T')[0],
  });

  const fetchLivestock = async () => {
    setLoading(true);
    try {
      let url = '/livestock';
      if (activeTab !== 'ALL') {
        url += `?type=${activeTab}`;
      }
      const response = await api.get<Livestock[]>(url);
      setLivestock(response.data);
    } catch (error) {
      console.error('Error fetching livestock:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivestock();
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/livestock', formData);
      setIsAddModalOpen(false);
      fetchLivestock();
      // Reset form (keep date)
      setFormData({
        type: 'CHICKEN',
        quantity: 1,
        dateReceived: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error adding livestock:', error);
      alert('Failed to add livestock');
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Livestock Inventory</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          Add Livestock
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit mb-6">
        {['ALL', 'CHICKEN', 'COW'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-green-800 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'ALL' ? 'All Inventory' : tab === 'CHICKEN' ? 'Chickens' : 'Cows'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading inventory...</div>
        ) : livestock.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No livestock found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID / Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Received</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {livestock.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.type === 'COW' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.type === 'COW' ? `Tag: ${item.tagId || '-'}` : `Batch: ${item.batchId || '-'}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'ALIVE' ? 'bg-green-100 text-green-800' : 
                        item.status === 'SLAUGHTERED' ? 'bg-gray-100 text-gray-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.dateReceived).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.farmLocation || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Livestock"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="CHICKEN">Chicken</option>
              <option value="COW">Cow</option>
            </select>
          </div>

          {formData.type === 'CHICKEN' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch ID</label>
              <input
                type="text"
                name="batchId"
                value={formData.batchId || ''}
                onChange={handleInputChange}
                placeholder="e.g. BATCH-2023-001"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag ID</label>
              <input
                type="text"
                name="tagId"
                value={formData.tagId || ''}
                onChange={handleInputChange}
                placeholder="e.g. COW-001"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
            <input
              type="date"
              name="dateReceived"
              value={formData.dateReceived}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                name="initialWeight"
                value={formData.initialWeight || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (RM)</label>
              <input
                type="number"
                step="0.01"
                name="costPrice"
                value={formData.costPrice || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farm Location</label>
            <input
              type="text"
              name="farmLocation"
              value={formData.farmLocation || ''}
              onChange={handleInputChange}
              placeholder="e.g. Barn A"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors mt-4"
          >
            Save Livestock
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
