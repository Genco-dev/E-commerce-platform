import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useForm } from 'react-hook-form';

import { supabase } from '../lib/supabase';
import { CreditCard, MapPin, Package, ArrowLeft, Lock, Truck, Wallet } from 'lucide-react';

interface CheckoutForm {
  shipping_street: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;

  billing_street: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_country: string;

  payment_method: 'cod' | 'card';
  card_number: string;
  expiry_date: string;
  cvv: string;
  cardholder_name: string;

  same_as_shipping: boolean;
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CheckoutForm>({
    defaultValues: {
      same_as_shipping: true,
      shipping_country: 'US',
      billing_country: 'US',
      payment_method: 'cod',
    }
  });

  const subtotal = getTotalPrice();
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const getProductImage = (product: any): string => {
    const images = product.images;
    if (!images || images.length === 0) return 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=100';
    if (typeof images[0] === 'string') return images[0];
    return images[0]?.url || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=100';
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      const shippingAddress = {
        street: data.shipping_street,
        city: data.shipping_city,
        state: data.shipping_state,
        postal_code: data.shipping_postal_code,
        country: data.shipping_country,
      };

      const billingAddress = sameAsShipping ? shippingAddress : {
        street: data.billing_street,
        city: data.billing_city,
        state: data.billing_state,
        postal_code: data.billing_postal_code,
        country: data.billing_country,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'pending',
          payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
          payment_method: paymentMethod,
          shipping_address: shippingAddress,
          billing_address: billingAddress,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.sale_price || item.product.price,
        size: item.size || '',
        color: item.color || '',
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      navigate(`/order-confirmation/${order.id}`);

    } catch (error) {
      console.error('Error processing order:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to checkout</h2>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Cart
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
              <p className="text-gray-600">Complete your order securely</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      {...register('shipping_street', { required: 'Street address is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                    {errors.shipping_street && (
                      <p className="mt-1 text-sm text-red-600">{errors.shipping_street.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      {...register('shipping_city', { required: 'City is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="New York"
                    />
                    {errors.shipping_city && (
                      <p className="mt-1 text-sm text-red-600">{errors.shipping_city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      {...register('shipping_state', { required: 'State is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="NY"
                    />
                    {errors.shipping_state && (
                      <p className="mt-1 text-sm text-red-600">{errors.shipping_state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      {...register('shipping_postal_code', { required: 'Postal code is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="10001"
                    />
                    {errors.shipping_postal_code && (
                      <p className="mt-1 text-sm text-red-600">{errors.shipping_postal_code.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      {...register('shipping_country', { required: 'Country is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Billing Address
                  </h2>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => {
                        setSameAsShipping(e.target.checked);
                        setValue('same_as_shipping', e.target.checked);
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Same as shipping</span>
                  </label>
                </div>

                {!sameAsShipping && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        {...register('billing_street', { required: !sameAsShipping && 'Street address is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        {...register('billing_city', { required: !sameAsShipping && 'City is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="New York"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        {...register('billing_state', { required: !sameAsShipping && 'State is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="NY"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        {...register('billing_postal_code', { required: !sameAsShipping && 'Postal code is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="10001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <select
                        {...register('billing_country', { required: !sameAsShipping && 'Country is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Payment Method
                </h2>

                <div className="space-y-4">
                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('cod'); setValue('payment_method', 'cod'); }}
                      className={`flex items-center justify-center space-x-3 p-4 border-2 rounded-lg transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Truck className="h-6 w-6" />
                      <div className="text-left">
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-xs opacity-75">Pay when you receive</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('card'); setValue('payment_method', 'card'); }}
                      className={`flex items-center justify-center space-x-3 p-4 border-2 rounded-lg transition-all ${
                        paymentMethod === 'card'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="h-6 w-6" />
                      <div className="text-left">
                        <p className="font-medium">Credit Card</p>
                        <p className="text-xs opacity-75">Visa, Mastercard</p>
                      </div>
                    </button>
                  </div>

                  {/* Card Details (only for card payment) */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name
                        </label>
                        <input
                          {...register('cardholder_name', { required: paymentMethod === 'card' && 'Cardholder name is required' })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="John Doe"
                        />
                        {errors.cardholder_name && (
                          <p className="mt-1 text-sm text-red-600">{errors.cardholder_name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          {...register('card_number', {
                            required: paymentMethod === 'card' && 'Card number is required',
                            pattern: {
                              value: /^[0-9]{16}$/,
                              message: 'Please enter a valid 16-digit card number'
                            }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="1234 5678 9012 3456"
                          maxLength={16}
                        />
                        {errors.card_number && (
                          <p className="mt-1 text-sm text-red-600">{errors.card_number.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            {...register('expiry_date', {
                              required: paymentMethod === 'card' && 'Expiry date is required',
                              pattern: {
                                value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                                message: 'Please enter MM/YY format'
                              }
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                          {errors.expiry_date && (
                            <p className="mt-1 text-sm text-red-600">{errors.expiry_date.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            {...register('cvv', {
                              required: paymentMethod === 'card' && 'CVV is required',
                              pattern: {
                                value: /^[0-9]{3,4}$/,
                                message: 'Please enter a valid CVV'
                              }
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="123"
                            maxLength={4}
                          />
                          {errors.cvv && (
                            <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg">
                        <Wallet className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        <p className="text-xs text-amber-800">
                          Your payment will be processed securely. We do not store your card details.
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                      <Truck className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-green-800">
                        Pay with cash when your order is delivered. No payment required now.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={getProductImage(item.product)}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.size || 'N/A'} • {item.color || 'N/A'} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${((item.product.sale_price || item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {shipping > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
