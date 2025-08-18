-- Script CORRIGÉ pour configurer la base de données avec votre VRAI utilisateur
-- À exécuter dans Supabase SQL Editor

-- ========================================
-- ÉTAPE 1 : TROUVER VOTRE VRAI ID UTILISATEUR
-- ========================================

-- D'abord, trouvons l'ID de votre utilisateur
DO $$
DECLARE
  real_user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur jbgerberon@gmail.com
  SELECT id INTO real_user_id 
  FROM auth.users 
  WHERE email = 'jbgerberon@gmail.com'
  LIMIT 1;
  
  IF real_user_id IS NULL THEN
    RAISE NOTICE '⚠️ ATTENTION: Aucun utilisateur trouvé avec l''email jbgerberon@gmail.com';
    RAISE NOTICE '👉 Vous devez d''abord créer un compte dans Authentication > Users';
    RAISE NOTICE '👉 Ou utiliser un autre email existant';
  ELSE
    RAISE NOTICE '✅ Utilisateur trouvé avec ID: %', real_user_id;
    RAISE NOTICE 'Copier cet ID, on va l''utiliser pour la suite';
  END IF;
END $$;

-- Afficher tous les utilisateurs existants pour vérification
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- ========================================
-- STOP! LISEZ CECI AVANT DE CONTINUER
-- ========================================
-- 1. Notez l'ID de votre utilisateur affiché ci-dessus
-- 2. Si aucun utilisateur n'existe, créez-en un d'abord dans:
--    Supabase Dashboard > Authentication > Users > Invite User
-- 3. Une fois que vous avez l'ID, continuez avec le script ci-dessous
-- ========================================