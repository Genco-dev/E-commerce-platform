-- Allow newly registered users to insert their own profile row
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Also allow anon to insert (for during signup flow before session is established)
CREATE POLICY "Anon can insert own profile"
  ON public.users
  FOR INSERT
  TO anon
  WITH CHECK (id = auth.uid());
