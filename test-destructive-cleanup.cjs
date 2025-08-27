#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Créer des sauvegardes temporaires
const backupDir = './temp-backup-destructive';
const filesToBackup = [
  'src/services/supabase-bypass.ts',
  'src/services/supabase.ts', 
  'src/services/debug-auth.ts',
  'src/services/adminService.ts',
  'src/main.tsx',
  'src/pages/AuthCallback.tsx'
];

async function createBackup() {
  console.log(`${colors.cyan}📦 Création sauvegarde temporaire...${colors.reset}`);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  for (const file of filesToBackup) {
    if (fs.existsSync(file)) {
      const backupPath = path.join(backupDir, path.basename(file));
      fs.copyFileSync(file, backupPath);
      console.log(`  ${colors.green}✓ Sauvegardé: ${file}${colors.reset}`);
    }
  }
}

async function applyDestructiveChanges() {
  console.log(`\n${colors.yellow}🚨 Application des changements destructifs...${colors.reset}`);
  
  // 1. Supprimer les anciens services
  const filesToDelete = [
    'src/services/supabase-bypass.ts',
    'src/services/supabase.ts',
    'src/services/debug-auth.ts'
  ];
  
  for (const file of filesToDelete) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`  ${colors.red}🗑️ Supprimé: ${file}${colors.reset}`);
    }
  }
  
  // 2. Créer nouveau service unifié
  const newSupabaseService = `import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTM3OTgsImV4cCI6MjA2Nzc4OTc5OH0.GJXkGBy047Dx8cS-uOIQJSEJa5VHQRfdwWb-FkQVbIQ';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Supabase unifié: Client unique créé');

// UN SEUL CLIENT SUPABASE - Pas de multiples instances
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: \`supabase.auth.token.effizen.\${window.location.hostname}.\${window.location.port || '3000'}\`
  }
});

// Client admin UNIQUE
export const supabaseAdmin = supabaseServiceKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Types unifiés
export interface AuthUser {
  id: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  team?: string;
}

// Service d'auth unifié et simple
export const authService = {
  async signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  },

  async signInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: \`\${window.location.origin}/auth/callback\` }
    });
    return { error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user) return null;

    const adminEmails = ['jbgerberon@gmail.com'];
    const role = adminEmails.includes(session.user.email || '') ? 'admin' : 'employee';

    return {
      id: session.user.id,
      email: session.user.email!,
      role,
      team: undefined
    };
  }
};

export default supabase;`;

  fs.writeFileSync('src/services/supabase.ts', newSupabaseService);
  console.log(`  ${colors.green}✅ Créé: src/services/supabase.ts (service unifié)${colors.reset}`);
  
  // 3. Mettre à jour useAuthNew pour utiliser le service unifié
  const useAuthNewPath = 'src/hooks/useAuthNew.ts';
  let useAuthNewContent = fs.readFileSync(useAuthNewPath, 'utf8');
  useAuthNewContent = useAuthNewContent.replace(
    "import { supabase } from '../services/supabase-clean';",
    "import { supabase } from '../services/supabase';"
  );
  fs.writeFileSync(useAuthNewPath, useAuthNewContent);
  console.log(`  ${colors.green}✅ Modifié: useAuthNew.ts (import unifié)${colors.reset}`);
  
  // 4. Nettoyer main.tsx
  const mainContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter';
import ErrorBoundary from './components/ErrorBoundary';
import './utils/navigation';
import { initDebugState } from './utils/debug-state';

console.log('🚀 EffiZen-AI - Démarrage avec auth unifié');
initDebugState();

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Element root non trouvé!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Erreur: Element root non trouvé</div>';
} else {
  ReactDOM.createRoot(rootElement).render(
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}`;

  fs.writeFileSync('src/main.tsx', mainContent);
  console.log(`  ${colors.green}✅ Modifié: main.tsx (nettoyé)${colors.reset}`);
  
  // 5. Mettre à jour adminService
  const adminServiceContent = `import { supabase, supabaseAdmin, type AuthUser } from './supabase';

// AdminService utilise maintenant le service unifié
export class AdminService {
  async createUser(userData: { email: string; password: string; role: string; team?: string }) {
    if (!supabaseAdmin) {
      throw new Error('Service admin non disponible');
    }
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });
    
    return { data, error };
  }
  
  async getUsers() {
    if (!supabaseAdmin) {
      throw new Error('Service admin non disponible');
    }
    
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    return { data, error };
  }
  
  async deleteUser(userId: string) {
    if (!supabaseAdmin) {
      throw new Error('Service admin non disponible');
    }
    
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    return { data, error };
  }
}

export const adminService = new AdminService();
export default adminService;`;

  fs.writeFileSync('src/services/adminService.ts', adminServiceContent);
  console.log(`  ${colors.green}✅ Modifié: adminService.ts (unifié)${colors.reset}`);
  
  // 6. Mettre à jour AuthCallback
  const authCallbackContent = `import React, { useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthCallback: React.FC = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erreur callback auth:', error);
        window.location.href = '/login?error=callback';
        return;
      }
      
      if (data.session) {
        console.log('Callback auth réussi:', data.session.user.email);
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/login';
      }
    };
    
    handleAuthCallback();
  }, []);
  
  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-green mx-auto"></div>
        <p className="mt-4 text-metallic-gray">Finalisation de la connexion...</p>
      </div>
    </div>
  );
};

export default AuthCallback;`;

  fs.writeFileSync('src/pages/AuthCallback.tsx', authCallbackContent);
  console.log(`  ${colors.green}✅ Modifié: AuthCallback.tsx (unifié)${colors.reset}`);
}

async function testAfterChanges() {
  console.log(`\n${colors.yellow}🧪 Test après changements destructifs...${colors.reset}`);
  
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  try {
    console.log(`  ${colors.blue}Test build...${colors.reset}`);
    await execPromise('npm run build', { timeout: 60000 });
    console.log(`  ${colors.green}✅ Build réussi${colors.reset}`);
    
    return true;
  } catch (error) {
    console.log(`  ${colors.red}❌ Build échoué: ${error.message}${colors.reset}`);
    return false;
  }
}

async function restoreBackup() {
  console.log(`\n${colors.magenta}🔄 Restauration depuis sauvegarde...${colors.reset}`);
  
  for (const file of filesToBackup) {
    const backupPath = path.join(backupDir, path.basename(file));
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, file);
      console.log(`  ${colors.green}✓ Restauré: ${file}${colors.reset}`);
    }
  }
  
  // Nettoyer les fichiers créés
  const filesToClean = ['src/services/supabase.ts'];
  for (const file of filesToClean) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`  ${colors.red}🧹 Nettoyé: ${file}${colors.reset}`);
    }
  }
  
  // Supprimer le dossier de backup
  if (fs.existsSync(backupDir)) {
    fs.rmSync(backupDir, { recursive: true });
    console.log(`  ${colors.blue}🗑️ Backup supprimé${colors.reset}`);
  }
}

async function runDestructiveTest() {
  console.log(`${colors.bright}${colors.red}⚠️  TEST DESTRUCTIF: Nettoyage radical auth${colors.reset}\n`);
  
  try {
    // Étape 1: Sauvegarde
    await createBackup();
    
    // Étape 2: Appliquer changements destructifs
    await applyDestructiveChanges();
    
    // Étape 3: Tester
    const buildSuccess = await testAfterChanges();
    
    if (buildSuccess) {
      console.log(`\n${colors.bright}${colors.green}✅ THÉORIE VALIDÉE !${colors.reset}`);
      console.log(`${colors.cyan}Le nettoyage radical fonctionne. Prêt pour application définitive.${colors.reset}`);
      
      // Restaurer pour l'instant
      await restoreBackup();
      
      console.log(`\n${colors.yellow}État restauré. Prêt pour application permanente.${colors.reset}`);
      return true;
    } else {
      console.log(`\n${colors.bright}${colors.red}❌ THÉORIE ÉCHOUÉE${colors.reset}`);
      await restoreBackup();
      return false;
    }
    
  } catch (error) {
    console.error(`${colors.red}Erreur:${colors.reset}`, error.message);
    await restoreBackup();
    return false;
  }
}

// Exécution
runDestructiveTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });