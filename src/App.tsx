import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Gamepad2, 
  Sparkles, 
  Brain, 
  Send, 
  User, 
  Bot,
  ChevronRight,
  Trophy,
  History,
  Info,
  Menu,
  X
} from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import { getChatResponse } from './services/gemini';
import { Content } from '@google/genai';

import { MemoryGame } from './components/MemoryGame';
import { TicTacToe } from './components/TicTacToe';
import { SnakeGame } from './components/SnakeGame';
import { Game2048 } from './components/Game2048';
import { FlappyGame } from './components/FlappyGame';

type AppState = 'chat' | 'games' | 'game-detail';
type GameType = 'memory' | 'tictactoe' | 'snake' | '2048' | 'flappy';

export default function App() {
  const [activeState, setActiveState] = useState<AppState>('chat');
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const history: Content[] = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await getChatResponse(userMessage, history);
      setMessages(prev => [...prev, { role: 'model', text: response || 'Kechirasiz, xatolik yuz berdi.' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Kechirasiz, ulanishda xatolik yuz berdi.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const games = [
    { id: 'memory', name: 'Xotira Mashqi', icon: Brain, desc: 'Kartalarni mosini toping', color: 'bg-blue-500' },
    { id: 'tictactoe', name: 'X-O O\'yini', icon: Trophy, desc: 'AI bilan bellashing', color: 'bg-emerald-500' },
    { id: 'snake', name: 'Iloncha', icon: Gamepad2, desc: 'Klassik iloncha o\'yini', color: 'bg-orange-500' },
    { id: '2048', name: '2048', icon: Sparkles, desc: 'Sonlarni birlashtiring', color: 'bg-purple-500' },
    { id: 'flappy', name: 'Uchar Qush', icon: MessageSquare, desc: 'To\'siqlardan o\'ting', color: 'bg-pink-500' },
  ];

  const renderContent = () => {
    if (activeState === 'chat') {
      return (
        <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                <div className="w-20 h-20 rounded-full bg-brand-primary/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-brand-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold">Najot AI ga xush kelibsiz!</h2>
                <p className="max-w-xs">Men sizning aqlli yordamchingizman. Savol bering yoki o'yin o'ynashni taklif qiling.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-start gap-3",
                  m.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  m.role === 'user' ? "bg-brand-primary" : "bg-dark-surface border border-white/10"
                )}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-brand-primary" />}
                </div>
                <div className={cn(
                  "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                  m.role === 'user' 
                    ? "bg-brand-primary text-white rounded-tr-none" 
                    : "bg-dark-surface border border-white/10 rounded-tl-none"
                )}>
                  <div className="markdown-body">
                    <Markdown>{m.text}</Markdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-brand-primary text-xs font-medium px-12">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-1.5 h-1.5 bg-current rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-1.5 h-1.5 bg-current rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-1.5 h-1.5 bg-current rounded-full"
                />
                <span>Najot AI yozmoqda...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 bg-dark-bg/80 backdrop-blur-md border-t border-white/5">
            <div className="relative flex items-center gap-2 max-w-3xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Savolingizni yozing..."
                className="flex-1 bg-dark-surface border border-white/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center hover:bg-brand-primary/80 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeState === 'games') {
      return (
        <div className="p-6 max-w-6xl mx-auto w-full">
          <header className="mb-10">
            <h1 className="text-4xl font-display font-bold mb-2">O'yinlar Olami</h1>
            <p className="text-white/60">Zehningizni charxlang va dam oling</p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <motion.button
                key={game.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedGame(game.id as GameType);
                  setActiveState('game-detail');
                }}
                className="glass-card p-6 text-left group hover:border-brand-primary/30 transition-all"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", game.color)}>
                  <game.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1">{game.name}</h3>
                <p className="text-sm text-white/50 mb-4">{game.desc}</p>
                <div className="flex items-center text-xs font-bold text-brand-primary uppercase tracking-wider">
                  O'ynash <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      );
    }

    if (activeState === 'game-detail') {
      return (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <button 
              onClick={() => setActiveState('games')}
              className="flex items-center text-sm text-white/60 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Orqaga
            </button>
            <h2 className="font-bold">{games.find(g => g.id === selectedGame)?.name}</h2>
            <div className="w-20" /> {/* Spacer */}
          </div>
          <div className="flex-1 overflow-auto">
            {selectedGame === 'memory' && <MemoryGame />}
            {selectedGame === 'tictactoe' && <TicTacToe />}
            {selectedGame === 'snake' && <SnakeGame />}
            {selectedGame === '2048' && <Game2048 />}
            {selectedGame === 'flappy' && <FlappyGame />}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-dark-surface border-r border-white/5 transform transition-transform duration-300 lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center neon-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">Najot AI</span>
        </div>

        <nav className="px-4 space-y-2">
          <button
            onClick={() => { setActiveState('chat'); setSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeState === 'chat' ? "bg-brand-primary text-white shadow-lg" : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <MessageSquare className="w-5 h-5" />
            AI Chat
          </button>
          <button
            onClick={() => { setActiveState('games'); setSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeState === 'games' || activeState === 'game-detail' ? "bg-brand-primary text-white shadow-lg" : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <Gamepad2 className="w-5 h-5" />
            O'yinlar
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="glass-card p-4 text-xs text-white/40 leading-relaxed">
            <div className="flex items-center gap-2 mb-2 text-white/60">
              <Info className="w-3 h-3" />
              <span>Ma'lumot</span>
            </div>
            Najot AI - bu sizning universal yordamchingiz. 2026-yil texnologiyasi.
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 border-b border-white/5 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-display font-bold">Najot AI</span>
          <div className="w-10" />
        </header>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {renderContent()}
      </main>
    </div>
  );
}
