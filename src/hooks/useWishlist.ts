import { useQuery, useMutation, useQueryClient } from 'react-query';
import { wishlistApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function useWishlist() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [], isLoading } = useQuery(
    ['wishlist', user?.id],
    () => user ? wishlistApi.getUserWishlist(user.id) : [],
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000,
    }
  );

  const addToWishlistMutation = useMutation(
    ({ productId }: { productId: string }) => 
      wishlistApi.add(user!.id, productId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['wishlist', user?.id]);
        toast.success('Added to wishlist');
      },
      onError: () => {
        toast.error('Failed to add to wishlist');
      },
    }
  );

  const removeFromWishlistMutation = useMutation(
    ({ productId }: { productId: string }) => 
      wishlistApi.remove(user!.id, productId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['wishlist', user?.id]);
        toast.success('Removed from wishlist');
      },
      onError: () => {
        toast.error('Failed to remove from wishlist');
      },
    }
  );

  const isInWishlistQuery = (productId: string) => 
    useQuery(
      ['wishlist-check', user?.id, productId],
      () => user ? wishlistApi.isInWishlist(user.id, productId) : false,
      {
        enabled: !!user && !!productId,
        staleTime: 5 * 60 * 1000,
      }
    );

  const addToWishlist = (productId: string) => {
    if (!user) {
      toast.error('Please sign in to add items to wishlist');
      return;
    }
    addToWishlistMutation.mutate({ productId });
  };

  const removeFromWishlist = (productId: string) => {
    if (!user) return;
    removeFromWishlistMutation.mutate({ productId });
  };

  const toggleWishlist = (productId: string) => {
    const isInWishlist = wishlistItems.some(item => item.product_id === productId);
    if (isInWishlist) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  return {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlistQuery,
    wishlistCount: wishlistItems.length,
  };
}