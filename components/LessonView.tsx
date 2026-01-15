
import React, { useState, useEffect } from 'react';
import { Lesson } from '../types';
import { generateQuiz } from '../services/geminiService';

interface LessonViewProps {
  lesson: Lesson;
  onClose: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ lesson, onClose }) => {
  const [quiz, setQuiz] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      const data = await generateQuiz(lesson.title, lesson.category);
      setQuiz(data);
      setLoading(false);
    };
    loadQuiz();
  }, [lesson]);

  const handleAnswer = (option: string) => {
    if (showExplanation) return;
    setSelectedOption(option);
    setShowExplanation(true);
    if (option === quiz[currentStep].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentStep < quiz.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-indigo-400 font-bold animate-pulse">Gerando sua lição personalizada...</p>
    </div>
  );

  if (isFinished) return (
    <div className="text-center py-12 bg-slate-800/50 rounded-3xl border border-indigo-500/20">
      <div className="text-6xl mb-6">🎊</div>
      <h2 className="text-3xl font-bold mb-2">Lição Concluída!</h2>
      <p className="text-slate-400 mb-6">Você acertou {score} de {quiz.length} perguntas.</p>
      <div className="flex justify-center gap-4">
        <button onClick={onClose} className="bg-indigo-600 px-8 py-3 rounded-xl font-bold">Voltar ao Menu</button>
      </div>
    </div>
  );

  const currentQ = quiz[currentStep];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onClose} className="text-slate-400 hover:text-white">✕ Sair</button>
        <div className="h-2 flex-1 mx-8 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500" 
            style={{ width: `${((currentStep + 1) / quiz.length) * 100}%` }}
          ></div>
        </div>
        <span className="font-mono text-slate-400">{currentStep + 1}/{quiz.length}</span>
      </div>

      <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
        <h3 className="text-2xl font-bold mb-8 text-center">{currentQ.question}</h3>
        
        <div className="grid gap-3">
          {currentQ.options.map((opt: string) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={showExplanation}
              className={`w-full p-4 rounded-2xl text-left border-2 transition-all ${
                selectedOption === opt 
                  ? opt === currentQ.correctAnswer ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'
                  : showExplanation && opt === currentQ.correctAnswer 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-slate-700 bg-slate-900/50 hover:bg-slate-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{opt}</span>
                {showExplanation && opt === currentQ.correctAnswer && <span>✅</span>}
                {showExplanation && selectedOption === opt && opt !== currentQ.correctAnswer && <span>❌</span>}
              </div>
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className="mt-8 animate-in fade-in slide-in-from-top-2">
            <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/30 text-indigo-200 mb-6">
              <p className="font-bold text-sm uppercase mb-1">Explicação:</p>
              <p>{currentQ.explanation}</p>
            </div>
            <button 
              onClick={nextQuestion}
              className="w-full bg-indigo-600 hover:bg-indigo-500 p-4 rounded-2xl font-bold shadow-lg transition-all"
            >
              {currentStep < quiz.length - 1 ? 'Próxima Pergunta' : 'Finalizar Lição'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonView;
