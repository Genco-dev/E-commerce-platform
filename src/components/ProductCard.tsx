import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { useWishlist } from '../hooks/useWishlist';
import { ProductQuickView } from './features/ProductQuickView';
import { formatPrice, calculateDiscount, optimizeImageUrl } from '../lib/utils';
import { Badge } from './ui/Badge';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlistQuery } = useWishlist();

  const { data: isInWishlist } = isInWishlistQuery(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      product,
      quantity: 1,
      selected_attributes: {},
      added_at: new Date().toISOString()
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const discountPercentage = product.sale_price 
    ? calculateDiscount(product.price, product.sale_price)
    : 0;

  const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
  const currentPrice = product.sale_price || product.price;

  return (
    <>
      <Link to={`/product/${product.id}`} className="group block">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
          <div className="relative overflow-hidden">
            <img
              src={optimizeImageUrl(primaryImage?.url || '/placeholder-image.jpg', 400, 400)}
              alt={primaryImage?.alt_text || product.name}
              className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.is_featured && (
                <Badge variant="info" size="sm">
                  Featured
                </Badge>
              )}
              
              {discountPercentage > 0 && (
                <Badge variant="error" size="sm">
                  -{discountPercentage}% OFF
                </Badge>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <button
                  onClick={handleQuickView}
                  className="bg-white text-gray-900 p-3 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-200 shadow-lg transform hover:scale-110"
                  title="Quick View"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="bg-white text-gray-900 p-3 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-200 shadow-lg transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Add to Cart"
                >
                  <ShoppingBag className="h-5 w-5" />
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-full transition-all duration-200 shadow-lg transform hover:scale-110 ${
                    isInWishlist 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white text-gray-900 hover:bg-red-500 hover:text-white'
                  }`}
                  title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Stock Status */}
            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
              <div className="absolute bottom-3 right-3">
                <Badge variant="warning" size="sm">
                  Only {product.stock_quantity} left
                </Badge>
              </div>
            )}
            
            {product.stock_quantity === 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Badge variant="error">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>
          
          <div className="p-5">
            {/* Brand */}
            {product.brand && (
              <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                {product.brand.name}
              </span>
            )}
            
            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating_average) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2">
                ({product.rating_count})
              </span>
            </div>
            
            {/* Price */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-indigo-600">
                  {formatPrice(currentPrice)}
                </span>
                {product.sale_price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              
              <div className="text-sm">
                {product.stock_quantity > 0 ? (
                  <Badge variant="success" size="sm">In Stock</Badge>
                ) : (
                  <Badge variant="error" size="sm">Out of Stock</Badge>
                )}
              </div>
            </div>
            
            {/* Variants Preview */}
            {product.variants.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {product.variants.slice(0, 4).map((variant, index) => (
                      <div
                        key={index}
                        className="w-5 h-5 rounded-full border-2 border-gray-300 shadow-sm bg-gray-100"
                        title={variant.name}
                      />
                    ))}
                    {product.variants.length > 4 && (
                      <span className="text-xs text-gray-500 ml-1">
                        +{product.variants.length - 4}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  {product.variants.length} options
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Quick View Modal */}
      <ProductQuickView
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};