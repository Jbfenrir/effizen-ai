const puppeteer = require('puppeteer');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

async function debugRealTime() {
  let browser;
  
  try {
    console.log(`${colors.cyan}🔍 DIAGNOSTIC EN TEMPS RÉEL${colors.reset}\n`);
    
    // Vérifier que Puppeteer est installé
    try {
      require.resolve('puppeteer');
    } catch(e) {
      console.log(`${colors.yellow}Installation de Puppeteer...${colors.reset}`);
      const { exec } = require('child_process');
      const util = require('util');
      const execPromise = util.promisify(exec);
      await execPromise('npm install puppeteer');
    }
    
    browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Capturer TOUS les logs
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(`[${new Date().toLocaleTimeString()}] ${text}`);
      console.log(`${colors.blue}CONSOLE:${colors.reset} ${text}`);
    });
    
    // Capturer les erreurs
    page.on('pageerror', error => {
      console.log(`${colors.red}PAGE ERROR:${colors.reset} ${error.message}`);
    });
    
    console.log(`${colors.yellow}1. Navigation vers localhost:3000...${colors.reset}`);
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Attendre 3 secondes pour voir les logs
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`\n${colors.yellow}2. Vérification des variables globales...${colors.reset}`);
    
    const globalCheck = await page.evaluate(() => {
      return {
        hasSupabaseGlobal: !!window.__effizen_supabase_client__,
        hasAdminGlobal: !!window.__effizen_supabase_admin__,
        globalCheckInProgress: window.globalCheckInProgress,
        localStorage: !!localStorage.getItem('supabase.auth.token.local.3000'),
        sessionStorage: !!sessionStorage.getItem('effizen_auth_cache'),
        currentPath: window.location.pathname,
        documentHidden: document.hidden
      };
    });
    
    console.log(`${colors.cyan}Variables globales:${colors.reset}`);
    Object.entries(globalCheck).forEach(([key, value]) => {
      const status = value ? `${colors.green}✓` : `${colors.red}✗`;
      console.log(`  ${status} ${key}: ${value}${colors.reset}`);
    });
    
    console.log(`\n${colors.yellow}3. Test du singleton Supabase...${colors.reset}`);
    
    const singletonTest = await page.evaluate(() => {
      // Tenter de créer une nouvelle instance
      const beforeCount = window.__supabase_instance_count__ || 0;
      
      // Simuler un import de supabase-bypass
      return {
        beforeCount,
        singletonExists: !!window.__effizen_supabase_client__,
        instanceType: typeof window.__effizen_supabase_client__
      };
    });
    
    console.log(`${colors.cyan}Test singleton:${colors.reset}`);
    Object.entries(singletonTest).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    console.log(`\n${colors.yellow}4. Simulation visibilitychange...${colors.reset}`);
    
    // Simuler le changement d'onglet
    await page.evaluate(() => {
      console.log('🔄 SIMULATION: Onglet devient invisible');
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: function() { return true; }
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await page.evaluate(() => {
      console.log('👁️ SIMULATION: Onglet redevient visible');
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: function() { return false; }
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`\n${colors.yellow}5. État final...${colors.reset}`);
    
    const finalState = await page.evaluate(() => {
      return {
        isLoading: !!document.querySelector('.animate-spin'),
        hasErrorMessage: !!document.querySelector('[class*="error"]'),
        currentUrl: window.location.href,
        bodyText: document.body.innerText.substring(0, 200)
      };
    });
    
    console.log(`${colors.cyan}État final:${colors.reset}`);
    Object.entries(finalState).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    // Afficher un résumé des logs
    console.log(`\n${colors.magenta}RÉSUMÉ DES LOGS (dernières 10):${colors.reset}`);
    logs.slice(-10).forEach(log => {
      console.log(`  ${log}`);
    });
    
    console.log(`\n${colors.red}DIAGNOSTIC TERMINÉ - Laissez la fenêtre ouverte pour inspecter${colors.reset}`);
    console.log(`${colors.yellow}Appuyez sur Ctrl+C pour fermer${colors.reset}`);
    
    // Garder ouvert pour inspection manuelle
    await new Promise(() => {}); // Attendre indéfiniment
    
  } catch (error) {
    console.error(`${colors.red}Erreur:${colors.reset}`, error.message);
  } finally {
    // Browser fermé par Ctrl+C
  }
}

debugRealTime().catch(console.error);