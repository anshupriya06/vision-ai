import React, { useState } from 'react';
import LoginModal from './LoginModal';

const Hero = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={() => setIsLoginModalOpen(false)} />

      <section className="relative min-h-screen flex flex-col justify-center pt-14 px-4 sm:px-6 lg:px-8 cyber-grid scan-overlay overflow-hidden">

        {/* Ambient glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />

        {/* System Online badge */}
        <div className="absolute top-20 right-6 flex items-center gap-2 px-3 py-1.5 glass-panel rounded font-mono-jet text-xs text-neon-green border-neon-green">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          SYSTEM ONLINE
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">

          {/* Label */}
          <div className="inline-flex items-center gap-2 px-4 py-1 mb-8 border border-neon-cyan/30 rounded-sm font-mono-jet text-xs tracking-widest text-neon-cyan bg-neon-cyan/5">
            <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse" />
            AI SURVEILLANCE SYSTEM v2.0
          </div>

          {/* Main title */}
          <h1 className="font-orbitron font-black mb-4 leading-none">
            <span className="block text-6xl md:text-8xl text-white animate-flicker">AI SURVEILLANCE</span>
            <span className="block text-4xl md:text-5xl mt-2 font-mono-jet font-light tracking-[0.3em] text-neon-cyan" style={{textShadow:'0 0 20px #00f0ff66'}}>
              THREAT DETECTION
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Real-time AI analysis of video footage. Detect unsafe activities, unauthorized vehicles, and behavioral threats before they escalate.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => setIsLoginModalOpen(true)} className="btn-cyber-solid px-8 py-3 font-orbitron text-sm tracking-widest">
              INITIALIZE SYSTEM
            </button>
            <button onClick={() => setIsLoginModalOpen(true)} className="btn-cyber px-8 py-3 font-orbitron text-sm tracking-widest">
              <span>VIEW DEMO</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 max-w-3xl mx-auto">
            {[
              { value: '90%+', label: 'MODEL ACCURACY', color: 'text-neon-cyan' },
              { value: 'REAL-TIME', label: 'VIDEO PROCESSING', color: 'text-neon-green' },
              { value: '8+', label: 'ACTIVITY CLASSES', color: 'text-neon-cyan' },
            ].map((stat, i) => (
              <div key={i} className="hud-frame glass-panel p-6 rounded-sm hover:shadow-neon-cyan transition-all">
                <div className={`font-orbitron text-3xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="font-mono-jet text-xs tracking-widest text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
