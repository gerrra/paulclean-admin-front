// Enums
export enum ServiceCategory {
  COUCH = "couch",
  RUG = "rug", 
  WINDOW = "window",
  OTHER = "other"
}

export enum OrderStatus {
  PENDING_CONFIRMATION = "Pending Confirmation",
  CONFIRMED = "Confirmed",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled"
}

// User types
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  email_verified: boolean;
  totp_enabled: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponse;
}

// Service types
export interface ServiceResponse {
  id: number;
  name: string;
  description: string;
  category: ServiceCategory;
  price_per_removable_cushion: number;
  price_per_unremovable_cushion: number;
  price_per_pillow: number;
  price_per_window: number;
  base_surcharge_pct: number;
  pet_hair_surcharge_pct: number;
  urine_stain_surcharge_pct: number;
  accelerated_drying_surcharge: number;
  before_image: string | null;
  after_image: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface ServiceCreate {
  name: string;
  description: string;
  category: ServiceCategory;
  price_per_removable_cushion?: number;
  price_per_unremovable_cushion?: number;
  price_per_pillow?: number;
  price_per_window?: number;
  base_surcharge_pct?: number;
  pet_hair_surcharge_pct?: number;
  urine_stain_surcharge_pct?: number;
  accelerated_drying_surcharge?: number;
  before_image?: string | null;
  after_image?: string | null;
  is_published?: boolean;
}

// Pricing block types
export interface QuantityOptionCreate {
  name: string;
  unit_price: number;
  min_quantity?: number;
  max_quantity?: number;
  unit_name: string;
}

export interface TypeOptionCreate {
  name: string;
  options: Array<{
    name: string;
    price: number;
  }>;
}

export interface ToggleOptionCreate {
  name: string;
  short_description: string;
  full_description?: string;
  percentage_increase: number;
}

export interface PricingBlockCreate {
  name: string;
  block_type: "quantity" | "type_choice" | "toggle";
  order_index?: number;
  is_required?: boolean;
  quantity_options?: QuantityOptionCreate;
  type_options?: TypeOptionCreate;
  toggle_option?: ToggleOptionCreate;
}

export interface QuantityOptionResponse extends QuantityOptionCreate {
  id: number;
}

export interface TypeOptionResponse extends TypeOptionCreate {
  id: number;
}

export interface ToggleOptionResponse extends ToggleOptionCreate {
  id: number;
}

export interface PricingBlockResponse {
  id: number;
  name: string;
  block_type: string;
  order_index: number;
  is_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  quantity_options?: QuantityOptionResponse;
  type_options?: TypeOptionResponse;
  toggle_option?: ToggleOptionResponse;
}

export interface PricingBlockUpdate {
  name?: string;
  order_index?: number;
  is_required?: boolean;
  is_active?: boolean;
  quantity_options?: QuantityOptionCreate;
  type_options?: TypeOptionCreate;
  toggle_option?: ToggleOptionCreate;
}

export interface BlockOrder {
  block_id: number;
  new_order: number;
}

// Cleaner types
export interface CleanerResponse {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  services: number[];
  calendar_email?: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CleanerCreate {
  full_name: string;
  phone: string;
  email: string;
  services?: number[];
  calendar_email?: string | null;
}

// Order types
export interface ClientResponse {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  address: string;
}

export interface OrderItemResponse {
  id: number;
  service_id: number;
  service_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  options: Record<string, any>;
}

export interface OrderResponse {
  id: number;
  client: ClientResponse;
  scheduled_date: string;
  scheduled_time: string;
  total_duration_minutes: number;
  total_price: number;
  status: string;
  cleaner?: CleanerResponse | null;
  notes?: string | null;
  order_items: OrderItemResponse[];
  created_at: string;
  updated_at: string | null;
}

export interface OrderListQuery {
  status?: OrderStatus | null;
  date_from?: string | null;
  date_to?: string | null;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  notes?: string;
}

export interface CleanerAssignment {
  cleaner_id: number;
}

// Timeslot types
export interface TimeslotsQuery {
  date: string;
}

export interface TimeslotsResponse {
  date: string;
  available_slots: string[];
  working_hours: object;
  slot_duration_minutes: number;
}

// Calculation types
export interface OrderItemCreate {
  service_id: number;
  quantity: number;
  options: Record<string, any>;
}

export interface OrderCalculation {
  order_items: OrderItemCreate[];
}

export interface CalculationResponse {
  total_price: number;
  total_duration_minutes: number;
  order_items: OrderItemResponse[];
}
