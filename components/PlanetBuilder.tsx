import React, { useState, useMemo } from 'react';
import { calculateHabitability } from '../utils/habitability';
import { useAppContext } from '../AppContext';

const PlanetBuilder: React.FC = () => {
  const { t } = useAppContext();
  const [params, setParams] = useState({
    mass_earth: 1,
    radius_earth: 1,
    equilibrium_temp_K: 288,
  });

  const handleSliderChange = (param: keyof typeof params, value: string) => {
    setParams(prev => ({ ...prev, [param]: parseFloat(value) }));
  };
  
  const { score, isHabitable } = useMemo(() => calculateHabitability(params), [params]);
  
  const scoreColor = score > 75 ? 'text-emerald-500 dark:text-emerald-400' : score > 50 ? 'text-amber-500 dark:text-amber-400' : 'text-rose-500 dark:text-rose-400';
  const habitabilityText = isHabitable ? t('potentially_habitable') : t('unlikely_habitable');

  const Slider: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }> = ({ label, value, min, max, step, unit, onChange }) => (
    <div className="mb-4">
      <label className="flex justify-between items-center text-slate-600 dark:text-slate-300 mb-1">
        <span>{label}</span>
        <span className="font-mono text-slate-800 dark:text-white bg-slate-200 dark:bg-slate-900 px-2 py-0.5 rounded text-sm">{value} {unit}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
        style={{accentColor: 'rgb(168 85 247)'}} // For slider thumb color
      />
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-8 p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-300 dark:border-slate-700">
      <div className="md:w-1/2 flex flex-col">
        <h2 className="text-3xl font-bold mb-4 text-violet-600 dark:text-violet-400">{t('builder_title')}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{t('builder_subtitle')}</p>
        <Slider 
          label={t('mass')} 
          unit="x Earth"
          value={params.mass_earth} 
          min={0.1} max={10} step={0.1} 
          onChange={(e) => handleSliderChange('mass_earth', e.target.value)} />
        <Slider
          label={t('radius')}
          unit="x Earth"
          value={params.radius_earth}
          min={0.1} max={5} step={0.1}
          onChange={(e) => handleSliderChange('radius_earth', e.target.value)} />
        <Slider
          label={t('temperature')}
          unit="K"
          value={params.equilibrium_temp_K}
          min={50} max={500} step={1}
          onChange={(e) => handleSliderChange('equilibrium_temp_K', e.target.value)} />
      </div>
      <div className="md:w-1/2 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900/50 p-6 rounded-lg">
        <h3 className="text-xl text-slate-500 dark:text-slate-400 mb-2">{t('habitability_score')}</h3>
        <p className={`text-7xl font-bold ${scoreColor}`}>{score}</p>
        <p className="text-lg text-slate-600 dark:text-slate-300 mt-2">{habitabilityText}</p>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 mt-6">
            <div className="bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 h-4 rounded-full" style={{ width: `${score}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default PlanetBuilder;
