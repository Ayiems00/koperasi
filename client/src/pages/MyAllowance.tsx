import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileText } from 'lucide-react';

interface InvoiceAllowance {
  id: number;
  invoiceNumber: string;
  month: number;
  year: number;
  totalAmount: number;
  status: string;
  items: { allowanceType: { name: string }; amount: number; description: string }[];
}

const MyAllowance = () => {
  const [invoices, setInvoices] = useState<InvoiceAllowance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyInvoices();
  }, []);

  const fetchMyInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/allowance/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <FileText className="text-green-600" />
        My Invoice Allowance (Invois Elaun Saya)
      </h1>

      <div className="grid gap-6">
        {loading ? <p>Loading...</p> : invoices.length === 0 ? <p className="text-gray-500">No allowance records found.</p> : invoices.map((invoice) => (
          <div key={invoice.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {new Date(0, invoice.month - 1).toLocaleString('default', { month: 'long' })} {invoice.year}
                </h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  invoice.status === 'FINALIZED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {invoice.status}
                </span>
                <div className="text-xs text-gray-500 mt-1">Invoice: {invoice.invoiceNumber}</div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Allowance</p>
                <p className="text-2xl font-bold text-green-700">RM {invoice.totalAmount.toFixed(2)}</p>
              </div>
            </div>
            <div className="p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2 text-gray-500 font-medium">Description</th>
                    <th className="text-right pb-2 text-gray-500 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3">
                        <div className="font-medium text-gray-800">{item.allowanceType.name}</div>
                        {item.description && <div className="text-gray-500 text-xs">{item.description}</div>}
                      </td>
                      <td className="py-3 text-right font-medium">RM {item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAllowance;
