import React, { useState } from 'react';
import { quizCollection } from '../data/mockData';
import { Search, Trophy, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Quiz = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [isFinished, setIsFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const question = quizCollection[currentLevel];

  const handleAnswerClick = (option: string) => {
    if (feedback !== 'none') return;
    if (option === question.correctAnswer) {
      setFeedback('correct');
      setTimeout(() => {
        if (currentLevel < quizCollection.length - 1) {
          setCurrentLevel(l => l + 1);
          setFeedback('none');
          setShowHint(false);
        } else {
          setIsFinished(true);
        }
      }, 1400);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback('none'), 900);
    }
  };

  const resetQuiz = () => {
    setCurrentLevel(0);
    setFeedback('none');
    setIsFinished(false);
    setShowHint(false);
  };

  const progress = ((currentLevel) / quizCollection.length) * 100;

  if (isFinished) {
    return (
      <div className="min-h-screen bg-rasala-dark flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 16 }}
          className="cinema-card border border-rasala-gold/30 p-10 sm:p-16 text-center max-w-lg w-full shadow-gold-lg"
        >
          <motion.div animate={{ rotate: [0, -10, 10, -5, 5, 0] }} transition={{ delay: 0.3, duration: 0.6 }}>
            <Trophy size={72} className="text-rasala-gold mx-auto mb-6" />
          </motion.div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-white mb-3">
            <span className="gold-shimmer">Onnittelut!</span>
          </h1>
          <p className="text-white/60 text-lg mb-8 leading-relaxed">
            Olet ratkaissut Rasalan salaisuuden.<br />
            Olet todellinen mestarisalapoliisi!
          </p>
          <img
            src="https://placehold.co/400x260/1c2b1e/d4af37?text=🏆+Rasalan+Mestari"
            alt="Palkinto"
            className="w-full rounded-xl mb-8 shadow-lg"
          />
          <button
            onClick={resetQuiz}
            className="btn-gold w-full py-4 rounded-2xl text-base"
          >
            <span>Pelaa uudelleen</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rasala-dark text-white pb-24 sm:pt-16 flex flex-col items-center">

      {/* ── Header ── */}
      <div className="w-full max-w-2xl px-4 pt-6">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Search size={28} className="text-rasala-gold" />
          <h2 className="font-serif text-3xl font-bold">
            <span className="gold-shimmer">Salapoliisipeli</span>
          </h2>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Taso {currentLevel + 1} / {quizCollection.length}</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #d4af37, #f5e07a)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* ── Quiz card ── */}
      <div className="w-full max-w-2xl px-4 py-6 flex-grow flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLevel}
            initial={{ opacity: 0, x: 30 }}
            animate={
              feedback === 'wrong'
                ? { x: [-12, 12, -8, 8, -4, 4, 0] }
                : { opacity: 1, x: 0 }
            }
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
            className={`cinema-card border relative ${
              feedback === 'correct' ? 'border-green-500/40' :
              feedback === 'wrong' ? 'border-red-500/40' :
              'border-white/10'
            } p-6 sm:p-8`}
          >
            {/* Vinkki-palkki */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="flex items-start gap-2 bg-blue-900/30 border border-blue-500/30 rounded-xl px-4 py-3">
                    <Lightbulb size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-300 text-sm leading-relaxed">{question.hint}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Kysymys */}
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight mb-8">
              {question.question}
            </h3>

            {/* Vaihtoehdot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options?.map((option, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: feedback === 'none' ? 1.02 : 1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAnswerClick(option)}
                  disabled={feedback === 'correct'}
                  className={`p-4 rounded-xl border text-base font-medium text-left transition-all duration-200 ${
                    feedback === 'correct' && option === question.correctAnswer
                      ? 'border-green-500/60 bg-green-500/20 text-green-300'
                      : 'border-white/15 bg-white/5 text-white/80 hover:border-rasala-gold/50 hover:bg-rasala-gold/10 hover:text-white'
                  }`}
                >
                  <span className="text-rasala-gold/50 text-xs font-bold mr-2">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                </motion.button>
              ))}
            </div>

            {/* Vinkki-nappi */}
            {!showHint && feedback === 'none' && (
              <button
                onClick={() => setShowHint(true)}
                className="mt-5 text-xs text-white/30 hover:text-rasala-gold transition-colors flex items-center gap-1.5"
              >
                <Lightbulb size={13} /> Näytä vinkki
              </button>
            )}

            {/* Feedback overlay */}
            <AnimatePresence>
              {feedback !== 'none' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm z-10"
                  style={{ background: feedback === 'correct' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }}
                >
                  {feedback === 'correct' ? (
                    <>
                      <CheckCircle size={64} className="text-green-400 mb-2 drop-shadow-lg" />
                      <span className="font-serif text-2xl font-bold text-green-400">Oikein! 🎉</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={64} className="text-red-400 mb-2 drop-shadow-lg" />
                      <span className="font-serif text-2xl font-bold text-red-400">Yritä uudelleen</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};
