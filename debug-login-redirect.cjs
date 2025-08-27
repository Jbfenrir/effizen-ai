#!/usr/bin/env node

const puppeteer = require('puppeteer');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function debugLoginRedirect() {
  let browser;
  
  try {
    console.log(`${colors.cyan}🔍 DEBUG: Problème de redirection après connexion${colors.reset}\n`);
    
    browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Capturer tous les logs
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(`[${new Date().toLocaleTimeString()}] ${text}`);
      
      // Afficher les logs importants
      if (text.includes('AppRouter') || text.includes('useAuthNew') || text.includes('navigation') || text.includes('authenticated')) {
        console.log(`${colors.blue}LOG:${colors.reset} ${text}`);
      }
    });
    
    page.on('pageerror', error => {
      console.log(`${colors.red}ERROR:${colors.reset} ${error.message}`);
    });
    
    console.log(`${colors.yellow}1. Navigation vers l'app...${colors.reset}`);
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    console.log(`\n${colors.yellow}2. Vérification état initial...${colors.reset}`);
    const initialState = await page.evaluate(() => {
      return {
        currentPath: window.location.pathname,
        isLoginPage: !!document.querySelector('input[type="email"]'),
        hasErrorMessage: !!document.querySelector('[class*="error"]'),
        authSystem: window.location.search.includes('emergency') ? 'EMERGENCY' : 'NORMAL'
      };
    });
    
    console.log(`${colors.cyan}État initial:${colors.reset}`);
    Object.entries(initialState).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    if (!initialState.isLoginPage) {
      console.log(`${colors.red}❌ Pas sur la page de login, arrêt du test${colors.reset}`);
      return;
    }
    
    console.log(`\n${colors.yellow}3. Tentative de connexion...${colors.reset}`);
    
    // Remplir le formulaire
    await page.type('input[type="email"]', 'jbgerberon@gmail.com');
    await page.type('input[type="password"]', 'Test123!@#'); // Mot de passe temporaire test
    
    console.log(`  Email et mot de passe saisis`);
    
    // Cliquer sur le bouton de connexion et attendre la réponse
    const loginButton = await page.$('button[type="submit"], button:contains("connexion"), button:contains("Connexion")');
    if (loginButton) {
      console.log(`  Clic sur le bouton de connexion...`);
      
      // Écouter les changements de navigation
      const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => null);
      
      await loginButton.click();
      
      // Attendre soit navigation soit timeout
      await Promise.race([navigationPromise, page.waitForTimeout(5000)]);
      
      console.log(`\n${colors.yellow}4. État après connexion...${colors.reset}`);
      
      const postLoginState = await page.evaluate(() => {
        return {
          currentPath: window.location.pathname,
          currentUrl: window.location.href,
          isStillOnLogin: !!document.querySelector('input[type="email"]'),
          hasDashboard: !!document.querySelector('[class*="dashboard"]') || document.body.textContent.includes('Dashboard'),
          hasSuccessMessage: document.body.textContent.includes('succès') || document.body.textContent.includes('réussie'),
          bodyPreview: document.body.innerText.substring(0, 200)
        };
      });
      
      console.log(`${colors.cyan}État post-connexion:${colors.reset}`);
      Object.entries(postLoginState).forEach(([key, value]) => {
        const status = key.includes('Still') && value ? `${colors.red}❌` : 
                     key.includes('has') && value ? `${colors.green}✓` : '';
        console.log(`  ${status} ${key}: ${value}${colors.reset}`);
      });
      
      // Analyser spécifiquement le problème
      if (postLoginState.isStillOnLogin && postLoginState.hasSuccessMessage) {
        console.log(`\n${colors.red}🚨 PROBLÈME IDENTIFIÉ: Connexion réussie mais pas de redirection${colors.reset}`);
        
        // Vérifier les variables globales
        const debugInfo = await page.evaluate(() => {
          return {
            authState: typeof window.globalCheckInProgress,
            supabaseClient: !!window.__effizen_supabase_client__,
            localStorage: !!localStorage.getItem('supabase.auth.token.effizen.localhost.3000'),
            sessionStorage: Object.keys(sessionStorage).filter(k => k.includes('auth'))
          };
        });
        
        console.log(`${colors.cyan}Debug auth:${colors.reset}`);
        Object.entries(debugInfo).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      }
      
      console.log(`\n${colors.yellow}5. Logs récents (derniers 10):${colors.reset}`);
      logs.slice(-10).forEach(log => {
        if (log.includes('AppRouter') || log.includes('redirect') || log.includes('authenticated')) {
          console.log(`  ${colors.blue}${log}${colors.reset}`);
        }
      });
      
    } else {
      console.log(`${colors.red}❌ Bouton de connexion non trouvé${colors.reset}`);
    }
    
    console.log(`\n${colors.cyan}Test terminé. Laissez la fenêtre ouverte pour inspection.${colors.reset}`);
    console.log(`${colors.yellow}Appuyez sur Ctrl+C pour fermer.${colors.reset}`);
    
    // Attendre indéfiniment pour inspection manuelle
    await new Promise(() => {});
    
  } catch (error) {
    console.error(`${colors.red}Erreur:${colors.reset}`, error.message);
  }
}

debugLoginRedirect().catch(console.error);