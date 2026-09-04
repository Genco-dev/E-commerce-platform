import { supabase } from './supabase';
import { 
  Product, 
  Category, 
  Order, 
  User, 
  Address,
  SearchFilters, 
  PaginatedResponse,
  Review,
  Wishlist,
  Coupon,
  Analytics
} from '../types';

// Enhanced error handling for API calls
const handleSupabaseError = (error: any) => {
  // Add status code to error for better handling
  if (error?.code === 'PGRST002') {
    error.status = 503;
    error.message = 'Service temporarily unavailable. Please try again later.';
  }
  throw error;
};
// Products API
export const productsApi = {
  getAll: async (filters: SearchFilters = {}): Promise<PaginatedResponse<Product>> => {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        brand:brands(*),
        images:product_images(*),
        variants:product_variants(*),
        reviews:reviews(rating)
      `, { count: 'exact' });

    // Apply filters
    if (filters.query) {
      query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }
    
    if (filters.category) {
      query = query.eq('category.slug', filters.category);
    }
    
    if (filters.brand) {
      query = query.eq('brand.slug', filters.brand);
    }
    
    if (filters.min_price) {
      query = query.gte('price', filters.min_price);
    }
    
    if (filters.max_price) {
      query = query.lte('price', filters.max_price);
    }
    
    if (filters.in_stock) {
      query = query.gt('stock_quantity', 0);
    }
    
    if (filters.on_sale) {
      query = query.not('sale_price', 'is', null);
    }
    
    if (filters.rating) {
      query = query.gte('rating_average', filters.rating);
    }

    // Apply sorting
    switch (filters.sort_by) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating_average', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'popularity':
        query = query.order('sales_count', { ascending: false });
        break;
      default:
        query = query.order('name', { ascending: true });
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to);

    const { data, error, count } = await query;
    
    if (error) handleSupabaseError(error);

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
      has_next: to < (count || 0) - 1,
      has_prev: page > 1
    };
  },

  getById: async (id: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        brand:brands(*),
        images:product_images(*),
        variants:product_variants(*),
        attributes:product_attributes(*),
        reviews:reviews(*, user:users(full_name, avatar_url))
      `)
      .eq('id', id)
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  getFeatured: async (limit = 8): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        brand:brands(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(limit);

    if (error) handleSupabaseError(error);
    return data || [];
  },

  getRelated: async (productId: string, categoryId: string, limit = 4): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        brand:brands(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('category_id', categoryId)
      .neq('id', productId)
      .eq('is_active', true)
      .limit(limit);

    if (error) handleSupabaseError(error);
    return data || [];
  },

  incrementViewCount: async (productId: string): Promise<void> => {
    const { error } = await supabase.rpc('increment_product_views', {
      product_id: productId
    });
    
    if (error) handleSupabaseError(error);
  }
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) handleSupabaseError(error);
    return data || [];
  },

  getHierarchy: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) handleSupabaseError(error);
    
    // Build hierarchy
    const categories = data || [];
    const categoryMap = new Map(categories.map(cat => [cat.id, { ...cat, children: [] }]));
    const rootCategories: Category[] = [];

    categories.forEach(category => {
      const cat = categoryMap.get(category.id)!;
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children!.push(cat);
        }
      } else {
        rootCategories.push(cat);
      }
    });

    return rootCategories;
  }
};

// Orders API
export const ordersApi = {
  create: async (orderData: Partial<Order>): Promise<Order> => {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select(`
        *,
        items:order_items(*, product:products(*))
      `)
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  getById: async (id: string): Promise<Order> => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(*),
        items:order_items(*, product:products(*), variant:product_variants(*))
      `)
      .eq('id', id)
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  getUserOrders: async (userId: string, page = 1, limit = 10): Promise<PaginatedResponse<Order>> => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*, product:products(*))
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) handleSupabaseError(error);

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
      has_next: to < (count || 0) - 1,
      has_prev: page > 1
    };
  },

  updateStatus: async (orderId: string, status: string): Promise<void> => {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) handleSupabaseError(error);
  }
};

// Reviews API
export const reviewsApi = {
  getByProduct: async (productId: string, page = 1, limit = 10): Promise<PaginatedResponse<Review>> => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('reviews')
      .select(`
        *,
        user:users(full_name, avatar_url)
      `, { count: 'exact' })
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) handleSupabaseError(error);

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
      has_next: to < (count || 0) - 1,
      has_prev: page > 1
    };
  },

  create: async (reviewData: Partial<Review>): Promise<Review> => {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select(`
        *,
        user:users(full_name, avatar_url)
      `)
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  markHelpful: async (reviewId: string): Promise<void> => {
    const { error } = await supabase.rpc('increment_review_helpful', {
      review_id: reviewId
    });
    
    if (error) handleSupabaseError(error);
  }
};

// Wishlist API
export const wishlistApi = {
  getUserWishlist: async (userId: string): Promise<Wishlist[]> => {
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        product:products(*, images:product_images(*))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  },

  add: async (userId: string, productId: string): Promise<Wishlist> => {
    const { data, error } = await supabase
      .from('wishlists')
      .insert({ user_id: userId, product_id: productId })
      .select(`
        *,
        product:products(*, images:product_images(*))
      `)
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  remove: async (userId: string, productId: string): Promise<void> => {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) handleSupabaseError(error);
  },

  isInWishlist: async (userId: string, productId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') handleSupabaseError(error);
    return !!data;
  }
};

// Coupons API
export const couponsApi = {
  validate: async (code: string, userId: string, cartTotal: number): Promise<Coupon> => {
    const { data, error } = await supabase.rpc('validate_coupon', {
      coupon_code: code,
      user_id: userId,
      cart_total: cartTotal
    });

    if (error) handleSupabaseError(error);
    return data;
  },

  apply: async (code: string, userId: string): Promise<void> => {
    const { error } = await supabase.rpc('apply_coupon', {
      coupon_code: code,
      user_id: userId
    });

    if (error) handleSupabaseError(error);
  }
};

// Analytics API
export const analyticsApi = {
  getDashboard: async (period = '30d'): Promise<Analytics> => {
    const { data, error } = await supabase.rpc('get_analytics_dashboard', {
      period_days: period === '7d' ? 7 : period === '30d' ? 30 : 90
    });

    if (error) handleSupabaseError(error);
    return data;
  },

  getTopProducts: async (limit = 10): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*)
      `)
      .order('sales_count', { ascending: false })
      .limit(limit);

    if (error) handleSupabaseError(error);
    return data || [];
  },

  getRevenueChart: async (period = '30d'): Promise<any[]> => {
    const { data, error } = await supabase.rpc('get_revenue_chart', {
      period_days: period === '7d' ? 7 : period === '30d' ? 30 : 90
    });

    if (error) handleSupabaseError(error);
    return data || [];
  }
};

// Users API
export const usersApi = {
  updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  getAddresses: async (userId: string): Promise<Address[]> => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  },

  addAddress: async (address: Partial<Address>): Promise<Address> => {
    const { data, error } = await supabase
      .from('addresses')
      .insert(address)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  updateAddress: async (addressId: string, updates: Partial<Address>): Promise<Address> => {
    const { data, error } = await supabase
      .from('addresses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', addressId)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  deleteAddress: async (addressId: string): Promise<void> => {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);

    if (error) handleSupabaseError(error);
  }
};