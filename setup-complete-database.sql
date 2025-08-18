-- Script COMPLET pour configurer la base de données EffiZen-AI
-- À exécuter dans Supabase SQL Editor

-- ========================================
-- PARTIE 1 : CRÉATION DES TABLES
-- ========================================

-- 1. Créer la table teams si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer la table profiles si elle n'existe pas (avec la colonne team)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) CHECK (role IN ('employee', 'manager', 'admin')) DEFAULT 'employee',
  team UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table daily_entries si elle n'existe pas
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

-- 4. Créer la table team_stats si elle n'existe pas
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
-- PARTIE 2 : CRÉATION DES INDEX
-- ========================================

CREATE INDEX IF NOT EXISTS idx_profiles_team ON public.profiles(team);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date ON public.daily_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_team_stats_team_date ON public.team_stats(team, date);

-- ========================================
-- PARTIE 3 : INSERTION DES DONNÉES DE BASE
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

-- Créer le profil admin
INSERT INTO public.profiles (id, email, role, team, is_active)
VALUES (
  '8ac44380-8445-49a8-b4a9-16f602d0e7d4',
  'jbgerberon@gmail.com',
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

-- ========================================
-- PARTIE 4 : CORRECTION DES POLITIQUES RLS
-- ========================================

-- Désactiver temporairement RLS sur toutes les tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_stats DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les anciennes politiques sur profiles
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- Supprimer TOUTES les anciennes politiques sur teams
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'teams' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.teams', pol.policyname);
  END LOOP;
END $$;

-- Supprimer TOUTES les anciennes politiques sur daily_entries
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'daily_entries' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.daily_entries', pol.policyname);
  END LOOP;
END $$;

-- ========================================
-- PARTIE 5 : CRÉER DES POLITIQUES SIMPLES
-- ========================================

-- Réactiver RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_stats ENABLE ROW LEVEL SECURITY;

-- POLITIQUES POUR PROFILES
-- Chaque utilisateur peut lire son propre profil
CREATE POLICY "profiles_read_own" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Chaque utilisateur peut créer son propre profil
CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Chaque utilisateur peut modifier son propre profil
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- L'admin peut tout faire (basé sur l'ID connu)
CREATE POLICY "profiles_admin_all" ON public.profiles
FOR ALL USING (auth.uid() = '8ac44380-8445-49a8-b4a9-16f602d0e7d4'::uuid);

-- POLITIQUES POUR TEAMS
-- Tout le monde peut lire les équipes
CREATE POLICY "teams_read_all" ON public.teams
FOR SELECT USING (true);

-- Seul l'admin peut modifier les équipes
CREATE POLICY "teams_admin_all" ON public.teams
FOR ALL USING (auth.uid() = '8ac44380-8445-49a8-b4a9-16f602d0e7d4'::uuid);

-- POLITIQUES POUR DAILY_ENTRIES
-- Chaque utilisateur peut gérer ses propres entrées
CREATE POLICY "entries_own_all" ON public.daily_entries
FOR ALL USING (auth.uid() = user_id);

-- L'admin peut tout voir
CREATE POLICY "entries_admin_read" ON public.daily_entries
FOR SELECT USING (auth.uid() = '8ac44380-8445-49a8-b4a9-16f602d0e7d4'::uuid);

-- POLITIQUES POUR TEAM_STATS
-- Tout le monde peut lire les stats
CREATE POLICY "stats_read_all" ON public.team_stats
FOR SELECT USING (true);

-- Seul l'admin peut modifier les stats
CREATE POLICY "stats_admin_all" ON public.team_stats
FOR ALL USING (auth.uid() = '8ac44380-8445-49a8-b4a9-16f602d0e7d4'::uuid);

-- ========================================
-- PARTIE 6 : CRÉER DES DONNÉES DE TEST
-- ========================================

-- Créer quelques entrées de test pour juillet 2025
DO $$
DECLARE
  admin_id UUID := '8ac44380-8445-49a8-b4a9-16f602d0e7d4';
  entry_date DATE;
BEGIN
  -- Créer des entrées pour les dates du 11 au 15 juillet 2025
  FOR entry_date IN SELECT generate_series('2025-07-11'::date, '2025-07-15'::date, '1 day'::interval)::date
  LOOP
    INSERT INTO public.daily_entries (user_id, entry_date, sleep, focus, tasks, wellbeing)
    VALUES (
      admin_id,
      entry_date,
      '{"quality": 4, "duration": 7.5, "notes": "Bonne nuit de sommeil"}'::jsonb,
      '{"morning": 4, "afternoon": 3, "blockers": [], "notes": "Concentration correcte"}'::jsonb,
      '{"completed": 8, "planned": 10, "priorities": ["Réunion équipe", "Rapport mensuel"], "notes": "Journée productive"}'::jsonb,
      '{"stress": 2, "energy": 4, "mood": 4, "notes": "Journée agréable"}'::jsonb
    )
    ON CONFLICT (user_id, entry_date) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Données de test créées pour juillet 2025';
END $$;

-- ========================================
-- PARTIE 7 : VÉRIFICATION FINALE
-- ========================================

-- Vérifier que tout est créé
DO $$
DECLARE
  profile_count INTEGER;
  team_count INTEGER;
  entry_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  SELECT COUNT(*) INTO team_count FROM public.teams;
  SELECT COUNT(*) INTO entry_count FROM public.daily_entries;
  
  RAISE NOTICE '✅ Configuration terminée:';
  RAISE NOTICE '  - % profil(s) créé(s)', profile_count;
  RAISE NOTICE '  - % équipe(s) créée(s)', team_count;
  RAISE NOTICE '  - % entrée(s) quotidienne(s)', entry_count;
  
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = '8ac44380-8445-49a8-b4a9-16f602d0e7d4' 
    AND role = 'admin'
  ) THEN
    RAISE NOTICE '✅ Profil admin configuré correctement';
  ELSE
    RAISE WARNING '⚠️ Profil admin non trouvé ou mal configuré';
  END IF;
END $$;

-- Afficher les politiques créées
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'teams', 'daily_entries', 'team_stats')
ORDER BY tablename, policyname;