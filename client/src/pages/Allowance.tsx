import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, DollarSign } from 'lucide-react';
import Modal from '../components/Modal';
import { User } from '../types/auth';

interface AllowanceType {
  id: number;
  name: string;
  description: string;
  approvalRequired?: boolean;
  active?: boolean;
}

interface InvoiceAllowance {
  id: number;
  userId: number;
  user: { name: string; branch: string; position: string };
  invoiceNumber: string;
  month: number;
  year: number;
  totalAmount: number;
  status: string;
  items: { allowanceType: { name: string }; amount: number }[];
}

const Allowance = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'types'>('invoices');
  const [types, setTypes] = useState<AllowanceType[]>([]);
  const [invoices, setInvoices] = useState<InvoiceAllowance[]>([]);
  const [users, setUsers] = useState<User[]>([]); // For selecting user for invoice
  
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Forms
  const [typeForm, setTypeForm] = useState({ name: '', description: '', approvalRequired: false, active: true });
  const [invoiceForm, setInvoiceForm] = useState({
    userId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    items: [] as { allowanceTypeId: string; amount: string; description: string }[]
  });

  useEffect(() => {
    fetchTypes();
    fetchInvoices();
    fetchUsers();
  }, []);

  const fetchTypes = async () => {
    try {
      const res = await api.get('/allowance/types');
      setTypes(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/allowance/invoices');
      setInvoices(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users'); // Assuming user has permission
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/allowance/types', typeForm);
      setIsTypeModalOpen(false);
      setTypeForm({ name: '', description: '', approvalRequired: false, active: true });
      fetchTypes();
    } catch (err) { alert('Error creating type'); }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/allowance/invoices', invoiceForm);
      setIsInvoiceModalOpen(false);
      setInvoiceForm({ 
        userId: '', 
        month: new Date().getMonth() + 1, 
        year: new Date().getFullYear(), 
        items: [] 
      });
      fetchInvoices();
    } catch (err) { alert('Error creating invoice'); }
  };

  const addItemToInvoice = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { allowanceTypeId: '', amount: '', description: '' }]
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...invoiceForm.items];
    (newItems[index] as any)[field] = value;
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const [statusReason, setStatusReason] = useState<string>('');
  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.put(`/allowance/invoices/${id}/status`, { status, reason: statusReason });
      setStatusReason('');
      fetchInvoices();
    } catch (err) { alert('Error updating status'); }
  };

  return (
    <div className="p-6">
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <DollarSign className="text-green-600" />
          Allowance (Elaun) Management
        </h1>
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'invoices' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}
          >
            Invoice Allowance (Invois Elaun)
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'types' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}
          >
            Allowance Types (Jenis Elaun)
          </button>
        </div>
      </div>

      {activeTab === 'invoices' && (
        <>
          <div className="mb-4">
            <button onClick={() => setIsInvoiceModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
              <Plus size={20} /> Create New Invoice Allowance
            </button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{inv.user.name}</div>
                      <div className="text-xs text-gray-500">{inv.user.position} - {inv.user.branch}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{inv.month}/{inv.year}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">RM {inv.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        inv.status === 'FINALIZED' ? 'bg-green-100 text-green-800' : 
                        inv.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' : 
                        inv.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {inv.status}
                      </span>
                      <div className="text-xs text-gray-500">Invoice: {inv.invoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <a 
                        href={`http://localhost:5000/api/allowance/invoices/${inv.id}/pdf`} 
                        target="_blank"
                        className="text-gray-600 hover:text-gray-900 border px-2 py-1 rounded text-xs"
                      >
                        PDF
                      </a>
                      {inv.status === 'DRAFT' && (
                        <>
                          <input
                            value={statusReason}
                            onChange={e => setStatusReason(e.target.value)}
                            placeholder="Reason (optional)"
                            className="border rounded px-2 py-1 text-xs"
                          />
                          <button onClick={() => handleStatusUpdate(inv.id, 'SUBMITTED')} className="text-gray-700 hover:text-gray-900">Submit</button>
                          <button onClick={() => handleStatusUpdate(inv.id, 'APPROVED')} className="text-blue-600 hover:text-blue-900">Approve</button>
                        </>
                      )}
                      {inv.status === 'SUBMITTED' && (
                        <>
                          <input
                            value={statusReason}
                            onChange={e => setStatusReason(e.target.value)}
                            placeholder="Reason (optional)"
                            className="border rounded px-2 py-1 text-xs"
                          />
                          <button onClick={() => handleStatusUpdate(inv.id, 'APPROVED')} className="text-blue-600 hover:text-blue-900">Approve</button>
                        </>
                      )}
                      {inv.status === 'APPROVED' && (
                        <>
                          <input
                            value={statusReason}
                            onChange={e => setStatusReason(e.target.value)}
                            placeholder="Reason (optional)"
                            className="border rounded px-2 py-1 text-xs"
                          />
                          <button onClick={() => handleStatusUpdate(inv.id, 'FINALIZED')} className="text-green-600 hover:text-green-900">Finalize</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'types' && (
        <>
          <div className="mb-4">
             <button onClick={() => setIsTypeModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
              <Plus size={20} /> Add Allowance Type
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {types.map(t => (
              <div key={t.id} className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="font-bold text-gray-800">{t.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{t.description}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Invoice Modal */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Create Invoice Allowance">
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee</label>
              <select 
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                value={invoiceForm.userId}
                onChange={(e) => setInvoiceForm({...invoiceForm, userId: e.target.value})}
              >
                <option value="">Select User</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Month</label>
                <input type="number" min="1" max="12" value={invoiceForm.month} onChange={e => setInvoiceForm({...invoiceForm, month: parseInt(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <input type="number" value={invoiceForm.year} onChange={e => setInvoiceForm({...invoiceForm, year: parseInt(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Allowance Items</label>
            {invoiceForm.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-start">
                <select 
                  className="w-1/3 rounded-md border-gray-300 border p-1"
                  value={item.allowanceTypeId}
                  onChange={(e) => updateItem(idx, 'allowanceTypeId', e.target.value)}
                  required
                >
                  <option value="">Type</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <input 
                  type="number" 
                  placeholder="Amount" 
                  className="w-1/4 rounded-md border-gray-300 border p-1"
                  value={item.amount}
                  onChange={(e) => updateItem(idx, 'amount', e.target.value)}
                  required
                />
                 <input 
                  type="text" 
                  placeholder="Desc" 
                  className="flex-1 rounded-md border-gray-300 border p-1"
                  value={item.description}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                />
              </div>
            ))}
            <button type="button" onClick={addItemToInvoice} className="text-sm text-green-600 hover:text-green-800 font-medium mt-1">
              + Add Item
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="px-4 py-2 text-sm bg-gray-100 rounded-md">Cancel</button>
            <button 
              type="submit" 
              disabled={!invoiceForm.userId || invoiceForm.items.length === 0 || invoiceForm.items.some(i => !i.allowanceTypeId || !i.amount)}
              className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Create Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Type Modal */}
      <Modal isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)} title="New Allowance Type (Jenis Elaun)">
        <form onSubmit={handleCreateType} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" required value={typeForm.name} onChange={e => setTypeForm({...typeForm, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={typeForm.description} onChange={e => setTypeForm({...typeForm, description: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={typeForm.approvalRequired} onChange={e => setTypeForm({...typeForm, approvalRequired: e.target.checked})} />
            <span className="text-sm text-gray-700">Approval Required</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={typeForm.active} onChange={e => setTypeForm({...typeForm, active: e.target.checked})} />
            <span className="text-sm text-gray-700">Active</span>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsTypeModalOpen(false)} className="px-4 py-2 text-sm bg-gray-100 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Allowance;
