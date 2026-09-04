// Stripe integration utilities
export const loadStripe = async () => {
  if (typeof window === 'undefined') return null;
  
  const { loadStripe } = await import('@stripe/stripe-js');
  return loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');
};

export const createPaymentIntent = async (amount: number, currency = 'usd') => {
  // This would typically call your backend API
  // For now, we'll simulate the response
  return {
    client_secret: 'pi_test_client_secret',
    amount,
    currency,
  };
};

export const confirmPayment = async (clientSecret: string, paymentMethod: any) => {
  const stripe = await loadStripe();
  if (!stripe) throw new Error('Stripe not loaded');

  return stripe.confirmCardPayment(clientSecret, {
    payment_method: paymentMethod,
  });
};