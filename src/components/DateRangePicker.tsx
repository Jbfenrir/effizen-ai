import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from '../utils/dateUtils';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onClose: () => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange, onClose }) => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(format(value.start, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(value.end, 'yyyy-MM-dd'));


  const handleApply = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start <= end) {
        onChange({ start, end });
        onClose();
      }
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-light-gray">
          <h3 className="text-lg font-semibold text-dark-blue flex items-center">
            <Calendar className="mr-2" size={20} />
            Sélectionner la période
          </h3>
          <button
            onClick={onClose}
            className="text-metallic-gray hover:text-dark-blue transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {/* Sélection manuelle */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-blue mb-1">
                Début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-lime-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-blue mb-1">
                Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-lime-green focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 p-4 border-t border-light-gray">
          <button
            onClick={onClose}
            className="px-4 py-2 text-metallic-gray hover:text-dark-blue transition-colors"
          >
            {t('common.cancel') || 'Annuler'}
          </button>
          <button
            onClick={handleApply}
            disabled={!startDate || !endDate || new Date(startDate) > new Date(endDate)}
            className="px-4 py-2 bg-lime-green text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Sélectionner
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;