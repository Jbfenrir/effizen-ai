import React, { useState } from 'react';
import { X, Database, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

interface DataRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fonction pour parser les tâches du format CSV
function parseTask(taskStr: string) {
  const match = taskStr.match(/^(.+?)\s*\((\d+(?:\.\d+)?h?)\)$/);
  if (match) {
    const name = match[1].trim();
    const duration = parseFloat(match[2]);
    
    // Déterminer si c'est une tâche à haute valeur ajoutée
    const highValueKeywords = ['app', 'recherche', 'prep forma', 'forma', 'strategic'];
    const isHighValue = highValueKeywords.some(keyword => 
      name.toLowerCase().includes(keyword)
    );
    
    return { name, duration, isHighValue };
  }
  return null;
}

// Fonction pour calculer les heures de travail
function calculateWorkHours(tasks: any[]) {
  const totalHours = tasks.reduce((sum, task) => sum + task.duration, 0);
  // Répartition approximative matin/après-midi
  const morningHours = Math.min(totalHours * 0.6, 6);
  const afternoonHours = Math.min(totalHours - morningHours, 4.4);
  return { morningHours, afternoonHours };
}

// Données du CSV converties - Structure simplifiée pour insertion directe
const csvData = [
  { date: '2025-08-11', sleep: 8, fatigue: 2, tasks: ['App (1h)', 'Recherche (2h)', 'Veille (3h)', 'Prep Rdv (2h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-08-12', sleep: 7, fatigue: 4, tasks: ['Recherche (3h)', 'Admin (2h)', 'Veille (3h)'], pauses: 0, social: false, sport: 0.5 },
  { date: '2025-08-13', sleep: 8, fatigue: 4, tasks: ['App (2h)', 'Veille (2h)', 'Prep Rdv (1h)', 'Recherche (3h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-08-14', sleep: 0, fatigue: 5, tasks: ['App (1h)', 'Recherche (5h)', 'Prep rdv (0.5h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-08-18', sleep: 8.5, fatigue: 3, tasks: ['Veille (3h)', 'Prep forma (1.5h)', 'Recherche (2.5h)', 'App (1.5h)'], pauses: 1, social: false, sport: 0.5 },
  { date: '2025-08-19', sleep: 8, fatigue: 3, tasks: ['Prep forma (3h)', 'Networking (6h)', 'Transport (1.5h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-08-20', sleep: 7.5, fatigue: 3, tasks: ['Rdv (1h)', 'Mails (1.5h)', 'Prep rdv (2h)', 'Transport (1.5h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-08-22', sleep: 7.5, fatigue: 4, tasks: ['Rdv (2.5h)', 'prep froma (6h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-08-25', sleep: 8.5, fatigue: 5, tasks: ['Recherche (2.5h)', 'Partenariat (0.5h)', 'mails (1h)', 'Admin (0.5h)', 'prep forma (3.5h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-08-26', sleep: 8, fatigue: 5, tasks: ['admin (1h)', 'forma (4.5h)', 'Transport (1.5h)'], pauses: 1, social: false, sport: 0.5 },
  { date: '2025-08-27', sleep: 7.25, fatigue: 4, tasks: ['prep forma (0.5h)', 'app (3h)', 'rdv (1.5h)', 'Admin (2h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-08-28', sleep: 7.5, fatigue: 4, tasks: ['rdv (0.5h)', 'partenariat (4h)', 'App (2h)', 'Networking (4h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-08-29', sleep: 8.5, fatigue: 3, tasks: ['Admin (3.5h)', 'rdv (1h)', 'prep forma (2h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-09-01', sleep: 6.5, fatigue: 3, tasks: ['partenariat (4.5h)', 'app (1h)', 'Mails (1h)', 'Admin (1h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-09-02', sleep: 8.5, fatigue: 3, tasks: ['Transport (2.5h)', 'rdv perso (1h)', 'Networking (4h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-09-03', sleep: 0, fatigue: 3, tasks: ['Rdv (2h)', 'prep forma (7h)', 'Networking (1h)', 'admin (1h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-09-04', sleep: 8, fatigue: 4, tasks: ['prep forma (6h)', 'rdv (2.5h)', 'mails (0.5h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-09-05', sleep: 0, fatigue: 5, tasks: ['Admin (1h)', 'prep forma (7h)', 'rdv (1h)', 'mails (0.5h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-09-08', sleep: 8, fatigue: 5, tasks: ['prep forma (11h)'], pauses: 0, social: false, sport: 0.5 },
  { date: '2025-09-09', sleep: 7, fatigue: 4, tasks: ['forma (7.5h)', 'Transport (2h)'], pauses: 0, social: false, sport: 0.5 },
  { date: '2025-09-10', sleep: 8, fatigue: 4, tasks: ['mails (2h)', 'rdv (0.5h)', 'prep forma (5h)', 'App (1.5h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-09-11', sleep: 6, fatigue: 4, tasks: ['Strategic (4.5h)', 'mails (2h)', 'App (1.5h)'], pauses: 0, social: false, sport: 0.5 },
  { date: '2025-09-12', sleep: 7.5, fatigue: 5, tasks: [], pauses: 1, social: false, sport: 0.5 }
];

const DataRecoveryModal: React.FC<DataRecoveryModalProps> = ({ isOpen, onClose }) => {
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectionResult, setInjectionResult] = useState<{
    success: boolean;
    message: string;
    injectedCount: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleDataInjection = async () => {
    setIsInjecting(true);
    setInjectionResult(null);

    try {
      console.log('🚀 Début injection données historiques...');

      // 1. Récupérer l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Utilisateur non connecté');
      }

      console.log('✅ Utilisateur:', user.email, 'ID:', user.id);

      // 2. Vérifier les données existantes
      const { data: existing, error: fetchError } = await supabase
        .from('daily_entries')
        .select('entry_date')
        .eq('user_id', user.id);

      if (fetchError) {
        throw new Error(`Erreur lecture données existantes: ${fetchError.message}`);
      }

      const existingDates = new Set((existing || []).map(e => e.entry_date));
      console.log(`📊 ${existingDates.size} entrées déjà présentes`);

      // 3. Préparer les données pour insertion (sans IDs personnalisés)
      const dataToInject = csvData
        .filter(item => !existingDates.has(item.date))
        .map(item => {
          // Parser les tâches
          const tasks = item.tasks.map(taskStr => parseTask(taskStr)).filter(t => t !== null);
          const { morningHours, afternoonHours } = calculateWorkHours(tasks);
          
          // Déterminer les heures de conduite si présence de Transport
          const drivingHours = tasks.some(t => t.name.toLowerCase().includes('transport')) ? 
            tasks.find(t => t.name.toLowerCase().includes('transport'))?.duration || 0 : 0;
          
          // Configuration des pauses
          const pauseConfig = {
            morning: item.pauses >= 1,
            noon: item.pauses >= 2,
            afternoon: item.pauses >= 3,
            evening: item.pauses >= 4
          };
          
          // Retourner l'objet sans ID (Supabase génèrera l'UUID automatiquement)
          return {
            user_id: user.id,
            entry_date: item.date,
            sleep: {
              bedTime: "22:00",
              wakeTime: "07:00",
              insomniaDuration: 0,
              duration: item.sleep
            },
            focus: {
              morningHours,
              afternoonHours,
              drivingHours,
              fatigue: item.fatigue
            },
            tasks: tasks,
            wellbeing: {
              meditationsPauses: pauseConfig,
              sportLeisureHours: item.sport,
              socialInteraction: item.social,
              energy: 50 // Valeur par défaut car non présente dans le CSV
            }
          };
        });

      console.log(`📥 ${dataToInject.length} nouvelles entrées à injecter`);

      if (dataToInject.length === 0) {
        setInjectionResult({
          success: true,
          message: 'Toutes les données sont déjà présentes dans Supabase',
          injectedCount: 0
        });
        setIsInjecting(false);
        return;
      }

      // 4. Injection par lots de 5
      let injectedCount = 0;
      const batchSize = 5;

      for (let i = 0; i < dataToInject.length; i += batchSize) {
        const batch = dataToInject.slice(i, i + batchSize);
        console.log(`🔄 Injection lot ${Math.floor(i/batchSize) + 1}/${Math.ceil(dataToInject.length/batchSize)}: ${batch.length} entrées`);

        const { error } = await supabase
          .from('daily_entries')
          .insert(batch);

        if (error) {
          console.error(`❌ Erreur lot ${Math.floor(i/batchSize) + 1}:`, error);
          throw new Error(`Erreur injection lot ${Math.floor(i/batchSize) + 1}: ${error.message}`);
        } else {
          injectedCount += batch.length;
          console.log(`✅ Lot ${Math.floor(i/batchSize) + 1} injecté`);
        }

        // Pause entre les lots
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setInjectionResult({
        success: true,
        message: `Injection réussie ! ${injectedCount} entrées ajoutées à Supabase. Vos données sont maintenant centralisées et accessibles depuis n'importe quel navigateur.`,
        injectedCount
      });

      console.log('🎉 INJECTION TERMINÉE:', injectedCount, 'entrées ajoutées');

    } catch (error: any) {
      console.error('❌ Erreur injection:', error);
      setInjectionResult({
        success: false,
        message: `Erreur: ${error.message}`,
        injectedCount: 0
      });
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark-blue flex items-center gap-2">
            <Database className="h-5 w-5" />
            Récupération Données Historiques
          </h2>
          <button
            onClick={onClose}
            className="text-metallic-gray hover:text-dark-blue"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-dark-blue mb-2">📊 Données disponibles</h3>
            <ul className="text-sm text-metallic-gray space-y-1">
              <li>• <strong>23 entrées</strong> du 11 août au 12 septembre 2025</li>
              <li>• Données complètes : sommeil, focus, tâches, bien-être</li>
              <li>• <strong>Synchronisation cloud</strong> : accessible depuis tous vos appareils</li>
              <li>• <strong>Détection automatique</strong> des doublons</li>
            </ul>
          </div>

          {!injectionResult && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-orange-600 mb-2">⚠️ Important</h3>
              <p className="text-sm text-metallic-gray">
                Cette action synchronisera vos données historiques avec Supabase. 
                Une fois synchronisées, elles seront accessibles depuis n'importe quel navigateur 
                ou machine en vous connectant avec votre compte.
              </p>
            </div>
          )}

          {injectionResult && (
            <div className={`p-4 rounded-lg ${injectionResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                {injectionResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <h3 className={`font-medium ${injectionResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {injectionResult.success ? 'Succès !' : 'Erreur'}
                </h3>
              </div>
              <p className="text-sm text-metallic-gray">{injectionResult.message}</p>
              {injectionResult.success && injectionResult.injectedCount > 0 && (
                <p className="text-sm text-green-600 mt-2 font-medium">
                  🔄 Rechargez la page pour voir vos données dans le dashboard !
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleDataInjection}
              disabled={isInjecting || (injectionResult?.success && injectionResult.injectedCount > 0)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                isInjecting
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : injectionResult?.success && injectionResult.injectedCount > 0
                  ? 'bg-green-100 text-green-600 cursor-not-allowed'
                  : 'bg-lime-green text-white hover:bg-green-600'
              }`}
            >
              {isInjecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Injection en cours...
                </>
              ) : injectionResult?.success && injectionResult.injectedCount > 0 ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Injection terminée
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Synchroniser avec Supabase
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="px-4 py-2 border border-light-gray text-metallic-gray rounded-lg hover:bg-gray-50"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataRecoveryModal;