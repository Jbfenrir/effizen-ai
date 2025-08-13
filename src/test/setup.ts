import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock pour crypto.randomUUID()
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-123'),
  },
});

// Mock pour localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock pour IndexedDB
const indexedDBMock = {
  open: vi.fn(),
};
Object.defineProperty(window, 'indexedDB', {
  value: indexedDBMock,
});

// Mock pour les variables d'environnement
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_ENCRYPTION_KEY: 'test-encryption-key-32-chars-long',
    MODE: 'test',
  },
});

// Mock pour les icônes Lucide
vi.mock('lucide-react', () => ({
  default: {
    Brain: vi.fn(() => 'Brain'),
    Clock: vi.fn(() => 'Clock'),
    AlertTriangle: vi.fn(() => 'AlertTriangle'),
    Plus: vi.fn(() => 'Plus'),
    Trash2: vi.fn(() => 'Trash2'),
    Target: vi.fn(() => 'Target'),
    Heart: vi.fn(() => 'Heart'),
    Coffee: vi.fn(() => 'Coffee'),
    Dumbbell: vi.fn(() => 'Dumbbell'),
    Wrench: vi.fn(() => 'Wrench'),
    Battery: vi.fn(() => 'Battery'),
    Save: vi.fn(() => 'Save'),
    CheckCircle: vi.fn(() => 'CheckCircle'),
    Calendar: vi.fn(() => 'Calendar'),
    BarChart3: vi.fn(() => 'BarChart3'),
    TrendingUp: vi.fn(() => 'TrendingUp'),
    Activity: vi.fn(() => 'Activity'),
    Lightbulb: vi.fn(() => 'Lightbulb'),
    Users: vi.fn(() => 'Users'),
    Download: vi.fn(() => 'Download'),
    Filter: vi.fn(() => 'Filter'),
  },
}));

// Mock pour react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'fr',
    },
  }),
}));

// Mock pour react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock pour Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOtp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  })),
}));

// Mock pour Dexie
vi.mock('dexie', () => ({
  default: class Dexie {
    constructor() {
      this.version = vi.fn(() => ({
        stores: vi.fn(),
      }));
      this.table = vi.fn(() => ({
        add: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        toArray: vi.fn(),
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            toArray: vi.fn(),
          })),
        })),
      }));
    }
  },
}));

// Mock pour crypto-js
vi.mock('crypto-js', () => ({
  AES: {
    encrypt: vi.fn(() => 'encrypted-data'),
    decrypt: vi.fn(() => 'decrypted-data'),
  },
  enc: {
    Utf8: 'utf8',
    Base64: 'base64',
  },
}));

// Configuration globale pour les tests
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
}); 