import React from 'react';
import { useQuery } from 'react-query';
import { ProductCard } from '../ProductCard';
import { Skeleton } from '../ui/Skeleton';

export const RecentlyViewed: React.FC = () => {
  const { data: recentProducts, isLoading } = useQuery(
    ['recently-viewed'],
    () => {
      // Get from localStorage
      const recent = localStorage.getItem('recently-viewed');
      return recent ? JSON.parse(recent) : [];
    },
    {
      staleTime: Infinity, // Never stale since it's from localStorage
    }
  );

  if (isLoading || !recentProducts || recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Recently Viewed</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <Skeleton className="w-full h-72" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
              </div>
            ))
          ) : (
            recentProducts.slice(0, 4).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};