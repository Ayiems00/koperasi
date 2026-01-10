import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Livestock } from '../types/livestock';
import { Product } from '../types/product';
import { ProcessSlaughterData } from '../types/slaughter';
import Modal from '../components/Modal';
import { Beef, ArrowRight } from 'lucide-react';

const Slaughter = () => {
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [selectedLivestockId, setSelectedLivestockId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(1);
  const [yieldWeight, setYieldWeight] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [productQuantity, setProductQuantity] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [livestockRes, productsRes] = await Promise.all([
        api.get<Livestock[]>('/livestock?status=ALIVE'),
        api.get<Product[]>('/products')
      ]);
      setLivestock(livestockRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLivestockId || !selectedProductId) return;

    const payload: ProcessSlaughterData = {
      livestockId: Number(selectedLivestockId),
      quantity: Number(quantity),
      yieldWeight: Number(yieldWeight),
      notes,
      producedProducts: [
        {
          productId: Number(selectedProductId),
          quantity: Number(productQuantity)
        }
      ]
    };

    try {
      await api.post('/slaughter', payload);
      setIsModalOpen(false);
      fetchData(); // Refresh data
      // Reset form
      setQuantity(1);
      setYieldWeight(0);
      setNotes('');
      setProductQuantity(0);
      setSelectedLivestockId('');
    } catch (error) {
      console.error('Error processing slaughter:', error);
      alert('Failed to process slaughter');
    }
  };

  const getSelectedLivestock = () => {
    return livestock.find(l => l.id === Number(selectedLivestockId));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Slaughter Processing</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors"
        >
          <Beef size={20} />
          Process Slaughter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Livestock Available */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Available Livestock</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-3">
              {livestock.slice(0, 5).map(item => (
                <div key={item.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.type === 'COW' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {item.type}
                    </span>
                    <p className="font-medium mt-1">
                      {item.type === 'COW' ? `Tag: ${item.tagId}` : `Batch: ${item.batchId}`}
                    </p>
                    <p className="text-sm text-gray-500">Available: {item.quantity}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedLivestockId(item.id);
                      setIsModalOpen(true);
                    }}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Select
                  </button>
                </div>
              ))}
              {livestock.length === 0 && <p className="text-gray-500">No livestock available for slaughter.</p>}
            </div>
          )}
        </div>

        {/* Recent Activity (Placeholder for now) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Processing Info</h2>
          <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
            <p className="mb-2"><strong>How it works:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Select livestock from inventory.</li>
              <li>Specify quantity to process.</li>
              <li>Record yield weight (Total KG).</li>
              <li>Select resulting product (e.g., Whole Chicken).</li>
              <li>System automatically updates livestock count and product stock.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Slaughter Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Process Slaughter"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Input Source */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">1. Source Livestock</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Livestock</label>
                <select
                  value={selectedLivestockId}
                  onChange={(e) => setSelectedLivestockId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                >
                  <option value="">-- Select Livestock --</option>
                  {livestock.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.type} - {l.type === 'COW' ? l.tagId : l.batchId} (Qty: {l.quantity})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedLivestockId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Slaughter</label>
                  <input
                    type="number"
                    min="1"
                    max={getSelectedLivestock()?.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max available: {getSelectedLivestock()?.quantity}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center text-gray-400">
            <ArrowRight size={24} className="transform rotate-90 md:rotate-0" />
          </div>

          {/* Step 2: Output Product */}
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <h3 className="text-sm font-bold text-green-800 mb-2 uppercase tracking-wide">2. Product Output</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Yield Weight (KG)</label>
                <input
                  type="number"
                  step="0.01"
                  value={yieldWeight}
                  onChange={(e) => setYieldWeight(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Total weight of meat produced"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                >
                  <option value="">-- Select Product to Stock Up --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Stock: {p.stock} {p.unitType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Added to Stock</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  How much/many to add to product inventory?
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-md hover:bg-red-700 transition-colors shadow-lg"
          >
            Confirm Slaughter & Update Stock
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Slaughter;
