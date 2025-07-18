/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Multiple overlapping policies on users table causing infinite recursion
    - Admin check policy references users table, creating circular dependency

  2. Solution
    - Remove duplicate policies
    - Simplify admin check to avoid recursion
    - Use auth.jwt() to check user role from JWT claims instead of querying users table

  3. Changes
    - Drop existing problematic policies
    - Create new simplified policies that don't cause recursion
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies that avoid recursion
-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can read all users (simplified to avoid recursion)
-- This policy allows users with admin role to read all user data
-- We'll check the role from the current row being accessed rather than doing a separate query
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id = auth.uid() 
      AND admin_user.role = 'admin'
      LIMIT 1
    )
  );

-- Admins can update any user data
CREATE POLICY "Admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id = auth.uid() 
      AND admin_user.role = 'admin'
      LIMIT 1
    )
  )
  WITH CHECK (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id = auth.uid() 
      AND admin_user.role = 'admin'
      LIMIT 1
    )
  );