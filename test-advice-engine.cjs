const axios = require('axios');

async function testAdviceEngine() {
    console.log('🧪 Test du moteur de conseils...');
    
    // Test que la page de test est accessible
    try {
        const response = await axios.get('http://localhost:3003/test-advice', {
            timeout: 5000
        });
        
        if (response.status === 200) {
            console.log('✅ Page de test accessible sur http://localhost:3003/test-advice');
            console.log('📄 Contenu reçu:', response.data.length, 'caractères');
            
            // Vérifier que le composant AdviceEngineTest est présent
            if (response.data.includes('Test du Moteur de Conseils')) {
                console.log('✅ Composant AdviceEngineTest détecté');
            } else {
                console.log('❌ Composant AdviceEngineTest non détecté');
            }
            
            // Vérifier que les boutons de test sont présents
            if (response.data.includes('Test Burnout') && response.data.includes('Test Isolation')) {
                console.log('✅ Interface de test complète détectée');
                console.log('🎯 Le système est prêt pour les tests utilisateur');
                console.log('');
                console.log('📋 INSTRUCTIONS UTILISATEUR:');
                console.log('1. Ouvrir http://localhost:3003/test-advice');
                console.log('2. Cliquer sur "Test Burnout", "Test Isolation" ou "Test Équilibré"');
                console.log('3. Observer les résultats d\'analyse et les conseils générés');
                console.log('');
                return true;
            } else {
                console.log('❌ Interface de test incomplète');
                return false;
            }
        }
    } catch (error) {
        console.log('❌ Erreur lors du test:', error.message);
        return false;
    }
}

testAdviceEngine();