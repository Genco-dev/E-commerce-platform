import React, { useEffect } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { LoadingSpinner } from './LoadingSpinner';

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
  threshold?: number;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  hasMore,
  isLoading,
  onLoadMore,
  children,
  threshold = 0.1,
}) => {
  const [setNode, entry] = useIntersectionObserver({
    threshold,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [entry?.isIntersecting, hasMore, isLoading, onLoadMore]);

  return (
    <>
      {children}
      {hasMore && (
        <div ref={setNode} className="flex justify-center py-8">
          {isLoading && <LoadingSpinner />}
        </div>
      )}
    </>
  );
};