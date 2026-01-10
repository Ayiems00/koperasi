import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Beef, 
  ClipboardList, 
  BarChart3, 
  LogOut, 
  Menu,
  X,
  Package,
  Users,
  User,
  DollarSign,
  FileText,
  Shield
} from 'lucide-react';
import { UserRole } from '../types/auth';

const Layout = () => {
  const { user, logout, hasModuleAccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const hasPermission = (allowedRoles: UserRole[], moduleKey: string) => {
    const roleOk = user && allowedRoles.includes(user.role);
    const moduleOk = hasModuleAccess(moduleKey as any);
    return !!roleOk && moduleOk;
  };

  const allNavItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={20} />,
      allowed: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'FARM_ADMIN', 'POS_USER', 'USER'],
      moduleKey: 'DASHBOARD'
    },
    { 
      path: '/pos', 
      label: 'POS System', 
      icon: <ShoppingCart size={20} />,
      allowed: ['SUPER_ADMIN', 'ADMIN', 'POS_USER'],
      moduleKey: 'POS'
    },
    { 
      path: '/inventory', 
      label: 'Livestock Inventory', 
      icon: <ClipboardList size={20} />,
      allowed: ['SUPER_ADMIN', 'ADMIN', 'FARM_ADMIN'],
      moduleKey: 'INVENTORY'
    },
    { 
      path: '/slaughter', 
      label: 'Slaughter Processing', 
      icon: <Beef size={20} />,
      allowed: ['SUPER_ADMIN', 'ADMIN', 'FARM_ADMIN'],
      moduleKey: 'SLAUGHTER'
    },
    { 
      path: '/products', 
      label: 'Product Management', 
      icon: <Package size={20} />,
      allowed: ['SUPER_ADMIN', 'ADMIN', 'FARM_ADMIN'],
      moduleKey: 'PRODUCTS'
    },
    { 
      path: '/reports', 
      label: 'Reports', 
      icon: <BarChart3 size={20} />,
      allowed: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'],
      moduleKey: 'REPORTS'
    },
    { 
      path: '/investment', 
      label: 'Investment Management', 
      icon: <DollarSign size={20} />,
      allowed: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'],
      moduleKey: 'INVESTMENT'
    },
    { 
      path: '/expenses', 
      label: 'Expenses', 
      icon: <DollarSign size={20} />,
      allowed: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'],
      moduleKey: 'EXPENSES'
    },
    { 
      path: '/users', 
      label: 'User Management', 
      icon: <Users size={20} />,
      allowed: ['SUPER_ADMIN', 'ADMIN'],
      moduleKey: 'USERS'
    },
    { 
      path: '/allowance', 
      label: 'Allowance (Elaun)', 
      icon: <DollarSign size={20} />,
      allowed: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'],
      moduleKey: 'ALLOWANCE'
    },
    { 
      path: '/my-allowance', 
      label: 'My Invoice Allowance (Invois Elaun)', 
      icon: <FileText size={20} />,
      allowed: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'FARM_ADMIN', 'POS_USER', 'USER'],
      moduleKey: 'MY_ALLOWANCE'
    },
    { 
      path: '/profile', 
      label: 'My Profile', 
      icon: <User size={20} />,
      allowed: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'FARM_ADMIN', 'POS_USER', 'USER'],
      moduleKey: 'PROFILE'
    },
    { 
      path: '/audit', 
      label: 'Audit Logs', 
      icon: <Shield size={20} />,
      allowed: ['SUPER_ADMIN'],
      moduleKey: 'AUDIT'
    }
  ];

  const visibleNavItems = allNavItems.filter(item => hasPermission(item.allowed as UserRole[], item.moduleKey));

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-green-800 text-white transition-all duration-300 ease-in-out flex flex-col shadow-xl`}
      >
        <div className="p-4 flex items-center justify-between border-b border-green-700">
          {isSidebarOpen && <h1 className="font-bold text-xl truncate">Agro Koperasi</h1>}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded hover:bg-green-700 focus:outline-none"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {visibleNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-green-700 text-white shadow-md'
                      : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-green-700">
          <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-green-300 truncate">{user?.role}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-green-700 text-green-200 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
