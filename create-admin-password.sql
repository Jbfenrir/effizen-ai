-- Script SQL pour créer un utilisateur admin avec mot de passe
-- À exécuter dans Supabase SQL Editor

-- 1. D'abord, inscrivez manuellement l'utilisateur avec Supabase Auth
-- Email: jbgerberon@gmail.com
-- Mot de passe: admin123

-- 2. Ensuite, créer ou mettre à jour le profil
INSERT INTO public.profiles (id, email, role, team, is_active)
VALUES (
  -- Remplacez cette UUID par l'ID réel de l'utilisateur créé
  'REMPLACER_PAR_UUID_UTILISATEUR',
  'jbgerberon@gmail.com',
  'admin',
  NULL,
  true
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  is_active = true;

-- Alternative: si vous connaissez l'email mais pas l'ID
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'jbgerberon@gmail.com';

-- Commande pour récupérer l'ID utilisateur:
-- SELECT id, email FROM auth.users WHERE email = 'jbgerberon@gmail.com';