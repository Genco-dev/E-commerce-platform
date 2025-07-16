import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, RotateCcw, Heart, AlertCircle, RefreshCw } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { NewsletterSignup } from '../components/features/NewsletterSignup';
import { RecentlyViewed } from '../components/features/RecentlyViewed';
import { SEOHead } from '../components/seo/SEOHead';
import { useFeaturedProducts } from '../hooks/useProducts';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Skeleton } from '../components/ui/Skeleton';

export const Home: React.FC = () => {
  const { data: featuredProducts, isLoading, error, refetch } = useFeaturedProducts(8);

  const handleRetry = () => {
    refetch();
  };

  return (
    <>
      <SEOHead
        title="FashionHub - Your Style Destination | Latest Fashion Trends"
        description="Discover the latest fashion trends and timeless classics at FashionHub. Shop women's, men's, and accessories with free shipping on orders over $100."
        keywords={['fashion', 'clothing', 'style', 'shopping', 'trends', 'women', 'men', 'accessories']}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                    Fashion
                    <span className="block bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                      Redefined
                    </span>
                  </h1>
                  <p className="text-xl lg:text-2xl text-gray-200 leading-relaxed">
                    Discover the latest trends and timeless classics. Express your unique style with our curated collection.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/products"
                    className="group bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/products?category=women"
                    className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all flex items-center justify-center"
                  >
                    Explore Collections
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <img
                    src="https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Fashion Model 1"
                    className="rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
                    loading="lazy"
                  />
                  <img
                    src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Fashion Model 2"
                    className="rounded-2xl shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500 mt-8"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <Truck className="h-8 w-8 text-green-600 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Shipping</h3>
                <p className="text-gray-600">Free shipping on orders over $100. Fast and reliable delivery worldwide.</p>
              </div>
              
              <div className="text-center group">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payment</h3>
                <p className="text-gray-600">Your payment information is secure with our encrypted checkout process.</p>
              </div>
              
              <div className="text-center group">
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <RotateCcw className="h-8 w-8 text-purple-600 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Returns</h3>
                <p className="text-gray-600">30-day return policy. Not satisfied? Return it hassle-free.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our handpicked selection of trending items and customer favorites
              </p>
            </div>
            
            {error ? (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Service Temporarily Unavailable</h3>
                  <p className="text-red-600 mb-4">
                    We're experiencing technical difficulties. Please try again in a few moments.
                  </p>
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <Skeleton className="w-full h-72" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {featuredProducts && featuredProducts.length > 0 ? (
                  featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">No featured products available at the moment.</p>
                  </div>
                )}
              </div>
            )}
            
            {!error && (
              <div className="text-center">
                <Link
                  to="/products"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-xl text-gray-600">Find exactly what you're looking for</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Link
                to="/products?category=women"
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <img
                  src="https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Women's Fashion"
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Women</h3>
                  <p className="text-gray-200">Elegant & Trendy</p>
                </div>
              </Link>
              
              <Link
                to="/products?category=men"
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <img
                  src="https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Men's Fashion"
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Men</h3>
                  <p className="text-gray-200">Classic & Contemporary</p>
                </div>
              </Link>
              
              <Link
                to="/products?category=accessories"
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <img
                  src="https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Accessories"
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Accessories</h3>
                  <p className="text-gray-200">Complete Your Look</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Recently Viewed */}
        <RecentlyViewed />

        {/* Newsletter Section */}
        <NewsletterSignup />
      </div>
    </>
  );
};