-- Script rapide pour créer l'utilisateur admin
-- À exécuter dans Supabase SQL Editor

-- 1. Créer l'utilisateur directement dans auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'jbgerberon@gmail.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '',
  NOW(),
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  0,
  NULL,
  '',
  NULL
)
ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('admin123', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW();

-- 2. Créer le profil admin
INSERT INTO public.profiles (id, email, role, team, is_active)
SELECT id, email, 'admin', NULL, true
FROM auth.users
WHERE email = 'jbgerberon@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  is_active = true;