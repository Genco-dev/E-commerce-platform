import { useQuery } from 'react-query';
import { analyticsApi } from '../lib/api';

export function useAnalytics(period = '30d') {
  return useQuery(
    ['analytics', period],
    () => analyticsApi.getDashboard(period),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    }
  );
}

export function useTopProducts(limit = 10) {
  return useQuery(
    ['top-products', limit],
    () => analyticsApi.getTopProducts(limit),
    {
      staleTime: 15 * 60 * 1000,
    }
  );
}

export function useRevenueChart(period = '30d') {
  return useQuery(
    ['revenue-chart', period],
    () => analyticsApi.getRevenueChart(period),
    {
      staleTime: 5 * 60 * 1000,
    }
  );
}