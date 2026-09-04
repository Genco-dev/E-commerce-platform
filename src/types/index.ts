export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'admin' | 'vendor';
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  preferences?: UserPreferences;
  created_at: string;
  updated_at?: string;
  last_login?: string;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
}

export interface UserPreferences {
  newsletter: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  preferred_language: string;
  preferred_currency: string;
  size_preferences: Record<string, string>;
  style_preferences: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  banner_url?: string;
  parent_id?: string;
  children?: Category[];
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  cost_price?: number;
  category_id?: string;
  category?: Category;
  brand_id?: string;
  brand?: Brand;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  allow_backorders: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  is_featured: boolean;
  is_active: boolean;
  is_digital: boolean;
  requires_shipping: boolean;
  tax_class?: string;
  meta_title?: string;
  meta_description?: string;
  tags: string[];
  sizes: string[];
  colors: string[];
  rating_average: number;
  rating_count: number;
  view_count: number;
  sales_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price?: number;
  sale_price?: number;
  stock_quantity: number;
  attributes: Record<string, string>;
  image_url?: string;
  is_active: boolean;
}

export interface ProductAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'color' | 'image';
  values: string[];
  is_required: boolean;
  is_variation: boolean;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  size?: string;
  color?: string;
  selected_attributes: Record<string, string>;
  added_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user?: User;
  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  shipping_address: Address;
  billing_address: Address;
  shipping_method?: ShippingMethod;
  payment_method?: PaymentMethod;
  notes?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  cancelled_at?: string;
  refunded_at?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  variant_id?: string;
  variant?: ProductVariant;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_attributes: Record<string, string>;
  created_at: string;
}

export interface Address {
  id?: string;
  user_id?: string;
  type?: 'shipping' | 'billing';
  is_default?: boolean;
  first_name: string;
  last_name: string;
  company?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimated_days: number;
  is_active: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'bank_transfer' | 'cash_on_delivery';
  is_active: boolean;
  config: Record<string, any>;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  usage_count: number;
  user_limit?: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  applicable_products?: string[];
  applicable_categories?: string[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user?: User;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'order' | 'promotion' | 'system' | 'review' | 'stock';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface Analytics {
  revenue: AnalyticsMetric;
  orders: AnalyticsMetric;
  customers: AnalyticsMetric;
  products: AnalyticsMetric;
  traffic: AnalyticsMetric;
  conversion_rate: AnalyticsMetric;
}

export interface AnalyticsMetric {
  current: number;
  previous: number;
  change: number;
  change_percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SearchFilters {
  query?: string;
  category?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  rating?: number;
  in_stock?: boolean;
  on_sale?: boolean;
  attributes?: Record<string, string[]>;
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popularity';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
}

export interface SiteSettings {
  site_name: string;
  site_description: string;
  site_logo: string;
  site_favicon: string;
  contact_email: string;
  contact_phone: string;
  address: Address;
  social_links: Record<string, string>;
  currency: string;
  timezone: string;
  language: string;
  tax_rate: number;
  shipping_zones: ShippingZone[];
  payment_methods: PaymentMethod[];
  email_templates: Record<string, string>;
  seo_settings: SEOData;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  methods: ShippingMethod[];
  is_active: boolean;
}