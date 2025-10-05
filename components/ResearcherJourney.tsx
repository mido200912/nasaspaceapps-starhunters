import React, { useState } from 'react';
import { Exoplanet } from '../types';
import { calculateHabitability } from '../utils/habitability';
import { useAppContext } from '../AppContext';

interface ResearcherJourneyProps {
  planets: Exoplanet[];
}

type Tag = 'Habitable' | 'Unlikely';

const ResearcherJourney: React.FC<ResearcherJourneyProps> = ({ planets }) => {
  const [tags, setTags] = useState<Record<number, Tag>>({});
  const [score, setScore] = useState<number | null>(null);
  const { t } = useAppContext();

  const handleTag = (planetId: number, tag: Tag) => {
    setTags((prev) => ({ ...prev, [planetId]: tag }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    planets.forEach((planet) => {
      const userTag = tags[planet.id];
      if (!userTag) return;

      const { isHabitable } = calculateHabitability(planet);
      const correctTag = isHabitable ? 'Habitable' : 'Unlikely';

      if (userTag === correctTag) {
        correctCount++;
      }
    });
    setScore(correctCount);
  };
  
  const totalTagged = Object.keys(tags).length;

  return (
    <div className="w-full h-full flex flex-col p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-300 dark:border-slate-700">
      <h2 className="text-3xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">{t('researcher_title')}</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{t('researcher_subtitle')}</p>
      
      {score !== null ? (
        <div className="text-center p-8 bg-slate-100 dark:bg-slate-900 rounded-lg">
          <h3 className="text-2xl font-bold mb-2">{t('results')}</h3>
          <p className="text-5xl font-bold text-emerald-500 dark:text-emerald-400">{score} / {totalTagged}</p>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t('correct_classifications')}</p>
          <button
            onClick={() => { setScore(null); setTags({}); }}
            className="mt-6 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-bold py-2 px-6 rounded-lg transition-colors"
          >
            {t('try_again')}
          </button>
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-y-auto ltr:pr-2 rtl:pl-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {planets.map((planet) => (
                <div key={planet.id} className={`p-4 rounded-lg border transition-all duration-300 ${tags[planet.id] ? 'bg-slate-100/50 dark:bg-slate-700/50 border-emerald-500/50' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">{planet.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Temp: {planet.equilibrium_temp_K ?? t('na')} K</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Radius: {planet.radius_earth ?? t('na')}x Earth</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Mass: {planet.mass_earth ?? t('na')}x Earth</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleTag(planet.id, 'Habitable')}
                      className={`w-full text-sm py-1 px-2 rounded ${tags[planet.id] === 'Habitable' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-emerald-500/50'}`}
                    >
                      {t('habitable')}
                    </button>
                    <button
                      onClick={() => handleTag(planet.id, 'Unlikely')}
                      className={`w-full text-sm py-1 px-2 rounded ${tags[planet.id] === 'Unlikely' ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-rose-500/50'}`}
                    >
                      {t('unlikely')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={handleSubmit}
              disabled={totalTagged === 0}
              className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-600 dark:text-blue-300 font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('finish_score', { tagged: totalTagged, total: planets.length })}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ResearcherJourney;
