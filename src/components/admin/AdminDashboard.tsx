import React from 'react';
import { useAnalytics, useRevenueChart } from '../../hooks/useAnalytics';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Badge } from '../ui/Badge';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueChart();

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const metrics = [
    {
      name: 'Total Revenue',
      value: formatPrice(analytics?.revenue.current || 0),
      change: analytics?.revenue.change_percentage || 0,
      trend: analytics?.revenue.trend || 'stable',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Orders',
      value: analytics?.orders.current || 0,
      change: analytics?.orders.change_percentage || 0,
      trend: analytics?.orders.trend || 'stable',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Customers',
      value: analytics?.customers.current || 0,
      change: analytics?.customers.change_percentage || 0,
      trend: analytics?.customers.trend || 'stable',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Products',
      value: analytics?.products.current || 0,
      change: analytics?.products.change_percentage || 0,
      trend: analytics?.products.trend || 'stable',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div className="flex items-center space-x-1">
                {metric.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : metric.trend === 'down' ? (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                ) : null}
                <span className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
              <p className="text-sm text-gray-600">{metric.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="success">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5%
            </Badge>
          </div>
        </div>
        
        {revenueLoading ? (
          <div className="h-80 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatPrice(value as number), 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate</h3>
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-gray-900">
              {analytics?.conversion_rate.current.toFixed(2) || 0}%
            </div>
          <Badge variant={analytics?.conversion_rate?.trend === 'up' ? 'success' : 'warning'}>
              {analytics?.conversion_rate?.change_percentage && analytics.conversion_rate.change_percentage > 0 ? '+' : ''}
              {analytics?.conversion_rate?.change_percentage?.toFixed(1)}%
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Visitors who made a purchase
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Order Value</h3>
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-gray-900">
              {formatPrice((analytics?.revenue.current || 0) / (analytics?.orders.current || 1))}
            </div>
            <Badge variant="info">
              Per order
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Average amount per order
          </p>
        </div>
      </div>
    </div>
  );
};