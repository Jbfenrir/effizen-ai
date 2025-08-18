-- ========================================
-- PARTIE 2 : CONFIGURATION AVEC VOTRE ID
-- ========================================
-- IMPORTANT: Remplacez 'VOTRE-ID-ICI' par l'ID trouvé dans la partie 1

-- Variable pour stocker votre ID (MODIFIEZ CETTE LIGNE!)
DO $$
DECLARE
  admin_user_id UUID := 'VOTRE-ID-ICI'::UUID; -- <-- REMPLACEZ PAR VOTRE VRAI ID
BEGIN
  -- Vérifier que l'ID a été modifié
  IF admin_user_id = 'VOTRE-ID-ICI'::UUID THEN
    RAISE EXCEPTION 'ERREUR: Vous devez remplacer VOTRE-ID-ICI par votre vrai ID utilisateur!';
  END IF;
  
  RAISE NOTICE 'Configuration pour l''utilisateur ID: %', admin_user_id;
END $$;

-- ========================================
-- CRÉATION DES TABLES
-- ========================================

-- 1. Créer la table teams
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer la table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) CHECK (role IN ('employee', 'manager', 'admin')) DEFAULT 'employee',
  team UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table daily_entries
CREATE TABLE IF NOT EXISTS public.daily_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  sleep JSONB,
  focus JSONB,
  tasks JSONB,
  wellbeing JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

-- 4. Créer la table team_stats
CREATE TABLE IF NOT EXISTS public.team_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  avg_sleep_quality DECIMAL(3,2),
  avg_focus_level DECIMAL(3,2),
  avg_task_completion DECIMAL(3,2),
  avg_wellbeing_score DECIMAL(3,2),
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team, date)
);

-- ========================================
-- INSERTION DES DONNÉES
-- ========================================

-- Créer une équipe par défaut
INSERT INTO public.teams (id, name, description, is_active)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Équipe Principale',
  'Équipe par défaut pour tous les employés',
  true
)
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- CRÉER LE PROFIL ADMIN AVEC VOTRE VRAI ID
-- ========================================
-- IMPORTANT: Cette partie utilise une fonction pour créer le profil avec l'ID dynamique

CREATE OR REPLACE FUNCTION create_admin_profile(user_id UUID)
RETURNS void AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Récupérer l'email de l'utilisateur
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'Utilisateur avec ID % non trouvé', user_id;
  END IF;
  
  -- Créer ou mettre à jour le profil
  INSERT INTO public.profiles (id, email, role, team, is_active)
  VALUES (
    user_id,
    user_email,
    'admin',
    '11111111-1111-1111-1111-111111111111',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'admin',
    team = '11111111-1111-1111-1111-111111111111',
    is_active = true,
    updated_at = NOW();
    
  RAISE NOTICE '✅ Profil admin créé/mis à jour pour %', user_email;
END;
$$ LANGUAGE plpgsql;

-- Appeler la fonction avec votre ID (MODIFIEZ CETTE LIGNE!)
SELECT create_admin_profile('VOTRE-ID-ICI'::UUID); -- <-- REMPLACEZ PAR VOTRE VRAI ID

-- ========================================
-- CONFIGURATION RLS SIMPLIFIÉE
-- ========================================

-- Désactiver RLS temporairement
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_stats DISABLE ROW LEVEL SECURITY;

-- Pour l'instant, on laisse RLS désactivé pour éviter les problèmes
-- On le réactivera plus tard une fois que tout fonctionne

RAISE NOTICE '⚠️ RLS désactivé temporairement pour éviter les problèmes';
RAISE NOTICE '✅ Vous pouvez maintenant vous connecter et utiliser l''application';

-- ========================================
-- CRÉER DES DONNÉES DE TEST
-- ========================================

-- Fonction pour créer des données de test
CREATE OR REPLACE FUNCTION create_test_data(user_id UUID)
RETURNS void AS $$
DECLARE
  entry_date DATE;
BEGIN
  -- Créer des entrées pour juillet 2025
  FOR entry_date IN SELECT generate_series('2025-07-11'::date, '2025-07-15'::date, '1 day'::interval)::date
  LOOP
    INSERT INTO public.daily_entries (user_id, entry_date, sleep, focus, tasks, wellbeing)
    VALUES (
      user_id,
      entry_date,
      '{"quality": 4, "duration": 7.5, "notes": "Bonne nuit de sommeil"}'::jsonb,
      '{"morning": 4, "afternoon": 3, "blockers": [], "notes": "Concentration correcte"}'::jsonb,
      '{"completed": 8, "planned": 10, "priorities": ["Réunion équipe", "Rapport mensuel"], "notes": "Journée productive"}'::jsonb,
      '{"stress": 2, "energy": 4, "mood": 4, "notes": "Journée agréable"}'::jsonb
    )
    ON CONFLICT (user_id, entry_date) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE '✅ Données de test créées pour juillet 2025';
END;
$$ LANGUAGE plpgsql;

-- Créer les données de test (MODIFIEZ CETTE LIGNE!)
SELECT create_test_data('VOTRE-ID-ICI'::UUID); -- <-- REMPLACEZ PAR VOTRE VRAI ID

-- ========================================
-- VÉRIFICATION FINALE
-- ========================================

DO $$
DECLARE
  profile_count INTEGER;
  team_count INTEGER;
  entry_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  SELECT COUNT(*) INTO team_count FROM public.teams;
  SELECT COUNT(*) INTO entry_count FROM public.daily_entries;
  
  RAISE NOTICE '';
  RAISE NOTICE '=================================';
  RAISE NOTICE '✅ CONFIGURATION TERMINÉE';
  RAISE NOTICE '=================================';
  RAISE NOTICE '  Profils: % créé(s)', profile_count;
  RAISE NOTICE '  Équipes: % créée(s)', team_count;
  RAISE NOTICE '  Entrées: % créée(s)', entry_count;
  RAISE NOTICE '';
  RAISE NOTICE '👉 Vous pouvez maintenant vous connecter à l''application';
  RAISE NOTICE '=================================';
END $$;