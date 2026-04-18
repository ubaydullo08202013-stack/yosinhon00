import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

const ICONS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍉'];

export const MemoryGame = () => {
  const [cards, setCards] = useState<{ id: number; icon: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const duplicatedIcons = [...ICONS, ...ICONS];
    const shuffled = duplicatedIcons
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        flipped: false,
        matched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setWon(false);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].flipped || cards[id].matched) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].icon === cards[second].icon) {
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].matched = true;
          matchedCards[second].matched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          
          if (matchedCards.every(c => c.matched)) {
            setWon(true);
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].flipped = false;
          resetCards[second].flipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="mb-8 text-center">
        <div className="text-3xl font-bold mb-2">Harakatlar: {moves}</div>
        {won && (
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="text-brand-primary font-bold text-xl"
          >
            Tabriklaymiz! Siz g'olib bo'ldingiz!
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 max-w-md w-full">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(card.id)}
            className={cn(
              "aspect-square rounded-xl cursor-pointer flex items-center justify-center text-4xl transition-all duration-300 preserve-3d",
              card.flipped || card.matched ? "bg-brand-primary rotate-y-180" : "bg-white/10"
            )}
          >
            {(card.flipped || card.matched) ? card.icon : '?'}
          </motion.div>
        ))}
      </div>

      <button
        onClick={initializeGame}
        className="mt-8 px-8 py-3 bg-brand-primary rounded-full font-bold hover:bg-brand-primary/80 transition-colors"
      >
        Qayta boshlash
      </button>
    </div>
  );
};
