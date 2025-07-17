/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Infinite recursion detected in policy for relation "users"
    - This prevents fetching products and user data
    - Likely caused by circular references in RLS policies

  2. Solution
    - Drop existing problematic policies on users table
    - Create simple, non-recursive policies
    - Allow users to read their own data
    - Allow admins to read all user data
    - Prevent recursive policy conditions

  3. Security
    - Users can only read their own profile data
    - Users can only update their own profile data
    - Admins can read all user data
    - Only authenticated users can access user data
*/

-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admin users can read all profiles" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Ensure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for users table
-- Policy 1: Users can read their own data using auth.uid()
CREATE POLICY "users_select_own" 
  ON users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Policy 2: Users can update their own data using auth.uid()
CREATE POLICY "users_update_own" 
  ON users 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Policy 3: Users can insert their own data during registration
CREATE POLICY "users_insert_own" 
  ON users 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Policy 4: Allow service role to access all user data (for admin operations)
CREATE POLICY "users_service_role_access" 
  ON users 
  FOR ALL 
  TO service_role 
  USING (true);