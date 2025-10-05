import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Exoplanet } from '../types';
import { isEarthLike } from '../utils/habitability';
import { useAppContext } from '../AppContext';

interface ExoQuizProps {
  planets: Exoplanet[];
}

const QUIZ_LENGTH = 10;
const TIME_PER_QUESTION = 10;

const Leaderboard: React.FC<{ scores: { name: string, score: number }[] }> = ({ scores }) => {
  const { t } = useAppContext();
  return (
    <div className="mt-4">
      <h3 className="font-bold text-lg text-center mb-2 text-amber-600 dark:text-amber-400">{t('leaderboard')}</h3>
      <ol className="list-decimal list-inside bg-slate-100 dark:bg-slate-900 p-3 rounded-lg max-h-40 overflow-y-auto">
        {scores.sort((a, b) => b.score - a.score).slice(0, 5).map((s, i) => (
          <li key={i} className="text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-800 dark:text-white">{s.name}</span>: {s.score}</li>
        ))}
      </ol>
    </div>
  );
};

const ExoQuiz: React.FC<ExoQuizProps> = ({ planets }) => {
  const [quizPlanets, setQuizPlanets] = useState<Exoplanet[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ name: string, score: number }[]>([]);
  const [playerName, setPlayerName] = useState('');
  const { t } = useAppContext();

  useEffect(() => {
    const savedScores = localStorage.getItem('exoQuizLeaderboard');
    if (savedScores) {
      setLeaderboard(JSON.parse(savedScores));
    }
  }, []);

  const startQuiz = useCallback(() => {
    const shuffled = [...planets].sort(() => 0.5 - Math.random());
    setQuizPlanets(shuffled.slice(0, QUIZ_LENGTH));
    setCurrentQ(0);
    setScore(0);
    setTimeLeft(TIME_PER_QUESTION);
    setGameState('playing');
    setFeedback(null);
  }, [planets]);

  useEffect(() => {
    if (gameState !== 'playing' || feedback) return;

    if (timeLeft === 0) {
      handleAnswer(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState, feedback]);

  const nextQuestion = useCallback(() => {
    if (currentQ + 1 >= QUIZ_LENGTH) {
      setGameState('finished');
    } else {
      setCurrentQ((q) => q + 1);
      setTimeLeft(TIME_PER_QUESTION);
      setFeedback(null);
    }
  }, [currentQ]);

  const handleAnswer = useCallback((userAnswer: boolean) => {
    if (feedback) return;

    const currentPlanet = quizPlanets[currentQ];
    const correctAnswer = isEarthLike(currentPlanet);

    if (userAnswer === correctAnswer) {
      setScore((s) => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }

    setTimeout(nextQuestion, 1000);
  }, [feedback, quizPlanets, currentQ, nextQuestion]);
  
  const saveScore = () => {
    if(!playerName) return;
    const newScores = [...leaderboard, {name: playerName, score}];
    newScores.sort((a,b) => b.score - a.score);
    setLeaderboard(newScores);
    localStorage.setItem('exoQuizLeaderboard', JSON.stringify(newScores));
    setPlayerName('');
    setGameState('idle');
  }

  const currentPlanet = useMemo(() => quizPlanets[currentQ], [quizPlanets, currentQ]);

  if (gameState === 'idle') {
    return (
      <div className="text-center p-8 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-300 dark:border-slate-700">
        <h2 className="text-3xl font-bold mb-4 text-amber-600 dark:text-amber-400">{t('quiz_title')}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">{t('quiz_subtitle', { seconds: TIME_PER_QUESTION })}</p>
        <button onClick={startQuiz} className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-600 dark:text-amber-300 font-bold py-3 px-8 rounded-lg transition-colors">{t('start_quiz')}</button>
        <Leaderboard scores={leaderboard} />
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="text-center p-8 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-300 dark:border-slate-700">
        <h2 className="text-3xl font-bold mb-4 text-amber-600 dark:text-amber-400">{t('quiz_complete')}</h2>
        <p className="text-5xl font-bold text-slate-800 dark:text-white">{score} / {QUIZ_LENGTH}</p>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{t('final_score')}</p>
        <div className="mt-6 flex flex-col items-center gap-2">
            <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder={t('enter_name')} className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-center" />
            <button onClick={saveScore} disabled={!playerName} className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50">{t('save_score')}</button>
        </div>
        <button onClick={startQuiz} className="mt-4 bg-amber-500/20 hover:bg-amber-500/40 text-amber-600 dark:text-amber-300 font-bold py-2 px-6 rounded-lg transition-colors">{t('play_again')}</button>
        <Leaderboard scores={leaderboard} />
      </div>
    );
  }
  
  const feedbackColor = feedback === 'correct' ? 'border-emerald-500' : feedback === 'incorrect' ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700';

  return (
    <div className={`p-6 bg-white dark:bg-slate-800/50 rounded-lg border-2 ${feedbackColor} transition-colors duration-500`}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{t('question', { current: currentQ + 1, total: QUIZ_LENGTH })}</h2>
            <div className="text-xl font-mono bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-md">{t('score')}: {score}</div>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-4">
            <div className="bg-amber-500 dark:bg-amber-400 h-2.5 rounded-full" style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%`, transition: timeLeft === TIME_PER_QUESTION ? 'none' : 'width 1s linear' }}></div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">{currentPlanet.name}</h3>
            <div className="grid grid-cols-3 gap-4 text-lg">
                <p><span className="text-slate-500 dark:text-slate-400 block text-sm">{t('temperature')}</span> {currentPlanet.equilibrium_temp_K ?? t('na')} K</p>
                <p><span className="text-slate-500 dark:text-slate-400 block text-sm">{t('radius')} (Earth)</span> {currentPlanet.radius_earth ?? t('na')}</p>
                <p><span className="text-slate-500 dark:text-slate-400 block text-sm">{t('mass')} (Earth)</span> {currentPlanet.mass_earth ?? t('na')}</p>
            </div>
        </div>
        <div className="mt-6 text-center">
            <p className="mb-4 text-lg font-semibold">{t('earth_like_q')}</p>
            <div className="flex justify-center gap-4">
                <button onClick={() => handleAnswer(true)} className="w-40 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-bold py-3 px-8 rounded-lg transition-colors">{t('yes')}</button>
                <button onClick={() => handleAnswer(false)} className="w-40 bg-rose-500/20 hover:bg-rose-500/40 text-rose-600 dark:text-rose-300 font-bold py-3 px-8 rounded-lg transition-colors">{t('no')}</button>
            </div>
        </div>
    </div>
  );
};

export default ExoQuiz;
