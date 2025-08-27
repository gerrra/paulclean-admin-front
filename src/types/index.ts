// Enums
export enum OrderStatus {
  PENDING_CONFIRMATION = "Pending Confirmation",
  CONFIRMED = "Confirmed",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled"
}

export enum PricingOptionType {
  PER_UNIT = "per_unit",
  SELECTOR = "selector",
  PERCENTAGE = "percentage"
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
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface ServiceCreate {
  name: string;
  description?: string;
  is_published?: boolean;
}

export interface ServiceUpdate {
  name?: string;
  description?: string;
  is_published?: boolean;
}

// Pricing option types
export interface PricingOption {
  id: number;
  service_id: number;
  name: string;
  option_type: PricingOptionType;
  order_index: number;
  is_required: boolean;
  is_active: boolean;
  is_hidden: boolean;
  per_unit_option?: PerUnitOption;
  selector_option?: SelectorOption;
  percentage_option?: PercentageOption;
  created_at: string;
  updated_at: string | null;
}

export interface PricingOptionCreate {
  service_id: number;
  name: string;
  option_type: PricingOptionType;
  order_index?: number;
  is_required?: boolean;
  is_active?: boolean;
  is_hidden?: boolean;
  per_unit_option?: PerUnitOptionCreate;
  selector_option?: SelectorOptionCreate;
  percentage_option?: PercentageOptionCreate;
}

export interface PricingOptionUpdate {
  name?: string;
  order_index?: number;
  is_required?: boolean;
  is_active?: boolean;
  is_hidden?: boolean;
  per_unit_option?: PerUnitOptionUpdate;
  selector_option?: SelectorOptionUpdate;
  percentage_option?: PercentageOptionUpdate;
}

// Per unit option types
export interface PerUnitOption {
  id: number;
  pricing_option_id: number;
  price_per_unit: number;
  short_description: string | null;
  full_description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PerUnitOptionCreate {
  price_per_unit: number;
  short_description?: string;
  full_description?: string;
}

export interface PerUnitOptionUpdate {
  price_per_unit?: number;
  short_description?: string;
  full_description?: string;
}

// Selector option types
export interface SelectorOption {
  id: number;
  pricing_option_id: number;
  short_description: string | null;
  full_description: string | null;
  options: SelectorOptionItem[];
  created_at: string;
  updated_at: string | null;
}

export interface SelectorOptionCreate {
  short_description?: string;
  full_description?: string;
  options: SelectorOptionItemCreate[];
}

export interface SelectorOptionUpdate {
  short_description?: string;
  full_description?: string;
  options?: SelectorOptionItemUpdate[];
}

export interface SelectorOptionItem {
  id: number;
  selector_option_id: number;
  name: string;
  price: number;
  short_description: string | null;
  full_description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface SelectorOptionItemCreate {
  name: string;
  price: number;
  short_description?: string;
  full_description?: string;
}

export interface SelectorOptionItemUpdate {
  name?: string;
  price?: number;
  short_description?: string;
  full_description?: string;
}

// Percentage option types
export interface PercentageOption {
  id: number;
  pricing_option_id: number;
  short_description: string | null;
  full_description: string | null;
  percentage_value: number;
  created_at: string;
  updated_at: string | null;
}

export interface PercentageOptionCreate {
  short_description?: string;
  full_description?: string;
  percentage_value: number;
}

export interface PercentageOptionUpdate {
  short_description?: string;
  full_description?: string;
  percentage_value?: number;
}

// Option order update
export interface OptionOrderUpdate {
  id: number;
  order_index: number;
}

// Pricing block types (keeping for backward compatibility)
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
  service_id: number;
  name: string;
  block_type: 'quantity' | 'type' | 'toggle';
  order_index: number;
  is_required: boolean;
  is_active: boolean;
  quantity_option?: QuantityOptionCreate;
  type_option?: TypeOptionCreate;
  toggle_option?: ToggleOptionCreate;
}

export interface PricingBlockResponse {
  id: number;
  service_id: number;
  name: string;
  block_type: 'quantity' | 'type' | 'toggle';
  order_index: number;
  is_required: boolean;
  is_active: boolean;
  quantity_option?: {
    id: number;
    pricing_block_id: number;
    name: string;
    unit_price: number;
    min_quantity?: number;
    max_quantity?: number;
    unit_name: string;
    created_at: string;
    updated_at: string | null;
  };
  type_option?: {
    id: number;
    pricing_block_id: number;
    name: string;
    options: Array<{
      id: number;
      type_option_id: number;
      name: string;
      price: number;
      created_at: string;
      updated_at: string | null;
    }>;
    created_at: string;
    updated_at: string | null;
  };
  toggle_option?: {
    id: number;
    pricing_block_id: number;
    name: string;
    short_description: string;
    full_description?: string;
    percentage_increase: number;
    created_at: string;
    updated_at: string | null;
  };
  created_at: string;
  updated_at: string | null;
}

export interface PricingBlockUpdate {
  name?: string;
  order_index?: number;
  is_required?: boolean;
  is_active?: boolean;
  quantity_option?: Partial<QuantityOptionCreate>;
  type_option?: Partial<TypeOptionCreate>;
  toggle_option?: Partial<ToggleOptionCreate>;
}

export interface BlockOrder {
  id: number;
  order_index: number;
}

// Cleaner types
export interface CleanerResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CleanerCreate {
  name: string;
  email: string;
  phone: string;
  is_active?: boolean;
}

// Order types
export interface OrderResponse {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_id: number;
  service_name: string;
  status: OrderStatus;
  total_amount: number;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  notes?: string;
  created_at: string;
  updated_at: string | null;
}

export interface OrderListQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  service_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
}

export interface CleanerAssignment {
  order_id: number;
  cleaner_id: number;
}

// Timeslot types
export interface TimeslotsQuery {
  date: string;
  service_id?: number;
}

export interface TimeslotsResponse {
  date: string;
  available_times: string[];
  booked_times: string[];
}

// Calculation types
export interface OrderCalculation {
  service_id: number;
  options: Array<{
    option_id: number;
    quantity?: number;
    selected_value?: string;
  }>;
}

export interface CalculationResponse {
  subtotal: number;
  total: number;
  breakdown: Array<{
    option_name: string;
    price: number;
    quantity?: number;
    total: number;
  }>;
}
