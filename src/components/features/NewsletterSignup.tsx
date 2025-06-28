import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Mail, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface NewsletterFormData {
  email: string;
  preferences?: string[];
}

export const NewsletterSignup: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<NewsletterFormData>();

  const onSubmit = async (data: NewsletterFormData) => {
    try {
      // In production, integrate with email service (Mailchimp, SendGrid, etc.)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setIsSubscribed(true);
      reset();
      toast.success('Successfully subscribed to newsletter!');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    }
  };

  if (isSubscribed) {
    return (
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <CheckCircle className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Thank You!</h2>
          <p className="text-xl text-indigo-100">
            You've successfully subscribed to our newsletter. Get ready for exclusive offers and style tips!
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Mail className="h-16 w-16 text-white mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">Stay in Style</h2>
        <p className="text-xl text-indigo-100 mb-8">
          Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and fashion tips.
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                placeholder="Enter your email"
                className="w-full px-6 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-200">{errors.email.message}</p>
              )}
            </div>
            <Button
              type="submit"
              variant="secondary"
              className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold"
            >
              Subscribe
            </Button>
          </div>
        </form>
        
        <p className="text-sm text-indigo-200 mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
};