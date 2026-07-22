import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { quizCollection } from '../data/mockData';
import { Search, Trophy, CheckCircle, XCircle, Lightbulb, Edit3, Trash2, GripHorizontal, Plus, Save, X, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useAuth } from '../contexts/AuthContext';

export interface QuizQuestion {
  id: string;
  question: string;
  hint: string;
  options: string[];
  correctAnswer: string;
  orderIndex: number;
}

export const Quiz = () => {
  const { profile } = useAuth();
  const isAdminUser = profile?.role === 'superadmin' || profile?.role === 'admin';
  const [isAdminMode, setIsAdminMode] = useState(false);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Peli-statet
  const [currentLevel, setCurrentLevel] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [isFinished, setIsFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [hasGuessedWrong, setHasGuessedWrong] = useState(false);

  // Admin-statet
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [editForm, setEditForm] = useState<Partial<QuizQuestion>>({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'quiz_questions'));
      const fetched: QuizQuestion[] = [];
      snap.forEach(d => {
        fetched.push({ id: d.id, ...d.data() } as QuizQuestion);
      });
      // Järjestetään orderIndexin mukaan
      fetched.sort((a, b) => a.orderIndex - b.orderIndex);
      setQuestions(fetched);
    } catch (e) {
      console.error("Virhe kysymysten latauksessa:", e);
      setFetchError("Tietokantayhteys epäonnistui. Tarkista tietoturvasäännöt Firebasesta.");
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultQuestions = async () => {
    try {
      setLoading(true);
      for (let i = 0; i < quizCollection.length; i++) {
        const q = quizCollection[i];
        const newId = `q_${Date.now()}_${i}`;
        await setDoc(doc(db, 'quiz_questions', newId), {
          question: q.question,
          hint: q.hint,
          options: q.options,
          correctAnswer: q.correctAnswer,
          orderIndex: i
        });
      }
      await fetchQuestions();
    } catch (e) {
      console.error("Virhe alustuksessa:", e);
      alert("Tietokanta hylkäsi pyynnön! Varmista, että olet lisännyt tietoturvasäännöt Firebasen konsoliin.");
    } finally {
      setLoading(false);
    }
  };

  const syncDefaultQuestions = async () => {
    if (!window.confirm("Tämä lisää puuttuvat oletuskysymykset tietokantaan. Jatketaanko?")) return;
    try {
      setLoading(true);
      let added = 0;
      for (let i = 0; i < quizCollection.length; i++) {
        const q = quizCollection[i];
        const exists = questions.find(existing => existing.question === q.question);
        if (!exists) {
          const newId = `q_seeded_${q.id}`;
          await setDoc(doc(db, 'quiz_questions', newId), {
            question: q.question,
            hint: q.hint || "",
            options: q.options,
            correctAnswer: q.correctAnswer,
            orderIndex: questions.length + added
          });
          added++;
        }
      }
      await fetchQuestions();
      alert(`Lisättiin ${added} uutta kysymystä kantaan!`);
    } catch (e) {
      console.error(e);
      alert("Virhe synkronoinnissa");
    } finally {
      setLoading(false);
    }
  };

  // ── PELIN LOGIIKKA ──
  const question = questions[currentLevel];

  const handleAnswerClick = (option: string) => {
    if (feedback !== 'none' || !question) return;
    if (option === question.correctAnswer) {
      setFeedback('correct');
      if (!hasGuessedWrong) {
        setScore(s => s + 1);
      }
      setTimeout(() => {
        if (currentLevel < questions.length - 1) {
          setCurrentLevel(l => l + 1);
          setFeedback('none');
          setShowHint(false);
          setHasGuessedWrong(false);
        } else {
          setIsFinished(true);
        }
      }, 1400);
    } else {
      setFeedback('wrong');
      setHasGuessedWrong(true);
      setTimeout(() => setFeedback('none'), 900);
    }
  };

  const resetQuiz = () => {
    setCurrentLevel(0);
    setScore(0);
    setHasGuessedWrong(false);
    setFeedback('none');
    setIsFinished(false);
    setShowHint(false);
  };

  const progress = questions.length > 0 ? ((currentLevel) / questions.length) * 100 : 0;

  // ── ADMIN LOGIIKKA ──
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updated = items.map((item, index) => ({ ...item, orderIndex: index }));
    setQuestions(updated);

    // Tallenna tietokantaan
    try {
      for (const item of updated) {
        await updateDoc(doc(db, 'quiz_questions', item.id), { orderIndex: item.orderIndex });
      }
    } catch (e) {
      console.error("Virhe tallennuksessa:", e);
    }
  };

  const saveEdit = async () => {
    if (!editingQuestion) return;
    try {
      if (editingQuestion.id === 'NEW') {
        const newId = `q_${Date.now()}`;
        await setDoc(doc(db, 'quiz_questions', newId), {
          ...editForm,
          orderIndex: questions.length
        });
      } else {
        await updateDoc(doc(db, 'quiz_questions', editingQuestion.id), { ...editForm });
      }
      setEditingQuestion(null);
      await fetchQuestions();
    } catch (e) {
      console.error("Virhe tallennuksessa:", e);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!window.confirm("Haluatko varmasti poistaa kysymyksen?")) return;
    try {
      await deleteDoc(doc(db, 'quiz_questions', id));
      await fetchQuestions();
    } catch (e) {
      console.error("Virhe poistossa:", e);
    }
  };

  // ── RENDERÖINTI ──
  if (loading) {
    return <div className="min-h-screen bg-rasala-dark flex items-center justify-center text-rasala-gold">Ladataan tietovisaa...</div>;
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-rasala-dark flex items-center justify-center px-4">
        <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-2xl text-center max-w-lg">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Tietokantavirhe</h2>
          <p className="text-white/80 mb-6">{fetchError}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600/30 text-red-200 border border-red-500/50 rounded-lg hover:bg-red-600/50 transition">
            Yritä uudelleen
          </button>
        </div>
      </div>
    );
  }

  // Admin näkymä
  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-rasala-dark text-white pb-24 sm:pt-16 px-4">
        <div className="max-w-3xl mx-auto pt-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-serif text-3xl font-bold text-rasala-gold">Tietovisan Ylläpito</h2>
            <button onClick={() => setIsAdminMode(false)} className="btn-gold px-4 py-2 text-sm rounded-full flex items-center gap-2">
              <Unlock size={16} /> Sulje Ylläpito
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-10 bg-black/30 rounded-xl border border-white/10">
              <p className="mb-4">Tietokannassa ei ole kysymyksiä.</p>
              <button onClick={seedDefaultQuestions} className="btn-gold px-6 py-3 rounded-lg">
                Alusta oletuskysymykset
              </button>
            </div>
          ) : (
            <>
              <div className="bg-black/40 rounded-2xl p-6 border border-white/10 mb-8 shadow-2xl">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <button onClick={() => {
                    setEditingQuestion({ id: 'NEW', question: '', hint: '', options: ['', '', '', ''], correctAnswer: '', orderIndex: 0 });
                    setEditForm({ question: '', hint: '', options: ['', '', '', ''], correctAnswer: '' });
                  }} className="bg-rasala-gold text-black px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors shadow-lg">
                    <Plus size={20} /> Lisää Uusi Kysymys
                  </button>
                  <button onClick={syncDefaultQuestions} className="bg-blue-600/20 text-blue-400 px-6 py-3 rounded-xl font-bold border border-blue-600/30 hover:bg-blue-600/40 transition-colors">
                    Hae puuttuvat oletuskysymykset
                  </button>
                </div>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="questions-list">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {questions.map((q, index) => (
                        <Draggable key={q.id} draggableId={q.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="bg-black/40 border border-white/10 p-4 rounded-xl flex gap-4 items-center group"
                            >
                              <div {...provided.dragHandleProps} className="text-white/30 hover:text-white cursor-grab active:cursor-grabbing">
                                <GripHorizontal size={20} />
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-bold">{q.question}</h4>
                                <p className="text-sm text-white/50 truncate max-w-md">Vastaus: {q.correctAnswer}</p>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => { setEditingQuestion(q); setEditForm(q); }} className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded-lg">
                                  <Edit3 size={16} />
                                </button>
                                <button onClick={() => deleteQuestion(q.id)} className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-lg">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </>
          )}
        </div>

        {/* Muokkaus Modali */}
        {editingQuestion && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-rasala-dark border border-white/10 rounded-2xl w-full max-w-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{editingQuestion.id === 'NEW' ? 'Uusi Kysymys' : 'Muokkaa Kysymystä'}</h3>
                <button onClick={() => setEditingQuestion(null)} className="text-white/50 hover:text-white"><X size={24} /></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-rasala-gold">Kysymys</label>
                  <input type="text" value={editForm.question} onChange={e => setEditForm({...editForm, question: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-rasala-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-rasala-gold">Vinkki</label>
                  <input type="text" value={editForm.hint} onChange={e => setEditForm({...editForm, hint: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-rasala-gold outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-rasala-gold">Vaihtoehdot (4 kpl)</label>
                  {editForm.options?.map((opt, i) => (
                    <input key={i} type="text" value={opt} onChange={e => {
                      const newOpts = [...(editForm.options || [])];
                      newOpts[i] = e.target.value;
                      setEditForm({...editForm, options: newOpts});
                    }} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white mb-2 focus:border-rasala-gold outline-none" placeholder={`Vaihtoehto ${i+1}`} />
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-rasala-gold">Oikea Vastaus (Kopioi täsmälleen yksi vaihtoehdoista)</label>
                  <input type="text" value={editForm.correctAnswer} onChange={e => setEditForm({...editForm, correctAnswer: e.target.value})} className="w-full bg-green-900/30 border border-green-500/50 rounded-lg p-3 text-green-100 focus:border-green-400 outline-none" />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button onClick={() => setEditingQuestion(null)} className="px-5 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/10">Peruuta</button>
                  <button onClick={saveEdit} className="px-5 py-2.5 rounded-lg bg-rasala-gold text-amber-900 font-bold hover:bg-yellow-400 flex items-center gap-2"><Save size={18} /> Tallenna</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Valmis -näkymä
  if (isFinished) {
    const grade = Math.round(4 + (score / questions.length) * 6);
    
    let feedbackText = "";
    if (grade === 10) feedbackText = "Täydellistä! Olet todellinen Rasalan mestarisalapoliisi!";
    else if (grade >= 8) feedbackText = "Hienoa työtä! Tunnet suvun salat paremmin kuin useimmat.";
    else if (grade >= 6) feedbackText = "Hyvin yritetty! Vielä muutama tarina opittavana.";
    else feedbackText = "Taisi mennä arvailuksi? Kysy sukulaisilta vinkkejä ja yritä uudelleen!";

    return (
      <div className="min-h-screen bg-rasala-dark flex items-center justify-center px-4 relative">
        {isAdminUser && (
          <button onClick={() => setIsAdminMode(true)} className="absolute top-20 right-4 md:right-8 p-3 bg-black/40 hover:bg-rasala-gold/20 text-white rounded-full transition-all border border-white/10">
            <Lock size={18} />
          </button>
        )}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 16 }}
          className="cinema-card border border-rasala-gold/30 p-10 sm:p-12 text-center max-w-lg w-full shadow-gold-lg relative overflow-hidden"
        >
          {grade === 10 && (
             <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(0,0,0,0) 70%)' }}></div>
          )}
          <motion.div animate={{ rotate: [0, -10, 10, -5, 5, 0] }} transition={{ delay: 0.3, duration: 0.6 }}>
            <Trophy size={72} className="text-rasala-gold mx-auto mb-6 relative z-10" />
          </motion.div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-white mb-2 relative z-10">
            <span className="gold-shimmer">Tietovisa suoritettu!</span>
          </h1>
          
          <div className="bg-black/40 border border-rasala-gold/30 rounded-xl p-6 my-6 relative z-10">
            <p className="text-white/60 text-sm tracking-widest uppercase mb-1">Tuloksesi</p>
            <p className="text-5xl font-bold text-rasala-gold mb-4">{score} / {questions.length}</p>
            
            <div className="flex justify-center items-center gap-4 border-t border-white/10 pt-4">
              <span className="text-white/60 text-sm tracking-widest uppercase">Kouluarvosana</span>
              <span className="text-3xl font-black text-white bg-rasala-gold/20 px-4 py-1 rounded-lg border border-rasala-gold/50">{grade}</span>
            </div>
          </div>

          <p className="text-white/80 text-lg mb-8 leading-relaxed italic relative z-10">
            "{feedbackText}"
          </p>

          <button onClick={resetQuiz} className="btn-gold w-full py-4 rounded-2xl text-base relative z-10">
            <span>Pelaa uudelleen</span>
          </button>
        </motion.div>
      </div>
    );
  }

  // Tyhjä peli (Ei kysymyksiä ja ei olla admin modessa)
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-rasala-dark flex items-center justify-center px-4 relative">
        {isAdminUser && (
          <button onClick={() => setIsAdminMode(true)} className="absolute top-20 right-4 md:right-8 px-4 py-2 bg-rasala-gold text-amber-900 font-bold rounded-full transition-all border border-yellow-200">
            Ylläpito
          </button>
        )}
        <div className="text-white/50 text-center">
          <Trophy size={48} className="mx-auto mb-4 opacity-50" />
          <p>Tietovisaa päivitetään parhaillaan. Palaa pian uudelleen!</p>
        </div>
      </div>
    );
  }

  // Normaali pelinäkymä
  return (
    <div className="min-h-screen bg-rasala-dark text-white pb-24 sm:pt-16 flex flex-col items-center relative">
      
      {isAdminUser && !isAdminMode && (
        <button 
          onClick={() => setIsAdminMode(true)} 
          className="absolute top-4 right-4 md:top-20 md:right-8 flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-rasala-gold/20 text-white rounded-full transition-all border border-white/10 z-20"
        >
          <Lock size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Ylläpitotila</span>
        </button>
      )}

      {/* ── Header ── */}
      <div className="w-full max-w-2xl px-4 pt-6">
        <div className="flex items-center justify-center gap-3 mb-6 mt-12 sm:mt-0">
          <Search size={28} className="text-rasala-gold" />
          <h2 className="font-serif text-3xl font-bold">
            <span className="gold-shimmer">Tietovisa</span>
          </h2>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Taso {currentLevel + 1} / {questions.length}</span>
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
          {question && (
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
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
