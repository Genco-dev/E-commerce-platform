import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { ProductForm } from '../components/admin/ProductForm';
import { OrderManagement } from '../components/admin/OrderManagement';
import { Package, Users, ShoppingCart, DollarSign, Plus, Settings } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';

export const Admin: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProductForm, setShowProductForm] = useState(false);

  if (!user || user.role !== 'admin') {
    return (
      <>
        <SEOHead title="Access Denied - FashionHub Admin" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Admin Dashboard - FashionHub" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your FashionHub store</p>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: DollarSign },
                { id: 'products', name: 'Products', icon: Package },
                { id: 'orders', name: 'Orders', icon: ShoppingCart },
                { id: 'users', name: 'Users', icon: Users },
                { id: 'settings', name: 'Settings', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && <AdminDashboard />}
          
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Products</h2>
                <button
                  onClick={() => setShowProductForm(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </button>
              </div>
              {/* Product management component would go here */}
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Product Management</h3>
                <p className="text-gray-600">Product management interface coming soon...</p>
              </div>
            </div>
          )}
          
          {activeTab === 'orders' && <OrderManagement />}
          
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
              <p className="text-gray-600">User management interface coming soon...</p>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
              <p className="text-gray-600">Settings interface coming soon...</p>
            </div>
          )}

          {/* Product Form Modal */}
          <ProductForm
            isOpen={showProductForm}
            onClose={() => setShowProductForm(false)}
            onSuccess={() => {
              setShowProductForm(false);
              // Refresh products list
            }}
          />
        </div>
      </div>
    </>
  );
};