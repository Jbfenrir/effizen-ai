-- Script CORRIGÉ pour votre utilisateur
-- ID: 8ac44380-84d5-49a8-b4a0-16f602d0e7d4

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
-- CRÉATION DES INDEX
-- ========================================

CREATE INDEX IF NOT EXISTS idx_profiles_team ON public.profiles(team);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date ON public.daily_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_team_stats_team_date ON public.team_stats(team, date);

-- ========================================
-- INSERTION DES DONNÉES DE BASE
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
-- DÉSACTIVER RLS AVANT INSERTION
-- ========================================

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_stats DISABLE ROW LEVEL SECURITY;

-- ========================================
-- CONFIGURATION POUR VOTRE UTILISATEUR
-- ========================================

-- Créer le profil admin
INSERT INTO public.profiles (id, email, role, team, is_active)
VALUES (
  '8ac44380-84d5-49a8-b4a0-16f602d0e7d4',
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
-- CRÉATION DES DONNÉES DE TEST
-- ========================================

-- Données pour juillet 2025
INSERT INTO public.daily_entries (user_id, entry_date, sleep, focus, tasks, wellbeing)
VALUES 
  ('8ac44380-84d5-49a8-b4a0-16f602d0e7d4', '2025-07-11', 
   '{"quality": 4, "duration": 7.5, "notes": "Bonne nuit de sommeil"}',
   '{"morning": 4, "afternoon": 3, "blockers": [], "notes": "Concentration correcte"}',
   '{"completed": 8, "planned": 10, "priorities": ["Réunion équipe", "Rapport mensuel"], "notes": "Journée productive"}',
   '{"stress": 2, "energy": 4, "mood": 4, "notes": "Journée agréable"}'),
   
  ('8ac44380-84d5-49a8-b4a0-16f602d0e7d4', '2025-07-12', 
   '{"quality": 3, "duration": 6.5, "notes": "Sommeil léger"}',
   '{"morning": 3, "afternoon": 4, "blockers": ["Fatigue"], "notes": "Meilleure après-midi"}',
   '{"completed": 6, "planned": 8, "priorities": ["Développement", "Tests"], "notes": "Journée correcte"}',
   '{"stress": 3, "energy": 3, "mood": 3, "notes": "Journée normale"}'),
   
  ('8ac44380-84d5-49a8-b4a0-16f602d0e7d4', '2025-07-13', 
   '{"quality": 5, "duration": 8.0, "notes": "Excellente nuit"}',
   '{"morning": 5, "afternoon": 4, "blockers": [], "notes": "Très concentré"}',
   '{"completed": 9, "planned": 10, "priorities": ["Présentation", "Formation"], "notes": "Excellente journée"}',
   '{"stress": 1, "energy": 5, "mood": 5, "notes": "Super forme"}'),
   
  ('8ac44380-84d5-49a8-b4a0-16f602d0e7d4', '2025-07-14', 
   '{"quality": 4, "duration": 7.0, "notes": "Bonne récupération"}',
   '{"morning": 4, "afternoon": 3, "blockers": ["Réunions"], "notes": "Matinée productive"}',
   '{"completed": 7, "planned": 9, "priorities": ["Code review", "Documentation"], "notes": "Bonne journée"}',
   '{"stress": 2, "energy": 4, "mood": 4, "notes": "Satisfait"}'),
   
  ('8ac44380-84d5-49a8-b4a0-16f602d0e7d4', '2025-07-15', 
   '{"quality": 4, "duration": 7.5, "notes": "Sommeil réparateur"}',
   '{"morning": 4, "afternoon": 5, "blockers": [], "notes": "Journée très productive"}',
   '{"completed": 10, "planned": 10, "priorities": ["Finalisation", "Livraison"], "notes": "Objectifs atteints"}',
   '{"stress": 1, "energy": 5, "mood": 5, "notes": "Très satisfait"}'
   )
ON CONFLICT (user_id, entry_date) DO NOTHING;

-- Données pour août 2025
INSERT INTO public.daily_entries (user_id, entry_date, sleep, focus, tasks, wellbeing)
VALUES 
  ('8ac44380-84d5-49a8-b4a0-16f602d0e7d4', '2025-08-01', 
   '{"quality": 3, "duration": 6.0, "notes": "Nuit courte"}',
   '{"morning": 2, "afternoon": 3, "blockers": ["Fatigue", "Réunions"], "notes": "Difficile"}',
   '{"completed": 5, "planned": 8, "priorities": ["Planning", "Réunions"], "notes": "Journée compliquée"}',
   '{"stress": 4, "energy": 2, "mood": 3, "notes": "Fatigué"}'),
   
  ('8ac44380-84d5-49a8-b4a0-16f602d0e7d4', '2025-08-02', 
   '{"quality": 4, "duration": 7.5, "notes": "Récupération"}',
   '{"morning": 4, "afternoon": 4, "blockers": [], "notes": "Meilleure forme"}',
   '{"completed": 8, "planned": 9, "priorities": ["Développement", "Tests"], "notes": "Journée productive"}',
   '{"stress": 2, "energy": 4, "mood": 4, "notes": "Ça va mieux"}'),
   
  ('8ac44380-84d5-49a8-b4a0-16f602d0e7d4', '2025-08-18', 
   '{"quality": 4, "duration": 7.0, "notes": "Sommeil correct"}',
   '{"morning": 4, "afternoon": 4, "blockers": [], "notes": "Journée stable"}',
   '{"completed": 7, "planned": 8, "priorities": ["Résolution bugs", "Documentation"], "notes": "Journée courante"}',
   '{"stress": 2, "energy": 4, "mood": 4, "notes": "Journée normale"}'
   )
ON CONFLICT (user_id, entry_date) DO NOTHING;

-- ========================================
-- VÉRIFICATION ET MESSAGES
-- ========================================

DO $$
DECLARE
  profile_count INTEGER;
  team_count INTEGER;
  entry_count INTEGER;
  july_entries INTEGER;
  august_entries INTEGER;
BEGIN
  -- Compter les éléments créés
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  SELECT COUNT(*) INTO team_count FROM public.teams;
  SELECT COUNT(*) INTO entry_count FROM public.daily_entries;
  
  -- Compter les entrées par mois
  SELECT COUNT(*) INTO july_entries 
  FROM public.daily_entries 
  WHERE entry_date >= '2025-07-01' AND entry_date < '2025-08-01';
  
  SELECT COUNT(*) INTO august_entries 
  FROM public.daily_entries 
  WHERE entry_date >= '2025-08-01' AND entry_date < '2025-09-01';
  
  RAISE NOTICE '';
  RAISE NOTICE '=================================';
  RAISE NOTICE '✅ CONFIGURATION TERMINÉE';
  RAISE NOTICE '=================================';
  RAISE NOTICE '  Profils créés: %', profile_count;
  RAISE NOTICE '  Équipes créées: %', team_count;
  RAISE NOTICE '  Total entrées: %', entry_count;
  RAISE NOTICE '  Entrées juillet 2025: %', july_entries;
  RAISE NOTICE '  Entrées août 2025: %', august_entries;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Profil admin configuré pour jbgerberon@gmail.com';
  RAISE NOTICE '✅ Données de test disponibles';
  RAISE NOTICE '⚠️ RLS désactivé temporairement';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Votre application est prête!';
  RAISE NOTICE '👉 Connectez-vous sur http://localhost:3000';
  RAISE NOTICE '=================================';
  RAISE NOTICE '';
END $$;