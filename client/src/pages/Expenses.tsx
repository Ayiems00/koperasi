import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Download, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ExpenseCategory {
  id: number;
  name: string;
}

interface Expense {
  id: number;
  name: string;
  amount: number;
  date: string;
  paymentMethod: string;
  referenceNo?: string;
  notes?: string;
  category: { id: number; name: string };
  createdBy?: { name: string };
}

const Expenses = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    amount: '',
    date: new Date().toISOString().slice(0,10),
    paymentMethod: 'TRANSFER',
    referenceNo: '',
    notes: '',
    bankName: '',
    proofPath: ''
  });

  const canEdit = ['SUPER_ADMIN','ADMIN','FINANCE'].includes(user?.role || '');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, expRes] = await Promise.all([
        api.get('/expenses/categories'),
        api.get('/expenses')
      ]);
      setCategories(catRes.data);
      setExpenses(expRes.data);
    } catch (err) {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        name: form.name,
        categoryId: Number(form.categoryId),
        amount: Number(form.amount),
        date: form.date,
        paymentMethod: form.paymentMethod,
        referenceNo: form.referenceNo || undefined,
        notes: form.notes || undefined,
        bankName: form.bankName || undefined,
        proofPath: form.proofPath || undefined
      });
      setIsCreateOpen(false);
      setForm({ name:'', categoryId:'', amount:'', date:new Date().toISOString().slice(0,10), paymentMethod:'TRANSFER', referenceNo:'', notes:'', bankName: '', proofPath: '' });
      fetchData();
    } catch {
      alert('Failed to create expense');
    }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Expenses</h1>
        <div className="flex gap-2">
          <a href="http://localhost:5000/api/expenses/export/pdf" className="bg-gray-200 text-gray-800 px-3 py-2 rounded flex items-center gap-2">
            <Download size={18}/> PDF
          </a>
          <a href="http://localhost:5000/api/expenses/export/excel" className="bg-gray-200 text-gray-800 px-3 py-2 rounded flex items-center gap-2">
            <Download size={18}/> Excel
          </a>
          {canEdit && (
            <button onClick={() => setIsCreateOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
              <Plus size={18}/> Add Expense
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount (RM)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td className="px-6 py-4" colSpan={7}>Loading...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td className="px-6 py-4 text-gray-500" colSpan={7}>No expenses available.</td></tr>
            ) : (
              expenses.map(e => (
                <tr key={e.id}>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{e.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{e.category.name}</td>
                  <td className="px-6 py-4 text-sm font-bold text-right">RM {e.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{e.paymentMethod}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{e.referenceNo || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{e.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-right text-lg font-bold text-gray-800">
        Total: RM {total.toFixed(2)}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Expense</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input className="w-full border rounded p-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select className="w-full border rounded p-2" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required>
                  <option value="">Select</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (RM)</label>
                  <input type="number" step="0.01" className="w-full border rounded p-2" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input type="date" className="w-full border rounded p-2" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <select className="w-full border rounded p-2" value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})}>
                    <option value="TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="QR">QR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reference / Invoice No</label>
                  <input 
                    className="w-full border rounded p-2" 
                    value={form.referenceNo} 
                    onChange={e => setForm({...form, referenceNo: e.target.value})}
                    required={form.paymentMethod !== 'CASH'}
                    placeholder={form.paymentMethod !== 'CASH' ? 'Required' : ''}
                  />
                </div>
              </div>
              
              {form.paymentMethod !== 'CASH' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                    <input 
                      className="w-full border rounded p-2" 
                      value={form.bankName} 
                      onChange={e => setForm({...form, bankName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Proof (Link/Ref)</label>
                    <input 
                      className="w-full border rounded p-2" 
                      value={form.proofPath} 
                      onChange={e => setForm({...form, proofPath: e.target.value})}
                      required
                      placeholder="Receipt No / Link"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea className="w-full border rounded p-2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
