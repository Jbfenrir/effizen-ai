import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle, Info, Download, Calendar } from 'lucide-react';
import { DataIntegrityChecker } from '../utils/dataIntegrityChecker';
import type { DailyEntry } from '../types';

interface IntegrityReport {
  totalDays: number;
  missingDays: string[];
  weekendsMissing: string[];
  recentMissing: string[];
  lastEntry: string | null;
  daysSinceLastEntry: number;
  recommendations: string[];
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    date?: string;
  }>;
}

interface DataIntegrityAlertProps {
  className?: string;
}

const DataIntegrityAlert: React.FC<DataIntegrityAlertProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // Charger le rapport d'intégrité
  useEffect(() => {
    const loadIntegrityReport = async () => {
      try {
        setLoading(true);
        const integrityReport = await DataIntegrityChecker.checkDataIntegrity();
        setReport(integrityReport);
      } catch (error) {
        console.error('Erreur chargement rapport intégrité:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIntegrityReport();
  }, []);

  // Télécharger backup
  const handleDownloadBackup = async () => {
    await DataIntegrityChecker.downloadBackup();
  };

  if (loading || !report) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="w-32 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  // Déterminer la couleur principale selon la gravité
  const getPrimaryAlert = () => {
    if (report.alerts.some(a => a.type === 'error')) return 'error';
    if (report.alerts.some(a => a.type === 'warning')) return 'warning';
    return 'info';
  };

  const primaryAlert = getPrimaryAlert();

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`${getBackgroundColor(primaryAlert)} border rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getIcon(primaryAlert)}
          <div>
            <h3 className="font-semibold text-gray-900">
              Intégrité des données ({report.totalDays} entrées)
            </h3>
            <p className="text-sm text-gray-600">
              {report.lastEntry ? `Dernière saisie: ${report.lastEntry}` : 'Aucune donnée'}
              {report.daysSinceLastEntry > 0 && ` (il y a ${report.daysSinceLastEntry} jour${report.daysSinceLastEntry > 1 ? 's' : ''})`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadBackup}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Télécharger sauvegarde CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {expanded ? 'Réduire' : 'Détails'}
          </button>
        </div>
      </div>

      {/* Alertes principales */}
      <div className="mt-3 space-y-1">
        {report.alerts.slice(0, expanded ? report.alerts.length : 1).map((alert, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            {getIcon(alert.type)}
            <span className="text-gray-800">
              {alert.message}
              {alert.date && <span className="text-gray-500 ml-1">({alert.date})</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Détails étendus */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Jours manquants récents */}
          {report.recentMissing.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                Jours récents manquants:
              </h4>
              <div className="flex flex-wrap gap-1">
                {report.recentMissing.map(date => (
                  <span
                    key={date}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                  >
                    {date}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="font-semibold text-lg text-blue-600">{report.totalDays}</div>
              <div className="text-gray-600">Entrées</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="font-semibold text-lg text-red-600">{report.missingDays.length}</div>
              <div className="text-gray-600">Manquants</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="font-semibold text-lg text-yellow-600">{report.recentMissing.length}</div>
              <div className="text-gray-600">Récents</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="font-semibold text-lg text-gray-600">{report.daysSinceLastEntry}</div>
              <div className="text-gray-600">Jours</div>
            </div>
          </div>

          {/* Recommandations */}
          {report.recommendations.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Recommandations:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {report.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tous les jours manquants (si beaucoup) */}
          {report.missingDays.length > 5 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                Tous les jours manquants ({report.missingDays.length}):
              </h4>
              <div className="max-h-20 overflow-y-auto bg-white p-2 rounded border text-xs">
                <div className="flex flex-wrap gap-1">
                  {report.missingDays.map(date => (
                    <span key={date} className="text-gray-600">{date}</span>
                  )).reduce((prev: React.ReactNode[], curr, index) => [
                    ...prev,
                    index > 0 && ', ',
                    curr
                  ], [])}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataIntegrityAlert;