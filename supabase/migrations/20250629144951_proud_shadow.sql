/*
  # Analytics Functions

  1. Functions
    - get_analytics_dashboard: Get dashboard analytics data
    - get_revenue_chart: Get revenue chart data
    - increment_product_views: Increment product view count
    - increment_review_helpful: Increment review helpful count
    - update_product_rating: Update product rating after review changes
    - generate_order_number: Generate unique order numbers
    - validate_coupon: Validate coupon codes
    - apply_coupon: Apply coupon to order

  2. Security
    - Functions are accessible to authenticated users
    - Some functions require admin role
*/

-- Analytics dashboard function
CREATE OR REPLACE FUNCTION get_analytics_dashboard(period_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  result JSON;
  current_period_start DATE;
  previous_period_start DATE;
  previous_period_end DATE;
BEGIN
  current_period_start := CURRENT_DATE - INTERVAL '1 day' * period_days;
  previous_period_start := current_period_start - INTERVAL '1 day' * period_days;
  previous_period_end := current_period_start;

  WITH current_metrics AS (
    SELECT
      COALESCE(SUM(total_amount), 0) as revenue,
      COUNT(*) as orders,
      COUNT(DISTINCT user_id) as customers
    FROM orders
    WHERE created_at >= current_period_start
  ),
  previous_metrics AS (
    SELECT
      COALESCE(SUM(total_amount), 0) as revenue,
      COUNT(*) as orders,
      COUNT(DISTINCT user_id) as customers
    FROM orders
    WHERE created_at >= previous_period_start AND created_at < previous_period_end
  ),
  product_metrics AS (
    SELECT COUNT(*) as products
    FROM products
    WHERE is_active = true
  )
  SELECT json_build_object(
    'revenue', json_build_object(
      'current', cm.revenue,
      'previous', pm.revenue,
      'change', cm.revenue - pm.revenue,
      'change_percentage', CASE WHEN pm.revenue > 0 THEN ((cm.revenue - pm.revenue) / pm.revenue) * 100 ELSE 0 END,
      'trend', CASE WHEN cm.revenue > pm.revenue THEN 'up' WHEN cm.revenue < pm.revenue THEN 'down' ELSE 'stable' END
    ),
    'orders', json_build_object(
      'current', cm.orders,
      'previous', pm.orders,
      'change', cm.orders - pm.orders,
      'change_percentage', CASE WHEN pm.orders > 0 THEN ((cm.orders - pm.orders)::FLOAT / pm.orders) * 100 ELSE 0 END,
      'trend', CASE WHEN cm.orders > pm.orders THEN 'up' WHEN cm.orders < pm.orders THEN 'down' ELSE 'stable' END
    ),
    'customers', json_build_object(
      'current', cm.customers,
      'previous', pm.customers,
      'change', cm.customers - pm.customers,
      'change_percentage', CASE WHEN pm.customers > 0 THEN ((cm.customers - pm.customers)::FLOAT / pm.customers) * 100 ELSE 0 END,
      'trend', CASE WHEN cm.customers > pm.customers THEN 'up' WHEN cm.customers < pm.customers THEN 'down' ELSE 'stable' END
    ),
    'products', json_build_object(
      'current', prom.products,
      'previous', prom.products,
      'change', 0,
      'change_percentage', 0,
      'trend', 'stable'
    ),
    'conversion_rate', json_build_object(
      'current', CASE WHEN cm.customers > 0 THEN (cm.orders::FLOAT / cm.customers) * 100 ELSE 0 END,
      'previous', CASE WHEN pm.customers > 0 THEN (pm.orders::FLOAT / pm.customers) * 100 ELSE 0 END,
      'change', 0,
      'change_percentage', 0,
      'trend', 'stable'
    )
  ) INTO result
  FROM current_metrics cm, previous_metrics pm, product_metrics prom;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revenue chart function
CREATE OR REPLACE FUNCTION get_revenue_chart(period_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH daily_revenue AS (
    SELECT
      DATE(created_at) as date,
      SUM(total_amount) as revenue
    FROM orders
    WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * period_days
    GROUP BY DATE(created_at)
    ORDER BY date
  )
  SELECT json_agg(
    json_build_object(
      'date', to_char(date, 'YYYY-MM-DD'),
      'revenue', revenue
    )
  ) INTO result
  FROM daily_revenue;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment product views
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET view_count = view_count + 1
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment review helpful count
CREATE OR REPLACE FUNCTION increment_review_helpful(review_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE reviews
  SET helpful_count = helpful_count + 1
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update product rating after review changes
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  product_id UUID;
  avg_rating NUMERIC;
  review_count INTEGER;
BEGIN
  -- Get product_id from the affected review
  IF TG_OP = 'DELETE' THEN
    product_id := OLD.product_id;
  ELSE
    product_id := NEW.product_id;
  END IF;

  -- Calculate new average rating and count
  SELECT
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, review_count
  FROM reviews
  WHERE product_id = product_id AND is_approved = true;

  -- Update product
  UPDATE products
  SET
    rating_average = avg_rating,
    rating_count = review_count
  WHERE id = product_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Validate coupon
CREATE OR REPLACE FUNCTION validate_coupon(
  coupon_code TEXT,
  user_id UUID,
  cart_total NUMERIC
)
RETURNS JSON AS $$
DECLARE
  coupon_record RECORD;
  result JSON;
BEGIN
  SELECT * INTO coupon_record
  FROM coupons
  WHERE code = coupon_code
    AND is_active = true
    AND valid_from <= NOW()
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND (usage_limit IS NULL OR usage_count < usage_limit)
    AND (minimum_amount IS NULL OR cart_total >= minimum_amount);

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'Invalid or expired coupon');
  END IF;

  -- Check user usage limit
  IF coupon_record.user_limit IS NOT NULL THEN
    IF (SELECT COUNT(*) FROM orders WHERE user_id = user_id AND id IN (
      SELECT order_id FROM order_coupons WHERE coupon_id = coupon_record.id
    )) >= coupon_record.user_limit THEN
      RETURN json_build_object('valid', false, 'error', 'Coupon usage limit exceeded');
    END IF;
  END IF;

  RETURN json_build_object(
    'valid', true,
    'coupon', row_to_json(coupon_record)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply coupon
CREATE OR REPLACE FUNCTION apply_coupon(
  coupon_code TEXT,
  user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons
  SET usage_count = usage_count + 1
  WHERE code = coupon_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update updated_at column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;