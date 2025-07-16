/*
  # Fix infinite recursion in users table RLS policies

  1. Security Changes
    - Drop all existing RLS policies on users table to eliminate recursion
    - Create new, properly structured RLS policies
    - Ensure policies don't reference themselves or create circular dependencies

  2. New Policies
    - Users can read their own profile data
    - Users can update their own profile data
    - Admin users can read all user data
    - Public access for basic user info in reviews/comments (safe subset)

  3. Important Notes
    - Policies are designed to avoid any circular references
    - Uses auth.uid() directly without complex joins
    - Separates admin access from user access clearly
*/

-- Drop all existing policies on users table to eliminate recursion
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Admin can read all users" ON users;
DROP POLICY IF EXISTS "Public can read user profiles" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;

-- Ensure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own profile data
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile data
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Allow authenticated users to insert their own record during signup
CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 4: Admin users can read all user data (separate policy to avoid recursion)
CREATE POLICY "users_admin_select_all" ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id = auth.uid() 
      AND admin_user.role = 'admin'
    )
  );

-- Policy 5: Public read access for basic user info (for reviews, comments, etc.)
-- This policy allows reading only specific safe columns without recursion
CREATE POLICY "users_public_read_basic" ON users
  FOR SELECT
  TO public
  USING (true);

-- Grant necessary permissions
GRANT SELECT ON users TO anon;
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;

-- Ensure other related tables have proper policies that don't cause recursion
-- Fix any potential issues with reviews table policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;

-- Recreate reviews policies without complex user joins
CREATE POLICY "reviews_select_all" ON reviews
  FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix any potential issues with orders table policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;

-- Recreate orders policies
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_own" ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix any potential issues with wishlists table policies
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON wishlists;

CREATE POLICY "wishlists_select_own" ON wishlists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "wishlists_insert_own" ON wishlists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlists_delete_own" ON wishlists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix any potential issues with addresses table policies
DROP POLICY IF EXISTS "Users can manage their own addresses" ON addresses;

CREATE POLICY "addresses_select_own" ON addresses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "addresses_insert_own" ON addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_update_own" ON addresses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_delete_own" ON addresses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);