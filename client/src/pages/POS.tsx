import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Product } from '../types/product';
import { CreateTransactionData } from '../types/transaction';
import Modal from '../components/Modal';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Smartphone 
} from 'lucide-react';

interface CartItem extends Product {
  cartQuantity: number;
}

const POS = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QR' | 'TRANSFER'>('CASH');

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/products';
      if (search) {
        url += `?search=${search}`;
      }
      const response = await api.get<Product[]>(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.stock) {
          alert('Insufficient stock');
          return prev;
        }
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, cartQuantity: item.cartQuantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.cartQuantity + delta;
        if (newQty > item.stock) {
          alert('Insufficient stock');
          return item;
        }
        return { ...item, cartQuantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  const formatCurrency = (value: number) => `RM ${value.toFixed(2)}`;
  const unitLabel = (p: Product) => (p.unitType === 'PER_UNIT' ? 'per unit' : 'per kg');
  const stockDisplay = (p: Product) => {
    if (p.unitType === 'PER_UNIT') return Math.floor(p.stock);
    const rounded = Math.round(p.stock * 100) / 100;
    return Number.isFinite(rounded) ? rounded.toFixed(2) : '0.00';
  };
  const lowStock = (p: Product) => (p.stock <= 0 ? 'zero' : p.stock < 10 ? 'low' : 'normal');

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const payload: CreateTransactionData = {
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.cartQuantity
      })),
      paymentMethod,
    };

    try {
      await api.post('/transactions', payload);
      alert('Transaction Successful!');
      setCart([]);
      setIsCheckoutModalOpen(false);
      fetchProducts(); // Refresh stock
    } catch (error: any) {
      console.error('Checkout failed:', error);
      alert(error.response?.data?.message || 'Transaction failed');
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-gray-100 overflow-hidden">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="bg-white p-3 rounded-lg shadow-sm mb-4 sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search products"
              className="w-full pl-10 pr-10 py-3 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-base placeholder:text-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => product.stock > 0 && addToCart(product)}
                  className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-green-600 flex flex-col justify-between h-52 ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500">{product.sku}</p>
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-2xl text-green-700">{formatCurrency(product.price)}</span>
                      <span className="text-xs text-gray-500">{unitLabel(product)}</span>
                    </div>
                    <div className="text-right">
                      {product.stock <= 0 ? (
                        <span className="text-xs font-semibold text-red-600">Out of Stock</span>
                      ) : (
                        <span className={`text-xs ${lowStock(product) === 'low' ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                          {stockDisplay(product)} left
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full md:w-96 bg-white shadow-xl flex flex-col h-full border-l border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-green-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="text-green-600" />
            Current Order
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart size={48} className="mb-2 opacity-50" />
              <p className="text-sm text-gray-500">Select a product to start a sale</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                  <p className="text-green-700 font-semibold">{formatCurrency(item.price)}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white rounded-md border border-gray-300">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                      disabled={item.cartQuantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium text-sm">{item.cartQuantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 hover:bg-gray-100 text-gray-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="text-right">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-gray-900">
              <span>Total</span>
              <span className="text-right">{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutModalOpen(true)}
            disabled={cart.length === 0}
            className="w-full bg-green-700 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            Checkout ({formatCurrency(cartTotal)})
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Complete Payment"
      >
        <div className="space-y-6">
          <div className="text-center py-4">
            <p className="text-gray-500 mb-1">Total Amount to Pay</p>
            <h2 className="text-4xl font-bold text-green-700">RM {cartTotal.toFixed(2)}</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Payment Method</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'CASH' 
                    ? 'border-green-600 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-green-300 text-gray-600'
                }`}
              >
                <Banknote size={24} />
                <span className="text-sm font-medium">Cash</span>
              </button>
              
              <button
                onClick={() => setPaymentMethod('QR')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'QR' 
                    ? 'border-green-600 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-green-300 text-gray-600'
                }`}
              >
                <Smartphone size={24} />
                <span className="text-sm font-medium">QR Pay</span>
              </button>

              <button
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'TRANSFER' 
                    ? 'border-green-600 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-green-300 text-gray-600'
                }`}
              >
                <CreditCard size={24} />
                <span className="text-sm font-medium">Transfer</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
          >
            Confirm Payment
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default POS;
