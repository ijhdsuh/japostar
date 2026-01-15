
import React, { useState } from 'react';
import { Flashcard } from '../types';

const INITIAL_CARDS: Flashcard[] = [
  { id: '1', front: 'こんにちは', back: 'Olá / Boa tarde', romaji: 'Konnichiwa' },
  { id: '2', front: 'ありがとう', back: 'Obrigado', romaji: 'Arigatou' },
  { id: '3', front: '猫', back: 'Gato', romaji: 'Neko' },
  { id: '4', front: '水', back: 'Água', romaji: 'Mizu' },
  { id: '5', front: '月', back: 'Lua', romaji: 'Tsuki' },
];

const FlashcardView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = INITIAL_CARDS[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % INITIAL_CARDS.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + INITIAL_CARDS.length) % INITIAL_CARDS.length);
    }, 150);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Flashcards Diários</h2>
        <p className="text-slate-400">Toque no card para ver a tradução</p>
      </div>

      <div 
        className="relative w-72 h-96 cursor-pointer perspective-1000 group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-500 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute inset-0 bg-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 backface-hidden shadow-2xl border border-slate-700">
            <span className="text-6xl font-jp mb-4">{card.front}</span>
            <span className="text-slate-500 font-medium">Japonês</span>
          </div>

          {/* Back */}
          <div className="absolute inset-0 bg-indigo-600 rounded-2xl flex flex-col items-center justify-center p-6 backface-hidden rotate-y-180 shadow-2xl">
            <span className="text-3xl font-bold text-center mb-2">{card.back}</span>
            <span className="text-indigo-200 text-xl mb-4 italic">{card.romaji}</span>
            <span className="text-indigo-100/60 text-sm text-center">Tradução e Pronúncia</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <button 
          onClick={handlePrev}
          className="p-4 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-2xl"
        >
          ⬅️
        </button>
        <span className="text-slate-400 font-mono">
          {currentIndex + 1} / {INITIAL_CARDS.length}
        </span>
        <button 
          onClick={handleNext}
          className="p-4 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-2xl"
        >
          ➡️
        </button>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashcardView;
