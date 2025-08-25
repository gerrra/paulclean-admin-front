import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../api/client';
import { ServiceResponse, ServiceCategory } from '../types';
import toast from 'react-hot-toast';

const categoryLabels: Record<ServiceCategory, string> = {
  [ServiceCategory.COUCH]: 'Диван',
  [ServiceCategory.RUG]: 'Ковер',
  [ServiceCategory.WINDOW]: 'Окно',
  [ServiceCategory.OTHER]: 'Другое'
};

const statusBadge: React.FC<{ isPublished: boolean }> = ({ isPublished }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    isPublished 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800'
  }`}>
    {isPublished ? (
      <>
        <Eye className="w-3 h-3 mr-1" />
        Опубликована
      </>
    ) : (
      <>
        <EyeOff className="w-3 h-3 mr-1" />
        Черновик
      </>
    )}
  </span>
);

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await apiClient.getServices();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Ошибка при загрузке услуг');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.deleteService(id);
      setServices(services.filter(service => service.id !== id));
      toast.success('Услуга успешно удалена');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Ошибка при удалении услуги');
    } finally {
      setDeleteId(null);
    }
  };

  const togglePublishStatus = async (service: ServiceResponse) => {
    try {
      const updatedService = await apiClient.updateService(service.id, {
        is_published: !service.is_published
      });
      setServices(services.map(s => s.id === service.id ? updatedService : s));
      toast.success(`Услуга ${updatedService.is_published ? 'опубликована' : 'скрыта'}`);
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Ошибка при обновлении услуги');
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Услуги</h1>
          <p className="text-gray-600">Управление услугами клининговой компании</p>
        </div>
        <Link
          to="/admin/services/create"
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Создать услугу
        </Link>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{services.length}</div>
            <div className="text-sm text-gray-600">Всего услуг</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {services.filter(s => s.is_published).length}
            </div>
            <div className="text-sm text-gray-600">Опубликовано</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {services.filter(s => s.category === ServiceCategory.COUCH).length}
            </div>
            <div className="text-sm text-gray-600">Диваны</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {services.filter(s => s.category === ServiceCategory.RUG).length}
            </div>
            <div className="text-sm text-gray-600">Ковры</div>
          </div>
        </div>
      </div>

      {/* Список услуг */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Услуга
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Цена
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Создана
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {service.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {categoryLabels[service.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <statusBadge isPublished={service.is_published} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {service.price_per_removable_cushion > 0 && (
                        <div>Подушка: ${service.price_per_removable_cushion}</div>
                      )}
                      {service.price_per_window > 0 && (
                        <div>Окно: ${service.price_per_window}</div>
                      )}
                      {service.base_surcharge_pct > 0 && (
                        <div>Надбавка: {service.base_surcharge_pct}%</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(service.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => togglePublishStatus(service)}
                        className="text-blue-600 hover:text-blue-900"
                        title={service.is_published ? 'Скрыть' : 'Опубликовать'}
                      >
                        {service.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <Link
                        to={`/admin/services/${service.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Редактировать"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(service.id)}
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
                Вы уверены, что хотите удалить эту услугу? Это действие нельзя отменить.
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
