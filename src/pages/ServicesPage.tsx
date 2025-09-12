import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import { apiClient } from '../api/client';
import { Service } from '../types';
import toast from 'react-hot-toast';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, statusFilter]);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getServices();
      setServices(data);
    } catch (error: any) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter === 'published') {
      filtered = filtered.filter(service => service.is_published);
    } else if (statusFilter === 'draft') {
      filtered = filtered.filter(service => !service.is_published);
    }

    setFilteredServices(filtered);
  };

  const handlePublishToggle = async (service: Service) => {
    try {
      if (service.is_published) {
        await apiClient.unpublishService(service.id);
        toast.success(`Service "${service.name}" unpublished`);
      } else {
        await apiClient.publishService(service.id);
        toast.success(`Service "${service.name}" published`);
      }
      loadServices(); // Reload to get updated data
    } catch (error: any) {
      console.error('Error toggling service status:', error);
      toast.error('Failed to update service status');
    }
  };

  const handleDeleteService = async (service: Service) => {
    if (!confirm(`Are you sure you want to delete service "${service.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.deleteService(service.id);
      toast.success(`Service "${service.name}" deleted successfully`);
      loadServices(); // Reload to get updated data
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage your cleaning services and pricing options</p>
        </div>
        <Link
          to="/admin/services/create"
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Service
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search services by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex-shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
              className="input-field"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="card">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first service'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link to="/admin/services/create" className="btn-primary mt-4 inline-flex">
                <Plus className="h-5 w-5 mr-2" />
                Create Service
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {service.name}
                        </div>
                        {service.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {service.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.is_published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {service.is_published ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Draft
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(service.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.updated_at ? formatDate(service.updated_at) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handlePublishToggle(service)}
                          className={`p-2 rounded-md transition-colors ${
                            service.is_published
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={service.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {service.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        
                        <Link
                          to={`/admin/services/${service.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        
                        <button
                          onClick={() => handleDeleteService(service)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
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
        )}
      </div>

      {/* Summary */}
      {filteredServices.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Showing {filteredServices.length} of {services.length} services
        </div>
      )}
    </div>
  );
};
