import React from 'react';
import { GameMode } from '../types';
import { RocketIcon, FlaskIcon, QuizIcon, BuilderIcon, MatchIcon } from '../constants';
import { useAppContext } from '../AppContext';

interface ModeSelectionProps {
  onSelectMode: (mode: GameMode) => void;
}

// FIX: Moved color classes map outside the component for performance and to derive a type from it.
const colorClassesMap = {
    'sky': {
        bg: 'hover:bg-sky-100 dark:hover:bg-sky-500/10',
        border: 'hover:border-sky-400 dark:hover:border-sky-500',
        iconBg: 'bg-sky-100 dark:bg-sky-500/10',
        iconBorder: 'border-sky-200 dark:border-sky-500/20',
        iconText: 'text-sky-600 dark:text-sky-400',
        text: 'text-sky-600 dark:text-sky-400',
    },
    'emerald': {
        bg: 'hover:bg-emerald-100 dark:hover:bg-emerald-500/10',
        border: 'hover:border-emerald-400 dark:hover:border-emerald-500',
        iconBg: 'bg-emerald-100 dark:bg-emerald-500/10',
        iconBorder: 'border-emerald-200 dark:border-emerald-500/20',
        iconText: 'text-emerald-600 dark:text-emerald-400',
        text: 'text-emerald-600 dark:text-emerald-400',
    },
    'amber': {
        bg: 'hover:bg-amber-100 dark:hover:bg-amber-500/10',
        border: 'hover:border-amber-400 dark:hover:border-amber-500',
        iconBg: 'bg-amber-100 dark:bg-amber-500/10',
        iconBorder: 'border-amber-200 dark:border-amber-500/20',
        iconText: 'text-amber-600 dark:text-amber-400',
        text: 'text-amber-600 dark:text-amber-400',
    },
    'violet': {
        bg: 'hover:bg-violet-100 dark:hover:bg-violet-500/10',
        border: 'hover:border-violet-400 dark:hover:border-violet-500',
        iconBg: 'bg-violet-100 dark:bg-violet-500/10',
        iconBorder: 'border-violet-200 dark:border-violet-500/20',
        iconText: 'text-violet-600 dark:text-violet-400',
        text: 'text-violet-600 dark:text-violet-400',
    },
    'rose': {
        bg: 'hover:bg-rose-100 dark:hover:bg-rose-500/10',
        border: 'hover:border-rose-400 dark:hover:border-rose-500',
        iconBg: 'bg-rose-100 dark:bg-rose-500/10',
        iconBorder: 'border-rose-200 dark:border-rose-500/20',
        iconText: 'text-rose-600 dark:text-rose-400',
        text: 'text-rose-600 dark:text-rose-400',
    }
};

// FIX: Created a specific type for the color string literals to ensure type safety.
type Color = keyof typeof colorClassesMap;

const ModeCard: React.FC<{
  titleKey: string;
  descriptionKey: string;
  Icon: React.ElementType;
  color: Color; // FIX: Changed type from `string` to the specific `Color` type.
  onClick: () => void;
}> = ({ titleKey, descriptionKey, Icon, color, onClick }) => {
    const { t, language } = useAppContext();
    const isRTL = language === 'ar';

    // FIX: This now safely looks up the class names based on the type-safe `color` prop,
    // resolving the "Type 'string' is not assignable to type 'never'" error.
    const colorClasses = colorClassesMap[color];

    return (
        <button
          onClick={onClick}
          className={`bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-start transition-all duration-300 transform hover:-translate-y-1 group ${isRTL ? 'text-right' : 'text-left'} ${colorClasses.bg} ${colorClasses.border}`}
        >
          <div className={`p-3 rounded-lg mb-4 border ${colorClasses.iconBg} ${colorClasses.iconBorder}`}>
            <Icon className={`w-8 h-8 ${colorClasses.iconText}`} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">{t(titleKey)}</h3>
          <p className="text-slate-500 dark:text-slate-400 flex-grow">{t(descriptionKey)}</p>
           <span className={`mt-4 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity ${colorClasses.text}`}>
            {t('select_mode')} {isRTL ? t('back_arrow') : t('forward_arrow')}
          </span>
        </button>
    )
}


const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelectMode }) => {
    const { t } = useAppContext();
    const modes = [
      { mode: GameMode.Explorer3D, titleKey: 'explorer_title', descriptionKey: 'explorer_desc', icon: RocketIcon, color: 'sky' },
      { mode: GameMode.ResearcherJourney, titleKey: 'researcher_title', descriptionKey: 'researcher_desc', icon: FlaskIcon, color: 'emerald' },
      { mode: GameMode.ExoQuiz, titleKey: 'quiz_title', descriptionKey: 'quiz_desc', icon: QuizIcon, color: 'amber' },
      { mode: GameMode.PlanetBuilder, titleKey: 'builder_title', descriptionKey: 'builder_desc', icon: BuilderIcon, color: 'violet' },
      { mode: GameMode.MatchThePlanet, titleKey: 'match_title', descriptionKey: 'match_desc', icon: MatchIcon, color: 'rose' },
    ];
  return (
    <div className="w-full flex flex-col items-center">
        <h2 className="text-4xl font-bold mb-4 text-center">{t('welcome_explorer')}</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 max-w-2xl text-center">{t('welcome_subtitle')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {modes.map((m) => (
                <ModeCard 
                    key={m.mode}
                    titleKey={m.titleKey}
                    descriptionKey={m.descriptionKey}
                    Icon={m.icon}
                    color={m.color as Color}
                    onClick={() => onSelectMode(m.mode)}
                />
            ))}
        </div>
    </div>
  );
};

export default ModeSelection;