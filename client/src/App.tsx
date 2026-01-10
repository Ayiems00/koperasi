import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Slaughter from './pages/Slaughter';
import POS from './pages/POS';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import Allowance from './pages/Allowance';
import MyAllowance from './pages/MyAllowance';
import AuditLogs from './pages/AuditLogs';
import Profile from './pages/Profile';
import Compliance from './pages/Compliance';
import Investment from './pages/Investment';
import Expenses from './pages/Expenses';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','ADMIN','FINANCE','FARM_ADMIN','POS_USER','USER']} moduleKey="DASHBOARD" />}>
                <Route path="/" element={<Dashboard />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','ADMIN','POS_USER']} moduleKey="POS" />}>
                <Route path="/pos" element={<POS />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','ADMIN','FARM_ADMIN']} moduleKey="INVENTORY" />}>
                <Route path="/inventory" element={<Inventory />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','ADMIN','FARM_ADMIN']} moduleKey="PRODUCTS" />}>
                <Route path="/products" element={<Products />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','ADMIN','FARM_ADMIN']} moduleKey="SLAUGHTER" />}>
                <Route path="/slaughter" element={<Slaughter />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','ADMIN','FINANCE']} moduleKey="REPORTS" />}>
                <Route path="/reports" element={<Reports />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','ADMIN']} moduleKey="USERS" />}>
                <Route path="/users" element={<UserManagement />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','ADMIN','FINANCE']} moduleKey="ALLOWANCE" />}>
                <Route path="/allowance" element={<Allowance />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','ADMIN','FINANCE','FARM_ADMIN','POS_USER','USER']} moduleKey="MY_ALLOWANCE" />}>
                <Route path="/my-allowance" element={<MyAllowance />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} moduleKey="AUDIT" />}>
                <Route path="/audit" element={<AuditLogs />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','ADMIN','FINANCE','FARM_ADMIN','POS_USER','USER']} moduleKey="INVESTMENT" />}>
                <Route path="/investment" element={<Investment />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','ADMIN','FINANCE']} moduleKey="EXPENSES" />}>
                <Route path="/expenses" element={<Expenses />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','ADMIN','FINANCE','FARM_ADMIN','POS_USER','USER']} moduleKey="PROFILE" />}>
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="/compliance" element={<Compliance />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
