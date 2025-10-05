import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import type { PlanetData, CustomPlanetDetails } from './types';
import { GameState } from './types';
import {
  generateInitialPlanets,
  generateAlienDescription,
  generateCustomPlanetDescription,
} from './services/geminiService';
import { translations } from './translations';
import StarfieldBackground from './components/StarfieldBackground';
import RobotAssistant from './components/RobotAssistant';

// ---------------- PlanetVisuals ----------------
const PlanetVisuals: React.FC<{ pattern: PlanetData['pattern']; detailColor: string; isTerrestrial?: boolean; hasIslands?: boolean; }> = ({ pattern, detailColor, isTerrestrial, hasIslands }) => {
  switch (pattern) {
    case 'swirls':
      return (
        <>
          <div className={`absolute w-3/4 h-3/4 ${detailColor} rounded-full filter blur-xl opacity-50 animate-pulse`}></div>
          <div className="absolute w-1/2 h-1/2 bg-white/30 rounded-full filter blur-lg opacity-50 animate-spin-slow"></div>
        </>
      );
    case 'spots':
      return (
        <>
          <div className={`absolute w-1/4 h-1/4 ${detailColor} rounded-full top-1/4 left-1/5 opacity-80`}></div>
          <div className={`absolute w-1/5 h-1/5 ${detailColor} rounded-full bottom-1/4 right-1/5 opacity-80`}></div>
          <div className={`absolute w-1/6 h-1/6 ${detailColor} rounded-full bottom-1/2 right-1/2 opacity-80`}></div>
        </>
      );
    case 'stripes':
      return (
        <>
          <div className={`absolute w-full h-1/4 top-[15%] ${detailColor} opacity-50 filter blur-sm`}></div>
          <div className={`absolute w-full h-1/4 top-[60%] ${detailColor} opacity-50 filter blur-sm`}></div>
        </>
      );
    default:
      return (
        <>
          {isTerrestrial && hasIslands && (
            <>
              <div className="absolute w-10 h-6 bg-green-700 rounded-full top-1/4 left-1/4 opacity-90 transform rotate-6"></div>
              <div className="absolute w-14 h-8 bg-yellow-600 rounded-full bottom-1/4 right-1/3 opacity-90 transform -rotate-6"></div>
              <div className="absolute w-8 h-5 bg-green-600 rounded-full top-1/2 left-3/4 opacity-85 transform rotate-3"></div>
            </>
          )}
        </>
      );
  }
};

// ---------------- Moons helper (used in preview) ----------------
const MoonsOrbit: React.FC<{ count: number }> = ({ count }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const radius = 32 + i * 18; // px
        const size = Math.max(6, 12 - i * 1.2);
        const duration = 6 + i * 2;
        const styleOuter: React.CSSProperties = {
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          top: `calc(50% - ${radius}px)`,
          left: `calc(50% - ${radius}px)`,
          position: 'absolute' as const,
          pointerEvents: 'none',
        };
        const styleMoon: React.CSSProperties = {
          width: `${size}px`,
          height: `${size}px`,
          top: `50%`,
          left: `calc(50% + ${radius}px)`,
          transform: `translate(-50%,-50%)`,
          animation: `orbit ${duration}s linear infinite`,
          background: 'rgba(230,230,230,0.95)',
          boxShadow: '0 0 6px rgba(255,255,255,0.08)',
          borderRadius: '999px',
          position: 'absolute' as const,
        };
        return (
          <div key={i} style={styleOuter}>
            <div style={styleMoon} />
          </div>
        );
      })}
    </>
  );
};

// ---------------- PreviewPlanet used in Create Planet UI ----------------
const PreviewPlanet: React.FC<{
  name: string;
  color: string;
  size: 'small' | 'medium' | 'large';
  pattern: PlanetData['pattern'];
  detailColor: string;
  isGas?: boolean;
  moonsCount?: number;
  hasRings?: boolean;
  hasIslands?: boolean;
}> = ({ name, color, size, pattern, detailColor, isGas, moonsCount = 0, hasRings, hasIslands }) => {
  const sizeClasses = { small: 'w-28 h-28', medium: 'w-40 h-40', large: 'w-52 h-52' } as const;
  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      {/* rings if any */}
      {hasRings && (
        <>
          <div className={`absolute inset-[-14%] border-2 ${detailColor.replace('bg-', 'border-')} rounded-full transform rotate-[-25deg] scale-x-150 z-0 opacity-70`}></div>
          <div className={`absolute inset-[-24%] border ${detailColor.replace('bg-', 'border-')} rounded-full transform rotate-[-25deg] scale-x-150 z-0 opacity-40`}></div>
        </>
      )}

      <div className={`w-full h-full rounded-full ${color} flex items-center justify-center p-2 overflow-visible relative`}>
        <PlanetVisuals pattern={pattern} detailColor={detailColor} isTerrestrial={!isGas} hasIslands={!!hasIslands} />
        <span className="relative z-10 text-white font-black text-xl drop-shadow-lg">{name}</span>

        {/* moons */}
        {moonsCount && moonsCount > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <MoonsOrbit count={moonsCount} />
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------- Planet component (motion) ----------------
interface PlanetProps {
  planet: PlanetData;
  onClick?: () => void;
}
const Planet: React.FC<PlanetProps> = ({ planet, onClick }) => {
  const sizeClasses = { small: 'w-28 h-28', medium: 'w-40 h-40', large: 'w-52 h-52' } as const;
  const isClickable = !!onClick;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={isClickable ? { scale: 1.08, rotate: 3, y: -6 } : {}}
      transition={{ type: 'spring', stiffness: 180, damping: 16 }}
      className={`relative ${sizeClasses[planet.size]} ${isClickable ? 'cursor-pointer group' : ''}`}
      onClick={onClick}
      aria-label={`Select planet ${planet.name}`}
    >
      {/* Rings */}
      {planet.pattern === 'rings' && (
        <>
          <div className={`absolute inset-[-8%] border-2 ${planet.detailColor.replace('bg-', 'border-')} rounded-full transform rotate-[-25deg] scale-x-150 ${isClickable ? 'transition-transform duration-300 group-hover:scale-110' : ''} z-0 opacity-80`}></div>
          <div className={`absolute inset-[-15%] border-2 ${planet.detailColor.replace('bg-', 'border-')} rounded-full transform rotate-[-25deg] scale-x-150 ${isClickable ? 'transition-transform duration-300 group-hover:scale-110' : ''} z-0 opacity-50`}></div>
        </>
      )}

      {/* Sphere */}
      <motion.div
        className={`w-full h-full rounded-full ${planet.color} ${isClickable ? 'group-hover:shadow-2xl transition-shadow duration-300' : ''} flex items-center justify-center text-center p-2 overflow-hidden relative`}
        whileTap={isClickable ? { scale: 0.98 } : {}}
      >
        <PlanetVisuals pattern={planet.pattern} detailColor={planet.detailColor} isTerrestrial={!planet.isGas} hasIslands={!!planet.hasIslands} />
        <span className="relative z-10 text-white font-black text-xl drop-shadow-lg">{planet.name}</span>
      </motion.div>
    </motion.div>
  );
};

// ---------------- MiniGame ----------------
interface MiniGameProps {
  title: string;
  description: string;
  options: { label: string; value: boolean }[];
  onComplete: (success: boolean) => void;
  planetIsCorrect: boolean;
}
const MiniGame: React.FC<MiniGameProps> = ({ title, description, options, onComplete, planetIsCorrect }) => {
  return (
    <div className="bg-gray-200/50 dark:bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20 text-center max-w-2xl mx-auto">
      <h2 className="text-4xl font-black text-yellow-500 dark:text-yellow-300 mb-2">{title}</h2>
      <p className="text-gray-800 dark:text-white text-xl mb-8">{description}</p>
      <div className="flex justify-center gap-6">
        {options.map(option => (
          <button
            key={option.label}
            onClick={() => onComplete(option.value === planetIsCorrect)}
            className="bg-blue-500 text-white font-bold text-2xl px-10 py-5 rounded-xl shadow-lg hover:bg-blue-400 transform hover:-translate-y-1 transition-all duration-200"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ---------------- QuestionSequence (multiple questions in TEMP phase) ----------------
const QuestionSequence: React.FC<{ planet: PlanetData; onComplete: (finalSuccess: boolean) => void; language: 'ar' | 'en'; translationsFn: (k: string, ...a: any[]) => string }> = ({ planet, onComplete, language, translationsFn }) => {
  const [step, setStep] = useState(0);
  const [accSuccess, setAccSuccess] = useState(true);

  const steps = [
    {
      key: 'temp',
      title: translationsFn('tempGameTitle'),
      desc: translationsFn('tempGameDescription'),
      correct: planet.isTempHabitable ?? false,
      options: [
        { label: translationsFn('habitable'), value: true },
        { label: translationsFn('notHabitable'), value: false },
      ],
    },
    {
      key: 'gravity',
      title: language === 'ar' ? 'اختبار الجاذبية' : 'Gravity check',
      desc: language === 'ar' ? 'هل جاذبية الكوكب مناسبة للبقاء؟ (قيمة متوقعة بين 0.5 و 2.0)' : 'Is the planet gravity suitable for life? (expected range 0.5 - 2.0 g)',
      correct: typeof (planet as any).gravity === 'number' ? ((planet as any).gravity >= 0.5 && (planet as any).gravity <= 2.0) : true,
      options: [
        { label: language === 'ar' ? 'نعم' : 'Yes', value: true },
        { label: language === 'ar' ? 'لا' : 'No', value: false },
      ],
    },
    {
      key: 'atmos',
      title: language === 'ar' ? 'تركيب الغلاف الجوي' : 'Atmosphere composition',
      desc: language === 'ar' ? 'هل يحتوي الغلاف الجوي على اكسيجين كافٍ؟' : 'Does the atmosphere contain sufficient oxygen?',
      correct: (planet as any).atmosphereHasOxygen ?? (planet.hasWaterAndOxygen ?? false),
      options: [
        { label: language === 'ar' ? 'نعم' : 'Yes', value: true },
        { label: language === 'ar' ? 'لا' : 'No', value: false },
      ],
    },
    {
      key: 'life',
      title: language === 'ar' ? 'مؤشرات حياة' : 'Signs of life',
      desc: language === 'ar' ? 'هل هناك علامات لوجود حياة على السطح؟' : 'Are there signs of life on surface?',
      correct: (planet as any).lifePresent ?? false,
      options: [
        { label: language === 'ar' ? 'نعم' : 'Yes', value: true },
        { label: language === 'ar' ? 'لا' : 'No', value: false },
      ],
    },
  ];

  const current = steps[step];

  const handleAnswer = (picked: boolean) => {
    const correct = picked === current.correct;
    setAccSuccess(prev => prev && correct);
    if (step === steps.length - 1) {
      onComplete(accSuccess && correct);
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="bg-gray-200/50 dark:bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20 text-center max-w-2xl mx-auto">
      <h2 className="text-4xl font-black text-yellow-500 dark:text-yellow-300 mb-2">{current.title}</h2>
      <p className="text-gray-800 dark:text-white text-xl mb-8">{current.desc}</p>
      <div className="flex justify-center gap-6">
        {current.options.map(opt => (
          <button key={opt.label} onClick={() => handleAnswer(opt.value)} className="bg-blue-500 text-white font-bold text-2xl px-8 py-4 rounded-xl shadow-lg hover:bg-blue-400 transform hover:-translate-y-1 transition-all duration-200">
            {opt.label}
          </button>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-300">{language === 'ar' ? `سؤال ${step + 1} من ${steps.length}` : `Question ${step + 1} of ${steps.length}`}</div>
    </div>
  );
};

// ---------------- App ----------------
const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.HOME);
  const [robotMessageKey, setRobotMessageKey] = useState('welcome');
  const [planets, setPlanets] = useState<PlanetData[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [gameResults, setGameResults] = useState<{ oxygen: boolean | null; temp: boolean | null }>({ oxygen: null, temp: null });
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [resultDescription, setResultDescription] = useState('');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  const [showConfetti, setShowConfetti] = useState(false);

  // ملاحظة: وسعت نوع customPlanet لإضافة الحقول الجديدة
  const [customPlanet, setCustomPlanet] = useState<CustomPlanetDetails & {
    isGas?: boolean;
    moonsCount?: number;
    hasRings?: boolean;
    hasIslands?: boolean;
  }>({
    name: '',
    color: 'bg-pink-400',
    atmosphere: language === 'ar' ? 'غائم' : 'Cloudy',
    life: language === 'ar' ? 'نباتات غريبة' : 'Strange Plants',
    isGas: false,
    moonsCount: 0,
    hasRings: false,
    hasIslands: false,
  });
  const [createdPlanetDetails, setCreatedPlanetDetails] = useState<typeof customPlanet | null>(null);

  const t = useCallback((key: string, ...args: any[]) => {
    let translation = translations[language][key] || key;
    if (args.length > 0) args.forEach((arg, i) => (translation = translation.replace(`{${i}}`, arg)));
    return translation;
  }, [language]);

  const robotMessage = t(robotMessageKey, selectedPlanet?.name);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // extra planets to append if user wants more variety
  const extraPlanets: PlanetData[] = [
    { name: 'Aurelia', size: 'large', pattern: 'swirls', color: 'bg-indigo-500', detailColor: 'bg-pink-300', hasWaterAndOxygen: true, isTempHabitable: true, moonsCount: 2, patternType: undefined } as any,
    { name: 'Zypher', size: 'medium', pattern: 'stripes', color: 'bg-sky-400', detailColor: 'bg-white', hasWaterAndOxygen: false, isTempHabitable: false, moonsCount: 0 } as any,
    { name: 'Kepleria', size: 'large', pattern: 'spots', color: 'bg-green-500', detailColor: 'bg-white', hasWaterAndOxygen: true, isTempHabitable: false, moonsCount: 1, gravity: 1.1, atmosphereHasOxygen: true, lifePresent: true } as any,
    { name: 'Vortis', size: 'small', pattern: 'swirls', color: 'bg-orange-500', detailColor: 'bg-yellow-200', hasWaterAndOxygen: false, isTempHabitable: false, moonsCount: 3, hasRings: true } as any,
    { name: 'Nerid', size: 'medium', pattern: 'stripes', color: 'bg-purple-600', detailColor: 'bg-white', hasWaterAndOxygen: true, isTempHabitable: true, moonsCount: 4, gravity: 0.9, atmosphereHasOxygen: true } as any,
    { name: 'Talos', size: 'large', pattern: 'rings', color: 'bg-pink-400', detailColor: 'bg-white', hasWaterAndOxygen: false, isTempHabitable: false, moonsCount: 6, hasRings: true } as any,
    { name: 'Ophion', size: 'medium', pattern: 'spots', color: 'bg-yellow-500', detailColor: 'bg-white', hasWaterAndOxygen: false, isTempHabitable: true, moonsCount: 1, gravity: 2.2 } as any,
    { name: 'Elys', size: 'small', pattern: 'none', color: 'bg-teal-500', detailColor: 'bg-white', hasWaterAndOxygen: true, isTempHabitable: true, moonsCount: 0, lifePresent: true } as any,
    { name: 'Cinder', size: 'small', pattern: 'spots', color: 'bg-red-600', detailColor: 'bg-white', hasWaterAndOxygen: false, isTempHabitable: false, moonsCount: 0 } as any,
    { name: 'Saphira', size: 'large', pattern: 'swirls', color: 'bg-blue-600', detailColor: 'bg-white', hasWaterAndOxygen: true, isTempHabitable: true, moonsCount: 2, atmosphereHasOxygen: true } as any,
  ];

  const fetchPlanets = useCallback(async () => {
    setIsLoading(true);
    setRobotMessageKey('findingPlanets');
    try {
      const fetchedPlanets = await generateInitialPlanets(language);
      // merge and dedupe by name
      const merged = [...(fetchedPlanets || []), ...extraPlanets].reduce((acc: PlanetData[], p: any) => {
        if (!acc.find(x => x.name === p.name)) acc.push(p);
        return acc;
      }, []);
      setPlanets(merged as PlanetData[]);
      setGameState(GameState.SELECTION);
      setRobotMessageKey('selectPlanet');
    } catch (e) {
      // fallback to local list
      setPlanets(extraPlanets as PlanetData[]);
      setGameState(GameState.SELECTION);
      setRobotMessageKey('selectPlanet');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const handlePlanetSelect = (planet: PlanetData) => {
    setSelectedPlanet(planet);
    setGameResults({ oxygen: null, temp: null });
    setGameState(GameState.OXYGEN_GAME);
    setRobotMessageKey('checkingOxygen');
  };

  const handleOxygenGameComplete = (success: boolean) => {
    setGameResults(prev => ({ ...prev, oxygen: success }));
    // move to the multi-question sequence (re-using TEMP_GAME slot)
    setGameState(GameState.TEMP_GAME);
    setRobotMessageKey(success ? 'oxygenSuccess' : 'oxygenFail');
  };

  const handleTempGameComplete = async (success: boolean) => {
    const finalResults = { ...gameResults, temp: success };
    setGameResults(finalResults);
    setGameState(GameState.RESULTS);

    const isHabitable = (finalResults.oxygen ?? false) && success;

    setIsLoading(true);
    setRobotMessageKey('analyzingData');
    try {
      // ask the AI for a creative description but also add structured details locally
      const aiDescription = await generateAlienDescription(selectedPlanet!.name, isHabitable, language);

      // build a richer local description
      const localParts: string[] = [];
      if (selectedPlanet) {
        const p: any = selectedPlanet as any;
        localParts.push(`${language === 'ar' ? 'التفاصيل' : 'Details'}:`);
        if (typeof p.gravity === 'number') localParts.push(`${language === 'ar' ? 'الجاذبية' : 'Gravity'}: ${p.gravity} g`);
        if (typeof p.moonsCount === 'number') localParts.push(`${language === 'ar' ? 'عدد الأقمار' : 'Moons'}: ${p.moonsCount}`);
        if (p.hasRings) localParts.push(language === 'ar' ? 'له حلقات' : 'Has rings');
        if (p.atmosphereHasOxygen) localParts.push(language === 'ar' ? 'غلاف جوي يحتوي على أكسجين' : 'Atmosphere contains oxygen');
        if (p.lifePresent) localParts.push(language === 'ar' ? 'دلائل على حياة' : 'Signs of life detected');
      }

      setResultDescription(`${aiDescription}

${localParts.join(' | ')}`);

      if (isHabitable) {
        setScore(prev => prev + 1);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        setRobotMessageKey('planetHabitable');
      } else {
        setRobotMessageKey('planetNotHabitable');
      }
    } catch (e) {
      setRobotMessageKey('errorFetching');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlanet = async () => {
    if (!customPlanet.name) {
      setRobotMessageKey('forgotPlanetName');
      return;
    }
    setIsLoading(true);
    setCreatedPlanetDetails(null);
    setRobotMessageKey('creatingPlanet');
    try {
      const description = await generateCustomPlanetDescription(customPlanet as any, language);
      setResultDescription(description);
      setCreatedPlanetDetails(customPlanet);
      setRobotMessageKey('creationSuccess');
    } catch (e) {
      setRobotMessageKey('errorFetching');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToSelection = () => {
    setGameState(GameState.SELECTION);
    setRobotMessageKey('selectAnotherPlanet');
  };

  const goToCreatePlanet = () => {
    setGameState(GameState.CREATE_PLANET);
    setResultDescription('');
    setCreatedPlanetDetails(null);
    setRobotMessageKey('timeToCreate');
  };

  // renderContent
  const renderContent = () => {
    if (isLoading) return <div className="text-gray-800 dark:text-white text-4xl font-black animate-pulse">{t('loading')}</div>;

    switch (gameState) {
      case GameState.HOME:
        return (
          <div className="text-center">
            <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120 }} className="text-6xl md:text-8xl font-black text-gray-100 mb-4">{t('title')}</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl text-cyan-300 mb-12">{t('subtitle')}</motion.p>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => fetchPlanets()} className="bg-yellow-400 text-gray-900 font-bold text-3xl px-12 py-6 rounded-2xl shadow-lg hover:bg-yellow-300 transform transition-all duration-300">
              {t('startAdventure')}
            </motion.button>
          </div>
        );

      case GameState.SELECTION:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center justify-center gap-16 p-8">
            {planets.map(p => (
              <div key={p.name} className="flex flex-col items-center gap-2">
                <Planet planet={p} onClick={() => handlePlanetSelect(p)} />
                <div className="text-center max-w-[10rem]">
                  <div className="font-bold">{p.name}</div>
                  <div className="text-sm text-gray-300">{(p as any).gravity ? `${language === 'ar' ? 'جاذبية' : 'Gravity'}: ${(p as any).gravity}g` : ''}</div>
                </div>
              </div>
            ))}
          </motion.div>
        );

      case GameState.OXYGEN_GAME:
        return (
          <MiniGame
            title={t('oxygenGameTitle')}
            description={t('oxygenGameDescription')}
            options={[{ label: t('yes'), value: true }, { label: t('no'), value: false }]}
            onComplete={handleOxygenGameComplete}
            planetIsCorrect={selectedPlanet!.hasWaterAndOxygen}
          />
        );

      case GameState.TEMP_GAME:
        return (
          // multi-question sequence: temp + gravity + atmosphere + life
          <QuestionSequence planet={selectedPlanet!} onComplete={handleTempGameComplete} language={language} translationsFn={t} />
        );

      case GameState.RESULTS: {
        const isHabitable = (gameResults.oxygen ?? false) && (gameResults.temp ?? false);
        return (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-lg border-white/10 text-center max-w-3xl mx-auto">
            <h2 className="text-5xl font-black text-yellow-300 mb-4">{t('resultsTitle', selectedPlanet?.name)}</h2>
            <div className={`text-3xl font-bold mb-6 ${isHabitable ? 'text-green-400' : 'text-red-400'}`}>
              {isHabitable ? t('habitableResult') : t('notHabitableResult')}
            </div>
            <p className="text-gray-200 text-xl min-h-[120px] text-left whitespace-pre-wrap">{resultDescription}</p>

            <div className="flex justify-center gap-4 mt-8">
              <motion.button whileHover={{ y: -4 }} onClick={resetToSelection} className="bg-blue-500 text-white font-bold text-xl px-8 py-4 rounded-xl shadow-lg hover:bg-blue-400 transform transition-all duration-200">{t('exploreAnother')}</motion.button>
              <motion.button whileHover={{ y: -4 }} onClick={goToCreatePlanet} className="bg-purple-500 text-white font-bold text-xl px-8 py-4 rounded-xl shadow-lg hover:bg-purple-400 transform transition-all duration-200">{t('createYourOwn')}</motion.button>
            </div>
          </motion.div>
        );
      }

      case GameState.CREATE_PLANET: {
        const colors = ['bg-pink-400', 'bg-green-500', 'bg-sky-400', 'bg-orange-500', 'bg-indigo-500'];
        const atmospheres = language === 'ar' ? ['غائم', 'صافي', 'عاصف', 'ضبابي'] : ['Cloudy', 'Clear', 'Stormy', 'Misty'];
        const lifeForms = language === 'ar' ? ['نباتات غريبة', 'مخلوقات لطيفة', 'لا شيء'] : ['Strange Plants', 'Cute Creatures', 'Nothing'];

        // bilingual labels
        const lblGas = language === 'ar' ? 'غازي' : 'Gaseous';
        const lblTerrestrial = language === 'ar' ? 'أرضي' : 'Terrestrial';
        const lblMoons = language === 'ar' ? 'كم عدد الأقمار؟' : 'How many moons?';
        const lblRings = language === 'ar' ? 'حلقات مثل زحل' : 'Has rings (like Saturn)';
        const lblIslands = language === 'ar' ? '(لو أرضي) أظهر جزر' : '(If terrestrial) show islands';
        const lblPreview = language === 'ar' ? 'معاينة الكوكب' : 'Planet preview';

        return (
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-lg border-white/10 max-w-4xl mx-auto text-gray-100">
            <h2 className="text-5xl font-black text-yellow-300 mb-6 text-center">{t('planetWorkshop')}</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="font-bold text-xl">{t('planetName')}:</label>
                  <input type="text" value={customPlanet.name} onChange={e => setCustomPlanet({...customPlanet, name: e.target.value})} className="w-full mt-2 p-3 rounded-lg bg-white/5 text-gray-100 border border-purple-700 outline-none" />
                </div>

                <div>
                  <label className="font-bold text-xl">{t('planetColor')}:</label>
                  <div className="flex gap-3 mt-2">
                    {colors.map(color => (
                      <div key={color} onClick={() => setCustomPlanet({...customPlanet, color})} className={`w-12 h-12 rounded-full cursor-pointer ${color} ${customPlanet.color === color ? 'ring-4 ring-offset-2 ring-offset-transparent ring-yellow-300' : ''}`}></div>
                    ))}
                  </div>
                </div>

                {/* Gas / Terrestrial */}
                <div>
                  <label className="font-bold text-xl block mb-2">{language === 'ar' ? 'غازي أم أرضي؟' : 'Gaseous or terrestrial?'}</label>
                  <div className="flex gap-3">
                    <button onClick={() => setCustomPlanet({...customPlanet, isGas: false})} className={`px-4 py-2 rounded ${customPlanet.isGas ? 'bg-gray-700' : 'bg-green-600 text-white'}`}>{lblTerrestrial}</button>
                    <button onClick={() => setCustomPlanet({...customPlanet, isGas: true})} className={`px-4 py-2 rounded ${customPlanet.isGas ? 'bg-indigo-600 text-white' : 'bg-gray-700'}`}>{lblGas}</button>
                  </div>
                </div>

                {/* Moons */}
                <div>
                  <label className="font-bold text-xl block mb-2">{lblMoons}</label>
                  <input type="range" min={0} max={8} value={customPlanet.moonsCount ?? 0} onChange={e => setCustomPlanet({...customPlanet, moonsCount: Number(e.target.value)})} className="w-full" />
                  <div className="text-sm mt-1">{language === 'ar' ? 'أقمار: ' : 'Moons: '}{customPlanet.moonsCount ?? 0}</div>
                </div>

                {/* Rings & Islands */}
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!customPlanet.hasRings} onChange={e => setCustomPlanet({...customPlanet, hasRings: e.target.checked})} />
                    {lblRings}
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!customPlanet.hasIslands} onChange={e => setCustomPlanet({...customPlanet, hasIslands: e.target.checked})} disabled={!!customPlanet.isGas} />
                    {lblIslands}
                  </label>
                </div>

              </div>

              <div className="space-y-4 flex flex-col items-center">
                <label className="font-bold text-xl self-start">{lblPreview}</label>
                <div className="p-6 bg-white/3 rounded-xl shadow-inner">
                  <PreviewPlanet
                    name={customPlanet.name || t('previewName', language === 'ar' ? 'كوكبك' : 'Your planet')}
                    color={customPlanet.color}
                    size="medium"
                    pattern="none"
                    detailColor="bg-white"
                    isGas={customPlanet.isGas}
                    moonsCount={customPlanet.moonsCount ?? 0}
                    hasRings={!!customPlanet.hasRings}
                    hasIslands={!!customPlanet.hasIslands}
                  />
                </div>

                {/* Atmosphere buttons */}
                <div className="w-full">
                  <label className="font-bold text-xl">{t('planetAtmosphere')}:</label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {atmospheres.map((a) => {
                      const isSelected = customPlanet.atmosphere === a;
                      const isClear = a === (language === 'ar' ? 'صافي' : 'Clear');
                      const isCloudy = a === (language === 'ar' ? 'غائم' : 'Cloudy');
                      const isStormy = a === (language === 'ar' ? 'عاصف' : 'Stormy');
                      const isMisty = a === (language === 'ar' ? 'ضبابي' : 'Misty');

                      const baseClass = isClear ? 'bg-cyan-400 text-gray-900' :
                                        isCloudy ? 'bg-sky-600 text-white' :
                                        isStormy ? 'bg-indigo-700 text-white' :
                                        isMisty ? 'bg-teal-600 text-white' :
                                        'bg-gray-600 text-white';

                      return (
                        <button
                          key={a}
                          onClick={() => setCustomPlanet({ ...customPlanet, atmosphere: a })}
                          className={`px-4 py-2 rounded-full font-semibold transition transform ${baseClass} ${isSelected ? 'ring-4 ring-offset-2 ring-yellow-300 scale-105' : 'hover:scale-105 hover:brightness-110'}`}
                          aria-pressed={isSelected}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Life buttons */}
                <div className="w-full">
                  <label className="font-bold text-xl">{t('planetLife')}:</label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {lifeForms.map((l) => {
                      const isSelected = customPlanet.life === l;
                      const isPlant = l === (language === 'ar' ? 'نباتات غريبة' : 'Strange Plants');
                      const isCreature = l === (language === 'ar' ? 'مخلوقات لطيفة' : 'Cute Creatures');
                      const baseClass = isPlant ? 'bg-green-600 text-white' : isCreature ? 'bg-pink-600 text-white' : 'bg-gray-600 text-white';

                      return (
                        <button
                          key={l}
                          onClick={() => setCustomPlanet({ ...customPlanet, life: l })}
                          className={`px-4 py-2 rounded-full font-semibold transition transform ${baseClass} ${isSelected ? 'ring-4 ring-offset-2 ring-yellow-300 scale-105' : 'hover:scale-105 hover:brightness-110'}`}
                          aria-pressed={isSelected}
                        >
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <button onClick={handleCreatePlanet} className="bg-green-500 text-white font-black text-2xl px-10 py-5 rounded-xl shadow-lg hover:bg-green-400 transform hover:-translate-y-1 transition-all duration-200">
                {t('createButton')}
              </button>
            </div>

            {createdPlanetDetails && resultDescription && (
              <div className="mt-8 p-4 bg-white/6 rounded-lg border border-purple-700 flex flex-col items-center gap-4">
                <PreviewPlanet
                  name={createdPlanetDetails.name}
                  color={createdPlanetDetails.color}
                  size="medium"
                  pattern="none"
                  detailColor="bg-white"
                  isGas={createdPlanetDetails.isGas}
                  moonsCount={createdPlanetDetails.moonsCount ?? 0}
                  hasRings={!!createdPlanetDetails.hasRings}
                  hasIslands={!!createdPlanetDetails.hasIslands}
                />
                <div>
                  <h3 className="text-2xl font-bold text-yellow-300">{t('yourPlanetDescription')}:</h3>
                  <p className="text-lg mt-2 text-gray-200">{resultDescription}</p>
                </div>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  // window size for confetti
  const [winSize, setWinSize] = useState({ width: 800, height: 600 });
  useEffect(() => {
    const update = () => setWinSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500`}>
      <StarfieldBackground theme="dark" />

      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1.05 }} transition={{ duration: 6, yoyo: Infinity }} className="absolute -z-20 w-[700px] h-[700px] bg-gradient-to-br from-purple-800/60 via-indigo-700/40 to-transparent rounded-full blur-3xl top-8 left-12"></motion.div>
      <motion.div initial={{ scale: 1.02 }} animate={{ scale: 0.98 }} transition={{ duration: 8, yoyo: Infinity }} className="absolute -z-20 w-[500px] h-[500px] bg-gradient-to-br from-blue-800/40 via-fuchsia-700/30 to-transparent rounded-full blur-3xl bottom-10 right-10"></motion.div>

      <div className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} z-20 flex gap-2`}>
        <button onClick={() => setLanguage(lang => lang === 'ar' ? 'en' : 'ar')} className="bg-purple-700 hover:bg-purple-600 text-yellow-200 font-bold px-4 py-2 rounded-full text-sm shadow-lg border-2 border-yellow-300 transition">{language === 'ar' ? 'EN' : 'AR'}</button>
      </div>

      <div className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} bg-yellow-400 text-purple-900 font-bold px-4 py-2 rounded-full flex items-center gap-2 text-xl shadow-lg border-2 border-purple-700`}>
        <span>⭐</span>
        <span>{t('score')}: {score}</span>
      </div>

      <main className="z-10 w-full max-w-6xl">
        {renderContent()}
      </main>

      {showConfetti && <Confetti width={winSize.width} height={winSize.height} recycle={false} />}

      <RobotAssistant message={robotMessage} />
    </div>
  );
};

export default App;
