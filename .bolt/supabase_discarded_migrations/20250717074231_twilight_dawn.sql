/*
  # Fix Users Table RLS Policies

  This migration fixes the infinite recursion error in the users table RLS policies
  by removing problematic policies and creating proper ones that don't cause recursion.

  ## Changes Made
  1. Drop all existing policies on users table to eliminate recursion
  2. Create new, safe policies that use auth.uid() directly
  3. Ensure policies don't query the users table within their conditions

  ## Security
  - Users can read their own profile data
  - Users can update their own profile data
  - Service role can perform all operations (for admin functions)
*/

-- Drop all existing policies on users table to eliminate recursion
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Ensure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create safe policies that don't cause recursion
-- Policy for users to read their own data
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy for inserting new user records (needed for registration)
CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy for service role to perform all operations (for admin functions)
CREATE POLICY "service_role_all" ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);