import { useState, useEffect } from 'react';
import { useQuery, useInfiniteQuery } from 'react-query';
import { productsApi } from '../lib/api';
import { SearchFilters } from '../types';

export function useProducts(filters: SearchFilters = {}) {
  return useQuery(
    ['products', filters],
    () => productsApi.getAll(filters),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 503 service unavailable errors
        if (error?.status === 503) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );
}

export function useInfiniteProducts(filters: SearchFilters = {}) {
  return useInfiniteQuery(
    ['products-infinite', filters],
    ({ pageParam = 1 }) => productsApi.getAll({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) => 
        lastPage.has_next ? lastPage.page + 1 : undefined,
      keepPreviousData: true,
      retry: (failureCount, error: any) => {
        if (error?.status === 503) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );
}

export function useProduct(id: string) {
  return useQuery(
    ['product', id],
    () => productsApi.getById(id),
    {
      enabled: !!id,
      staleTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 503) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );
}

export function useFeaturedProducts(limit = 8) {
  return useQuery(
    ['products-featured', limit],
    () => productsApi.getFeatured(limit),
    {
      staleTime: 15 * 60 * 1000, // 15 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 503) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );
}

export function useRelatedProducts(productId: string, categoryId: string, limit = 4) {
  return useQuery(
    ['products-related', productId, categoryId, limit],
    () => productsApi.getRelated(productId, categoryId, limit),
    {
      enabled: !!productId && !!categoryId,
      staleTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.status === 503) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );
}

export function useProductSearch() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [debouncedFilters, setDebouncedFilters] = useState<SearchFilters>({});

  // Debounce search filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const { data, isLoading, error } = useProducts(debouncedFilters);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    products: data?.data || [],
    pagination: data ? {
      total: data.total,
      page: data.page,
      limit: data.limit,
      total_pages: data.total_pages,
      has_next: data.has_next,
      has_prev: data.has_prev,
    } : null,
    filters,
    updateFilters,
    clearFilters,
    isLoading,
    error,
  };
}