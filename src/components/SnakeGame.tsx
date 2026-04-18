import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const GRID_SIZE = 20;
  const CELL_SIZE = 20;

  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const foodRef = useRef({ x: 15, y: 15 });
  const directionRef = useRef({ x: 0, y: 0 });
  const nextDirectionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (directionRef.current.y === 0) nextDirectionRef.current = { x: 0, y: -1 }; break;
        case 'ArrowDown': if (directionRef.current.y === 0) nextDirectionRef.current = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if (directionRef.current.x === 0) nextDirectionRef.current = { x: -1, y: 0 }; break;
        case 'ArrowRight': if (directionRef.current.x === 0) nextDirectionRef.current = { x: 1, y: 0 }; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    const gameLoop = setInterval(() => {
      // Update direction
      directionRef.current = nextDirectionRef.current;
      
      if (directionRef.current.x === 0 && directionRef.current.y === 0) return;

      const newHead = {
        x: snakeRef.current[0].x + directionRef.current.x,
        y: snakeRef.current[0].y + directionRef.current.y,
      };

      // Collision detection
      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        snakeRef.current.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setGameOver(true);
        if (score > highScore) setHighScore(score);
        clearInterval(gameLoop);
        return;
      }

      const newSnake = [newHead, ...snakeRef.current];

      // Food detection
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        setScore(s => s + 10);
        foodRef.current = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        };
      } else {
        newSnake.pop();
      }

      snakeRef.current = newSnake;

      // Draw
      context.clearRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      
      // Draw Grid (Subtle)
      context.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i <= GRID_SIZE; i++) {
        context.beginPath();
        context.moveTo(i * CELL_SIZE, 0);
        context.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
        context.stroke();
        context.beginPath();
        context.moveTo(0, i * CELL_SIZE);
        context.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
        context.stroke();
      }

      // Draw Food (Glow)
      context.shadowBlur = 15;
      context.shadowColor = '#ef4444';
      context.fillStyle = '#ef4444';
      context.beginPath();
      context.arc(foodRef.current.x * CELL_SIZE + CELL_SIZE/2, foodRef.current.y * CELL_SIZE + CELL_SIZE/2, CELL_SIZE/2 - 2, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;

      // Draw Snake
      snakeRef.current.forEach((segment, i) => {
        const isHead = i === 0;
        context.fillStyle = isHead ? '#10b981' : '#059669';
        if (isHead) {
          context.shadowBlur = 10;
          context.shadowColor = '#10b981';
        }
        context.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        context.shadowBlur = 0;
      });
    }, 120);

    return () => clearInterval(gameLoop);
  }, [gameOver]);

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 0, y: 0 };
    nextDirectionRef.current = { x: 0, y: 0 };
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="mb-4 flex justify-between w-full max-w-[400px]">
        <div className="text-xl font-bold">Ball: {score}</div>
        <div className="text-xl font-bold text-white/40">Eng yuqori: {highScore}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="bg-white/5 border border-white/10 rounded-lg"
        />
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-3xl font-bold text-red-500 mb-4">O'yin Tugadi!</h2>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-brand-primary rounded-full font-bold"
            >
              Qayta boshlash
            </button>
          </div>
        )}
        {(directionRef.current.x === 0 && directionRef.current.y === 0 && !gameOver) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white/60 animate-pulse">Boshlash uchun strelkalarni bosing</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 grid grid-cols-3 gap-2 lg:hidden">
        <div />
        <button onClick={() => nextDirectionRef.current = { x: 0, y: -1 }} className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">↑</button>
        <div />
        <button onClick={() => nextDirectionRef.current = { x: -1, y: 0 }} className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">←</button>
        <button onClick={() => nextDirectionRef.current = { x: 0, y: 1 }} className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">↓</button>
        <button onClick={() => nextDirectionRef.current = { x: 1, y: 0 }} className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">→</button>
      </div>
    </div>
  );
};
