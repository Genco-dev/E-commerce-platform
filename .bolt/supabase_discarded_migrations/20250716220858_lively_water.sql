/*
  # Fix Users Table RLS Policies

  This migration fixes the infinite recursion issue in the users table RLS policies
  by replacing complex policies with simple, non-recursive ones.

  ## Changes Made
  1. Drop existing problematic RLS policies on users table
  2. Create simple, non-recursive policies for users table
  3. Ensure proper access control without circular dependencies

  ## Security
  - Users can read their own profile data
  - Users can insert their own profile during registration
  - Users can update their own profile data
  - No delete policy (users should be deactivated, not deleted)
*/

-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;

-- Create simple, non-recursive RLS policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role to read all users (for admin functions)
CREATE POLICY "Service role can read all users"
  ON users
  FOR SELECT
  TO service_role
  USING (true);

-- Allow service role to insert users (for triggers)
CREATE POLICY "Service role can insert users"
  ON users
  FOR INSERT
  TO service_role
  WITH CHECK (true);