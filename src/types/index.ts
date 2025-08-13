// Types pour l'application EffiZen-AI

export interface User {
  id: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  team: string;
  created_at: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface Sleep {
  bedTime: string; // HH:MM
  wakeTime: string; // HH:MM
  insomniaDuration: number; // heures
  duration: number; // calculé automatiquement
}

export interface Focus {
  morningHours: number; // ≤ 6h
  afternoonHours: number; // ≤ 6h
  drivingHours: number;
  fatigue: 1 | 2 | 3 | 4 | 5; // échelle 1-5
}

export interface Task {
  id: string;
  name: string;
  duration: number; // heures
  isHighValue: boolean;
}

export interface Wellbeing {
  meditations: {
    am: boolean;
    pm: boolean;
  };
  breaks: {
    am: boolean;
    noon: boolean;
    pm: boolean;
  };
  sportHours: number;
  manualHours: number;
  energy: number; // 0-100%
}

export interface DailyEntry {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  sleep: Sleep;
  focus: Focus;
  tasks: Task[];
  wellbeing: Wellbeing;
  created_at: string;
}

export interface AggregatedMetrics {
  team: string;
  day: string; // YYYY-MM-DD
  avg_energy: number;
  avg_sleep: number;
  avg_fatigue: number;
  hv_ratio: number; // high-value / total
  entries: number; // nombre d'employés ayant saisi
}

export interface WellbeingScore {
  sleepScore: number; // 0-100
  fatigueScore: number; // 0-100
  meditScore: number; // 0-100
  pauseScore: number; // 0-100
  activityScore: number; // 0-100
  wellbeingScore: number; // 0-100 (moyenne)
}

export interface AIRecommendation {
  type: 'info' | 'warning' | 'alert';
  message: string;
  color: string;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface Locale {
  code: 'fr' | 'en';
  name: string;
  flag: string;
}

// Types pour les props des composants
export interface FormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
}

export interface ChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
}

// Types pour l'administration
export interface Team {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
  members_count?: number;
}

export interface UserCreateRequest {
  email: string;
  role: 'employee' | 'manager' | 'admin';
  team_id: string;
  send_invitation?: boolean;
}

export interface TeamCreateRequest {
  name: string;
  description?: string;
  manager_id?: string;
}

export interface AdminMetrics {
  total_users: number;
  total_teams: number;
  active_users: number;
  entries_today: number;
  system_health: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface UserWithTeam extends User {
  team_name?: string;
  last_entry_date?: string;
  entries_count?: number;
}

export interface DetailedUserData {
  user: UserWithTeam;
  recent_entries: DailyEntry[];
  wellbeing_trend: number[];
  productivity_trend: number[];
}

// Types pour les hooks
export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T) => void;
}

export interface UseDebounceReturn<T> {
  debouncedValue: T;
  setValue: (value: T) => void;
}

// Types pour les hooks admin
export interface UseAdminReturn {
  users: UserWithTeam[];
  teams: Team[];
  metrics: AdminMetrics;
  loading: boolean;
  error: string | null;
  createUser: (userData: UserCreateRequest) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  createTeam: (teamData: TeamCreateRequest) => Promise<{ success: boolean; error?: string }>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<{ success: boolean; error?: string }>;
  deleteTeam: (teamId: string) => Promise<{ success: boolean; error?: string }>;
  getUserDetails: (userId: string) => Promise<DetailedUserData | null>;
  refreshData: () => Promise<void>;
} 