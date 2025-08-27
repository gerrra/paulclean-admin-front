import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AdminLoginRequest, 
  AdminLoginResponse,
  ServiceResponse,
  ServiceCreate,
  ServiceUpdate,
  PricingOption,
  PricingOptionCreate,
  PricingOptionUpdate,
  OptionOrderUpdate,
  CleanerResponse,
  CleanerCreate,
  OrderResponse,
  OrderListQuery,
  OrderStatusUpdate,
  CleanerAssignment,
  TimeslotsQuery,
  TimeslotsResponse,
  OrderCalculation,
  CalculationResponse
} from '../types';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.paulcleanwa.com';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response: AxiosResponse<AdminLoginResponse> = await this.client.post('/api/admin/login', credentials);
    return response.data;
  }

  // Services
  async getServices(): Promise<ServiceResponse[]> {
    const response: AxiosResponse<ServiceResponse[]> = await this.client.get('/api/admin/services');
    return response.data;
  }

  async getService(id: number): Promise<ServiceResponse> {
    const response: AxiosResponse<ServiceResponse> = await this.client.get(`/api/admin/services/${id}`);
    return response.data;
  }

  async createService(service: ServiceCreate): Promise<ServiceResponse> {
    const response: AxiosResponse<ServiceResponse> = await this.client.post('/api/admin/services', service);
    return response.data;
  }

  async updateService(id: number, service: ServiceUpdate): Promise<ServiceResponse> {
    const response: AxiosResponse<ServiceResponse> = await this.client.put(`/api/admin/services/${id}`, service);
    return response.data;
  }

  async deleteService(id: number): Promise<void> {
    await this.client.delete(`/api/admin/services/${id}`);
  }

  async publishService(id: number): Promise<ServiceResponse> {
    const response: AxiosResponse<ServiceResponse> = await this.client.put(`/api/admin/services/${id}/publish`);
    return response.data;
  }

  async unpublishService(id: number): Promise<ServiceResponse> {
    const response: AxiosResponse<ServiceResponse> = await this.client.put(`/api/admin/services/${id}/unpublish`);
    return response.data;
  }

  // Pricing Options
  async getPricingOptions(serviceId: number): Promise<PricingOption[]> {
    const response: AxiosResponse<PricingOption[]> = await this.client.get(`/api/admin/services/${serviceId}/pricing-options`);
    return response.data;
  }

  async createPricingOption(serviceId: number, option: PricingOptionCreate): Promise<PricingOption> {
    const response: AxiosResponse<PricingOption> = await this.client.post(`/api/admin/services/${serviceId}/pricing-options`, option);
    return response.data;
  }

  async updatePricingOption(id: number, option: PricingOptionUpdate): Promise<PricingOption> {
    const response: AxiosResponse<PricingOption> = await this.client.put(`/api/admin/pricing-options/${id}`, option);
    return response.data;
  }

  async deletePricingOption(id: number): Promise<void> {
    await this.client.delete(`/api/admin/pricing-options/${id}`);
  }

  async updatePricingOptionOrder(updates: OptionOrderUpdate[]): Promise<void> {
    await this.client.put('/api/admin/pricing-options/order', updates);
  }

  // Cleaners
  async getCleaners(): Promise<CleanerResponse[]> {
    const response: AxiosResponse<CleanerResponse[]> = await this.client.get('/api/admin/cleaners');
    return response.data;
  }

  async getCleaner(id: number): Promise<CleanerResponse> {
    const response: AxiosResponse<CleanerResponse> = await this.client.get(`/api/admin/cleaners/${id}`);
    return response.data;
  }

  async createCleaner(cleaner: CleanerCreate): Promise<CleanerResponse> {
    const response: AxiosResponse<CleanerResponse> = await this.client.post('/api/admin/cleaners', cleaner);
    return response.data;
  }

  async updateCleaner(id: number, cleaner: Partial<CleanerCreate>): Promise<CleanerResponse> {
    const response: AxiosResponse<CleanerResponse> = await this.client.put(`/api/admin/cleaners/${id}`, cleaner);
    return response.data;
  }

  async deleteCleaner(id: number): Promise<void> {
    await this.client.delete(`/api/admin/cleaners/${id}`);
  }

  // Orders
  async getOrders(query?: OrderListQuery): Promise<OrderResponse[]> {
    const response: AxiosResponse<OrderResponse[]> = await this.client.get('/api/admin/orders', { params: query });
    return response.data;
  }

  async getOrder(id: number): Promise<OrderResponse> {
    const response: AxiosResponse<OrderResponse> = await this.client.get(`/api/admin/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(id: number, status: OrderStatusUpdate): Promise<OrderResponse> {
    const response: AxiosResponse<OrderResponse> = await this.client.put(`/api/admin/orders/${id}/status`, status);
    return response.data;
  }

  async assignCleaner(assignment: CleanerAssignment): Promise<void> {
    await this.client.put('/api/admin/orders/assign-cleaner', assignment);
  }

  // Timeslots
  async getTimeslots(query: TimeslotsQuery): Promise<TimeslotsResponse> {
    const response: AxiosResponse<TimeslotsResponse> = await this.client.get('/api/admin/timeslots', { params: query });
    return response.data;
  }

  // Calculations
  async calculateOrder(calculation: OrderCalculation): Promise<CalculationResponse> {
    const response: AxiosResponse<CalculationResponse> = await this.client.post('/api/admin/orders/calculate', calculation);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
