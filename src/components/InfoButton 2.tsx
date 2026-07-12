import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoButtonProps {
  title: string;
  instructions: React.ReactNode[];
  buttonClassName?: string;
  iconSize?: number;
}

export const InfoButton: React.FC<InfoButtonProps> = ({ title, instructions, buttonClassName = "", iconSize = 20 }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors flex items-center justify-center ${buttonClassName}`}
        title="Näytä ohjeet"
      >
        <Info size={iconSize} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div 
              initial={{ y: 20, scale: 0.95 }} 
              animate={{ y: 0, scale: 1 }} 
              exit={{ y: 10, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-rasala-dark border border-amber-900/40 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Koriste */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none" />

              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-serif text-rasala-gold font-bold mb-6 pr-8 flex items-center gap-3">
                <Info className="text-amber-500" size={24} /> {title}
              </h2>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-white/80">
                {instructions.map((instruction, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    <div className="text-sm md:text-base leading-relaxed">
                      {instruction}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center border-t border-white/10 pt-4">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-bold transition-colors w-full sm:w-auto"
                >
                  Selvä juttu!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
