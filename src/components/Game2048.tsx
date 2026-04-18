import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

type Grid = (number | null)[][];

export const Game2048 = () => {
  const [grid, setGrid] = useState<Grid>(Array(4).fill(null).map(() => Array(4).fill(null)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const addRandomTile = useCallback((currentGrid: Grid) => {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === null) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentGrid;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = currentGrid.map(row => [...row]);
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  }, []);

  const initGame = useCallback(() => {
    let newGrid = Array(4).fill(null).map(() => Array(4).fill(null));
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
  }, [addRandomTile]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let newScore = score;

    const rotateGrid = (g: Grid) => {
      const rotated = Array(4).fill(null).map(() => Array(4).fill(null));
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          rotated[c][3 - r] = g[r][c];
        }
      }
      return rotated;
    };

    // Normalize to "left" move
    let rotations = 0;
    if (direction === 'up') rotations = 1;
    else if (direction === 'right') rotations = 2;
    else if (direction === 'down') rotations = 3;

    for (let i = 0; i < rotations; i++) newGrid = rotateGrid(newGrid);

    // Slide and Merge
    for (let r = 0; r < 4; r++) {
      let row = newGrid[r].filter(val => val !== null) as number[];
      for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
          row[i] *= 2;
          newScore += row[i];
          row.splice(i + 1, 1);
          moved = true;
        }
      }
      const newRow = [...row, ...Array(4 - row.length).fill(null)];
      if (JSON.stringify(newGrid[r]) !== JSON.stringify(newRow)) moved = true;
      newGrid[r] = newRow;
    }

    // Rotate back
    for (let i = 0; i < (4 - rotations) % 4; i++) newGrid = rotateGrid(newGrid);

    if (moved) {
      const finalGrid = addRandomTile(newGrid);
      setGrid(finalGrid);
      setScore(newScore);

      // Check game over
      const canMove = (g: Grid) => {
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (g[r][c] === null) return true;
            if (c < 3 && g[r][c] === g[r][c + 1]) return true;
            if (r < 3 && g[r][c] === g[r + 1][c]) return true;
          }
        }
        return false;
      };

      if (!canMove(finalGrid)) setGameOver(true);
    }
  }, [grid, score, gameOver, addRandomTile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move('up');
      else if (e.key === 'ArrowDown') move('down');
      else if (e.key === 'ArrowLeft') move('left');
      else if (e.key === 'ArrowRight') move('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const getTileColor = (val: number | null) => {
    if (!val) return 'bg-white/5';
    const colors: Record<number, string> = {
      2: 'bg-zinc-200 text-zinc-800',
      4: 'bg-zinc-300 text-zinc-800',
      8: 'bg-orange-200 text-orange-800',
      16: 'bg-orange-300 text-orange-900',
      32: 'bg-orange-400 text-white',
      64: 'bg-orange-500 text-white',
      128: 'bg-yellow-200 text-yellow-900',
      256: 'bg-yellow-300 text-yellow-900',
      512: 'bg-yellow-400 text-white',
      1024: 'bg-yellow-500 text-white',
      2048: 'bg-brand-primary text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    };
    return colors[val] || 'bg-brand-primary text-white';
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="mb-6 flex justify-between w-full max-w-[320px] items-center">
        <div className="text-2xl font-bold">Ball: {score}</div>
        <button onClick={initGame} className="px-4 py-2 bg-white/10 rounded-lg text-sm font-bold hover:bg-white/20">Yangilash</button>
      </div>

      <div className="relative bg-dark-surface p-3 rounded-xl border border-white/10 shadow-2xl">
        <div className="grid grid-cols-4 gap-3">
          {grid.map((row, r) => row.map((val, c) => (
            <motion.div
              key={`${r}-${c}`}
              layout
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center text-2xl font-bold transition-colors duration-200",
                getTileColor(val)
              )}
            >
              {val}
            </motion.div>
          )))}
        </div>

        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10"
            >
              <h2 className="text-3xl font-bold mb-4">O'yin Tugadi!</h2>
              <p className="text-white/60 mb-6">Sizning balingiz: {score}</p>
              <button
                onClick={initGame}
                className="px-8 py-3 bg-brand-primary rounded-full font-bold hover:scale-105 transition-transform"
              >
                Qayta boshlash
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 text-white/40 text-sm text-center max-w-xs">
        Strelkalar yordamida sonlarni suring. Bir xil sonlar birlashib ko'payadi!
      </div>
    </div>
  );
};
