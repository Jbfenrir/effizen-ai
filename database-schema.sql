-- ============================================
-- SCHÉMA COMPLET BASE DE DONNÉES EFFIZEN-AI
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================

-- 1. Supprimer les tables existantes si elles existent (optionnel)
DROP TABLE IF EXISTS public.daily_entries CASCADE;
DROP TABLE IF EXISTS public.team_stats CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;

-- 2. Créer la table des équipes
CREATE TABLE public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    manager_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- 3. Créer la table des profils utilisateur (étend auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin')),
    team UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- 4. Ajouter la contrainte foreign key pour manager_id dans teams
ALTER TABLE public.teams 
ADD CONSTRAINT teams_manager_id_fkey 
FOREIGN KEY (manager_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 5. Créer la table des entrées quotidiennes
CREATE TABLE public.daily_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    sleep JSONB NOT NULL DEFAULT '{}',
    focus JSONB NOT NULL DEFAULT '{}',
    tasks JSONB NOT NULL DEFAULT '[]',
    wellbeing JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, entry_date)
);

-- 6. Créer la table des statistiques d'équipe (cache)
CREATE TABLE public.team_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    avg_energy DECIMAL(5,2),
    avg_sleep DECIMAL(5,2),
    avg_fatigue DECIMAL(5,2),
    avg_hv_ratio DECIMAL(5,2),
    participant_count INTEGER DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team, date)
);

-- ============================================
-- 7. CRÉATION DES INDEX POUR PERFORMANCE
-- ============================================

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_team ON public.profiles(team);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

CREATE INDEX idx_daily_entries_user_id ON public.daily_entries(user_id);
CREATE INDEX idx_daily_entries_entry_date ON public.daily_entries(entry_date);
CREATE INDEX idx_daily_entries_user_date ON public.daily_entries(user_id, entry_date);

CREATE INDEX idx_teams_manager_id ON public.teams(manager_id);
CREATE INDEX idx_teams_is_active ON public.teams(is_active);

CREATE INDEX idx_team_stats_team ON public.team_stats(team);
CREATE INDEX idx_team_stats_date ON public.team_stats(date);

-- ============================================
-- 8. FONCTIONS ET TRIGGERS UTILITAIRES
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_entries_updated_at BEFORE UPDATE ON public.daily_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer un profil automatiquement après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'employee');
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Trigger pour créer le profil automatiquement
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_stats ENABLE ROW LEVEL SECURITY;

-- Politiques pour les profils
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Politiques Admin (peuvent tout voir/modifier)
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour les équipes
CREATE POLICY "All authenticated users can view teams" ON public.teams
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage teams" ON public.teams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour les entrées quotidiennes
CREATE POLICY "Users can manage their own entries" ON public.daily_entries
    FOR ALL USING (auth.uid() = user_id);

-- Managers peuvent voir les entrées de leur équipe (anonymisées)
CREATE POLICY "Managers can view team entries" ON public.daily_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p1
            JOIN public.profiles p2 ON p1.team = p2.team
            WHERE p1.id = auth.uid() AND p1.role = 'manager'
            AND p2.id = daily_entries.user_id
        )
    );

-- Admins peuvent voir toutes les entrées
CREATE POLICY "Admins can view all entries" ON public.daily_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- 10. DONNÉES INITIALES
-- ============================================

-- Créer l'administrateur initial (jbgerberon@gmail.com)
-- NOTE: Cette insertion se fera après que l'utilisateur se soit connecté une première fois
-- Car l'ID auth.users sera généré automatiquement par Supabase Auth

-- ============================================
-- 11. FONCTIONS MÉTIER
-- ============================================

-- Fonction pour obtenir les statistiques d'équipe
CREATE OR REPLACE FUNCTION get_team_stats(
    team_name TEXT,
    period_type TEXT DEFAULT 'week'
)
RETURNS TABLE (
    team TEXT,
    avg_energy DECIMAL,
    avg_sleep DECIMAL,
    avg_fatigue DECIMAL,
    avg_hv_ratio DECIMAL,
    participant_count BIGINT,
    risk_level TEXT,
    date_range TEXT
) AS $$
DECLARE
    start_date DATE;
    end_date DATE;
BEGIN
    -- Calculer les dates selon la période
    end_date := CURRENT_DATE;
    
    CASE period_type
        WHEN 'week' THEN
            start_date := end_date - INTERVAL '7 days';
        WHEN 'month' THEN
            start_date := end_date - INTERVAL '30 days';
        WHEN 'quarter' THEN
            start_date := end_date - INTERVAL '90 days';
        ELSE
            start_date := end_date - INTERVAL '7 days';
    END CASE;

    RETURN QUERY
    SELECT 
        t.name::TEXT as team,
        ROUND(AVG((de.wellbeing->>'energy')::DECIMAL), 2) as avg_energy,
        ROUND(AVG((de.sleep->>'duration')::DECIMAL), 2) as avg_sleep,
        ROUND(AVG((de.focus->>'fatigue')::DECIMAL), 2) as avg_fatigue,
        ROUND(AVG(
            CASE 
                WHEN jsonb_array_length(de.tasks) > 0 THEN
                    (SELECT AVG((task->>'isHighValue')::INT::DECIMAL * (task->>'duration')::DECIMAL) 
                     FROM jsonb_array_elements(de.tasks) as task)
                ELSE 0 
            END
        ), 2) as avg_hv_ratio,
        COUNT(DISTINCT de.user_id) as participant_count,
        CASE 
            WHEN AVG((de.wellbeing->>'energy')::DECIMAL) < 50 OR 
                 AVG((de.focus->>'fatigue')::DECIMAL) > 3.5 THEN 'high'
            WHEN AVG((de.wellbeing->>'energy')::DECIMAL) < 70 OR 
                 AVG((de.focus->>'fatigue')::DECIMAL) > 2.5 THEN 'medium'
            ELSE 'low'
        END::TEXT as risk_level,
        (start_date::TEXT || ' - ' || end_date::TEXT) as date_range
    FROM public.teams t
    JOIN public.profiles p ON p.team = t.id
    JOIN public.daily_entries de ON de.user_id = p.id
    WHERE t.name = team_name
      AND de.entry_date >= start_date
      AND de.entry_date <= end_date
      AND t.is_active = true
      AND p.is_active = true
    GROUP BY t.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour calculer le score de bien-être
CREATE OR REPLACE FUNCTION calculate_wellbeing_score(
    sleep_data JSONB,
    focus_data JSONB,
    wellbeing_data JSONB
)
RETURNS INTEGER AS $$
DECLARE
    sleep_score INTEGER := 0;
    energy_score INTEGER := 0;
    fatigue_score INTEGER := 0;
    breaks_score INTEGER := 0;
BEGIN
    -- Score sommeil (0-100)
    IF (sleep_data->>'duration')::DECIMAL > 0 THEN
        sleep_score := LEAST(((sleep_data->>'duration')::DECIMAL / 8.0) * 100, 100)::INTEGER;
    END IF;

    -- Score énergie (0-100)
    IF wellbeing_data->>'energy' IS NOT NULL THEN
        energy_score := (wellbeing_data->>'energy')::INTEGER;
    END IF;

    -- Score fatigue inversé (0-100)
    IF focus_data->>'fatigue' IS NOT NULL THEN
        fatigue_score := ((5 - (focus_data->>'fatigue')::DECIMAL) / 4.0) * 100::INTEGER;
    END IF;

    -- Score pauses (0-100)
    IF wellbeing_data->'breaks' IS NOT NULL THEN
        breaks_score := (
            CASE WHEN (wellbeing_data->'breaks'->>'am')::BOOLEAN THEN 33 ELSE 0 END +
            CASE WHEN (wellbeing_data->'breaks'->>'noon')::BOOLEAN THEN 33 ELSE 0 END +
            CASE WHEN (wellbeing_data->'breaks'->>'pm')::BOOLEAN THEN 34 ELSE 0 END
        );
    END IF;

    -- Score global (moyenne)
    RETURN ((sleep_score + energy_score + fatigue_score + breaks_score) / 4)::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- FIN DU SCHÉMA
-- ============================================

-- Afficher un message de confirmation
SELECT 'Base de données EffiZen-AI créée avec succès!' as message;