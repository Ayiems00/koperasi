import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  TrendingUp, 
  Package, 
  Beef, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    lowStockCount: 0,
    totalLivestock: 0,
    todaysSales: 0
  });

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        // This is a simplified fetch, ideally we'd have a specific dashboard endpoint
        const [inventoryRes, salesRes] = await Promise.all([
          api.get('/reports/inventory'),
          api.get(`/reports/sales?startDate=${new Date().toISOString().split('T')[0]}&endDate=${new Date().toISOString().split('T')[0]}`)
        ]);

        const products = inventoryRes.data.products || [];
        const livestock = inventoryRes.data.livestockSummary || [];
        const sales = salesRes.data.totalSales || 0;

        const lowStock = products.filter((p: any) => p.stock < 10).length;
        const totalAnimals = livestock.reduce((sum: number, item: any) => sum + item.quantity, 0);

        setStats({
          lowStockCount: lowStock,
          totalLivestock: totalAnimals,
          todaysSales: sales
        });
      } catch (error) {
        console.error("Error loading dashboard stats", error);
      }
    };

    fetchQuickStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, <span className="font-semibold text-green-700">{user?.name}</span>!</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
          {new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 font-medium mb-1">Today's Sales</p>
              <h3 className="text-3xl font-bold">RM {stats.todaysSales.toFixed(2)}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
          <Link to="/reports" className="mt-4 inline-flex items-center text-sm text-green-100 hover:text-white">
            View details <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium mb-1">Total Livestock</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.totalLivestock}</h3>
              <p className="text-xs text-gray-400 mt-1">Chickens & Cows</p>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg">
              <Beef size={24} className="text-orange-600" />
            </div>
          </div>
          <Link to="/inventory" className="mt-4 inline-flex items-center text-sm text-orange-600 hover:text-orange-700">
            Manage Inventory <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium mb-1">Low Stock Alerts</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.lowStockCount}</h3>
              <p className="text-xs text-gray-400 mt-1">Products needing restock</p>
            </div>
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </div>
          <Link to="/products" className="mt-4 inline-flex items-center text-sm text-red-600 hover:text-red-700">
            Check Products <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/pos" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-green-500 hover:shadow-md transition-all group text-center">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-600 transition-colors">
            <TrendingUp size={24} className="text-green-600 group-hover:text-white" />
          </div>
          <h3 className="font-semibold text-gray-800">New Sale</h3>
        </Link>

        <Link to="/slaughter" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-red-500 hover:shadow-md transition-all group text-center">
          <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-red-600 transition-colors">
            <Beef size={24} className="text-red-600 group-hover:text-white" />
          </div>
          <h3 className="font-semibold text-gray-800">Process Slaughter</h3>
        </Link>

        <Link to="/inventory" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-orange-500 hover:shadow-md transition-all group text-center">
          <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-600 transition-colors">
            <Package size={24} className="text-orange-600 group-hover:text-white" />
          </div>
          <h3 className="font-semibold text-gray-800">Add Livestock</h3>
        </Link>

        <Link to="/reports" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all group text-center">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition-colors">
            <TrendingUp size={24} className="text-blue-600 group-hover:text-white" />
          </div>
          <h3 className="font-semibold text-gray-800">View Reports</h3>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
