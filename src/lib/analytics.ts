// Analytics tracking utilities
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

class Analytics {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
  }

  track(event: string, properties?: Record<string, any>, userId?: string) {
    if (!this.isEnabled) return;

    const eventData: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      userId,
    };

    // Send to analytics service
    this.sendEvent(eventData);
  }

  page(name: string, properties?: Record<string, any>) {
    this.track('page_view', {
      page_name: name,
      ...properties,
    });
  }

  identify(userId: string, traits?: Record<string, any>) {
    if (!this.isEnabled) return;

    this.track('identify', {
      user_id: userId,
      traits,
    });
  }

  ecommerce = {
    viewProduct: (product: any) => {
      this.track('product_viewed', {
        product_id: product.id,
        product_name: product.name,
        product_category: product.category?.name,
        product_price: product.price,
      });
    },

    addToCart: (product: any, quantity: number) => {
      this.track('product_added_to_cart', {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity,
        value: product.price * quantity,
      });
    },

    removeFromCart: (product: any, quantity: number) => {
      this.track('product_removed_from_cart', {
        product_id: product.id,
        product_name: product.name,
        quantity,
      });
    },

    beginCheckout: (cartItems: any[], total: number) => {
      this.track('checkout_started', {
        value: total,
        currency: 'USD',
        items: cartItems.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });
    },

    purchase: (order: any) => {
      this.track('purchase', {
        order_id: order.id,
        value: order.total_amount,
        currency: 'USD',
        items: order.items?.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    },

    search: (query: string, results: number) => {
      this.track('search', {
        search_term: query,
        results_count: results,
      });
    },
  };

  private async sendEvent(eventData: AnalyticsEvent) {
    try {
      // Send to Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventData.event, eventData.properties);
      }

      // Send to custom analytics endpoint
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }
}

export const analytics = new Analytics();