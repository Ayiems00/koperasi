import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Beef, 
  Calendar,
  DollarSign,
  Wallet
} from 'lucide-react';

interface SalesReport {
  totalSales: number;
  totalTransactions: number;
  transactions: any[];
}

interface InventorySummary {
  type: string;
  status: string;
  count: number;
  quantity: number;
}

interface InventoryReport {
  products: any[];
  livestockSummary: InventorySummary[];
}

interface AllowanceReport {
  year: number;
  byMonth: Record<string, number>;
  byBranch: Record<string, number>;
  byCategory: Record<string, number>;
  statusCounts: Record<string, number>;
}

const Reports = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'allowance'>('sales');
  const [loading, setLoading] = useState(false);
  
  // Sales Filters
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [salesData, setSalesData] = useState<SalesReport | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryReport | null>(null);
  const [allowanceData, setAllowanceData] = useState<AllowanceReport | null>(null);

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesReport();
    } else if (activeTab === 'inventory') {
      fetchInventoryReport();
    } else if (activeTab === 'allowance') {
      fetchAllowanceReport();
    }
  }, [activeTab, startDate, endDate]);

  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      const response = await api.get<SalesReport>(`/reports/sales?startDate=${startDate}&endDate=${endDate}`);
      setSalesData(response.data);
    } catch (error) {
      console.error('Error fetching sales report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryReport = async () => {
    setLoading(true);
    try {
      const response = await api.get<InventoryReport>('/reports/inventory');
      setInventoryData(response.data);
    } catch (error) {
      console.error('Error fetching inventory report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllowanceReport = async () => {
    setLoading(true);
    try {
      const response = await api.get<AllowanceReport>('/reports/allowance');
      setAllowanceData(response.data);
    } catch (error) {
      console.error('Error fetching allowance report:', error);
    } finally {
      setLoading(false);
    }
  };

  const canViewAllowance = ['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(user?.role || '');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="text-green-600" />
          Reports & Analytics
        </h1>
        
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sales' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sales Report
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'inventory' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Inventory Status
          </button>
          {canViewAllowance && (
            <button
              onClick={() => setActiveTab('allowance')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'allowance' 
                  ? 'bg-white text-green-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Allowance (Elaun) Report
            </button>
          )}
        </div>
      </div>

      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-md p-2"
              />
            </div>
            <button 
              onClick={fetchSalesReport}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mb-[1px]"
            >
              Filter
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    RM {salesData?.totalSales.toFixed(2) || '0.00'}
                  </h3>
                </div>
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Transactions</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {salesData?.totalTransactions || 0}
                  </h3>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Avg. Transaction</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    RM {salesData && salesData.totalTransactions > 0 
                      ? (salesData.totalSales / salesData.totalTransactions).toFixed(2) 
                      : '0.00'}
                  </h3>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <Calendar size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cashier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
                  ) : salesData?.transactions.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No transactions found</td></tr>
                  ) : (
                    salesData?.transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(t.date).toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' })}
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {t.user?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {t.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          RM {t.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Livestock Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Beef className="text-orange-600" />
              <h2 className="text-xl font-bold text-gray-800">Livestock Summary</h2>
            </div>
            
            {loading ? <p>Loading...</p> : (
              <div className="space-y-4">
                {inventoryData?.livestockSummary.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div>
                      <h4 className="font-bold text-gray-800">{item.type}</h4>
                      <p className="text-xs text-gray-500">{item.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-orange-700">{item.quantity} Heads</p>
                      <p className="text-xs text-gray-500">{item.count} Records</p>
                    </div>
                  </div>
                ))}
                {inventoryData?.livestockSummary.length === 0 && <p className="text-gray-500">No livestock data.</p>}
              </div>
            )}
          </div>

          {/* Product Stock */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Product Stock Levels</h2>
            </div>

            {loading ? <p>Loading...</p> : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {inventoryData?.products.map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-3 border-b last:border-0">
                    <div>
                      <h4 className="font-medium text-gray-800">{product.name}</h4>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                        {product.stock} {product.unitType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'allowance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2 bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded text-sm">
            Compliance: All recorded allowances are cooperative-approved allowances and do not represent salary, wages, or payroll under employment contracts, in accordance with cooperative governance practices.
          </div>
          {/* Monthly Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Allowance by Month ({allowanceData?.year})</h2>
            </div>
            
            {loading ? <p>Loading...</p> : (
              <div className="space-y-4">
                {Object.entries(allowanceData?.byMonth || {}).map(([month, amount]) => (
                  <div key={month} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div>
                      <h4 className="font-bold text-gray-800">{new Date(0, parseInt(month) - 1).toLocaleString('default', { month: 'long' })}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-700">RM {amount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {Object.keys(allowanceData?.byMonth || {}).length === 0 && <p className="text-gray-500">No allowance data for this year.</p>}
              </div>
            )}
          </div>

          {/* Branch Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Allowance by Branch</h2>
            </div>

            {loading ? <p>Loading...</p> : (
              <div className="space-y-3">
                {Object.entries(allowanceData?.byBranch || {}).map(([branch, amount]) => (
                  <div key={branch} className="flex justify-between items-center p-3 border-b last:border-0">
                    <div>
                      <h4 className="font-medium text-gray-800">{branch}</h4>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-600">
                        RM {amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                 {Object.keys(allowanceData?.byBranch || {}).length === 0 && <p className="text-gray-500">No allowance data by branch.</p>}
              </div>
            )}
          </div>
          
          {/* Category Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Allowance by Category</h2>
            </div>
            {loading ? <p>Loading...</p> : (
              <div className="space-y-3">
                {Object.entries(allowanceData?.byCategory || {}).map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between items-center p-3 border-b last:border-0">
                    <div>
                      <h4 className="font-medium text-gray-800">{cat}</h4>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-600">RM {amount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                {Object.keys(allowanceData?.byCategory || {}).length === 0 && <p className="text-gray-500">No allowance data by category.</p>}
              </div>
            )}
          </div>
          
          {/* Status Summary & Export */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Invoice Status Summary</h2>
              </div>
              <div className="flex gap-2">
                <a href={`/api/reports/allowance/export/csv?year=${allowanceData?.year || new Date().getFullYear()}`} className="px-3 py-2 bg-gray-100 rounded-md text-sm">Export CSV</a>
                <a href={`/api/reports/allowance/export/excel?year=${allowanceData?.year || new Date().getFullYear()}`} className="px-3 py-2 bg-gray-100 rounded-md text-sm">Export Excel</a>
                <a href={`/api/reports/allowance/export/pdf?year=${allowanceData?.year || new Date().getFullYear()}`} className="px-3 py-2 bg-gray-100 rounded-md text-sm">Export PDF</a>
              </div>
            </div>
            {loading ? <p>Loading...</p> : (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(allowanceData?.statusCounts || {}).map(([st, cnt]) => (
                  <div key={st} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="text-xs text-gray-500">Status</div>
                    <div className="font-bold text-gray-800">{st}</div>
                    <div className="text-sm text-gray-700">Count: {cnt}</div>
                  </div>
                ))}
                {Object.keys(allowanceData?.statusCounts || {}).length === 0 && <p className="text-gray-500">No invoice status data.</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
