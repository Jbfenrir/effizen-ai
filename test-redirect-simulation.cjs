#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function testRedirectFix() {
  let browser;
  let testPassed = false;
  
  try {
    console.log(`${colors.cyan}🧪 TEST EXHAUSTIF: Redirection après connexion${colors.reset}\n`);
    
    // Vérifier que Puppeteer est installé
    try {
      require.resolve('puppeteer');
    } catch(e) {
      console.log(`${colors.yellow}Installation Puppeteer...${colors.reset}`);
      const { exec } = require('child_process');
      const util = require('util');
      const execPromise = util.promisify(exec);
      await execPromise('npm install puppeteer');
    }
    
    browser = await puppeteer.launch({
      headless: false, // Pour voir ce qui se passe
      devtools: false, // Désactiver devtools pour focus sur le test
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1200, height: 800 }
    });
    
    const page = await browser.newPage();
    
    // Capturer les logs importants
    const authLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('useAuthNew') || text.includes('AppRouter') || text.includes('Auth event') || text.includes('REDIRECTION')) {
        authLogs.push(`[${new Date().toLocaleTimeString()}] ${text}`);
        console.log(`${colors.blue}LOG:${colors.reset} ${text}`);
      }
    });
    
    page.on('pageerror', error => {
      console.log(`${colors.red}ERROR:${colors.reset} ${error.message}`);
    });
    
    console.log(`${colors.yellow}1. Navigation vers l'application...${colors.reset}`);
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    
    console.log(`${colors.yellow}2. Vérification page de login...${colors.reset}`);
    const loginPageCheck = await page.evaluate(() => {
      return {
        hasEmailInput: !!document.querySelector('input[type="email"]'),
        hasPasswordInput: !!document.querySelector('input[type="password"]'),
        hasSubmitButton: !!document.querySelector('button[type="submit"], button:contains("connexion")'),
        currentPath: window.location.pathname,
        isLoadingPage: !!document.querySelector('.animate-spin')
      };
    });
    
    if (loginPageCheck.isLoadingPage) {
      console.log(`  ${colors.red}✗ Encore sur page de chargement${colors.reset}`);
      return false;
    }
    
    if (!loginPageCheck.hasEmailInput || !loginPageCheck.hasPasswordInput) {
      console.log(`  ${colors.red}✗ Formulaire de connexion manquant${colors.reset}`);
      return false;
    }
    
    console.log(`  ${colors.green}✓ Page de login correcte${colors.reset}`);
    
    console.log(`${colors.yellow}3. Saisie des identifiants...${colors.reset}`);
    await page.type('input[type="email"]', 'jbgerberon@gmail.com');
    await page.type('input[type="password"]', 'Test123!@#');
    
    console.log(`${colors.yellow}4. Tentative de connexion...${colors.reset}`);
    
    // Cliquer sur le bouton et attendre la réponse
    const loginResult = await Promise.race([
      // Essayer de détecter la navigation vers dashboard
      page.waitForFunction(() => {
        return window.location.pathname === '/dashboard' || 
               document.body.textContent.includes('Dashboard') ||
               document.querySelector('[class*="dashboard"]');
      }, { timeout: 10000 }),
      
      // Ou attendre qu'on reste sur login avec message d'erreur/succès
      new Promise((resolve) => {
        setTimeout(() => resolve('TIMEOUT'), 8000);
      })
    ]);
    
    // Cliquer sur connexion
    const submitButton = await page.$('button[type="submit"]') || await page.$('button');
    if (submitButton) {
      await submitButton.click();
    }
    
    // Attendre et analyser le résultat
    await page.waitForTimeout(3000);
    
    console.log(`${colors.yellow}5. Analyse du résultat...${colors.reset}`);
    
    const finalState = await page.evaluate(() => {
      return {
        currentPath: window.location.pathname,
        currentUrl: window.location.href,
        isDashboard: window.location.pathname === '/dashboard' || 
                    document.body.textContent.includes('Dashboard Admin') ||
                    document.querySelector('[class*="dashboard"]'),
        isStillOnLogin: !!document.querySelector('input[type="email"]'),
        hasSuccessMessage: document.body.textContent.includes('réussie') || 
                          document.body.textContent.includes('succès'),
        hasErrorMessage: document.body.textContent.includes('erreur') || 
                        document.body.textContent.includes('Erreur'),
        pageTitle: document.title,
        bodyText: document.body.innerText.substring(0, 300)
      };
    });
    
    console.log(`${colors.cyan}État final:${colors.reset}`);
    console.log(`  URL: ${finalState.currentUrl}`);
    console.log(`  Path: ${finalState.currentPath}`);
    console.log(`  Dashboard: ${finalState.isDashboard ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
    console.log(`  Encore sur login: ${finalState.isStillOnLogin ? colors.red + '✓' : colors.green + '✗'}${colors.reset}`);
    console.log(`  Message succès: ${finalState.hasSuccessMessage ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
    console.log(`  Message erreur: ${finalState.hasErrorMessage ? colors.red + '✓' : colors.green + '✗'}${colors.reset}`);
    
    // Évaluer le succès
    const redirectWorked = finalState.isDashboard && !finalState.isStillOnLogin;
    const connectionWorked = finalState.hasSuccessMessage && !finalState.hasErrorMessage;
    
    if (redirectWorked) {
      console.log(`\n${colors.green}✅ SUCCÈS: Redirection vers dashboard fonctionne !${colors.reset}`);
      testPassed = true;
    } else if (connectionWorked && finalState.isStillOnLogin) {
      console.log(`\n${colors.red}❌ PROBLÈME: Connexion réussie mais pas de redirection${colors.reset}`);
    } else if (finalState.hasErrorMessage) {
      console.log(`\n${colors.red}❌ PROBLÈME: Erreur de connexion${colors.reset}`);
    } else {
      console.log(`\n${colors.red}❌ PROBLÈME: État indéterminé${colors.reset}`);
    }
    
    console.log(`\n${colors.cyan}Logs d'authentification (derniers 10):${colors.reset}`);
    authLogs.slice(-10).forEach(log => {
      console.log(`  ${log}`);
    });
    
    if (!testPassed) {
      console.log(`\n${colors.yellow}🔍 Debug supplémentaire:${colors.reset}`);
      const debugInfo = await page.evaluate(() => {
        return {
          authGlobals: {
            supabaseClient: !!window.__effizen_supabase_client__,
            globalCheckInProgress: window.globalCheckInProgress
          },
          storage: {
            localStorage: Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('auth')),
            sessionStorage: Object.keys(sessionStorage).filter(k => k.includes('auth') || k.includes('redirect'))
          }
        };
      });
      
      console.log(`  Debug:`, JSON.stringify(debugInfo, null, 2));
    }
    
  } catch (error) {
    console.error(`${colors.red}Erreur test:${colors.reset}`, error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  return testPassed;
}

// Exécution avec rapport final
testRedirectFix()
  .then(success => {
    if (success) {
      console.log(`\n${colors.green}🎉 TEST VALIDÉ: La correction fonctionne !${colors.reset}`);
      console.log(`${colors.cyan}Vous pouvez tester manuellement en toute confiance.${colors.reset}`);
    } else {
      console.log(`\n${colors.red}❌ TEST ÉCHOUÉ: La correction ne fonctionne pas${colors.reset}`);
      console.log(`${colors.yellow}Ne testez PAS manuellement, il faut corriger le code d'abord.${colors.reset}`);
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(`${colors.red}Erreur fatale:${colors.reset}`, error);
    process.exit(1);
  });