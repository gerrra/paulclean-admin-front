import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { ServiceCreate, ServiceCategory } from '../types';
import toast from 'react-hot-toast';

interface CreateServiceFormData extends ServiceCreate {
  before_image_file?: FileList;
  after_image_file?: FileList;
}

export const CreateServicePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pricingBlocks, setPricingBlocks] = useState<any[]>([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateServiceFormData>({
    defaultValues: {
      category: ServiceCategory.COUCH,
      is_published: false,
    }
  });

  const selectedCategory = watch('category');

  const onSubmit = async (data: CreateServiceFormData) => {
    setIsLoading(true);
    try {
      // Создаем услугу
      const service = await apiClient.createService({
        name: data.name,
        description: data.description,
        category: data.category,
        price_per_removable_cushion: data.price_per_removable_cushion || 0,
        price_per_unremovable_cushion: data.price_per_unremovable_cushion || 0,
        price_per_pillow: data.price_per_pillow || 0,
        price_per_window: data.price_per_window || 0,
        base_surcharge_pct: data.base_surcharge_pct || 0,
        pet_hair_surcharge_pct: data.pet_hair_surcharge_pct || 0,
        urine_stain_surcharge_pct: data.urine_stain_surcharge_pct || 0,
        accelerated_drying_surcharge: data.accelerated_drying_surcharge || 0,
        is_published: data.is_published,
      });

      toast.success('Услуга успешно создана');
      navigate('/admin/services');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка при создании услуги';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const addPricingBlock = () => {
    setPricingBlocks([...pricingBlocks, { id: Date.now(), type: 'quantity' }]);
  };

  const removePricingBlock = (id: number) => {
    setPricingBlocks(pricingBlocks.filter(block => block.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/services')}
          className="btn-secondary"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Назад
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Создать услугу</h1>
          <p className="text-gray-600">Добавить новую услугу в систему</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Основная информация */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Основная информация</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Название услуги *
              </label>
              <input
                {...register('name', { 
                  required: 'Название обязательно',
                  minLength: { value: 3, message: 'Минимум 3 символа' },
                  maxLength: { value: 100, message: 'Максимум 100 символов' }
                })}
                type="text"
                id="name"
                className="input-field"
                placeholder="Например: Чистка дивана"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <select
                {...register('category', { required: 'Категория обязательна' })}
                id="category"
                className="input-field"
              >
                <option value={ServiceCategory.COUCH}>Диван</option>
                <option value={ServiceCategory.RUG}>Ковер</option>
                <option value={ServiceCategory.WINDOW}>Окно</option>
                <option value={ServiceCategory.OTHER}>Другое</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              {...register('description', { 
                required: 'Описание обязательно',
                minLength: { value: 10, message: 'Минимум 10 символов' },
                maxLength: { value: 1000, message: 'Максимум 1000 символов' }
              })}
              id="description"
              rows={4}
              className="input-field"
              placeholder="Подробное описание услуги..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Ценообразование */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Ценообразование</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {selectedCategory === ServiceCategory.COUCH && (
              <>
                <div>
                  <label htmlFor="price_per_removable_cushion" className="block text-sm font-medium text-gray-700 mb-2">
                    Цена за съемную подушку
                  </label>
                  <input
                    {...register('price_per_removable_cushion', { 
                      min: { value: 0, message: 'Цена не может быть отрицательной' }
                    })}
                    type="number"
                    step="0.01"
                    id="price_per_removable_cushion"
                    className="input-field"
                    placeholder="0.00"
                  />
                  {errors.price_per_removable_cushion && (
                    <p className="mt-1 text-sm text-red-600">{errors.price_per_removable_cushion.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="price_per_unremovable_cushion" className="block text-sm font-medium text-gray-700 mb-2">
                    Цена за несъемную подушку
                  </label>
                  <input
                    {...register('price_per_unremovable_cushion', { 
                      min: { value: 0, message: 'Цена не может быть отрицательной' }
                    })}
                    type="number"
                    step="0.01"
                    id="price_per_unremovable_cushion"
                    className="input-field"
                    placeholder="0.00"
                  />
                  {errors.price_per_unremovable_cushion && (
                    <p className="mt-1 text-sm text-red-600">{errors.price_per_unremovable_cushion.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="price_per_pillow" className="block text-sm font-medium text-gray-700 mb-2">
                    Цена за подушку
                  </label>
                  <input
                    {...register('price_per_pillow', { 
                      min: { value: 0, message: 'Цена не может быть отрицательной' }
                    })}
                    type="number"
                    step="0.01"
                    id="price_per_pillow"
                    className="input-field"
                    placeholder="0.00"
                  />
                  {errors.price_per_pillow && (
                    <p className="mt-1 text-sm text-red-600">{errors.price_per_pillow.message}</p>
                  )}
                </div>
              </>
            )}

            {selectedCategory === ServiceCategory.WINDOW && (
              <div>
                <label htmlFor="price_per_window" className="block text-sm font-medium text-gray-700 mb-2">
                  Цена за окно
                </label>
                <input
                  {...register('price_per_window', { 
                    min: { value: 0, message: 'Цена не может быть отрицательной' }
                  })}
                  type="number"
                  step="0.01"
                  id="price_per_window"
                  className="input-field"
                  placeholder="0.00"
                />
                {errors.price_per_window && (
                  <p className="mt-1 text-sm text-red-600">{errors.price_per_window.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <div>
              <label htmlFor="base_surcharge_pct" className="block text-sm font-medium text-gray-700 mb-2">
                Базовая надбавка (%)
              </label>
              <input
                {...register('base_surcharge_pct', { 
                  min: { value: 0, message: 'Процент не может быть отрицательным' }
                })}
                type="number"
                step="0.1"
                id="base_surcharge_pct"
                className="input-field"
                placeholder="0.0"
              />
              {errors.base_surcharge_pct && (
                <p className="mt-1 text-sm text-red-600">{errors.base_surcharge_pct.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="pet_hair_surcharge_pct" className="block text-sm font-medium text-gray-700 mb-2">
                Надбавка за шерсть животных (%)
              </label>
              <input
                {...register('pet_hair_surcharge_pct', { 
                  min: { value: 0, message: 'Процент не может быть отрицательным' }
                })}
                type="number"
                step="0.1"
                id="pet_hair_surcharge_pct"
                className="input-field"
                placeholder="0.0"
              />
              {errors.pet_hair_surcharge_pct && (
                <p className="mt-1 text-sm text-red-600">{errors.pet_hair_surcharge_pct.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="urine_stain_surcharge_pct" className="block text-sm font-medium text-gray-700 mb-2">
                Надбавка за пятна мочи (%)
              </label>
              <input
                {...register('urine_stain_surcharge_pct', { 
                  min: { value: 0, message: 'Процент не может быть отрицательным' }
                })}
                type="number"
                step="0.1"
                id="urine_stain_surcharge_pct"
                className="input-field"
                placeholder="0.0"
              />
              {errors.urine_stain_surcharge_pct && (
                <p className="mt-1 text-sm text-red-600">{errors.urine_stain_surcharge_pct.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="accelerated_drying_surcharge" className="block text-sm font-medium text-gray-700 mb-2">
                Надбавка за ускоренную сушку
              </label>
              <input
                {...register('accelerated_drying_surcharge', { 
                  min: { value: 0, message: 'Надбавка не может быть отрицательной' }
                })}
                type="number"
                step="0.01"
                id="accelerated_drying_surcharge"
                className="input-field"
                placeholder="0.00"
              />
              {errors.accelerated_drying_surcharge && (
                <p className="mt-1 text-sm text-red-600">{errors.accelerated_drying_surcharge.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Настройки публикации */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Настройки публикации</h3>
          
          <div className="flex items-center">
            <input
              {...register('is_published')}
              type="checkbox"
              id="is_published"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
              Опубликовать услугу сразу после создания
            </label>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/services')}
            className="btn-secondary"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex items-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            Создать услугу
          </button>
        </div>
      </form>
    </div>
  );
};
