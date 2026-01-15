
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import FlashcardView from './components/FlashcardView';
import ChatTutor from './components/ChatTutor';
import LessonView from './components/LessonView';
import { AppRoute, Lesson } from './types';

const MOCK_LESSONS: Lesson[] = [
  { id: '1', title: 'Hiragana Básico 1', description: 'Aprenda as vogais あ, い, う, え, お.', category: 'Hiragana', level: 'Basic', stars: 5 },
  { id: '2', title: 'Saudações Comuns', description: 'Como se apresentar e dizer bom dia.', category: 'Vocabulary', level: 'Basic', stars: 4 },
  { id: '3', title: 'Kanji de Números', description: 'Aprenda a escrever de 1 a 10.', category: 'Kanji', level: 'Basic', stars: 3 },
  { id: '4', title: 'Partícula Wa e Ga', description: 'A base da gramática japonesa.', category: 'Grammar', level: 'Intermediate', stars: 0 },
];

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const startLesson = (lesson: Lesson) => {
    if (isOffline) {
       alert("Lições dinâmicas via IA requerem internet. Use os Flashcards offline!");
       return;
    }
    setActiveLesson(lesson);
  };

  const renderContent = () => {
    if (activeLesson) {
      return <LessonView lesson={activeLesson} onClose={() => setActiveLesson(null)} />;
    }

    switch (currentRoute) {
      case AppRoute.HOME:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {isOffline && (
              <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-2xl flex items-center gap-3 text-amber-200">
                <span className="text-xl">⚠️</span>
                <p className="text-sm font-medium">Você está offline. Os recursos de IA requerem internet.</p>
              </div>
            )}
            <section className="text-center py-12 px-6 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-slate-800/40 border border-indigo-500/20 backdrop-blur-sm">
              <h2 className="text-4xl font-extrabold mb-4 font-jp">Japostar ⭐</h2>
              <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                Sua jornada para a fluência começa aqui. Aprenda de forma divertida e constante com o nosso Sensei IA.
              </p>
              <button 
                onClick={() => setCurrentRoute(AppRoute.LESSONS)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 transition-all hover:scale-105"
              >
                Explorar Lições
              </button>
            </section>

            <div className="grid md:grid-cols-2 gap-6">
              <div className={`bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-colors cursor-pointer ${isOffline ? 'opacity-50 grayscale' : ''}`} onClick={() => !isOffline && setCurrentRoute(AppRoute.TUTOR)}>
                <div className="text-3xl mb-3">✨</div>
                <h3 className="text-xl font-bold mb-2">Sensei IA</h3>
                <p className="text-slate-400">Tire dúvidas e pratique leitura com inteligência artificial.</p>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer" onClick={() => setCurrentRoute(AppRoute.FLASHCARDS)}>
                <div className="text-3xl mb-3">🗂️</div>
                <h3 className="text-xl font-bold mb-2">Flashcards</h3>
                <p className="text-slate-400">Memorize Hiragana e Katakana rapidamente.</p>
              </div>
            </div>

            <section>
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-2xl font-bold">Aulas em Destaque</h3>
                <button onClick={() => setCurrentRoute(AppRoute.LESSONS)} className="text-indigo-400 hover:underline">Ver todas</button>
              </div>
              <div className="grid gap-4">
                {MOCK_LESSONS.slice(0, 3).map(lesson => (
                  <div key={lesson.id} className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 flex justify-between items-center group hover:bg-slate-700/80 transition-all">
                    <div>
                      <span className="text-xs font-bold px-2 py-1 bg-slate-900 rounded-md text-slate-400 mb-2 inline-block">{lesson.category}</span>
                      <h4 className="text-lg font-bold">{lesson.title}</h4>
                      <p className="text-sm text-slate-400">{lesson.description}</p>
                    </div>
                    <button onClick={() => startLesson(lesson)} className="text-sm font-bold text-indigo-400 group-hover:text-white transition-colors uppercase tracking-wider">Estudar ➔</button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      case AppRoute.LESSONS:
        return (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold mb-8">Trilha de Aprendizado</h2>
            <div className="grid gap-6">
              {MOCK_LESSONS.map(lesson => (
                <div key={lesson.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
                         lesson.level === 'Basic' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                       }`}>
                         {lesson.level}
                       </span>
                       <span className="text-sm text-indigo-400 font-semibold">{lesson.category}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{lesson.title}</h3>
                    <p className="text-slate-400 text-sm">{lesson.description}</p>
                  </div>
                  <button 
                    onClick={() => startLesson(lesson)}
                    className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Abrir Aula
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case AppRoute.FLASHCARDS:
        return <FlashcardView />;
      case AppRoute.TUTOR:
        return <ChatTutor />;
      case AppRoute.PROGRESS:
        return (
          <div className="text-center py-20 animate-in zoom-in-95 duration-500">
            <div className="text-6xl mb-6">🔭</div>
            <h2 className="text-3xl font-bold mb-4">Progresso Estelar</h2>
            <div className="max-w-md mx-auto space-y-6">
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <div className="flex justify-between mb-2 text-sm font-bold">
                  <span>Nível: Estudante I</span>
                  <span>40%</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 w-[40%]"></div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Em construção...</div>;
    }
  };

  return (
    <Layout activeRoute={currentRoute} onNavigate={setCurrentRoute}>
      {renderContent()}
    </Layout>
  );
};

export default App;
