import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export const FlappyGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const birdY = useRef(200);
  const birdVelocity = useRef(0);
  const pipes = useRef<{ x: number; top: number; passed: boolean }[]>([]);
  const frameRef = useRef(0);

  const GRAVITY = 0.6;
  const JUMP = -8;
  const PIPE_WIDTH = 50;
  const PIPE_GAP = 150;
  const PIPE_SPEED = 3;

  const resetGame = useCallback(() => {
    birdY.current = 200;
    birdVelocity.current = 0;
    pipes.current = [];
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  }, []);

  const jump = useCallback(() => {
    if (gameOver) {
      resetGame();
      return;
    }
    if (!gameStarted) {
      setGameStarted(true);
    }
    birdVelocity.current = JUMP;
  }, [gameOver, gameStarted, resetGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const update = () => {
      // Bird physics
      birdVelocity.current += GRAVITY;
      birdY.current += birdVelocity.current;

      // Pipe generation
      if (frameRef.current % 100 === 0) {
        const minPipeHeight = 50;
        const maxPipeHeight = canvas.height - PIPE_GAP - minPipeHeight;
        const top = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
        pipes.current.push({ x: canvas.width, top, passed: false });
      }

      // Pipe movement
      pipes.current.forEach(pipe => {
        pipe.x -= PIPE_SPEED;
      });

      // Collision detection
      if (birdY.current < 0 || birdY.current > canvas.height) {
        setGameOver(true);
      }

      pipes.current.forEach(pipe => {
        // Bird rect
        const bx = 50;
        const by = birdY.current;
        const bw = 30;
        const bh = 30;

        // Top pipe rect
        if (
          bx + bw > pipe.x && bx < pipe.x + PIPE_WIDTH &&
          by < pipe.top
        ) {
          setGameOver(true);
        }

        // Bottom pipe rect
        if (
          bx + bw > pipe.x && bx < pipe.x + PIPE_WIDTH &&
          by + bh > pipe.top + PIPE_GAP
        ) {
          setGameOver(true);
        }

        // Score
        if (!pipe.passed && pipe.x + PIPE_WIDTH < bx) {
          pipe.passed = true;
          setScore(s => s + 1);
        }
      });

      // Cleanup pipes
      pipes.current = pipes.current.filter(p => p.x + PIPE_WIDTH > 0);

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Pipes
      ctx.fillStyle = '#10b981';
      pipes.current.forEach(pipe => {
        // Top
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
        // Bottom
        ctx.fillRect(pipe.x, pipe.top + PIPE_GAP, PIPE_WIDTH, canvas.height - (pipe.top + PIPE_GAP));
      });

      // Draw Bird
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(65, birdY.current + 15, 15, 0, Math.PI * 2);
      ctx.fill();
      // Eye
      ctx.fillStyle = 'black';
      ctx.fillRect(72, birdY.current + 8, 4, 4);
      // Beak
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(80, birdY.current + 15);
      ctx.lineTo(88, birdY.current + 18);
      ctx.lineTo(80, birdY.current + 21);
      ctx.fill();

      frameRef.current++;
      if (!gameOver) requestAnimationFrame(update);
    };

    const animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [gameStarted, gameOver]);

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="mb-4 text-2xl font-bold">Ball: {score}</div>
      
      <div className="relative" onClick={jump}>
        <canvas
          ref={canvasRef}
          width={400}
          height={500}
          className="bg-sky-500/20 border border-white/10 rounded-xl cursor-pointer"
        />
        
        <AnimatePresence>
          {!gameStarted && !gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-xl pointer-events-none"
            >
              <p className="text-2xl font-bold mb-2">Boshlash uchun bosing</p>
              <p className="text-white/60">Yoki Space tugmasini bosing</p>
            </motion.div>
          )}

          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-xl z-10"
            >
              <h2 className="text-4xl font-bold text-red-500 mb-2">Yutqazdingiz!</h2>
              <p className="text-xl mb-6">Natija: {score}</p>
              <button
                onClick={(e) => { e.stopPropagation(); resetGame(); }}
                className="px-8 py-3 bg-brand-primary rounded-full font-bold hover:scale-105 transition-transform"
              >
                Qayta urinish
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-6 text-white/40 text-sm">
        To'siqlardan o'tish uchun sakrang. Yerga yoki to'siqqa tegmang!
      </div>
    </div>
  );
};
