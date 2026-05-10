import React from 'react';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: 'REAL-TIME DETECTION',
    desc: 'YOLOv8 and MediaPipe AI classifies activities frame-by-frame — distinguishing safe from unsafe behaviors instantly.',
    color: 'neon-cyan',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    title: 'THREAT ALERTS',
    desc: 'Automated alerts on unsafe detections — fighting, unauthorized vehicles, and suspicious activities flagged in real-time.',
    color: 'neon-red',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'VIDEO ANALYTICS',
    desc: 'Advanced pose estimation and behavioral pattern analysis generates detailed safety reports and activity statistics.',
    color: 'neon-green',
  },
];

const capabilities = ['Pose Estimation', 'Object Detection', 'Threat Classification', 'Cloud Storage', 'Multi-Camera Support', 'Historical Playback', 'Custom Alerts', 'API Integration'];

const colorMap = {
  'neon-cyan':  { border: 'border-t-neon-cyan',  text: 'text-neon-cyan',  bg: 'bg-neon-cyan/10'  },
  'neon-red':   { border: 'border-t-neon-red',   text: 'text-neon-red',   bg: 'bg-neon-red/10'   },
  'neon-green': { border: 'border-t-neon-green', text: 'text-neon-green', bg: 'bg-neon-green/10' },
};

const Features = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8 cyber-grid">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-cyan/20 font-mono-jet text-xs tracking-widest text-neon-cyan mb-4">
          SYSTEM CAPABILITIES
        </div>
        <h2 className="font-orbitron text-3xl md:text-4xl font-black text-white">CORE <span className="text-neon-cyan">MODULES</span></h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {features.map((f, i) => {
          const c = colorMap[f.color];
          return (
            <div key={i} className={`glass-panel rounded-sm p-6 border-t-2 ${c.border} hover:shadow-neon-cyan transition-all group cursor-pointer`}>
              <div className={`w-10 h-10 ${c.bg} border border-current ${c.text} rounded-sm flex items-center justify-center mb-5`}>
                {f.icon}
              </div>
              <h3 className={`font-orbitron text-sm font-bold tracking-wider text-white mb-3 group-hover:${c.text} transition-colors`}>{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="glass-panel rounded-sm p-6">
        <h3 className="font-orbitron text-xs text-neon-cyan tracking-widest mb-5">ADDITIONAL CAPABILITIES</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {capabilities.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-400 hover:text-neon-cyan transition-colors">
              <span className="text-neon-green font-mono-jet text-xs">✓</span>
              <span className="font-mono-jet text-xs tracking-wide">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Features;
