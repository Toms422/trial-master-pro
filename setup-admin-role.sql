-- This script sets up the admin user role
-- You need to first create admin@test.com in Supabase Auth console
-- Then replace 'REPLACE_WITH_ADMIN_USER_ID' with the actual user ID from auth.users

-- First, find the admin user ID by running this query:
-- SELECT id, email FROM auth.users WHERE email = 'admin@test.com';

-- Once you have the ID, run this command with the actual ID:
INSERT INTO public.user_roles (user_id, role)
VALUES ('REPLACE_WITH_ADMIN_USER_ID', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Alternative: If you want to grant multiple users roles, you can do:
-- INSERT INTO public.user_roles (user_id, role) VALUES
-- ('user-id-1', 'admin'),
-- ('user-id-2', 'operator');
