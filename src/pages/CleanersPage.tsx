import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Mail, Phone, User } from 'lucide-react';
import { apiClient } from '../api/client';
import { CleanerResponse, ServiceResponse } from '../types';
import toast from 'react-hot-toast';

export const CleanersPage: React.FC = () => {
  const [cleaners, setCleaners] = useState<CleanerResponse[]>([]);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cleanersData, servicesData] = await Promise.all([
        apiClient.getCleaners(),
        apiClient.getServices()
      ]);
      setCleaners(cleanersData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Ошибка при загрузке данных');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.deleteCleaner(id);
      setCleaners(cleaners.filter(cleaner => cleaner.id !== id));
      toast.success('Уборщик успешно удален');
    } catch (error) {
      console.error('Error deleting cleaner:', error);
      toast.error('Ошибка при удалении уборщика');
    } finally {
      setDeleteId(null);
    }
  };

  const getServiceNames = (serviceIds: number[]) => {
    return serviceIds
      .map(id => services.find(service => service.id === id)?.name)
      .filter(Boolean)
      .join(', ');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Уборщики</h1>
          <p className="text-gray-600">Управление персоналом клининговой компании</p>
        </div>
        <Link
          to="/admin/cleaners/create"
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Добавить уборщика
        </Link>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{cleaners.length}</div>
            <div className="text-sm text-gray-600">Всего уборщиков</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {cleaners.filter(c => c.services.length > 0).length}
            </div>
            <div className="text-sm text-gray-600">С назначенными услугами</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {cleaners.filter(c => c.calendar_email).length}
            </div>
            <div className="text-sm text-gray-600">С календарем</div>
          </div>
        </div>
      </div>

      {/* Список уборщиков */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Уборщик
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Контакты
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Услуги
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Календарь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Создан
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cleaners.map((cleaner) => (
                <tr key={cleaner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{cleaner.full_name}</div>
                        <div className="text-sm text-gray-500">ID: {cleaner.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {cleaner.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {cleaner.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {cleaner.services.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cleaner.services.slice(0, 3).map(serviceId => {
                            const service = services.find(s => s.id === serviceId);
                            return service ? (
                              <span
                                key={serviceId}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {service.name}
                              </span>
                            ) : null;
                          })}
                          {cleaner.services.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{cleaner.services.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">Не назначены</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cleaner.calendar_email ? (
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-green-500" />
                          {cleaner.calendar_email}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Не настроен</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(cleaner.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/admin/cleaners/${cleaner.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Редактировать"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(cleaner.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно подтверждения удаления */}
      {deleteId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Подтверждение удаления</h3>
              <p className="text-sm text-gray-500 mb-6">
                Вы уверены, что хотите удалить этого уборщика? Это действие нельзя отменить.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setDeleteId(null)}
                  className="btn-secondary"
                >
                  Отмена
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="btn-danger"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
