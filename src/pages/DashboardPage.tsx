import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Eye, 
  Users, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiClient } from '../api/client';
import { OrderResponse, ServiceResponse, CleanerResponse } from '../types';
import { OrderStatus } from '../types';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ 
  title, 
  value, 
  icon, 
  color 
}) => (
  <div className="card">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const QuickActionCard: React.FC<{ title: string; description: string; href: string; icon: React.ReactNode }> = ({ 
  title, 
  description, 
  href, 
  icon 
}) => (
  <Link to={href} className="card hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center">
      <div className="p-3 rounded-lg bg-primary-100 text-primary-600">
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </Link>
);

export const DashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [cleaners, setCleaners] = useState<CleanerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, servicesData, cleanersData] = await Promise.all([
          apiClient.getOrders(),
          apiClient.getServices(),
          apiClient.getCleaners()
        ]);
        
        setOrders(ordersData);
        setServices(servicesData);
        setCleaners(cleanersData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Статистика заказов
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === OrderStatus.PENDING_CONFIRMATION).length;
  const confirmedOrders = orders.filter(order => order.status === OrderStatus.CONFIRMED).length;
  const completedOrders = orders.filter(order => order.status === OrderStatus.COMPLETED).length;
  const cancelledOrders = orders.filter(order => order.status === OrderStatus.CANCELLED).length;

  // Статистика услуг
  const activeServices = services.filter(service => service.is_published).length;
  const totalServices = services.length;

  // Данные для графика (последние 7 дней)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayOrders = orders.filter(order => order.scheduled_date === date);
    return {
      date: new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, order) => sum + order.total_price, 0)
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Обзор системы PaulClean</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Всего заказов"
          value={totalOrders}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Активные услуги"
          value={`${activeServices}/${totalServices}`}
          icon={<CheckCircle className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Уборщики"
          value={cleaners.length}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Ожидают подтверждения"
          value={pendingOrders}
          icon={<AlertCircle className="h-6 w-6 text-white" />}
          color="bg-yellow-500"
        />
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Заказы по дням</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Выручка по дням</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Выручка']} />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Статусы заказов */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Статусы заказов</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
            <div className="text-sm text-gray-600">Ожидают подтверждения</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{confirmedOrders}</div>
            <div className="text-sm text-gray-600">Подтверждены</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
            <div className="text-sm text-gray-600">Завершены</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{cancelledOrders}</div>
            <div className="text-sm text-gray-600">Отменены</div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Создать услугу"
            description="Добавить новую услугу в систему"
            href="/admin/services/create"
            icon={<Plus className="h-6 w-6" />}
          />
          <QuickActionCard
            title="Просмотреть заказы"
            description="Управление заказами и их статусами"
            href="/admin/orders"
            icon={<Eye className="h-6 w-6" />}
          />
          <QuickActionCard
            title="Управление уборщиками"
            description="Добавить или изменить уборщиков"
            href="/admin/cleaners"
            icon={<Users className="h-6 w-6" />}
          />
        </div>
      </div>
    </div>
  );
};
