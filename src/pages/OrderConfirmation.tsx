import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Package, Truck, Calendar, ArrowRight } from 'lucide-react';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: any;
  order_items: Array<{
    id: string;
    quantity: number;
    price: number;
    size: string;
    color: string;
    product: {
      id: string;
      name: string;
      images: string[];
    };
  }>;
}

export const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              images
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <Link
            to="/products"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 text-lg">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <h2 className="text-xl font-semibold">Order #{order.id.slice(0, 8)}</h2>
                <p className="text-indigo-100">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${order.total_amount.toFixed(2)}</p>
                <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order Items
            </h3>
            
            <div className="space-y-6">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 pb-6 border-b border-gray-200 last:border-b-0">
                  <img
                    src={item.product.images[0] || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=100'}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                    <div className="text-sm text-gray-600 mt-1">
                      <span>Size: {item.size}</span>
                      <span className="mx-2">•</span>
                      <span>Color: {item.color}</span>
                      <span className="mx-2">•</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Shipping Information
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900 mb-2">Shipping Address:</p>
            <div className="text-gray-600">
              <p>{order.shipping_address.street}</p>
              <p>
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
              </p>
              <p>{order.shipping_address.country}</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="font-medium text-blue-900">Estimated Delivery</p>
                <p className="text-blue-700">
                  {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-100 rounded-full p-2 mt-1">
                <span className="block w-2 h-2 bg-indigo-600 rounded-full"></span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Order Confirmation</p>
                <p className="text-gray-600 text-sm">
                  You'll receive an email confirmation with your order details shortly.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-gray-100 rounded-full p-2 mt-1">
                <span className="block w-2 h-2 bg-gray-400 rounded-full"></span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Processing</p>
                <p className="text-gray-600 text-sm">
                  We'll prepare your items for shipment within 1-2 business days.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-gray-100 rounded-full p-2 mt-1">
                <span className="block w-2 h-2 bg-gray-400 rounded-full"></span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Shipping</p>
                <p className="text-gray-600 text-sm">
                  You'll receive tracking information once your order ships.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            to="/products"
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-center flex items-center justify-center"
          >
            Continue Shopping
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
          
          <Link
            to="/profile"
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            View Order History
          </Link>
        </div>
      </div>
    </div>
  );
};