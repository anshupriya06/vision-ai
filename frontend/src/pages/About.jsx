import React from 'react';

const About = () => {
  const features = [
    { icon: '🎬', title: 'AI Video Analysis',   desc: 'Upload videos and receive safety classification and confidence scoring.' },
    { icon: '🚨', title: 'Real-Time Alerts',    desc: 'WebSocket notifications for unsafe events as they occur.' },
    { icon: '📊', title: 'History & Insights',  desc: 'Review past uploads, detections, and confidence trends.' },
    { icon: '🔐', title: 'Secure Access',       desc: 'Firebase authentication with protected user data.' },
  ];

  const stack = [
    { icon: '🤖', title: 'AI / ML',           desc: 'YOLOv8 + MediaPipe for activity recognition' },
    { icon: '🎥', title: 'Video Processing',   desc: 'Upload, process, and render annotated output' },
    { icon: '🌐', title: 'Web Platform',       desc: 'React + FastAPI with real-time WebSockets' },
    { icon: '💾', title: 'Data Layer',         desc: 'PostgreSQL for history, detections, and stats' },
  ];

  const highlights = [
    { value: 'AI-Assisted', desc: 'Confidence-scored safety results' },
    { value: 'Real-Time',   desc: 'Live alert notifications' },
    { value: 'Secure',      desc: 'Protected access with Firebase' },
  ];

  return (
    <section className="pt-16 sm:pt-20 pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8 min-h-screen cyber-grid">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-cyan/20 font-mono-jet text-xs tracking-widest text-neon-cyan mb-4 sm:mb-6">
            ABOUT THE PROJECT
          </div>
          <h1 className="font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 sm:mb-4">
            About <span className="text-neon-cyan">VisionSafe</span>
          </h1>
          <p className="font-inter text-sm sm:text-base lg:text-xl text-slate-400 max-w-xs sm:max-w-xl lg:max-w-2xl mx-auto">
            A smart video safety platform that turns uploads into real-time insights and actionable alerts.
          </p>
        </div>

        {/* Mission + Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start mb-10 sm:mb-14 lg:mb-20">
          {/* Mission / Vision */}
          <div className="space-y-5 sm:space-y-6">
            <div className="glass-panel hud-frame p-5 sm:p-6 rounded-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                <h2 className="font-sora text-xl sm:text-2xl lg:text-3xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="font-inter text-sm sm:text-base text-slate-300 leading-relaxed">
                VisionSafe helps teams review video faster and respond sooner. We combine AI-powered detection,
                clear dashboards, and instant alerts so safety decisions are made with confidence.
              </p>
            </div>
            <div className="glass-panel hud-frame p-5 sm:p-6 rounded-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                <h2 className="font-sora text-xl sm:text-2xl lg:text-3xl font-bold text-white">Our Vision</h2>
              </div>
              <p className="font-inter text-sm sm:text-base text-slate-300 leading-relaxed">
                We envision a world where safety is proactive and data-driven. By combining computer vision
                with human-friendly tooling, VisionSafe makes it easy to understand what happened,
                when it happened, and what to do next.
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="glass-panel rounded-sm p-5 sm:p-6 lg:p-8">
            <h2 className="font-sora text-lg sm:text-xl lg:text-2xl font-bold text-white mb-5 sm:mb-6">Key Features</h2>
            <ul className="space-y-4 sm:space-y-5">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 sm:gap-4">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{f.icon}</span>
                  <div>
                    <h3 className="font-sora text-sm font-semibold text-neon-cyan mb-0.5">{f.title}</h3>
                    <p className="font-inter text-xs sm:text-sm text-slate-400">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="glass-panel rounded-sm p-5 sm:p-6 lg:p-8 mb-10 sm:mb-14 lg:mb-20">
          <h2 className="font-sora text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
            Technology <span className="text-neon-cyan">Stack</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stack.map((s, i) => (
              <div key={i} className="glass-panel hud-frame p-4 sm:p-5 rounded-sm text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3">{s.icon}</div>
                <h3 className="font-sora text-sm font-semibold text-white mb-1 sm:mb-2">{s.title}</h3>
                <p className="font-inter text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {highlights.map((h, i) => (
            <div key={i} className="glass-panel hud-frame p-5 sm:p-6 lg:p-8 rounded-sm text-center">
              <div className="font-sora text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neon-cyan mb-2">{h.value}</div>
              <p className="font-inter text-sm text-slate-400">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
