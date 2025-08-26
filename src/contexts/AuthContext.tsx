import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserResponse, AdminLoginRequest } from '../types';
import apiClient from '../api/client';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AdminLoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем, есть ли сохраненный токен при загрузке
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // Здесь можно добавить проверку валидности токена
      // Пока просто считаем пользователя авторизованным
      setUser({
        id: 1,
        username: 'admin',
        email: 'admin@paulclean.com',
        role: 'admin',
        email_verified: true,
        totp_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: null
      });
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: AdminLoginRequest) => {
    try {
      const response = await apiClient.login(credentials);
      
      // Сохраняем токены
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Устанавливаем пользователя
      setUser(response.user);
      
    } catch (error) {
      console.error('AuthContext: Ошибка входа:', error);
      throw error;
    }
  };

  const logout = () => {
    // Удаляем токены
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Сбрасываем пользователя
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
