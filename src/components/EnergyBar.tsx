import React from 'react';
import { Battery, BatteryCharging, BatteryFull } from 'lucide-react';

interface EnergyBarProps {
  energy: number; // 0-100
  showIcon?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const EnergyBar: React.FC<EnergyBarProps> = ({
  energy,
  showIcon = true,
  showPercentage = true,
  size = 'md',
  className = '',
}) => {
  const getEnergyColor = (level: number) => {
    if (level >= 80) return 'from-lime-green to-green-400';
    if (level >= 60) return 'from-green-400 to-yellow-400';
    if (level >= 40) return 'from-yellow-400 to-orange-400';
    if (level >= 20) return 'from-orange-400 to-red-400';
    return 'from-red-400 to-red-600';
  };

  const getEnergyIcon = (level: number) => {
    if (level >= 80) return <BatteryFull size={20} className="text-lime-green" />;
    if (level >= 40) return <Battery size={20} className="text-yellow-500" />;
    return <BatteryCharging size={20} className="text-red-500" />;
  };

  const getEnergyText = (level: number) => {
    if (level >= 80) return 'Énergique';
    if (level >= 60) return 'Bon';
    if (level >= 40) return 'Moyen';
    if (level >= 20) return 'Faible';
    return 'Très faible';
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showIcon && (
        <div className="flex-shrink-0">
          {getEnergyIcon(energy)}
        </div>
      )}
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-dark-blue">
            {getEnergyText(energy)}
          </span>
          {showPercentage && (
            <span className="text-sm text-metallic-gray">
              {Math.round(energy)}%
            </span>
          )}
        </div>
        
        <div className={`energy-bar ${sizeClasses[size]}`}>
          <div
            className={`energy-fill ${getEnergyColor(energy)}`}
            style={{ width: `${energy}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default EnergyBar; 