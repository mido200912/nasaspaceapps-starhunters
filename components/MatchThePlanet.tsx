import React, { useState, useMemo, useEffect } from 'react';
import { Exoplanet } from '../types';
import { useAppContext } from '../AppContext';

interface MatchThePlanetProps {
  planets: Exoplanet[];
}

const getExoplanetType = (planet: Exoplanet): string => {
  const { mass_earth, radius_earth, equilibrium_temp_K } = planet;
  if (!mass_earth || !radius_earth || !equilibrium_temp_K) return 'Unknown';

  if (radius_earth > 1.8 && mass_earth > 10) {
    if (radius_earth > 4) {
      if (mass_earth > 40) return 'Gas Giant';
      return 'Ice Giant';
    }
    return 'Ice Giant';
  }
  if (radius_earth < 1.8 && mass_earth < 10) {
      if (equilibrium_temp_K > 250 && equilibrium_temp_K < 350 && mass_earth > 0.5 && mass_earth < 2) return 'Habitable Rocky';
      if (equilibrium_temp_K > 1000) return 'Hot, small, rocky world.';
      return 'Rocky';
  }
  return 'Unknown';
}

const MatchThePlanet: React.FC<MatchThePlanetProps> = ({ planets }) => {
  const { t } = useAppContext();
  const solarSystemAnalogs = useMemo(() => [
    { name: 'Mercury', type: 'Small Rocky', description: 'Hot, small, rocky world.' },
    { name: 'Venus', type: 'Rocky', description: 'Thick atmosphere, very hot.' },
    { name: 'Earth', type: 'Habitable Rocky', description: 'Temperate, water-rich world.' },
    { name: 'Mars', type: 'Rocky', description: 'Cold, thin atmosphere, rocky.' },
    { name: 'Jupiter', type: 'Gas Giant', description: 'Massive gas giant.' },
    { name: 'Saturn', type: 'Gas Giant', description: 'Large gas giant with rings.' },
    { name: 'Uranus', type: 'Ice Giant', description: 'Cold giant made of ices.' },
    { name: 'Neptune', type: 'Ice Giant', description: 'Distant, cold ice giant.' },
  ], []);

  const [gamePlanets, setGamePlanets] = useState<Exoplanet[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null);
  const [selectedAnalog, setSelectedAnalog] = useState<typeof solarSystemAnalogs[0] | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{messageKey: string, isCorrect: boolean} | null>(null);

  const setupGame = () => {
    setGamePlanets([...planets].sort(() => 0.5 - Math.random()).slice(0, 8));
    setScore(0);
    setMatchedPairs([]);
    setSelectedPlanet(null);
    setSelectedAnalog(null);
    setFeedback(null);
  }
  
  useEffect(setupGame, [planets]);


  const checkMatch = (planet: Exoplanet | null, analog: typeof solarSystemAnalogs[0] | null) => {
    if(planet && analog) {
        const planetType = getExoplanetType(planet);
        if(planetType === analog.type || planetType === analog.description) {
            setScore(s => s + 1);
            setMatchedPairs(p => [...p, planet.id]);
            setFeedback({messageKey: "correct_match", isCorrect: true});
        } else {
            setFeedback({messageKey: "incorrect_match", isCorrect: false});
        }
        setSelectedPlanet(null);
        setSelectedAnalog(null);
        setTimeout(() => setFeedback(null), 1500);
    }
  }

  const handleSelectPlanet = (planet: Exoplanet) => {
    if (matchedPairs.includes(planet.id)) return;
    setSelectedPlanet(planet);
    checkMatch(planet, selectedAnalog);
  };
  
  const handleSelectAnalog = (analog: typeof solarSystemAnalogs[0]) => {
    setSelectedAnalog(analog);
    checkMatch(selectedPlanet, analog);
  };
  
  const isFinished = matchedPairs.length > 0 && matchedPairs.length === gamePlanets.length;

  return (
    <div className="w-full h-full flex flex-col p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-300 dark:border-slate-700">
      <h2 className="text-3xl font-bold mb-2 text-rose-600 dark:text-rose-400">{t('match_title')}</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{t('match_subtitle', { score })}</p>
      
      {isFinished ? (
        <div className="text-center p-8 bg-slate-100 dark:bg-slate-900 rounded-lg flex-grow flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-2">{t('congrats')}</h3>
          <p className="text-5xl font-bold text-rose-500 dark:text-rose-400">{score} / {gamePlanets.length}</p>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t('pairs_matched')}</p>
          <button onClick={setupGame} className="mt-6 bg-rose-500/20 hover:bg-rose-500/40 text-rose-600 dark:text-rose-300 font-bold py-2 px-6 rounded-lg transition-colors">{t('play_again')}</button>
        </div>
      ) : (
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-bold mb-3 text-center text-blue-600 dark:text-blue-400">{t('exoplanets')}</h3>
            <div className="grid grid-cols-2 gap-3">
              {gamePlanets.map(planet => {
                const isMatched = matchedPairs.includes(planet.id);
                return (
                  <button 
                    key={planet.id} 
                    onClick={() => handleSelectPlanet(planet)}
                    disabled={isMatched}
                    className={`p-3 rounded-lg border-2 text-left rtl:text-right transition-colors duration-200 ${selectedPlanet?.id === planet.id ? 'bg-blue-500/30 border-blue-400' : 'bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600'} ${isMatched ? 'opacity-30' : 'hover:border-blue-500'}`}
                  >
                    <p className="font-bold text-slate-800 dark:text-white">{planet.name}</p>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3 text-center text-orange-600 dark:text-orange-400">{t('solar_analogs')}</h3>
            <div className="grid grid-cols-2 gap-3">
              {solarSystemAnalogs.map(analog => (
                <button
                  key={analog.name}
                  onClick={() => handleSelectAnalog(analog)}
                  className={`p-3 rounded-lg border-2 text-left rtl:text-right transition-colors duration-200 ${selectedAnalog?.name === analog.name ? 'bg-orange-500/30 border-orange-400' : 'bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:border-orange-500'}`}
                >
                  <p className="font-bold text-slate-800 dark:text-white">{analog.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{analog.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {feedback && (
          <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-white font-bold ${feedback.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            {t(feedback.messageKey)}
          </div>
      )}
    </div>
  );
};

export default MatchThePlanet;
