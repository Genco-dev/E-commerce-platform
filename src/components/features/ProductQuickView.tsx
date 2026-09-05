import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useWishlist } from '../../hooks/useWishlist';
import { formatPrice, calculateDiscount } from '../../lib/utils';
import { Star, Heart, ShoppingBag, Truck, Shield, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlist(product?.id || '');

  if (!product) return null;

  // Ensure product.images is always an array to prevent undefined errors
  const productImages = product.images || [];
  const productVariants = product.variants || [];
  const discountPercentage = product.sale_price 
    ? calculateDiscount(product.price, product.sale_price)
    : 0;

  const handleAddToCart = () => {
    const variant = productVariants.find(v => v.id === selectedVariant);
    
    addItem({
      product,
      variant,
      quantity,
      selected_attributes: variant?.attributes || {},
      added_at: new Date().toISOString()
    });
    
    toast.success('Added to cart!');
    onClose();
  };

  const currentPrice = selectedVariant 
    ? productVariants.find(v => v.id === selectedVariant)?.sale_price || 
      productVariants.find(v => v.id === selectedVariant)?.price || product.price
    : product.sale_price || product.price;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={productImages[selectedImage]?.url || '/placeholder-image.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-indigo-600' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            {product.brand && (
              <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide">
                {product.brand.name}
              </p>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mt-1">{product.name}</h2>
            
            {/* Rating */}
            <div className="flex items-center mt-2">
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
              <span className="text-sm text-gray-600 ml-2">
                ({product.rating_count} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(currentPrice)}
            </span>
            {product.sale_price && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
                <Badge variant="error" size="sm">
                  {discountPercentage}% OFF
                </Badge>
              </>
            )}
          </div>

          {/* Description */}
          {product.short_description && (
            <p className="text-gray-600">{product.short_description}</p>
          )}

          {/* Variants */}
          {productVariants.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Options</h4>
              <div className="grid grid-cols-2 gap-2">
                {productVariants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                      selectedVariant === variant.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-gray-300 text-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    {variant.name}
                    {variant.price && (
                      <span className="block text-xs text-gray-500">
                        {formatPrice(variant.price)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Quantity</h4>
            <div className="flex items-center space-x-3">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-600">
                {product.stock_quantity} available
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className="flex-1"
              leftIcon={<ShoppingBag className="h-4 w-4" />}
            >
              Add to Cart
            </Button>
            
            <Button
              variant="outline"
              onClick={() => toggleWishlist(product.id)}
              className={isInWishlist ? 'text-red-600 border-red-300' : ''}
            >
              <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Features */}
          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Truck className="h-4 w-4 mr-2 text-green-600" />
                Free shipping on orders over $100
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                Secure payment & buyer protection
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <RotateCcw className="h-4 w-4 mr-2 text-purple-600" />
                30-day return policy
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};