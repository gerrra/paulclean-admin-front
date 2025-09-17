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
  ServicePricingResponse
} from '../types';

// Mock data
const mockServices: Service[] = [
  {
    id: 1,
    name: "Couch Cleaning",
    description: "Professional couch cleaning service",
    is_published: true,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z"
  },
  {
    id: 2,
    name: "Carpet Cleaning",
    description: "Deep carpet cleaning and stain removal",
    is_published: false,
    created_at: "2025-01-14T10:00:00Z",
    updated_at: null
  }
];

const mockCleaners: CleanerResponse[] = [
  {
    id: 1,
    name: "John Doe",
    full_name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    is_active: true,
    services: [1, 2],
    calendar_email: "john.calendar@example.com",
    created_at: "2025-01-10T10:00:00Z",
    updated_at: null
  }
];

const mockOrders: OrderResponse[] = [
  {
    id: 1,
    customer_name: "Jane Smith",
    customer_email: "jane@example.com",
    customer_phone: "+1987654321",
    service_id: 1,
    service_name: "Couch Cleaning",
    status: "Pending Confirmation" as any,
    total_amount: 150.00,
    total_price: 150.00,
    total_duration_minutes: 120,
    scheduled_date: "2025-01-20",
    scheduled_time: "14:00",
    address: "123 Main St, City",
    notes: "Please clean the fabric couch",
    client: {
      full_name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1987654321"
    },
    cleaner: null,
    order_items: [
      {
        id: 1,
        name: "Couch Cleaning",
        quantity: 1,
        price: 150.00
      }
    ],
    created_at: "2025-01-15T10:00:00Z",
    updated_at: null
  }
];

class MockApiClient {
  // Simulate network delay
  private delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Authentication
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    await this.delay();
    
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      return {
        access_token: 'mock_jwt_token_' + Date.now(),
        refresh_token: 'mock_refresh_token_' + Date.now(),
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@paulclean.com',
          role: 'admin',
          email_verified: true,
          totp_enabled: false,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: null
        }
      };
    }
    
    throw new Error('Invalid credentials');
  }

  // Services
  async getServices(): Promise<Service[]> {
    await this.delay();
    return [...mockServices];
  }

  async getService(id: number): Promise<ServiceWithPricingResponse> {
    await this.delay();
    const service = mockServices.find(s => s.id === id);
    if (!service) throw new Error('Service not found');
    
    return {
      ...service,
      pricing_options: []
    };
  }

  async createService(service: ServiceCreate): Promise<Service> {
    await this.delay();
    const newService: Service = {
      id: mockServices.length + 1,
      name: service.name,
      description: service.description,
      is_published: service.is_published || false,
      created_at: new Date().toISOString(),
      updated_at: null
    };
    mockServices.push(newService);
    return newService;
  }

  async updateService(id: number, service: ServiceUpdate): Promise<Service> {
    await this.delay();
    const index = mockServices.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Service not found');
    
    mockServices[index] = { ...mockServices[index], ...service, updated_at: new Date().toISOString() };
    return mockServices[index];
  }

  async deleteService(id: number): Promise<void> {
    await this.delay();
    const index = mockServices.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Service not found');
    mockServices.splice(index, 1);
  }

  async publishService(id: number): Promise<void> {
    await this.delay();
    const service = mockServices.find(s => s.id === id);
    if (!service) throw new Error('Service not found');
    service.is_published = true;
    service.updated_at = new Date().toISOString();
  }

  async unpublishService(id: number): Promise<void> {
    await this.delay();
    const service = mockServices.find(s => s.id === id);
    if (!service) throw new Error('Service not found');
    service.is_published = false;
    service.updated_at = new Date().toISOString();
  }

  // Pricing Options
  async getPricingOptions(_serviceId: number): Promise<PricingOptionResponse[]> {
    await this.delay();
    return [];
  }

  async createPricingOption(_serviceId: number, option: PricingOptionCreate): Promise<PricingOptionResponse> {
    await this.delay();
    return {
      id: Date.now(),
      name: option.name,
      option_type: option.option_type,
      order_index: option.order_index || 0,
      is_required: option.is_required || false,
      is_active: true,
      is_hidden: option.is_hidden || false,
      created_at: new Date().toISOString(),
      updated_at: null
    };
  }

  async updatePricingOption(optionId: number, option: PricingOptionUpdate): Promise<PricingOptionResponse> {
    await this.delay();
    return {
      id: optionId,
      name: option.name || 'Updated Option',
      option_type: 'per_unit' as any,
      order_index: option.order_index || 0,
      is_required: option.is_required || false,
      is_active: true,
      is_hidden: option.is_hidden || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async deletePricingOption(_optionId: number): Promise<void> {
    await this.delay();
    // Mock implementation
  }

  async updatePricingOptionsOrder(_updates: OptionOrderUpdate[]): Promise<void> {
    await this.delay();
    // Mock implementation
  }

  // Public endpoints
  async getPublicServices(): Promise<PublicServiceResponse[]> {
    await this.delay();
    return mockServices.filter(s => s.is_published).map(s => ({
      ...s,
      pricing_options: []
    }));
  }

  async getPublicService(id: number): Promise<PublicServiceResponse> {
    await this.delay();
    const service = mockServices.find(s => s.id === id && s.is_published);
    if (!service) throw new Error('Service not found');
    return { ...service, pricing_options: [] };
  }

  async calculatePrice(_calculation: PublicPricingCalculationRequest): Promise<ServicePricingResponse> {
    await this.delay();
    return {
      total_price: 150.00,
      base_price: 100.00,
      breakdown: [
        {
          option_name: "Base Service",
          quantity: 1,
          unit_price: 100.00,
          total: 100.00
        }
      ],
      estimated_time_minutes: 120
    };
  }

  // Cleaners
  async getCleaners(): Promise<CleanerResponse[]> {
    await this.delay();
    return [...mockCleaners];
  }

  async getCleaner(id: number): Promise<CleanerResponse> {
    await this.delay();
    const cleaner = mockCleaners.find(c => c.id === id);
    if (!cleaner) throw new Error('Cleaner not found');
    return cleaner;
  }

  async createCleaner(cleaner: CleanerCreate): Promise<CleanerResponse> {
    await this.delay();
    const newCleaner: CleanerResponse = {
      id: mockCleaners.length + 1,
      name: cleaner.name,
      full_name: cleaner.full_name,
      email: cleaner.email,
      phone: cleaner.phone,
      is_active: cleaner.is_active || true,
      services: cleaner.services || [],
      calendar_email: cleaner.calendar_email,
      created_at: new Date().toISOString(),
      updated_at: null
    };
    mockCleaners.push(newCleaner);
    return newCleaner;
  }

  async updateCleaner(id: number, cleaner: Partial<CleanerCreate>): Promise<CleanerResponse> {
    await this.delay();
    const index = mockCleaners.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Cleaner not found');
    
    mockCleaners[index] = { ...mockCleaners[index], ...cleaner, updated_at: new Date().toISOString() };
    return mockCleaners[index];
  }

  async deleteCleaner(id: number): Promise<void> {
    await this.delay();
    const index = mockCleaners.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Cleaner not found');
    mockCleaners.splice(index, 1);
  }

  // Orders
  async getOrders(_query?: OrderListQuery): Promise<OrderResponse[]> {
    await this.delay();
    return [...mockOrders];
  }

  async getOrder(id: number): Promise<OrderResponse> {
    await this.delay();
    const order = mockOrders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    return order;
  }

  async updateOrderStatus(id: number, status: OrderStatusUpdate): Promise<OrderResponse> {
    await this.delay();
    const order = mockOrders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    
    order.status = status.status as any;
    order.updated_at = new Date().toISOString();
    return order;
  }

  async assignCleaner(_assignment: CleanerAssignment): Promise<void> {
    await this.delay();
    // Mock implementation
  }

  // Timeslots
  async getTimeslots(query: TimeslotsQuery): Promise<TimeslotsResponse> {
    await this.delay();
    return {
      date: query.date,
      available_times: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      booked_times: ['13:00']
    };
  }

  // Calculations
  async calculateOrder(_calculation: OrderCalculation): Promise<CalculationResponse> {
    await this.delay();
    return {
      subtotal: 100.00,
      total: 120.00,
      breakdown: [
        {
          option_name: "Base Service",
          price: 100.00,
          quantity: 1,
          total: 100.00
        }
      ]
    };
  }
}

export const mockApiClient = new MockApiClient();
export default mockApiClient;
