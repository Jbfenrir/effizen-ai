-- Script CORRIGÉ pour les politiques RLS de la table profiles
-- Le problème était une récursion infinie dans la politique admin
-- À exécuter dans Supabase SQL Editor

-- 1. D'abord, désactiver temporairement RLS pour corriger les politiques
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can do everything" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for users to their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for admins to all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable all access for admins" ON public.profiles;

-- 3. S'assurer que le profil admin existe AVANT de créer les politiques
INSERT INTO public.profiles (id, email, role, is_active, created_at, updated_at)
VALUES (
  '8ac44380-8445-49a8-b4a9-16f602d0e7d4',
  'jbgerberon@gmail.com',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  is_active = true,
  updated_at = NOW();

-- 4. Réactiver RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Créer des politiques SIMPLES sans récursion

-- Politique pour que chaque utilisateur puisse lire son propre profil
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Politique pour que chaque utilisateur puisse créer son propre profil
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Politique pour que chaque utilisateur puisse modifier son propre profil
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Politique spéciale pour l'admin (basée sur l'ID utilisateur, pas sur le rôle pour éviter la récursion)
-- On utilise directement l'ID de l'admin connu
CREATE POLICY "Admin can read all profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() = '8ac44380-8445-49a8-b4a9-16f602d0e7d4'::uuid
);

-- Politique pour que l'admin puisse modifier tous les profils
CREATE POLICY "Admin can modify all profiles"
ON public.profiles FOR ALL
USING (
  auth.uid() = '8ac44380-8445-49a8-b4a9-16f602d0e7d4'::uuid
);

-- 6. Créer une fonction helper pour vérifier le rôle admin sans récursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- Vérifier directement avec l'ID connu de l'admin
  RETURN auth.uid() = '8ac44380-8445-49a8-b4a9-16f602d0e7d4'::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Alternative: Si vous voulez une approche plus flexible avec plusieurs admins
-- Créer une table séparée pour les admins
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter l'admin principal
INSERT INTO public.admin_users (user_id) 
VALUES ('8ac44380-8445-49a8-b4a9-16f602d0e7d4')
ON CONFLICT DO NOTHING;

-- 8. Vérifier que tout fonctionne
DO $$
DECLARE
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  RAISE NOTICE 'Nombre de profils dans la base: %', profile_count;
  
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = '8ac44380-8445-49a8-b4a9-16f602d0e7d4' 
    AND role = 'admin'
  ) THEN
    RAISE NOTICE '✅ Profil admin trouvé et configuré correctement';
  ELSE
    RAISE WARNING '⚠️ Profil admin non trouvé ou mal configuré';
  END IF;
END $$;

-- 9. Afficher les politiques créées
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd, 
  qual::text as "condition",
  with_check::text as "with_check_condition"
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;