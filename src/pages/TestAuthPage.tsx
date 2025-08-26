import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLoginRequest } from '../types';

export const TestAuthPage: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [username, setUsername] = useState('test');
  const [password, setPassword] = useState('test123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const credentials: AdminLoginRequest = { username, password };
      console.log('Тестируем вход с:', credentials);
      
      await login(credentials);
      console.log('Вход успешен!');
    } catch (error) {
      console.error('Ошибка входа:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    console.log('Выход выполнен');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Тест аутентификации</h1>
      
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Текущее состояние</h2>
        <div className="space-y-2">
          <p><strong>isAuthenticated:</strong> {isAuthenticated ? '✅ Да' : '❌ Нет'}</p>
          <p><strong>Пользователь:</strong> {user ? JSON.stringify(user, null, 2) : 'Не авторизован'}</p>
          <p><strong>Токен в localStorage:</strong> {localStorage.getItem('access_token') ? '✅ Есть' : '❌ Нет'}</p>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Тест входа</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Действия</h2>
        <div className="space-x-4">
          <button onClick={handleLogout} className="btn-secondary">
            Выйти
          </button>
          <button 
            onClick={() => console.log('localStorage:', localStorage)}
            className="btn-secondary"
          >
            Показать localStorage
          </button>
        </div>
      </div>
    </div>
  );
};
