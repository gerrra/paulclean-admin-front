import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ServicesPage } from './pages/ServicesPage';
import { CreateServicePage } from './pages/CreateServicePage';
import { CleanersPage } from './pages/CleanersPage';
import { OrdersPage } from './pages/OrdersPage';
import { TestPage } from './pages/TestPage';
import { TestAuthPage } from './pages/TestAuthPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/admin/login" element={<LoginPage />} />
        
        {/* Защищенные маршруты */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/create" element={<CreateServicePage />} />
          <Route path="cleaners" element={<CleanersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
        
        {/* Тестовые страницы */}
        <Route path="/test" element={<TestPage />} />
        <Route path="/test-auth" element={<TestAuthPage />} />
        
        {/* Редирект по умолчанию */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
