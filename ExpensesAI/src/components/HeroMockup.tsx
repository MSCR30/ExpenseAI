import React from "react";

const Sparkle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l1.8 3.6L17.8 7l-3.2 1.4L12 12l-2.6-3.6L6.2 7l3.9-1.4L12 2z" fill="#34D399" opacity="0.9"/>
  </svg>
);

export const HeroMockup: React.FC = () => {
  return (
    <div className="hidden lg:flex items-center justify-center relative w-96 h-96 -mt-12">
      {/* Floating device */}
      <div className="relative z-10 transform transition-all duration-700 hover:-translate-y-3 hover:scale-105 animate-float">
        <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-4 shadow-2xl backdrop-blur-md w-80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">EA</div>
              <div>
                <div className="text-white font-semibold">ExpenseAI</div>
                <div className="text-xs text-gray-400">AI-powered insights</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">Mon</div>
          </div>

          {/* Chart */}
          <div className="w-full h-40 rounded-xl bg-gradient-to-br from-white/5 to-white/3 border border-white/6 p-3">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path d="M0,30 L10,26 L20,18 L30,22 L40,12 L50,15 L60,8 L70,18 L80,10 L90,12 L100,6" fill="none" stroke="url(#g1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              <g>
                {[10,20,30,40,50,60,70,80,90,100].map((x, i) => (
                  <circle key={i} cx={x - 5} cy={20 + Math.sin(i) * 6} r={1.7} fill="#fff" opacity={0.9} />
                ))}
              </g>
            </svg>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-300">Monthly Spend</div>
            <div className="text-white font-semibold">₹1,245</div>
          </div>
        </div>
      </div>

      {/* Decorative glow */}
      <div className="absolute -inset-6 bg-gradient-to-br from-cyan-400/20 via-blue-400/10 to-transparent rounded-3xl filter blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -right-12 -top-6 w-24 h-24 opacity-70">
        <Sparkle className="w-full h-full" />
      </div>
    </div>
  );
};

export default HeroMockup;
