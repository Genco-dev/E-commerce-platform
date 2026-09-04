import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../lib/utils';
import { SEOHead } from '../components/seo/SEOHead';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const Wishlist: React.FC = () => {
  const { wishlistItems, isLoading, removeFromWishlist } = useWishlist();
  const { addItem } = useCartStore();

  const handleAddToCart = (item: any) => {
    if (!item.product) return;
    addItem({
      product: item.product,
      quantity: 1,
      selected_attributes: {},
      added_at: new Date().toISOString()
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="My Wishlist - FashionHub"
        description="View and manage your saved items in your FashionHub wishlist."
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your wishlist is empty</h3>
                <p className="text-gray-600 mb-8">
                  Save items you love to your wishlist and shop them later!
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                  <div className="relative">
                    <img
                      src={item.product?.images?.[0]?.url || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={item.product?.name || 'Product'}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => removeFromWishlist(item.product_id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.product?.name || 'Unknown Product'}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-indigo-600">
                          {formatPrice(item.product?.sale_price || item.product?.price || 0)}
                        </span>
                        {item.product?.sale_price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(item.product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        to={`/product/${item.product?.id || ''}`}
                        className="flex-1 text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={item.product?.stock_quantity === 0}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};