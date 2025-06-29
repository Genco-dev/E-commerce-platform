import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { ShoppingBag, ArrowLeft, CheckCircle } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';

interface ForgotPasswordForm {
  email: string;
}

export const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors }, setError } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setIsSuccess(true);
    } catch (error: any) {
      setError('root', { message: error.message || 'Failed to send reset email' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <>
        <SEOHead title="Password Reset Email Sent - FashionHub" />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
                <ShoppingBag className="h-10 w-10 text-indigo-600" />
                <span className="text-2xl font-bold text-gray-900">FashionHub</span>
              </Link>
              <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-8">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Forgot Password - FashionHub" />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
              <ShoppingBag className="h-10 w-10 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">FashionHub</span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
            <p className="text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {errors.root.message}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};