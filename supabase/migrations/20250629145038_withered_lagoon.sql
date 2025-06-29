/*
  # Sample Data for FashionHub

  1. Sample Data
    - Categories
    - Brands
    - Products
    - Users (admin and customer)
    - Sample orders

  2. Security
    - Data is inserted with proper relationships
    - Admin user is created for testing
*/

-- Insert sample categories
INSERT INTO categories (name, slug, description, is_active, sort_order) VALUES
('Women', 'women', 'Women''s fashion and accessories', true, 1),
('Men', 'men', 'Men''s fashion and accessories', true, 2),
('Accessories', 'accessories', 'Fashion accessories for all', true, 3),
('Shoes', 'shoes', 'Footwear for every occasion', true, 4),
('Bags', 'bags', 'Handbags, backpacks, and more', true, 5);

-- Insert sample brands
INSERT INTO brands (name, slug, description, is_active) VALUES
('FashionForward', 'fashion-forward', 'Contemporary fashion brand', true),
('ClassicStyle', 'classic-style', 'Timeless fashion pieces', true),
('UrbanTrend', 'urban-trend', 'Street style and urban fashion', true),
('ElegantWear', 'elegant-wear', 'Sophisticated and elegant clothing', true),
('CasualComfort', 'casual-comfort', 'Comfortable everyday wear', true);

-- Insert sample products
WITH category_ids AS (
  SELECT id, slug FROM categories
),
brand_ids AS (
  SELECT id, slug FROM brands
)
INSERT INTO products (
  name, 
  description, 
  short_description,
  price, 
  sale_price,
  category_id, 
  brand_id,
  stock_quantity,
  is_featured,
  is_active,
  tags,
  meta_title,
  meta_description
)
SELECT 
  product_data.name,
  product_data.description,
  product_data.short_description,
  product_data.price,
  product_data.sale_price,
  c.id,
  b.id,
  product_data.stock_quantity,
  product_data.is_featured,
  true,
  product_data.tags,
  product_data.meta_title,
  product_data.meta_description
FROM (
  VALUES
  ('Elegant Summer Dress', 'A beautiful flowing summer dress perfect for any occasion. Made from lightweight, breathable fabric.', 'Beautiful flowing summer dress', 89.99, 69.99, 'women', 'elegant-wear', 25, true, ARRAY['dress', 'summer', 'elegant'], 'Elegant Summer Dress - FashionHub', 'Shop our elegant summer dress collection'),
  ('Classic White Shirt', 'Timeless white button-down shirt that works for both casual and formal occasions.', 'Timeless white button-down shirt', 49.99, NULL, 'women', 'classic-style', 40, true, ARRAY['shirt', 'classic', 'white'], 'Classic White Shirt - FashionHub', 'Classic white shirts for women'),
  ('Denim Jacket', 'Vintage-style denim jacket with a modern fit. Perfect for layering.', 'Vintage-style denim jacket', 79.99, 59.99, 'women', 'urban-trend', 30, false, ARRAY['jacket', 'denim', 'vintage'], 'Denim Jacket - FashionHub', 'Stylish denim jackets for women'),
  ('Men''s Polo Shirt', 'Comfortable cotton polo shirt available in multiple colors.', 'Comfortable cotton polo shirt', 39.99, NULL, 'men', 'casual-comfort', 50, true, ARRAY['polo', 'cotton', 'casual'], 'Men''s Polo Shirt - FashionHub', 'Comfortable polo shirts for men'),
  ('Formal Blazer', 'Sharp, tailored blazer perfect for business meetings and formal events.', 'Sharp, tailored blazer', 149.99, 119.99, 'men', 'elegant-wear', 20, false, ARRAY['blazer', 'formal', 'business'], 'Formal Blazer - FashionHub', 'Professional blazers for men'),
  ('Leather Handbag', 'Premium leather handbag with multiple compartments and elegant design.', 'Premium leather handbag', 199.99, NULL, 'accessories', 'fashion-forward', 15, true, ARRAY['handbag', 'leather', 'premium'], 'Leather Handbag - FashionHub', 'Luxury leather handbags'),
  ('Running Shoes', 'High-performance running shoes with advanced cushioning technology.', 'High-performance running shoes', 129.99, 99.99, 'shoes', 'urban-trend', 35, false, ARRAY['shoes', 'running', 'sports'], 'Running Shoes - FashionHub', 'Professional running shoes'),
  ('Silk Scarf', 'Luxurious silk scarf with beautiful patterns. Perfect accessory for any outfit.', 'Luxurious silk scarf', 59.99, 44.99, 'accessories', 'elegant-wear', 25, false, ARRAY['scarf', 'silk', 'luxury'], 'Silk Scarf - FashionHub', 'Elegant silk scarves')
) AS product_data(name, description, short_description, price, sale_price, category_slug, brand_slug, stock_quantity, is_featured, tags, meta_title, meta_description)
JOIN category_ids c ON c.slug = product_data.category_slug
JOIN brand_ids b ON b.slug = product_data.brand_slug;

-- Insert sample product images
INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary)
SELECT 
  p.id,
  'https://images.pexels.com/photos/' || (1000000 + (ROW_NUMBER() OVER ()))::text || '/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=400',
  p.name || ' - Image ' || generate_series,
  generate_series - 1,
  generate_series = 1
FROM products p
CROSS JOIN generate_series(1, 3);

-- Create admin user (password: admin123)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'admin@fashionhub.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User"}',
  false,
  'authenticated'
);

-- Insert admin user into users table
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  email_verified
)
SELECT 
  id,
  email,
  'Admin User',
  'admin',
  true
FROM auth.users 
WHERE email = 'admin@fashionhub.com';

-- Create sample customer user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'customer@example.com',
  crypt('customer123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "John Customer"}',
  false,
  'authenticated'
);

-- Insert customer user into users table
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  email_verified
)
SELECT 
  id,
  email,
  'John Customer',
  'customer',
  true
FROM auth.users 
WHERE email = 'customer@example.com';

-- Insert sample coupons
INSERT INTO coupons (
  code,
  type,
  value,
  minimum_amount,
  usage_limit,
  valid_from,
  valid_until,
  is_active
) VALUES
('WELCOME10', 'percentage', 10, 50, 100, NOW(), NOW() + INTERVAL '30 days', true),
('FREESHIP', 'free_shipping', 0, 75, NULL, NOW(), NOW() + INTERVAL '60 days', true),
('SAVE20', 'fixed_amount', 20, 100, 50, NOW(), NOW() + INTERVAL '14 days', true);