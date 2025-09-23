# Base de données et Configuration Supabase

## 🗄️ Schéma de la base de données

### Tables principales

```sql
-- Équipes
public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Profils utilisateurs (lié à auth.users)
public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) CHECK (role IN ('employee', 'manager', 'admin')),
  team UUID REFERENCES teams(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Entrées quotidiennes
public.daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  entry_date DATE NOT NULL,
  sleep JSONB,        -- Structure sommeil complète
  focus JSONB,        -- Répartition focus matin/après-midi
  tasks JSONB[],      -- Array de tâches avec durées
  wellbeing JSONB,    -- Pauses, sport, interactions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
)

-- Statistiques équipes (cache)
public.team_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team UUID REFERENCES teams(id),
  date DATE NOT NULL,
  avg_metrics JSONB,
  risk_level VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team, date)
)
```

## 🔐 Configuration Supabase

### URL et clés
- **URL :** https://qzvrkcmwzdaffpknuozl.supabase.co
- **Dashboard :** https://supabase.com/dashboard
- **Projet :** EffiZen-AI

### Variables d'environnement requises
```env
VITE_SUPABASE_URL=https://qzvrkcmwzdaffpknuozl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🛡️ Row Level Security (RLS)

### Politiques par rôle

#### Admin
- **SELECT, INSERT, UPDATE, DELETE** sur toutes les tables
- Accès complet non filtré
- Peut créer/modifier utilisateurs via service_role_key

#### Manager
- **SELECT** sur daily_entries de son équipe (anonymisé)
- **SELECT, UPDATE** sur teams où manager_id = user_id
- **SELECT** sur profiles de son équipe

#### Employee
- **SELECT, INSERT, UPDATE** sur ses propres daily_entries
- **SELECT** sur son propre profile
- **SELECT** limité sur teams (nom équipe uniquement)

### Exemples de politiques RLS

```sql
-- Politique pour les employés sur daily_entries
CREATE POLICY "Employees can view own entries" ON daily_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Employees can insert own entries" ON daily_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour les managers
CREATE POLICY "Managers can view team entries" ON daily_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN teams t ON p.team = t.id
      WHERE p.id = auth.uid()
      AND p.role = 'manager'
      AND t.id = (
        SELECT team FROM profiles WHERE id = daily_entries.user_id
      )
    )
  );

-- Politique pour les admins
CREATE POLICY "Admins have full access" ON daily_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## 📊 Structure des données JSONB

### Sleep (sommeil)
```json
{
  "duration": 8,
  "quality": 4,
  "bedTime": "22:00",
  "wakeTime": "07:00"
}
```

### Tasks (tâches)
```json
{
  "name": "Développement Feature X",
  "duration": 3.5,
  "isHighValue": true,
  "category": "Development"
}
```

### Wellbeing (bien-être)
```json
{
  "breaks": {
    "morning": true,
    "lunch": true,
    "afternoon": false,
    "evening": true
  },
  "sportsHours": 1.5,
  "socialInteraction": true
}
```