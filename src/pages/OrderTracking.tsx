import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Package, Truck, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatDate } from '../lib/utils';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address: any;
  tracking_number?: string;
  estimated_delivery?: string;
  delivered_at?: string;
}

export const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: Package },
      { key: 'processing', label: 'Processing', icon: Clock },
      { key: 'shipped', label: 'Shipped', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order?.status || 'pending');

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <>
        <SEOHead title="Order Not Found - FashionHub" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || 'The order you are looking for does not exist or you do not have permission to view it.'}
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <>
      <SEOHead title={`Track Order #${order.order_number} - FashionHub`} />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/profile"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
              <div className="text-white">
                <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
                <p className="text-indigo-100">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
            </div>

            {/* Order Status */}
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status</h2>
              
              <div className="relative">
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, index) => (
                    <div key={step.key} className="flex flex-col items-center relative">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                          step.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : step.current
                            ? 'bg-indigo-500 border-indigo-500 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}
                      >
                        <step.icon className="h-6 w-6" />
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium ${
                          step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </span>
                      
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`absolute top-6 left-12 w-full h-0.5 ${
                            statusSteps[index + 1].completed ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          style={{ width: 'calc(100% + 3rem)' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            {order.tracking_number && (
              <div className="border-t border-gray-200 p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tracking Number</p>
                      <p className="text-lg font-mono text-gray-900">{order.tracking_number}</p>
                    </div>
                    {order.estimated_delivery && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Estimated Delivery</p>
                        <p className="text-lg text-gray-900">{formatDate(order.estimated_delivery)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="border-t border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">
                  {order.shipping_address.street}<br />
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br />
                  {order.shipping_address.country}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-xl font-bold text-gray-900">${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};