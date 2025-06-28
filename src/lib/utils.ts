import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

export function calculateDiscount(originalPrice: number, salePrice: number): number {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateSKU(productName: string, variant?: string): string {
  const base = productName
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 6)
    .toUpperCase();
  
  const variantCode = variant
    ? variant.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase()
    : '';
  
  const random = Math.random().toString(36).substr(2, 3).toUpperCase();
  
  return `${base}${variantCode}${random}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function getImageUrl(path: string, size?: 'thumb' | 'medium' | 'large'): string {
  if (!path) return '/placeholder-image.jpg';
  
  if (path.startsWith('http')) return path;
  
  const sizeParam = size ? `?size=${size}` : '';
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images/${path}${sizeParam}`;
}

export function generateColorVariants(baseColor: string): string[] {
  // This would typically integrate with a color palette service
  const variants = {
    red: ['#FF0000', '#DC143C', '#B22222', '#8B0000'],
    blue: ['#0000FF', '#4169E1', '#1E90FF', '#0066CC'],
    green: ['#008000', '#32CD32', '#228B22', '#006400'],
    black: ['#000000', '#2F2F2F', '#1C1C1C', '#0A0A0A'],
    white: ['#FFFFFF', '#F8F8FF', '#F5F5F5', '#E6E6FA'],
  };
  
  return variants[baseColor.toLowerCase() as keyof typeof variants] || [baseColor];
}

export function calculateShipping(weight: number, distance: number, method: string): number {
  // Simplified shipping calculation
  const baseRates = {
    standard: 5.99,
    express: 12.99,
    overnight: 24.99,
  };
  
  const baseRate = baseRates[method as keyof typeof baseRates] || baseRates.standard;
  const weightMultiplier = Math.max(1, Math.ceil(weight / 1000)); // per kg
  const distanceMultiplier = distance > 500 ? 1.5 : 1;
  
  return baseRate * weightMultiplier * distanceMultiplier;
}

export function calculateTax(amount: number, taxRate: number, location: string): number {
  // Simplified tax calculation - in production, integrate with tax service
  const stateTaxRates: Record<string, number> = {
    CA: 0.0875, // California
    NY: 0.08,   // New York
    TX: 0.0625, // Texas
    FL: 0.06,   // Florida
  };
  
  const rate = stateTaxRates[location] || taxRate;
  return amount * rate;
}

export function generateMetaDescription(product: any): string {
  const { name, description, price, sale_price } = product;
  const priceText = sale_price ? `Sale $${sale_price}` : `$${price}`;
  const desc = description ? description.substring(0, 100) : '';
  
  return `${name} - ${priceText}. ${desc}... Shop now with free shipping!`;
}

export function optimizeImageUrl(url: string, width?: number, height?: number, quality = 80): string {
  if (!url || url.startsWith('data:')) return url;
  
  // For production, integrate with image optimization service like Cloudinary
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  params.set('f', 'auto');
  
  return `${url}?${params.toString()}`;
}

export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  // Integration with analytics services (Google Analytics, Mixpanel, etc.)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
  
  // Also send to custom analytics endpoint
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: eventName, properties }),
  }).catch(console.error);
}

export function shareProduct(product: any, method: 'facebook' | 'twitter' | 'pinterest' | 'email'): void {
  const url = `${window.location.origin}/product/${product.id}`;
  const title = product.name;
  const description = product.description || '';
  const image = product.images?.[0]?.url || '';
  
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(description)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this product: ${url}`)}`
  };
  
  if (method === 'email') {
    window.location.href = shareUrls[method];
  } else {
    window.open(shareUrls[method], '_blank', 'width=600,height=400');
  }
  
  trackEvent('product_shared', { product_id: product.id, method });
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  
  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  return Promise.resolve();
}