import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Calendar, Clock, DollarSign, User, MapPin, Filter } from 'lucide-react';
import { apiClient } from '../api/client';
import { OrderResponse, OrderStatus, CleanerResponse } from '../types';
import toast from 'react-hot-toast';

const statusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING_CONFIRMATION:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING_CONFIRMATION:
        return 'Ожидает подтверждения';
      case OrderStatus.CONFIRMED:
        return 'Подтвержден';
      case OrderStatus.COMPLETED:
        return 'Завершен';
      case OrderStatus.CANCELLED:
        return 'Отменен';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
};

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [cleaners, setCleaners] = useState<CleanerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [ordersData, cleanersData] = await Promise.all([
        apiClient.getOrders(filters.status || undefined),
        apiClient.getCleaners()
      ]);
      setOrders(ordersData);
      setCleaners(cleanersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Ошибка при загрузке данных');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await apiClient.updateOrderStatus(orderId, { status: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      toast.success('Статус заказа обновлен');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Ошибка при обновлении статуса');
    }
  };

  const handleAssignCleaner = async (orderId: number, cleanerId: number) => {
    try {
      await apiClient.assignCleaner(orderId, { cleaner_id: cleanerId });
      const cleaner = cleaners.find(c => c.id === cleanerId);
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, cleaner: cleaner || null }
          : order
      ));
      toast.success('Уборщик назначен');
    } catch (error) {
      console.error('Error assigning cleaner:', error);
      toast.error('Ошибка при назначении уборщика');
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      date_from: '',
      date_to: ''
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Заказы</h1>
        <p className="text-gray-600">Управление заказами клиентов</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
            <div className="text-sm text-gray-600">Всего заказов</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === OrderStatus.PENDING_CONFIRMATION).length}
            </div>
            <div className="text-sm text-gray-600">Ожидают подтверждения</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === OrderStatus.COMPLETED).length}
            </div>
            <div className="text-sm text-gray-600">Завершены</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {orders.filter(o => o.cleaner).length}
            </div>
            <div className="text-sm text-gray-600">С назначенными уборщиками</div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Фильтры</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Статус
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="">Все статусы</option>
              <option value={OrderStatus.PENDING_CONFIRMATION}>Ожидает подтверждения</option>
              <option value={OrderStatus.CONFIRMED}>Подтвержден</option>
              <option value={OrderStatus.COMPLETED}>Завершен</option>
              <option value={OrderStatus.CANCELLED}>Отменен</option>
            </select>
          </div>

          <div>
            <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-2">
              Дата от
            </label>
            <input
              type="date"
              id="date_from"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-2">
              Дата до
            </label>
            <input
              type="date"
              id="date_to"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="btn-secondary w-full"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>

      {/* Список заказов */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Заказ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Клиент
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата и время
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Уборщик
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Стоимость
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                      <div className="text-sm text-gray-500">
                        {order.order_items.length} {order.order_items.length === 1 ? 'услуга' : 'услуги'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.client.full_name}</div>
                      <div className="text-sm text-gray-500">{order.client.email}</div>
                      <div className="text-sm text-gray-500">{order.client.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(order.scheduled_date).toLocaleDateString('ru-RU')}
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {order.scheduled_time}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <statusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.cleaner ? (
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{order.cleaner.full_name}</div>
                        <div className="text-gray-500">{order.cleaner.phone}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        <select
                          onChange={(e) => handleAssignCleaner(order.id, Number(e.target.value))}
                          className="input-field text-sm"
                          defaultValue=""
                        >
                          <option value="" disabled>Назначить уборщика</option>
                          {cleaners.map(cleaner => (
                            <option key={cleaner.id} value={cleaner.id}>
                              {cleaner.full_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center font-medium">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {order.total_price}
                      </div>
                      <div className="text-gray-500">
                        {order.total_duration_minutes} мин
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Просмотреть детали"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      
                      {order.status === OrderStatus.PENDING_CONFIRMATION && (
                        <select
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="input-field text-sm w-32"
                          defaultValue=""
                        >
                          <option value="" disabled>Изменить статус</option>
                          <option value={OrderStatus.CONFIRMED}>Подтвердить</option>
                          <option value={OrderStatus.CANCELLED}>Отменить</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
