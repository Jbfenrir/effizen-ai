-- =====================================================
-- TRIGGER AUTO-CRÉATION PROFIL
-- =====================================================
-- Ce trigger crée automatiquement un profil dans la table 'profiles'
-- quand un nouvel utilisateur est créé dans auth.users
-- =====================================================

-- 1. Créer la fonction qui sera appelée par le trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer un nouveau profil avec les valeurs par défaut
  INSERT INTO public.profiles (id, email, role, team, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),  -- Prendre le rôle des metadata ou 'employee' par défaut
    (NEW.raw_user_meta_data->>'team')::uuid,                -- Prendre l'équipe des metadata si présente
    true
  )
  ON CONFLICT (id) DO NOTHING;  -- Ne rien faire si le profil existe déjà

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Supprimer le trigger s'il existe déjà (pour pouvoir re-exécuter ce script)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Créer le trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VÉRIFICATION
-- =====================================================
-- Pour vérifier que le trigger fonctionne, tu peux :
-- 1. Créer un nouvel utilisateur via Supabase Auth
-- 2. Vérifier qu'un profil est automatiquement créé dans profiles

-- =====================================================
-- CORRECTION MANUELLE pour erikagerberon@gmail.com
-- =====================================================
-- Créer le profil manquant pour l'utilisateur existant
INSERT INTO public.profiles (id, email, role, team, is_active)
VALUES (
  'fd437374-5043-45d5-abac-c0f596fd66bc',
  'erikagerberon@gmail.com',
  'employee',  -- Modifie selon le rôle souhaité : 'employee', 'manager', 'admin'
  NULL,        -- Modifie avec l'UUID d'une équipe si nécessaire
  true
)
ON CONFLICT (id) DO NOTHING;

-- Vérifier que le profil a été créé
SELECT id, email, role, team, is_active, created_at
FROM public.profiles
WHERE email = 'erikagerberon@gmail.com';

-- =====================================================
-- BONUS : Script pour synchroniser TOUS les users Auth manquants
-- =====================================================
-- Ce script crée les profils pour tous les utilisateurs Auth
-- qui n'ont pas encore de profil dans la table profiles

INSERT INTO public.profiles (id, email, role, team, is_active)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'employee')::varchar(50),
  (au.raw_user_meta_data->>'team')::uuid,
  true
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL  -- Seulement les users qui n'ont pas de profil
ON CONFLICT (id) DO NOTHING;

-- Vérifier le résultat
SELECT
  au.email as auth_email,
  p.email as profile_email,
  p.role,
  p.is_active,
  CASE WHEN p.id IS NULL THEN 'MANQUANT' ELSE 'OK' END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY status DESC, au.created_at DESC;
