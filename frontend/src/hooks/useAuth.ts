'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/users/me');
      setUser(response.data);
    } catch (error) {
      Cookies.remove('access_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await api.post<AuthResponse>('/api/auth/login', formData);
    const { access_token, user: userData } = response.data;
    
    Cookies.set('access_token', access_token, { expires: 7 });
    setUser(userData);
  };

  const register = async (data: RegisterRequest) => {
    await api.post('/api/auth/register', data);
  };

  const logout = async () => {
    try {
      // Call backend logout to clear broker session data
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear frontend state and cookies
      Cookies.remove('access_token');
      setUser(null);
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};

export { AuthContext };