import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole, PermissionModule } from '../types/auth';

interface Props {
  allowedRoles?: UserRole[];
  moduleKey?: PermissionModule['module'];
}

const ProtectedRoute: React.FC<Props> = ({ allowedRoles, moduleKey }) => {
  const { isAuthenticated, isLoading, user, hasModuleAccess } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (moduleKey && !hasModuleAccess(moduleKey)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
