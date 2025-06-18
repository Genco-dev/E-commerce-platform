import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      product,
      quantity: 1,
      size: product.sizes[0] || 'M',
      color: product.colors[0] || 'Black',
    });
  };

  const discountPercentage = product.sale_price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="relative overflow-hidden">
          <img
            src={product.images[0] || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400'}
            alt={product.name}
            className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_featured && (
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 text-xs font-semibold rounded-full shadow-lg">
                Featured
              </span>
            )}
            
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 text-xs font-semibold rounded-full shadow-lg">
                -{discountPercentage}% OFF
              </span>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                className="bg-white text-gray-900 p-3 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-200 shadow-lg transform hover:scale-110"
                title="Add to Cart"
              >
                <ShoppingBag className="h-5 w-5" />
              </button>
              <button 
                className="bg-white text-gray-900 p-3 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200 shadow-lg transform hover:scale-110"
                title="Add to Wishlist"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Stock Status */}
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <div className="absolute bottom-3 right-3">
              <span className="bg-orange-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                Only {product.stock_quantity} left
              </span>
            </div>
          )}
          
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-gray-900 text-white px-4 py-2 text-sm font-semibold rounded-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        
        <div className="p-5">
          {/* Category */}
          {product.category && (
            <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
              {product.category.name}
            </span>
          )}
          
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          
          {/* Rating (Mock) */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">(4.0)</span>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {product.sale_price ? (
                <>
                  <span className="text-xl font-bold text-indigo-600">
                    ${product.sale_price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            
            <div className="text-sm">
              {product.stock_quantity > 0 ? (
                <span className="text-green-600 font-medium">In Stock</span>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>
          </div>
          
          {/* Colors and Sizes */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {product.colors.slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className="w-5 h-5 rounded-full border-2 border-gray-300 shadow-sm"
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
                {product.colors.length > 4 && (
                  <span className="text-xs text-gray-500 ml-1">+{product.colors.length - 4}</span>
                )}
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              {product.sizes.length > 0 && `${product.sizes.length} sizes`}
            </div>
          </div>
          
          {/* Quick Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-2.5 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};