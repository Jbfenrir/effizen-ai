-- Script pour corriger les politiques RLS de la table profiles
-- À exécuter dans Supabase SQL Editor

-- 1. Activer RLS sur la table profiles (si pas déjà fait)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can do everything" ON public.profiles;

-- 3. Créer une politique permissive pour la lecture
-- Permet à tous les utilisateurs authentifiés de lire leur propre profil
CREATE POLICY "Enable read access for users to their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 4. Créer une politique pour permettre l'insertion de son propre profil
CREATE POLICY "Enable insert for users based on user_id"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 5. Créer une politique pour permettre la mise à jour de son propre profil
CREATE POLICY "Enable update for users based on user_id"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Créer une politique pour les admins (lecture de tous les profils)
CREATE POLICY "Enable read access for admins to all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 7. Créer une politique pour les admins (modification de tous les profils)
CREATE POLICY "Enable all access for admins"
ON public.profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 8. Vérifier si le profil admin existe, sinon le créer
DO $$
BEGIN
  -- Vérifier si le profil existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = '8ac44380-8445-49a8-b4a9-16f602d0e7d4'
  ) THEN
    -- Créer le profil admin
    INSERT INTO public.profiles (id, email, role, is_active, created_at, updated_at)
    VALUES (
      '8ac44380-8445-49a8-b4a9-16f602d0e7d4',
      'jbgerberon@gmail.com',
      'admin',
      true,
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Profil admin créé avec succès';
  ELSE
    -- Mettre à jour le profil existant pour s'assurer qu'il est admin
    UPDATE public.profiles 
    SET role = 'admin', 
        is_active = true,
        updated_at = NOW()
    WHERE id = '8ac44380-8445-49a8-b4a9-16f602d0e7d4';
    RAISE NOTICE 'Profil admin mis à jour';
  END IF;
END $$;

-- 9. Vérifier les politiques créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;