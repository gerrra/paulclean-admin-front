import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { apiClient } from '../api/client';
import { Service, ServiceUpdate } from '../types';
import toast from 'react-hot-toast';

export const EditServicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [service, setService] = useState<Service | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ServiceUpdate>({
    defaultValues: {
      is_published: false,
    }
  });

  useEffect(() => {
    if (id) {
      loadService(parseInt(id));
    }
  }, [id]);

  const loadService = async (serviceId: number) => {
    try {
      setIsLoading(true);
      const serviceData = await apiClient.getService(serviceId);
      setService(serviceData);
      
      // Reset form with service data
      reset({
        name: serviceData.name,
        description: serviceData.description || '',
        category: serviceData.category || 'other',
        price_per_removable_cushion: serviceData.price_per_removable_cushion || 0,
        price_per_unremovable_cushion: serviceData.price_per_unremovable_cushion || 0,
        price_per_pillow: serviceData.price_per_pillow || 0,
        price_per_window: serviceData.price_per_window || 0,
        base_surcharge_pct: serviceData.base_surcharge_pct || 0,
        pet_hair_surcharge_pct: serviceData.pet_hair_surcharge_pct || 0,
        urine_stain_surcharge_pct: serviceData.urine_stain_surcharge_pct || 0,
        accelerated_drying_surcharge: serviceData.accelerated_drying_surcharge || 0,
        before_image: serviceData.before_image || '',
        after_image: serviceData.after_image || '',
        is_published: serviceData.is_published,
      });
    } catch (error: any) {
      console.error('Error loading service:', error);
      toast.error('Failed to load service');
      navigate('/admin/services');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ServiceUpdate) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await apiClient.updateService(parseInt(id), data);
      toast.success('Service updated successfully');
      navigate('/admin/services');
    } catch (error: any) {
      console.error('Error updating service:', error);
      const message = error.response?.data?.message || 'Failed to update service';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Service not found</h3>
        <p className="text-gray-600 mb-4">The service you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/admin/services')}
          className="btn-primary"
        >
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/services')}
          className="btn-secondary"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Services
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
          <p className="text-gray-600">Update service information and pricing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                {...register('name', { 
                  required: 'Service name is required',
                  minLength: { value: 3, message: 'Minimum 3 characters' },
                  maxLength: { value: 100, message: 'Maximum 100 characters' }
                })}
                type="text"
                id="name"
                className="input-field"
                placeholder="e.g., Couch Cleaning"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                {...register('category')}
                id="category"
                className="input-field"
              >
                <option value="couch">Couch Cleaning</option>
                <option value="carpet">Carpet Cleaning</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description', { 
                maxLength: { value: 1000, message: 'Maximum 1000 characters' }
              })}
              id="description"
              rows={4}
              className="input-field"
              placeholder="Detailed service description..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Pricing Information */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Pricing Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="price_per_removable_cushion" className="block text-sm font-medium text-gray-700 mb-2">
                Price per Removable Cushion
              </label>
              <input
                {...register('price_per_removable_cushion', { 
                  min: { value: 0, message: 'Price must be non-negative' }
                })}
                type="number"
                step="0.01"
                min="0"
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
                Price per Unremovable Cushion
              </label>
              <input
                {...register('price_per_unremovable_cushion', { 
                  min: { value: 0, message: 'Price must be non-negative' }
                })}
                type="number"
                step="0.01"
                min="0"
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
                Price per Pillow
              </label>
              <input
                {...register('price_per_pillow', { 
                  min: { value: 0, message: 'Price must be non-negative' }
                })}
                type="number"
                step="0.01"
                min="0"
                id="price_per_pillow"
                className="input-field"
                placeholder="0.00"
              />
              {errors.price_per_pillow && (
                <p className="mt-1 text-sm text-red-600">{errors.price_per_pillow.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="price_per_window" className="block text-sm font-medium text-gray-700 mb-2">
                Price per Window
              </label>
              <input
                {...register('price_per_window', { 
                  min: { value: 0, message: 'Price must be non-negative' }
                })}
                type="number"
                step="0.01"
                min="0"
                id="price_per_window"
                className="input-field"
                placeholder="0.00"
              />
              {errors.price_per_window && (
                <p className="mt-1 text-sm text-red-600">{errors.price_per_window.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="base_surcharge_pct" className="block text-sm font-medium text-gray-700 mb-2">
                Base Surcharge (%)
              </label>
              <input
                {...register('base_surcharge_pct', { 
                  min: { value: 0, message: 'Percentage must be non-negative' }
                })}
                type="number"
                step="0.1"
                min="0"
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
                Pet Hair Surcharge (%)
              </label>
              <input
                {...register('pet_hair_surcharge_pct', { 
                  min: { value: 0, message: 'Percentage must be non-negative' }
                })}
                type="number"
                step="0.1"
                min="0"
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
                Urine Stain Surcharge (%)
              </label>
              <input
                {...register('urine_stain_surcharge_pct', { 
                  min: { value: 0, message: 'Percentage must be non-negative' }
                })}
                type="number"
                step="0.1"
                min="0"
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
                Accelerated Drying Surcharge
              </label>
              <input
                {...register('accelerated_drying_surcharge', { 
                  min: { value: 0, message: 'Surcharge must be non-negative' }
                })}
                type="number"
                step="0.01"
                min="0"
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

        {/* Images */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Images</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="before_image" className="block text-sm font-medium text-gray-700 mb-2">
                Before Image URL
              </label>
              <input
                {...register('before_image')}
                type="url"
                id="before_image"
                className="input-field"
                placeholder="https://example.com/before.jpg"
              />
            </div>

            <div>
              <label htmlFor="after_image" className="block text-sm font-medium text-gray-700 mb-2">
                After Image URL
              </label>
              <input
                {...register('after_image')}
                type="url"
                id="after_image"
                className="input-field"
                placeholder="https://example.com/after.jpg"
              />
            </div>
          </div>
        </div>

        {/* Publication Settings */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Publication Settings</h3>
          
          <div className="flex items-center">
            <input
              {...register('is_published')}
              type="checkbox"
              id="is_published"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
              Publish this service
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/services')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary flex items-center"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Update Service
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
