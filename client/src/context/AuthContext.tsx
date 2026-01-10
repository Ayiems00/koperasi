import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import api from '../api/axios';
import { User, LoginCredentials, AuthResponse, PermissionModule } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  permissions: PermissionModule[];
  hasModuleAccess: (module: PermissionModule['module']) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<PermissionModule[]>([]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          // Fetch fresh user data
          const userRes = await api.get('/auth/me');
          const freshUser = userRes.data;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));

          // Fetch permissions
          const permRes = await api.get('/users/me/permissions');
          setPermissions(permRes.data.modules || []);
        } catch (error) {
          // If token invalid, logout
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);
      // Fetch permissions immediately after login
      const res = await api.get('/users/me/permissions');
      setPermissions(res.data.modules || []);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setPermissions([]);
  };

  const hasModuleAccess = (module: PermissionModule['module']) => {
    const record = permissions.find(p => p.module === module);
    if (record) return record.allowed;
    return true; // default allow if not explicitly set
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        permissions,
        hasModuleAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
