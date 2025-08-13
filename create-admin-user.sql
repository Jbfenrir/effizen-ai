-- Script pour créer le premier utilisateur administrateur
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Insérer l'utilisateur dans auth.users (simulé via l'interface Supabase)
-- Note: Vous devez d'abord vous inscrire via l'interface Supabase Authentication
-- avec l'email jbgerberon@gmail.com

-- 2. Ensuite, exécuter ce script pour créer le profil admin
INSERT INTO profiles (id, email, role, team, is_active, created_at, updated_at)
VALUES (
  -- Remplacez 'USER_ID_FROM_AUTH' par l'ID réel de l'utilisateur créé dans auth.users
  'USER_ID_FROM_AUTH',
  'jbgerberon@gmail.com',
  'admin',
  NULL,  -- Les admins n'appartiennent pas à une équipe spécifique
  true,
  now(),
  now()
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  is_active = true,
  updated_at = now();

-- 3. Vérifier que l'utilisateur a été créé
SELECT * FROM profiles WHERE email = 'jbgerberon@gmail.com';