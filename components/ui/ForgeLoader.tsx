import React from 'react';

interface ForgeLoaderProps {
  status: string;
  progress: number;
}

export const ForgeLoader: React.FC<ForgeLoaderProps> = ({ status, progress }) => {
  return (
    <div className="w-full bg-black border border-orange-900/30 p-8 relative overflow-hidden group select-none rounded-sm">
      {/* Background pulsing effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black animate-pulse"></div>
      
      {/* Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,11,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,3px_100%] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-end justify-between border-b border-orange-900/30 pb-2">
          <span className="text-orange-500 font-black uppercase tracking-[0.2em] text-sm animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 inline-block animate-ping rounded-full"></span>
            {status}
          </span>
          <span className="text-orange-700/80 font-mono text-xl font-bold">
            {progress < 10 ? `0${progress}` : progress}%
          </span>
        </div>
        
        {/* Progress Bar Container */}
        <div className="h-4 bg-zinc-900/80 border border-zinc-700/50 skew-x-[-12deg] p-0.5 backdrop-blur-sm">
          {/* Fill */}
          <div 
            className="h-full bg-gradient-to-r from-orange-900 via-orange-600 to-yellow-500 shadow-[0_0_20px_rgba(234,88,12,0.4)] relative overflow-hidden transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          >
             {/* Striped animation inside bar */}
             <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]"></div>
          </div>
        </div>
        
        <div className="flex justify-between text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
           <span>Core Temp: {(1200 + (progress * 18)).toFixed(0)}°K</span>
           <span>System: Active</span>
        </div>
      </div>
      <style>{`
        @keyframes slide {
          0% { background-position: 0 0; }
          100% { background-position: 20px 20px; }
        }
      `}</style>
    </div>
  );
};