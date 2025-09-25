import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AdminLoginRequest, 
  AdminLoginResponse,
  Service,
  ServiceCreate,
  ServiceUpdate,
  ServiceWithPricingResponse,
  PricingOptionCreate,
  PricingOptionUpdate,
  PricingOptionResponse,
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
  CalculationResponse,
  PublicServiceResponse,
  PublicPricingCalculationRequest,
  ServicePricingResponse,
  ApiErrorResponse
} from '../types';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Use local proxy in development to avoid CORS issues
    this.baseURL = (import.meta as any).env?.DEV 
      ? '/api' // This will be proxied by Vite to http://localhost:8000/api
      : 'https://api.paulcleanwa.com/api';
    
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
        
        // Handle new error response format
        if (error.response?.data?.error) {
          const apiError: ApiErrorResponse = error.response.data;
          error.message = apiError.message || error.message;
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response: AxiosResponse<AdminLoginResponse> = await this.client.post('/admin/login', credentials);
    return response.data;
  }

  // Services - Admin endpoints
  async getServices(): Promise<Service[]> {
    const response: AxiosResponse<Service[]> = await this.client.get('/admin/services');
    return response.data;
  }

  async getService(id: number): Promise<ServiceWithPricingResponse> {
    const response: AxiosResponse<ServiceWithPricingResponse> = await this.client.get(`/admin/services/${id}`);
    return response.data;
  }

  async createService(service: ServiceCreate): Promise<Service> {
    const response: AxiosResponse<Service> = await this.client.post('/admin/services', service);
    return response.data;
  }

  async updateService(id: number, service: ServiceUpdate): Promise<Service> {
    const response: AxiosResponse<Service> = await this.client.put(`/admin/services/${id}`, service);
    return response.data;
  }

  async deleteService(id: number): Promise<void> {
    await this.client.delete(`/admin/services/${id}`);
  }

  async publishService(id: number): Promise<void> {
    await this.client.put(`/admin/services/${id}/publish`);
  }

  async unpublishService(id: number): Promise<void> {
    await this.client.put(`/admin/services/${id}/unpublish`);
  }

  // Pricing Options - Admin endpoints
  async getPricingOptions(serviceId: number): Promise<PricingOptionResponse[]> {
    const response: AxiosResponse<PricingOptionResponse[]> = await this.client.get(`/admin/services/${serviceId}/pricing-options`);
    return response.data;
  }

  async createPricingOption(serviceId: number, option: PricingOptionCreate): Promise<PricingOptionResponse> {
    const response: AxiosResponse<PricingOptionResponse> = await this.client.post(`/admin/services/${serviceId}/pricing-options`, option);
    return response.data;
  }

  async updatePricingOption(optionId: number, option: PricingOptionUpdate): Promise<PricingOptionResponse> {
    const response: AxiosResponse<PricingOptionResponse> = await this.client.put(`/admin/pricing-options/${optionId}`, option);
    return response.data;
  }

  async deletePricingOption(optionId: number): Promise<void> {
    await this.client.delete(`/admin/pricing-options/${optionId}`);
  }

  async updatePricingOptionsOrder(updates: OptionOrderUpdate[]): Promise<void> {
    await this.client.put('/admin/pricing-options/order', updates);
  }

  async getPricingBlock(blockId: number): Promise<PricingOptionResponse> {
    const response: AxiosResponse<PricingOptionResponse> = await this.client.get(`/admin/pricing-blocks/${blockId}`);
    return response.data;
  }

  // Public endpoints
  async getPublicServices(): Promise<PublicServiceResponse[]> {
    const response: AxiosResponse<PublicServiceResponse[]> = await this.client.get('/public/services');
    return response.data;
  }

  async getPublicService(id: number): Promise<PublicServiceResponse> {
    const response: AxiosResponse<PublicServiceResponse> = await this.client.get(`/public/services/${id}`);
    return response.data;
  }

  async calculatePrice(calculation: PublicPricingCalculationRequest): Promise<ServicePricingResponse> {
    const response: AxiosResponse<ServicePricingResponse> = await this.client.post('/public/calculate-price', calculation);
    return response.data;
  }

  // Cleaners
  async getCleaners(): Promise<CleanerResponse[]> {
    const response: AxiosResponse<CleanerResponse[]> = await this.client.get('/admin/cleaners');
    return response.data;
  }

  async getCleaner(id: number): Promise<CleanerResponse> {
    const response: AxiosResponse<CleanerResponse> = await this.client.get(`/admin/cleaners/${id}`);
    return response.data;
  }

  async createCleaner(cleaner: CleanerCreate): Promise<CleanerResponse> {
    const response: AxiosResponse<CleanerResponse> = await this.client.post('/admin/cleaners', cleaner);
    return response.data;
  }

  async updateCleaner(id: number, cleaner: Partial<CleanerCreate>): Promise<CleanerResponse> {
    const response: AxiosResponse<CleanerResponse> = await this.client.put(`/admin/cleaners/${id}`, cleaner);
    return response.data;
  }

  async deleteCleaner(id: number): Promise<void> {
    await this.client.delete(`/admin/cleaners/${id}`);
  }

  // Orders
  async getOrders(query?: OrderListQuery): Promise<OrderResponse[]> {
    const response: AxiosResponse<OrderResponse[]> = await this.client.get('/admin/orders', { params: query });
    return response.data;
  }

  async getOrder(id: number): Promise<OrderResponse> {
    const response: AxiosResponse<OrderResponse> = await this.client.get(`/admin/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(id: number, status: OrderStatusUpdate): Promise<OrderResponse> {
    const response: AxiosResponse<OrderResponse> = await this.client.put(`/admin/orders/${id}/status`, status);
    return response.data;
  }

  async assignCleaner(assignment: CleanerAssignment): Promise<void> {
    await this.client.put('/admin/orders/assign-cleaner', assignment);
  }

  // Timeslots
  async getTimeslots(query: TimeslotsQuery): Promise<TimeslotsResponse> {
    const response: AxiosResponse<TimeslotsResponse> = await this.client.get('/admin/timeslots', { params: query });
    return response.data;
  }

  // Calculations
  async calculateOrder(calculation: OrderCalculation): Promise<CalculationResponse> {
    const response: AxiosResponse<CalculationResponse> = await this.client.post('/admin/orders/calculate', calculation);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
