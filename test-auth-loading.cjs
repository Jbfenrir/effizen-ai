const puppeteer = require('puppeteer');

async function testAuthLoading() {
  console.log('🧪 Démarrage des tests de chargement et authentification...\n');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Collecter les logs de la console
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('useAuth') || text.includes('AppRouter') || text.includes('Loading')) {
        consoleLogs.push(text);
      }
    });
    
    // Test 1: Accès initial à l'application
    console.log('📝 Test 1: Accès initial à localhost:3002');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2', timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Vérifier si on est sur la page de login ou si on reste en chargement
    const isLoading = await page.evaluate(() => {
      return document.body.textContent.includes('Chargement...');
    });
    
    const hasLoginForm = await page.evaluate(() => {
      return document.body.textContent.includes('Connexion à votre espace de bien-être') ||
             document.querySelector('input[type="email"]') !== null;
    });
    
    const hasEmergencyButton = await page.evaluate(() => {
      return document.body.textContent.includes('Forcer la connexion');
    });
    
    console.log(`  ✓ Page de chargement visible: ${isLoading}`);
    console.log(`  ✓ Formulaire de connexion visible: ${hasLoginForm}`);
    console.log(`  ✓ Bouton d'urgence visible: ${hasEmergencyButton}`);
    
    if (isLoading && !hasLoginForm) {
      console.log('  ⚠️ ATTENTION: Toujours en chargement après 2 secondes');
      
      // Attendre encore 2 secondes pour voir si le bouton d'urgence apparaît
      await page.waitForTimeout(2000);
      const hasEmergencyButtonAfter4s = await page.evaluate(() => {
        return document.body.textContent.includes('Forcer la connexion');
      });
      console.log(`  ✓ Bouton d'urgence après 4 secondes: ${hasEmergencyButtonAfter4s}`);
    }
    
    // Test 2: Tester avec une session existante (simulation)
    console.log('\n📝 Test 2: Test avec session simulée');
    await page.evaluate(() => {
      localStorage.setItem('sb-qzvrkcmwzdaffpknuozl-auth-token', JSON.stringify({
        access_token: 'fake-token',
        refresh_token: 'fake-refresh',
        expires_at: Date.now() + 3600000
      }));
    });
    
    await page.reload({ waitUntil: 'networkidle2', timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const isLoadingAfterReload = await page.evaluate(() => {
      return document.body.textContent.includes('Chargement...');
    });
    
    console.log(`  ✓ Chargement après reload avec token: ${isLoadingAfterReload}`);
    
    // Test 3: Nettoyage et vérification finale
    console.log('\n📝 Test 3: Nettoyage et vérification finale');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2', timeout: 10000 });
    await page.waitForTimeout(1000);
    
    const finalCheck = await page.evaluate(() => {
      const loading = document.body.textContent.includes('Chargement...');
      const login = document.body.textContent.includes('Connexion') || document.querySelector('input[type="email"]');
      return { loading, hasLogin: !!login };
    });
    
    console.log(`  ✓ État final - Chargement: ${finalCheck.loading}, Login: ${finalCheck.hasLogin}`);
    
    // Afficher quelques logs de la console
    console.log('\n📊 Logs console pertinents:');
    consoleLogs.slice(-5).forEach(log => console.log(`  ${log}`));
    
    // Résultat final
    console.log('\n✅ Tests terminés');
    if (!finalCheck.loading && finalCheck.hasLogin) {
      console.log('✅ SUCCÈS: L\'application ne reste pas bloquée en chargement');
    } else if (finalCheck.loading) {
      console.log('❌ ÉCHEC: L\'application reste bloquée en chargement');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  } finally {
    await browser.close();
  }
}

// Vérifier si puppeteer est installé
try {
  require.resolve('puppeteer');
  testAuthLoading();
} catch(e) {
  console.log('⚠️ Puppeteer n\'est pas installé. Installation...');
  console.log('Exécutez: npm install puppeteer');
  console.log('Puis relancez ce script avec: node test-auth-loading.js');
}