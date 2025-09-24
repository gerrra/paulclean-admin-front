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
