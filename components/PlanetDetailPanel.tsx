import React from 'react';
import { Exoplanet } from '../types';
import { calculateHabitability } from '../utils/habitability';
import { useAppContext } from '../AppContext';

interface PlanetDetailPanelProps {
  planet: Exoplanet | null;
  onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => (
    <div className="flex justify-between items-baseline py-2 border-b border-slate-200 dark:border-slate-700">
        <span className="text-slate-500 dark:text-slate-400 text-sm">{label}</span>
        <span className="font-semibold text-slate-800 dark:text-white">{value ?? 'N/A'}</span>
    </div>
);


const PlanetDetailPanel: React.FC<PlanetDetailPanelProps> = ({ planet, onClose }) => {
  const { t } = useAppContext();
  if (!planet) return null;

  const { score, isHabitable } = calculateHabitability(planet);
  const scoreColor = isHabitable ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400';

  return (
    <div className="absolute top-0 h-full w-full max-w-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 border-slate-300 dark:border-slate-700 flex flex-col animate-slide-in ltr:right-0 ltr:border-l rtl:left-0 rtl:border-r">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-sky-600 dark:text-sky-400">{planet.name}</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-3xl leading-none">&times;</button>
        </div>
        
        <div className="flex-grow overflow-y-auto ltr:pr-2 rtl:pl-2">
            <DetailItem label={t('discovery_method')} value={planet.discovery_method} />
            <DetailItem label={t('mass_earths')} value={planet.mass_earth} />
            <DetailItem label={t('radius_earths')} value={planet.radius_earth} />
            <DetailItem label={t('temp_k')} value={planet.equilibrium_temp_K} />
            <DetailItem label={t('semi_major_axis')} value={planet.semi_major_axis_AU} />

            <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">{t('habitability_analysis')}</h4>
                <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">{t('score')}</span>
                    <span className={`text-2xl font-bold ${scoreColor}`}>{score}/100</span>
                </div>
                 <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-2">
                    <div className="bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 h-2.5 rounded-full" style={{ width: `${score}%` }}></div>
                </div>
                <p className={`mt-2 text-center font-semibold ${scoreColor}`}>{isHabitable ? t('potentially_habitable') : t('unlikely_habitable')}</p>
            </div>
        </div>

    </div>
  );
};

export default PlanetDetailPanel;
