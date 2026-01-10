import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { DollarSign, BarChart3, FileText } from 'lucide-react';

interface InvestmentSummary {
  id: number;
  totalAmount: number;
  startDate: string;
  category: string;
  active: boolean;
}

interface DividendSetting {
  id: number;
  cycle: 'QUARTERLY' | 'HALF_YEAR' | 'YEARLY';
  percentage: number;
  amount: number;
  declarationDate?: string;
  paymentStatus: 'DECLARED' | 'PAID' | 'CANCELLED';
}

interface ROIReport {
  totalInvestment: number;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  roiPercent: number;
}

const Investment = () => {
  const { user, hasModuleAccess } = useAuth();
  const canEdit = user?.role === 'SUPER_ADMIN' && hasModuleAccess('INVESTMENT');
  const canView = ['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(user?.role || '') && hasModuleAccess('INVESTMENT');

  const [tab, setTab] = useState<'summary' | 'dividend' | 'roi' | 'history' | 'dividendHistory' | 'add' | 'approve'>('summary');
  const [, setSummary] = useState<InvestmentSummary | null>(null);
  const [dividends, setDividends] = useState<DividendSetting[]>([]);
  const [roi, setRoi] = useState<ROIReport | null>(null);
  const [loading, setLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    totalAmount: '',
    startDate: '',
    category: 'OPERATIONS',
    active: true,
    reason: ''
  });

  const [divForm, setDivForm] = useState({
    cycle: 'YEARLY' as 'QUARTERLY' | 'HALF_YEAR' | 'YEARLY',
    percentage: 0,
    declarationDate: '',
    paymentStatus: 'DECLARED' as 'DECLARED' | 'PAID' | 'CANCELLED'
  });
  const [investmentForm, setInvestmentForm] = useState({
    amount: '',
    type: 'CASH',
    bankName: '',
    referenceNo: '',
    date: '',
    proofFile: null as File | null,
    notes: ''
  });

  useEffect(() => {
    if (!canView) return;
    fetchSummary();
    fetchDividends();
    fetchROI();
  }, [canView]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get<InvestmentSummary>('/investment/summary');
      setSummary(res.data || null);
      if (res.data) {
        setEditForm({
          totalAmount: String(res.data.totalAmount),
          startDate: res.data.startDate?.split('T')[0],
          category: res.data.category,
          active: res.data.active,
          reason: ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDividends = async () => {
    try {
      const res = await api.get<DividendSetting[]>('/investment/dividends');
      setDividends(res.data || []);
    } catch {}
  };

  const fetchROI = async () => {
    try {
      const res = await api.get<ROIReport>('/investment/roi');
      setRoi(res.data);
    } catch {}
  };

  const saveSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!editForm.reason.trim()) {
      alert('Reason is required');
      return;
    }
    try {
      const res = await api.put('/investment/summary', {
        totalAmount: Number(editForm.totalAmount),
        startDate: editForm.startDate,
        category: editForm.category,
        active: editForm.active,
        reason: editForm.reason
      });
      setSummary(res.data.summary);
      setEditForm({ ...editForm, reason: '' });
      alert('Saved');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving summary');
    }
  };

  const saveDividend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    try {
      await api.post('/investment/dividends', divForm);
      await fetchDividends();
      alert('Dividend saved');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving dividend');
    }
  };

  const canApprove = ['SUPER_ADMIN', 'FINANCE'].includes(user?.role || '') && hasModuleAccess('INVESTMENT');
  const canSubmit = hasModuleAccess('INVESTMENT');
  const [pending, setPending] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const handleInvestmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/investment/member', {
        amount: Number(investmentForm.amount),
        type: investmentForm.type,
        bankName: investmentForm.bankName,
        referenceNo: investmentForm.referenceNo,
        date: investmentForm.date,
        notes: investmentForm.notes
      });
      alert('Investment submitted for approval');
      setInvestmentForm({
        amount: '',
        type: 'CASH',
        bankName: '',
        referenceNo: '',
        date: '',
        proofFile: null,
        notes: ''
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error submitting investment');
    }
  };

  useEffect(() => {
    if (tab === 'approve' && canApprove) {
      fetchPending();
    }
    if (tab === 'history' && canApprove) {
      fetchHistory();
    }
  }, [tab, canApprove]);

  const fetchPending = async () => {
    try {
      const res = await api.get('/investment/member/pending');
      setPending(res.data);
    } catch {}
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/investment/history');
      setHistory(res.data);
    } catch {}
  };

  const approve = async (id: number) => {
    try {
      await api.put(`/investment/member/${id}/approve`);
      fetchPending();
      fetchSummary();
      alert('Approved');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error approving');
    }
  };

  const reject = async (id: number) => {
    const reason = prompt('Enter rejection reason');
    if (!reason) return;
    try {
      await api.put(`/investment/member/${id}/reject`, { reason });
      fetchPending();
      alert('Rejected');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error rejecting');
    }
  };

  if (!canView) {
    return <div className="p-6">Access denied.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <DollarSign className="text-green-600" />
          Investment Management
        </h1>
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setTab('summary')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'summary' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}
          >
            Summary
          </button>
          <button
            onClick={() => setTab('dividend')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'dividend' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}
          >
            Dividend
          </button>
          <button
            onClick={() => setTab('roi')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'roi' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}
          >
            ROI
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'history' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}
          >
            Investment History
          </button>
          <button
            onClick={() => setTab('dividendHistory')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'dividendHistory' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}
          >
            Dividend History
          </button>
          {canSubmit && (
            <button
              onClick={() => setTab('add')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'add' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}
            >
              Add Investment
            </button>
          )}
          {canApprove && (
            <button
              onClick={() => setTab('approve')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'approve' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}
            >
              Approve Payment
            </button>
          )}
        </div>
      </div>

      {tab === 'summary' && (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
          {loading ? <p>Loading...</p> : (
            <form onSubmit={saveSummary} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Investment Amount (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.totalAmount}
                  onChange={(e) => setEditForm({ ...editForm, totalAmount: e.target.value })}
                  disabled={!canEdit}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    disabled={!canEdit}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    disabled={!canEdit}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="LIVESTOCK">Livestock</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="OPERATIONS">Operations</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.active}
                  onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                  disabled={!canEdit}
                />
                <span className="text-sm">Active</span>
              </div>
              {canEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason (required)</label>
                  <input
                    type="text"
                    value={editForm.reason}
                    onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="Provide reason for change"
                  />
                </div>
              )}
              {canEdit && (
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md">Save Summary</button>
              )}
            </form>
          )}
        </div>
      )}

      {tab === 'dividend' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Dividend Settings</h2>
            </div>
            <form onSubmit={saveDividend} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cycle</label>
                  <select
                    value={divForm.cycle}
                    onChange={(e) => setDivForm({ ...divForm, cycle: e.target.value as any })}
                    disabled={!canEdit}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="HALF_YEAR">Half-Year</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={divForm.percentage}
                    onChange={(e) => setDivForm({ ...divForm, percentage: Number(e.target.value) })}
                    disabled={!canEdit}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Declaration Date</label>
                  <input
                    type="date"
                    value={divForm.declarationDate}
                    onChange={(e) => setDivForm({ ...divForm, declarationDate: e.target.value })}
                    disabled={!canEdit}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={divForm.paymentStatus}
                    onChange={(e) => setDivForm({ ...divForm, paymentStatus: e.target.value as any })}
                    disabled={!canEdit}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="DECLARED">Declared</option>
                    <option value="PAID">Paid</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
              {canEdit && (
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md">Save Dividend</button>
              )}
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Current Settings</h3>
            <div className="space-y-3">
              {dividends.map(d => (
                <div key={d.id} className="p-3 border rounded-md flex justify-between items-center">
                  <div>
                    <div className="font-medium">{d.cycle}</div>
                    <div className="text-sm text-gray-500">Percentage: {d.percentage}% | Amount: RM {d.amount.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Declared: {d.declarationDate ? new Date(d.declarationDate).toLocaleDateString() : '-'}</div>
                  </div>
                  {canEdit && d.paymentStatus !== 'CANCELLED' && (
                    <button
                      onClick={async () => {
                        try {
                          await api.put(`/investment/dividends/${d.id}/cancel`);
                          fetchDividends();
                          alert('Cancelled');
                        } catch (err: any) {
                          alert(err.response?.data?.message || 'Error cancelling');
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
              {dividends.length === 0 && <p className="text-gray-500 text-sm">No dividend settings.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === 'roi' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">ROI Report</h2>
          </div>
          {roi ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-md">
                <div className="text-sm text-gray-500">Total Investment</div>
                <div className="text-2xl font-bold">RM {roi.totalInvestment.toFixed(2)}</div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-sm text-gray-500">Total Revenue</div>
                <div className="text-2xl font-bold text-green-700">RM {roi.totalRevenue.toFixed(2)}</div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-sm text-gray-500">Total Cost</div>
                <div className="text-2xl font-bold text-red-700">RM {roi.totalCost.toFixed(2)}</div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-sm text-gray-500">Net Profit</div>
                <div className="text-2xl font-bold">RM {roi.netProfit.toFixed(2)}</div>
              </div>
              <div className="p-4 border rounded-md md:col-span-2">
                <div className="text-sm text-gray-500">ROI Percentage</div>
                <div className="text-3xl font-bold">{roi.roiPercent.toFixed(2)}%</div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No ROI data.</p>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank / Ref</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount (RM)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proof</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.length === 0 ? (
                <tr><td className="px-6 py-4 text-gray-500" colSpan={10}>No history available.</td></tr>
              ) : (
                history.map((h: any) => (
                  <tr key={h.id}>
                    <td className="px-6 py-4 text-sm text-gray-600">#{h.investmentId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(h.transactionDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{h.member?.name}</div>
                      <div className="text-xs text-gray-500">{h.member?.icNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{h.investment?.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {h.investment?.bankName ? `${h.investment.bankName} - ` : ''}
                      {h.investment?.referenceNo || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-right">RM {h.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{h.source}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{h.approvedBy?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(h.approvedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                       {h.proofPath ? (
                         <a href={h.proofPath} target="_blank" rel="noreferrer" className="text-blue-600 underline">View</a>
                       ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'dividendHistory' && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Dividend history coming soon.</p>
        </div>
      )}

      {tab === 'add' && (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
          <form onSubmit={handleInvestmentSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount (RM)</label>
              <input
                type="number"
                step="0.01"
                value={investmentForm.amount}
                onChange={(e) => setInvestmentForm({ ...investmentForm, amount: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investment Type</label>
                <select
                  value={investmentForm.type}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_IN">Bank In</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={investmentForm.bankName}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, bankName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference No</label>
                <input
                  type="text"
                  value={investmentForm.referenceNo}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, referenceNo: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Transaction</label>
                <input
                  type="date"
                  value={investmentForm.date}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Proof</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setInvestmentForm({ ...investmentForm, proofFile: e.target.files?.[0] || null })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={investmentForm.notes}
                onChange={(e) => setInvestmentForm({ ...investmentForm, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md">Submit Investment</button>
          </form>
        </div>
      )}

      {tab === 'approve' && (
        <div className="bg-white rounded-lg shadow p-6">
          {pending.length === 0 ? (
            <div className="text-gray-600">No pending approvals.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Member</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Submitted By</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2">{p.member?.name || '-'}</td>
                    <td className="py-2">RM {Number(p.amount).toFixed(2)}</td>
                    <td className="py-2">{p.type}</td>
                    <td className="py-2">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="py-2">{p.submittedBy?.name || '-'}</td>
                    <td className="py-2 space-x-2">
                      <button onClick={() => approve(p.id)} className="text-green-600 hover:text-green-800">Approve</button>
                      <button onClick={() => reject(p.id)} className="text-red-600 hover:text-red-800">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Investment;
