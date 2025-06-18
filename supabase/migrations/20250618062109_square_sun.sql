/*
  # Fashion Store Database Schema - Fixed Migration

  1. New Tables
    - `categories` - Product categories with hierarchical support
    - `products` - Fashion products with full details
    - `users` - Extended user profiles with role management
    - `orders` - Customer orders with status tracking
    - `order_items` - Individual items within orders

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for customer and admin access
    - Public read access for products and categories

  3. Sample Data
    - Insert sample categories (Women, Men, Accessories)
    - Insert sample featured products with realistic fashion items
*/

-- Create categories table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
    CREATE TABLE categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text UNIQUE NOT NULL,
      slug text UNIQUE NOT NULL,
      description text,
      image_url text,
      parent_id uuid REFERENCES categories(id),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Create products table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
    CREATE TABLE products (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      description text,
      price decimal(10,2) NOT NULL CHECK (price >= 0),
      sale_price decimal(10,2) CHECK (sale_price >= 0),
      category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
      images text[] DEFAULT '{}',
      sizes text[] DEFAULT '{}',
      colors text[] DEFAULT '{}',
      stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
      is_featured boolean DEFAULT false,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Add updated_at column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create orders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
    CREATE TABLE orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
      status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
      shipping_address jsonb NOT NULL,
      billing_address jsonb NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Create order_items table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
    CREATE TABLE order_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity integer NOT NULL CHECK (quantity > 0),
      price decimal(10,2) NOT NULL CHECK (price >= 0),
      size text NOT NULL DEFAULT '',
      color text NOT NULL DEFAULT '',
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Create addresses table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'addresses') THEN
    CREATE TABLE addresses (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type text NOT NULL CHECK (type IN ('shipping', 'billing')),
      is_default boolean DEFAULT false,
      street text NOT NULL,
      city text NOT NULL,
      state text NOT NULL,
      postal_code text NOT NULL,
      country text NOT NULL DEFAULT 'US',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Enable Row Level Security on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'addresses') THEN
    ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies to avoid conflicts, then recreate them
DO $$
BEGIN
  -- Categories policies
  DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
  DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
  DROP POLICY IF EXISTS "Categories are manageable by admins" ON categories;
  DROP POLICY IF EXISTS "Only admins can manage categories" ON categories;

  -- Products policies  
  DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
  DROP POLICY IF EXISTS "Anyone can read products" ON products;
  DROP POLICY IF EXISTS "Products are manageable by admins" ON products;
  DROP POLICY IF EXISTS "Only admins can manage products" ON products;

  -- Orders policies
  DROP POLICY IF EXISTS "Users can read own orders" ON orders;
  DROP POLICY IF EXISTS "Users can create own orders" ON orders;
  DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
  DROP POLICY IF EXISTS "Admins can update orders" ON orders;

  -- Order items policies
  DROP POLICY IF EXISTS "Users can read own order items" ON order_items;
  DROP POLICY IF EXISTS "Users can create order items for own orders" ON order_items;
  DROP POLICY IF EXISTS "Admins can read all order items" ON order_items;

  -- Addresses policies
  DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
  DROP POLICY IF EXISTS "Admins can read all addresses" ON addresses;
END $$;

-- Create new policies for categories
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create new policies for products
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create new policies for orders
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create new policies for order_items
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for addresses if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'addresses') THEN
    DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
    DROP POLICY IF EXISTS "Admins can read all addresses" ON addresses;
    
    CREATE POLICY "Users can manage own addresses"
      ON addresses FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Admins can read all addresses"
      ON addresses FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'addresses') THEN
    CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
  END IF;
END $$;

-- Insert sample categories
INSERT INTO categories (name, slug, description, image_url) VALUES
  ('Women', 'women', 'Elegant and trendy styles for women', 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=600'),
  ('Men', 'men', 'Classic and contemporary designs for men', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600'),
  ('Accessories', 'accessories', 'Complete your perfect look with accessories', 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample featured products
DO $$
DECLARE
  women_cat_id uuid;
  men_cat_id uuid;
  accessories_cat_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO women_cat_id FROM categories WHERE slug = 'women';
  SELECT id INTO men_cat_id FROM categories WHERE slug = 'men';
  SELECT id INTO accessories_cat_id FROM categories WHERE slug = 'accessories';

  -- Only insert if we have the categories and no products exist yet
  IF women_cat_id IS NOT NULL AND men_cat_id IS NOT NULL AND accessories_cat_id IS NOT NULL THEN
    -- Check if products already exist
    IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
      -- Insert women's products
      INSERT INTO products (name, description, price, sale_price, category_id, images, sizes, colors, stock_quantity, is_featured) VALUES
        ('Elegant Summer Dress', 'A beautiful flowing summer dress perfect for any occasion. Made with premium cotton blend for comfort and style.', 89.99, 69.99, women_cat_id, 
         ARRAY['https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600'], 
         ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Blue', 'Pink', 'White'], 25, true),
        
        ('Designer Blazer', 'Professional blazer with modern cut and premium fabric. Perfect for office or formal events.', 149.99, 119.99, women_cat_id,
         ARRAY['https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=600'],
         ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Gray'], 15, true),
        
        ('Casual Denim Jacket', 'Classic denim jacket with vintage wash. A timeless piece for your wardrobe.', 79.99, NULL, women_cat_id,
         ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600'],
         ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Light Blue', 'Dark Blue'], 30, true),
        
        ('Silk Evening Gown', 'Luxurious silk evening gown for special occasions. Elegant design with perfect fit.', 299.99, 249.99, women_cat_id,
         ARRAY['https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=600'],
         ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Red', 'Navy'], 8, true);

      -- Insert men's products
      INSERT INTO products (name, description, price, sale_price, category_id, images, sizes, colors, stock_quantity, is_featured) VALUES
        ('Classic Oxford Shirt', 'Premium cotton oxford shirt with perfect fit. Essential for any gentleman''s wardrobe.', 69.99, 54.99, men_cat_id,
         ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600'],
         ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['White', 'Blue', 'Light Blue'], 40, true),
        
        ('Tailored Suit Jacket', 'Modern tailored suit jacket with slim fit. Perfect for business and formal events.', 249.99, 199.99, men_cat_id,
         ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600'],
         ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Black', 'Navy', 'Charcoal'], 20, true),
        
        ('Casual Polo Shirt', 'Comfortable polo shirt made from premium pique cotton. Perfect for casual and smart-casual occasions.', 49.99, NULL, men_cat_id,
         ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600'],
         ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['White', 'Navy', 'Green', 'Red'], 50, true),
        
        ('Premium Leather Jacket', 'Genuine leather jacket with classic biker style. Durable and stylish for years to come.', 399.99, 349.99, men_cat_id,
         ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600'],
         ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Black', 'Brown'], 12, true);

      -- Insert accessories
      INSERT INTO products (name, description, price, sale_price, category_id, images, sizes, colors, stock_quantity, is_featured) VALUES
        ('Designer Handbag', 'Luxury leather handbag with gold hardware. Perfect for everyday use or special occasions.', 199.99, 159.99, accessories_cat_id,
         ARRAY['https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600'],
         ARRAY['One Size'], ARRAY['Black', 'Brown', 'Tan'], 18, true),
        
        ('Classic Watch', 'Elegant timepiece with leather strap. Combines classic design with modern functionality.', 149.99, 119.99, accessories_cat_id,
         ARRAY['https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600'],
         ARRAY['One Size'], ARRAY['Black', 'Brown'], 25, true),
        
        ('Silk Scarf', 'Premium silk scarf with beautiful patterns. Add elegance to any outfit.', 59.99, 44.99, accessories_cat_id,
         ARRAY['https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600'],
         ARRAY['One Size'], ARRAY['Blue', 'Red', 'Green', 'Purple'], 35, true),
        
        ('Leather Belt', 'Genuine leather belt with classic buckle. Essential accessory for any wardrobe.', 39.99, NULL, accessories_cat_id,
         ARRAY['https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600'],
         ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'Brown'], 45, true);
    END IF;
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for users table if updated_at column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON users 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add trigger for addresses table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'addresses') THEN
    DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
    CREATE TRIGGER update_addresses_updated_at 
      BEFORE UPDATE ON addresses 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;