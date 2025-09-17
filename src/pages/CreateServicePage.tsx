import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, EyeOff } from 'lucide-react';
import { apiClient } from '../api/client';
import { ServiceCreate, PricingOptionCreate, PricingOptionType, FlexibleValueType } from '../types';
import toast from 'react-hot-toast';

interface CreateServiceFormData extends ServiceCreate {
  pricingOptions: PricingOptionCreate[];
}

interface PricingOptionFormData {
  name: string;
  option_type: PricingOptionType;
  order_index: number;
  is_required: boolean;
  is_hidden: boolean;
  per_unit_option?: {
    price_per_unit: number;
    short_description: string;
    full_description: string;
  };
  selector_option?: {
    short_description: string;
    full_description: string;
    options: Array<{
      name: string;
      price: number;
      short_description: string;
      full_description: string;
    }>;
  };
  flexible_value_option?: {
    short_description: string;
    full_description: string;
    value_type: FlexibleValueType;
    value: number;
    is_enabled: boolean;
  };
}

export const CreateServicePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pricingOptions, setPricingOptions] = useState<PricingOptionFormData[]>([]);
  const [showPricingOptionModal, setShowPricingOptionModal] = useState(false);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateServiceFormData>({
    defaultValues: {
      is_published: false,
      pricingOptions: [],
    }
  });

  const onSubmit = async (data: CreateServiceFormData) => {
    setIsLoading(true);
    try {
      // Create service
      const service = await apiClient.createService({
        name: data.name,
        description: data.description,
        is_published: data.is_published,
      });

      // Create pricing options if any
      if (pricingOptions.length > 0) {
        for (const option of pricingOptions) {
          const pricingOptionData: PricingOptionCreate = {
            name: option.name,
            option_type: option.option_type,
            order_index: option.order_index,
            is_required: option.is_required,
            is_hidden: option.is_hidden,
          };

          // Add type-specific data
          if (option.option_type === PricingOptionType.PER_UNIT && option.per_unit_option) {
            pricingOptionData.per_unit_option = {
              price_per_unit: option.per_unit_option.price_per_unit,
              short_description: option.per_unit_option.short_description,
              full_description: option.per_unit_option.full_description,
            };
          } else if (option.option_type === PricingOptionType.SELECTOR && option.selector_option) {
            pricingOptionData.selector_option = {
              short_description: option.selector_option.short_description,
              full_description: option.selector_option.full_description,
              options: option.selector_option.options,
            };
          } else if (option.option_type === PricingOptionType.FLEXIBLE_VALUE && option.flexible_value_option) {
            pricingOptionData.flexible_value_option = {
              short_description: option.flexible_value_option.short_description,
              full_description: option.flexible_value_option.full_description,
              value_type: option.flexible_value_option.value_type,
              value: option.flexible_value_option.value,
              is_enabled: option.flexible_value_option.is_enabled,
            };
          }

          await apiClient.createPricingOption(service.id, pricingOptionData);
        }
      }

      toast.success('Service created successfully');
      navigate('/admin/services');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error creating service';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const addPricingOption = () => {
    const newOption: PricingOptionFormData = {
      name: '',
      option_type: PricingOptionType.PER_UNIT,
      order_index: pricingOptions.length,
      is_required: false,
      is_hidden: false,
      per_unit_option: {
        price_per_unit: 0,
        short_description: '',
        full_description: '',
      },
      selector_option: {
        short_description: '',
        full_description: '',
        options: [{ name: '', price: 0, short_description: '', full_description: '' }],
      },
      flexible_value_option: {
        short_description: '',
        full_description: '',
        value_type: FlexibleValueType.PERCENTAGE,
        value: 0,
        is_enabled: false,
      },
    };
    setPricingOptions([...pricingOptions, newOption]);
    setEditingOptionIndex(pricingOptions.length);
    setShowPricingOptionModal(true);
  };

  const editPricingOption = (index: number) => {
    setEditingOptionIndex(index);
    setShowPricingOptionModal(true);
  };

  const deletePricingOption = (index: number) => {
    if (confirm('Are you sure you want to delete this pricing option?')) {
      const updatedOptions = pricingOptions.filter((_, i) => i !== index);
      // Update order_index for remaining options
      updatedOptions.forEach((option, i) => {
        option.order_index = i;
      });
      setPricingOptions(updatedOptions);
    }
  };

  const updatePricingOption = (updatedOption: PricingOptionFormData) => {
    if (editingOptionIndex !== null) {
      const updatedOptions = [...pricingOptions];
      updatedOptions[editingOptionIndex] = updatedOption;
      setPricingOptions(updatedOptions);
    }
    setShowPricingOptionModal(false);
    setEditingOptionIndex(null);
  };

  const getOptionTypeBadge = (type: PricingOptionType) => {
    const badges = {
      [PricingOptionType.PER_UNIT]: 'bg-blue-100 text-blue-800',
      [PricingOptionType.SELECTOR]: 'bg-green-100 text-green-800',
      [PricingOptionType.FLEXIBLE_VALUE]: 'bg-orange-100 text-orange-800',
    };
    return badges[type];
  };

  const getOptionTypeLabel = (type: PricingOptionType) => {
    const labels = {
      [PricingOptionType.PER_UNIT]: 'Per Unit',
      [PricingOptionType.SELECTOR]: 'Selector',
      [PricingOptionType.FLEXIBLE_VALUE]: 'Flexible Value',
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/services')}
          className="btn-secondary"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Service</h1>
          <p className="text-gray-600">Add new service to the system</p>
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

        {/* Pricing Options */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Pricing Options</h3>
            <button
              type="button"
              onClick={addPricingOption}
              className="btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Option
            </button>
          </div>

          {pricingOptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No pricing options added yet.</p>
              <p className="text-sm">Click "Add Option" to create your first pricing option.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pricingOptions.map((option, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                      <div>
                        <h4 className="font-medium text-gray-900">{option.name || 'Unnamed Option'}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOptionTypeBadge(option.option_type)}`}>
                            {getOptionTypeLabel(option.option_type)}
                          </span>
                          {option.is_required && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Required
                            </span>
                          )}
                          {option.is_hidden && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => editPricingOption(index)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePricingOption(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
              Publish service immediately after creation
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
            disabled={isLoading}
            className="btn-primary flex items-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Create Service
              </>
            )}
          </button>
        </div>
      </form>

      {/* Pricing Option Modal */}
      {showPricingOptionModal && (
        <PricingOptionModal
          option={editingOptionIndex !== null ? pricingOptions[editingOptionIndex] : undefined}
          onSave={updatePricingOption}
          onCancel={() => {
            setShowPricingOptionModal(false);
            setEditingOptionIndex(null);
          }}
        />
      )}
    </div>
  );
};

// Pricing Option Modal Component
interface PricingOptionModalProps {
  option?: PricingOptionFormData;
  onSave: (option: PricingOptionFormData) => void;
  onCancel: () => void;
}

const PricingOptionModal: React.FC<PricingOptionModalProps> = ({ option, onSave, onCancel }) => {
  const [formData, setFormData] = useState<PricingOptionFormData>(
    option || {
      name: '',
      option_type: PricingOptionType.PER_UNIT,
      order_index: 0,
      is_required: false,
      is_hidden: false,
      per_unit_option: { price_per_unit: 0, short_description: '', full_description: '' },
      selector_option: { short_description: '', full_description: '', options: [{ name: '', price: 0, short_description: '', full_description: '' }] },
      flexible_value_option: { short_description: '', full_description: '', value_type: FlexibleValueType.PERCENTAGE, value: 0, is_enabled: false },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addSelectorOption = () => {
    setFormData(prev => ({
      ...prev,
      selector_option: {
        ...prev.selector_option!,
        options: [...prev.selector_option!.options, { name: '', price: 0, short_description: '', full_description: '' }]
      }
    }));
  };

  const removeSelectorOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      selector_option: {
        ...prev.selector_option!,
        options: prev.selector_option!.options.filter((_, i) => i !== index)
      }
    }));
  };

  const updateSelectorOption = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      selector_option: {
        ...prev.selector_option!,
        options: prev.selector_option!.options.map((opt, i) => 
          i === index ? { ...opt, [field]: value } : opt
        )
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {option ? 'Edit Pricing Option' : 'Add Pricing Option'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Option Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
                placeholder="e.g., Cushion Cleaning"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Option Type *
              </label>
              <select
                value={formData.option_type}
                onChange={(e) => setFormData(prev => ({ ...prev, option_type: e.target.value as PricingOptionType }))}
                className="input-field"
              >
                <option value={PricingOptionType.PER_UNIT}>Per Unit</option>
                <option value={PricingOptionType.SELECTOR}>Selector</option>
                <option value={PricingOptionType.FLEXIBLE_VALUE}>Flexible Value</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Required</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_hidden}
                onChange={(e) => setFormData(prev => ({ ...prev, is_hidden: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Hidden</label>
            </div>
          </div>

          {/* Type-specific fields */}
          {formData.option_type === PricingOptionType.PER_UNIT && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Per Unit Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Unit *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.per_unit_option!.price_per_unit}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      per_unit_option: { ...prev.per_unit_option!, price_per_unit: parseFloat(e.target.value) || 0 }
                    }))}
                    className="input-field"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={formData.per_unit_option!.short_description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      per_unit_option: { ...prev.per_unit_option!, short_description: e.target.value }
                    }))}
                    className="input-field"
                    placeholder="Brief description"
                    maxLength={200}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Description
                </label>
                <textarea
                  value={formData.per_unit_option!.full_description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    per_unit_option: { ...prev.per_unit_option!, full_description: e.target.value }
                  }))}
                  className="input-field"
                  rows={3}
                  placeholder="Detailed description"
                  maxLength={1000}
                />
              </div>
            </div>
          )}

          {formData.option_type === PricingOptionType.SELECTOR && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Selector Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={formData.selector_option!.short_description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      selector_option: { ...prev.selector_option!, short_description: e.target.value }
                    }))}
                    className="input-field"
                    placeholder="Brief description"
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description
                  </label>
                  <input
                    type="text"
                    value={formData.selector_option!.full_description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      selector_option: { ...prev.selector_option!, full_description: e.target.value }
                    }))}
                    className="input-field"
                    placeholder="Detailed description"
                    maxLength={1000}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium text-gray-900">Options</h5>
                  <button
                    type="button"
                    onClick={addSelectorOption}
                    className="btn-secondary text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.selector_option!.options.map((opt, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={opt.name}
                          onChange={(e) => updateSelectorOption(index, 'name', e.target.value)}
                          className="input-field text-sm"
                          placeholder="Option name"
                          required
                        />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={opt.price}
                          onChange={(e) => updateSelectorOption(index, 'price', parseFloat(e.target.value) || 0)}
                          className="input-field text-sm"
                          placeholder="Price"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        <input
                          type="text"
                          value={opt.short_description}
                          onChange={(e) => updateSelectorOption(index, 'short_description', e.target.value)}
                          className="input-field text-sm"
                          placeholder="Short description"
                          maxLength={200}
                        />
                        <input
                          type="text"
                          value={opt.full_description}
                          onChange={(e) => updateSelectorOption(index, 'full_description', e.target.value)}
                          className="input-field text-sm"
                          placeholder="Full description"
                          maxLength={1000}
                        />
                      </div>
                      {formData.selector_option!.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSelectorOption(index)}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {formData.option_type === PricingOptionType.FLEXIBLE_VALUE && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Flexible Value Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value Type *
                  </label>
                  <select
                    value={formData.flexible_value_option!.value_type}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      flexible_value_option: { ...prev.flexible_value_option!, value_type: e.target.value as FlexibleValueType }
                    }))}
                    className="input-field"
                  >
                    <option value={FlexibleValueType.PERCENTAGE}>Percentage</option>
                    <option value={FlexibleValueType.DOLLAR_AMOUNT}>Dollar Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value *
                  </label>
                  <input
                    type="number"
                    step={formData.flexible_value_option!.value_type === FlexibleValueType.PERCENTAGE ? "0.1" : "0.01"}
                    min={formData.flexible_value_option!.value_type === FlexibleValueType.PERCENTAGE ? "0.1" : "0"}
                    max={formData.flexible_value_option!.value_type === FlexibleValueType.PERCENTAGE ? "100" : undefined}
                    value={formData.flexible_value_option!.value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      flexible_value_option: { ...prev.flexible_value_option!, value: parseFloat(e.target.value) || 0 }
                    }))}
                    className="input-field"
                    placeholder={formData.flexible_value_option!.value_type === FlexibleValueType.PERCENTAGE ? "0.0" : "0.00"}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={formData.flexible_value_option!.short_description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      flexible_value_option: { ...prev.flexible_value_option!, short_description: e.target.value }
                    }))}
                    className="input-field"
                    placeholder="Brief description"
                    maxLength={200}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.flexible_value_option!.is_enabled}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      flexible_value_option: { ...prev.flexible_value_option!, is_enabled: e.target.checked }
                    }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Enabled by default</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Description
                </label>
                <textarea
                  value={formData.flexible_value_option!.full_description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    flexible_value_option: { ...prev.flexible_value_option!, full_description: e.target.value }
                  }))}
                  className="input-field"
                  rows={3}
                  placeholder="Detailed description"
                  maxLength={1000}
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {option ? 'Update Option' : 'Add Option'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
