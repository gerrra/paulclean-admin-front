import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AdminLoginRequest, 
  AdminLoginResponse,
  ServiceResponse,
  ServiceCreate,
  PricingBlockCreate,
  PricingBlockResponse,
  PricingBlockUpdate,
  BlockOrder,
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

    // Request interceptor для добавления токена
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

    // Response interceptor для обработки ошибок
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Токен истек, перенаправляем на логин
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(data: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response: AxiosResponse<AdminLoginResponse> = await this.client.post('/api/admin/login', data);
    return response.data;
  }



  // Service methods
  async getServices(): Promise<ServiceResponse[]> {
    const response: AxiosResponse<ServiceResponse[]> = await this.client.get('/api/admin/services');
    return response.data;
  }

  async createService(data: ServiceCreate): Promise<ServiceResponse> {
    const response: AxiosResponse<ServiceResponse> = await this.client.post('/api/admin/services', data);
    return response.data;
  }

  async updateService(id: number, data: Partial<ServiceCreate>): Promise<ServiceResponse> {
    const response: AxiosResponse<ServiceResponse> = await this.client.put(`/api/admin/services/${id}`, data);
    return response.data;
  }

  async deleteService(id: number): Promise<void> {
    await this.client.delete(`/api/admin/services/${id}`);
  }

  // Pricing block methods
  async getPricingBlocks(serviceId: number): Promise<PricingBlockResponse[]> {
    const response: AxiosResponse<PricingBlockResponse[]> = await this.client.get(`/api/admin/services/${serviceId}/pricing-blocks`);
    return response.data;
  }

  async createPricingBlock(serviceId: number, data: PricingBlockCreate): Promise<PricingBlockResponse> {
    const response: AxiosResponse<PricingBlockResponse> = await this.client.post(`/api/admin/services/${serviceId}/pricing-blocks`, data);
    return response.data;
  }

  async updatePricingBlock(blockId: number, data: PricingBlockUpdate): Promise<PricingBlockResponse> {
    const response: AxiosResponse<PricingBlockResponse> = await this.client.put(`/api/admin/pricing-blocks/${blockId}`, data);
    return response.data;
  }

  async deletePricingBlock(blockId: number): Promise<void> {
    await this.client.delete(`/api/admin/pricing-blocks/${blockId}`);
  }

  async reorderPricingBlocks(serviceId: number, data: BlockOrder[]): Promise<void> {
    await this.client.post(`/api/admin/services/${serviceId}/pricing-blocks/reorder`, data);
  }

  // Cleaner methods
  async getCleaners(): Promise<CleanerResponse[]> {
    const response: AxiosResponse<CleanerResponse[]> = await this.client.get('/api/admin/cleaners');
    return response.data;
  }

  async createCleaner(data: CleanerCreate): Promise<CleanerResponse> {
    const response: AxiosResponse<CleanerResponse> = await this.client.post('/api/admin/cleaners', data);
    return response.data;
  }

  async updateCleaner(id: number, data: Partial<CleanerCreate>): Promise<CleanerResponse> {
    const response: AxiosResponse<CleanerResponse> = await this.client.put(`/api/admin/cleaners/${id}`, data);
    return response.data;
  }

  async deleteCleaner(id: number): Promise<void> {
    await this.client.delete(`/api/admin/cleaners/${id}`);
  }

  // Order methods
  async getOrders(query?: OrderListQuery): Promise<OrderResponse[]> {
    const response: AxiosResponse<OrderResponse[]> = await this.client.get('/api/admin/orders', { params: query });
    return response.data;
  }

  async getOrder(id: number): Promise<OrderResponse> {
    const response: AxiosResponse<OrderResponse> = await this.client.get(`/api/admin/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(orderId: number, data: OrderStatusUpdate): Promise<OrderResponse> {
    const response: AxiosResponse<OrderResponse> = await this.client.put(`/api/admin/orders/${orderId}/status`, data);
    return response.data;
  }

  async assignCleaner(orderId: number, data: CleanerAssignment): Promise<OrderResponse> {
    const response: AxiosResponse<OrderResponse> = await this.client.put(`/api/admin/orders/${orderId}/cleaner`, data);
    return response.data;
  }

  // Utility methods
  async getTimeslots(query: TimeslotsQuery): Promise<TimeslotsResponse> {
    const response: AxiosResponse<TimeslotsResponse> = await this.client.get('/api/orders/slots', { params: query });
    return response.data;
  }

  async calculateOrder(data: OrderCalculation): Promise<CalculationResponse> {
    const response: AxiosResponse<CalculationResponse> = await this.client.post('/api/orders/calc', data);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
