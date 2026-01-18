'use client';

import React from 'react';
import { Link2, Download } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardHeroProps {
  anyaState: 'idle' | 'loading' | 'success' | 'error' | 'empty';
  inputValue: string;
  onUrlChange: (value: string) => void;
  onSave: () => void;
}

export default function DashboardHero({
  anyaState,
  inputValue,
  onUrlChange,
  onSave,
}: DashboardHeroProps) {
  const getAnyaGif = () => {
    switch (anyaState) {
      case 'loading': return '/assets/anya-loading.gif';
      case 'success': return '/assets/anya-success.gif';
      case 'error': return '/assets/anya-error.gif';
      default: return '/assets/anya-idle.gif';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#2d3748] to-[#1a2332] p-8 lg:p-10 shadow-2xl border border-white/5"
    >
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Anya Animation - Simplified for Mobile */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative shrink-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-2xl opacity-40 animate-pulse" />
          <div className="relative w-[120px] h-[120px] lg:w-[160px] lg:h-[160px] rounded-full overflow-hidden border-4 border-white/10 shadow-inner bg-[#1a2332]">
            <img
              src={getAnyaGif()}
              alt="Anya For You"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Status Badge */}
          <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[10px] lg:text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-[#1a2332] flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            ONLINE
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 w-full text-center lg:text-left">
          <h1 className="text-3xl lg:text-5xl font-black text-white mb-4 lg:mb-6 tracking-tight drop-shadow-lg font-sans">
            Save Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Favorite</span> Moments <span className="inline-block animate-bounce">✨</span>
          </h1>

          <div className="flex flex-col gap-4 w-full lg:max-w-xl">
            <div className="relative group w-full">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="Paste Instagram Link here..."
                className="w-full h-12 lg:h-14 pl-12 pr-4 lg:pl-14 lg:pr-6 rounded-2xl bg-[#0f172a]/50 border-2 border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-pink-500/50 focus:bg-[#0f172a]/80 transition-all shadow-inner text-sm lg:text-base"
              />
              <div className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-400 transition-colors">
                <Link2 size={20} className="lg:w-6 lg:h-6" />
              </div>
            </div>

            <motion.button
              onClick={onSave}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 lg:h-[52px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2 text-sm lg:text-base relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Download size={20} className="lg:w-[22px] lg:h-[22px]" />
              Save to Google Drive
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
