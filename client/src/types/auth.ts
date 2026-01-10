export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'FINANCE' | 'FARM_ADMIN' | 'POS_USER' | 'USER';

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  branch?: string;
  position?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface PermissionModule {
  id: number;
  userId: number;
  module: 
    | 'DASHBOARD'
    | 'POS'
    | 'INVENTORY'
    | 'SLAUGHTER'
    | 'PRODUCTS'
    | 'REPORTS'
    | 'USERS'
    | 'ALLOWANCE'
    | 'INVESTMENT'
    | 'EXPENSES'
    | 'MY_ALLOWANCE'
    | 'PROFILE'
    | 'AUDIT';
  allowed: boolean;
}

export interface ProfileChangeRequest {
    id: number;
    userId: number;
    user?: { username: string; name: string };
    field: string;
    oldValue: string;
    newValue: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    adminNote?: string;
    createdAt: string;
}
