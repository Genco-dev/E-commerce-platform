/*
  # Fix Products Table RLS Policies

  This migration ensures products table policies don't cause recursion issues
  when joining with users table for reviews and other user-related data.

  ## Changes Made
  1. Review and fix products table RLS policies
  2. Ensure reviews policies don't cause recursion
  3. Allow public read access to products and reviews

  ## Security
  - Public can read all active products
  - Public can read approved reviews
  - Only authenticated users can create reviews
  - Users can only update/delete their own reviews
*/

-- Drop existing policies that might cause issues
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON products;

-- Create simple policy for products (public read access)
CREATE POLICY "Public can read active products"
  ON products
  FOR SELECT
  TO public
  USING (is_active = true);

-- Allow service role full access to products
CREATE POLICY "Service role can manage products"
  ON products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix reviews policies to avoid recursion
DROP POLICY IF EXISTS "Enable read access for all users" ON reviews;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON reviews;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON reviews;

-- Create simple policies for reviews
CREATE POLICY "Public can read approved reviews"
  ON reviews
  FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY "Users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow service role full access to reviews
CREATE POLICY "Service role can manage reviews"
  ON reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);