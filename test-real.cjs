// Test automatisé pour vérifier réellement l'état de l'application
const https = require('https');
const http = require('http');

function testUrl(url, isLocal = false) {
  return new Promise((resolve) => {
    const protocol = isLocal ? http : https;
    
    console.log(`\n🔍 Test de ${url}...`);
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Statut HTTP: ${res.statusCode}`);
        
        // Chercher les éléments clés
        const hasLoading = data.includes('Chargement') || data.includes('Loading');
        const hasForceButton = data.includes('Forcer la connexion');
        const hasBlockedMessage = data.includes('Bloqué sur cette page');
        const hasSpinner = data.includes('animate-spin');
        const hasLogin = data.includes('login') || data.includes('Login');
        const hasDebugState = data.includes('debugState');
        
        console.log('📊 Analyse du contenu:');
        console.log(`  - Page de chargement: ${hasLoading}`);
        console.log(`  - Spinner animé: ${hasSpinner}`);
        console.log(`  - Bouton "Forcer la connexion": ${hasForceButton}`);
        console.log(`  - Message "Bloqué": ${hasBlockedMessage}`);
        console.log(`  - Page de login: ${hasLogin}`);
        console.log(`  - Debug functions: ${hasDebugState}`);
        
        // Afficher un extrait du HTML
        if (hasForceButton) {
          const buttonIndex = data.indexOf('Forcer la connexion');
          console.log('\n📌 Extrait autour du bouton:');
          console.log(data.substring(buttonIndex - 100, buttonIndex + 100));
        } else {
          console.log('\n⚠️ Bouton non trouvé. Premiers 500 caractères:');
          console.log(data.substring(0, 500));
        }
        
        resolve({
          url,
          status: res.statusCode,
          hasButton: hasForceButton,
          hasLoading,
          hasLogin
        });
      });
    }).on('error', (err) => {
      console.error(`❌ Erreur: ${err.message}`);
      resolve({ url, error: err.message });
    });
  });
}

async function runTests() {
  console.log('🚀 Début des tests automatisés\n');
  console.log('=' .repeat(50));
  
  // Test local
  const localResult = await testUrl('http://localhost:3000', true);
  
  // Test production
  const prodResult = await testUrl('https://effizen-ai-prod.vercel.app', false);
  
  console.log('\n' + '=' .repeat(50));
  console.log('📈 RÉSUMÉ DES TESTS:');
  console.log('\nLocal (localhost:3000):');
  console.log(`  - Accessible: ${!localResult.error}`);
  console.log(`  - Bouton urgence présent: ${localResult.hasButton}`);
  
  console.log('\nProduction (Vercel):');
  console.log(`  - Accessible: ${!prodResult.error}`);
  console.log(`  - Bouton urgence présent: ${prodResult.hasButton}`);
  
  if (!localResult.hasButton && !prodResult.hasButton) {
    console.log('\n🔴 PROBLÈME: Le bouton d\'urgence n\'est visible nulle part!');
  } else {
    console.log('\n✅ Le bouton est disponible sur au moins une version');
  }
}

runTests().catch(console.error);