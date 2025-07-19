/*
  # Fix Other Table RLS Policies

  This migration ensures other tables have proper RLS policies that don't
  cause recursion issues when joining with the users table.

  ## Changes Made
  1. Fix categories table policies
  2. Fix orders table policies
  3. Fix wishlists table policies
  4. Ensure all policies are simple and non-recursive

  ## Security
  - Maintain proper access control
  - Avoid complex joins in RLS policies
  - Use simple user ID checks where possible
*/

-- Categories table - public read access
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
CREATE POLICY "Public can read active categories"
  ON categories
  FOR SELECT
  TO public
  USING (is_active = true);

-- Orders table - users can only see their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;

CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Wishlists table - users can only manage their own wishlist
DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlists;

CREATE POLICY "Users can read own wishlist"
  ON wishlists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own wishlist items"
  ON wishlists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items"
  ON wishlists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Order items table - access through orders
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;

CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Service role policies for all tables
CREATE POLICY "Service role can manage categories"
  ON categories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage orders"
  ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage order items"
  ON order_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage wishlists"
  ON wishlists
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);