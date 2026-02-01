import React from 'react';

const About = () => {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gradient mb-4">About VisionSafe</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A smart video safety platform that turns uploads into real-time insights and actionable alerts
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Side */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-300 leading-relaxed">
                VisionSafe helps teams review video faster and respond sooner. We combine AI-powered detection, clear dashboards, and instant alerts so safety decisions are made with confidence.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-gray-300 leading-relaxed">
                We envision a world where safety is proactive and data-driven. By combining computer vision with human-friendly tooling, VisionSafe makes it easy to understand what happened, when it happened, and what to do next.
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="glassmorphism p-8 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <span className="text-2xl">🎬</span>
                <div>
                  <h3 className="text-lg font-semibold text-accent">AI Video Analysis</h3>
                  <p className="text-gray-400 text-sm">Upload videos and receive safety classification and confidence</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl">🚨</span>
                <div>
                  <h3 className="text-lg font-semibold text-accent">Real-Time Alerts</h3>
                  <p className="text-gray-400 text-sm">WebSocket notifications for unsafe events as they occur</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="text-lg font-semibold text-accent">History & Insights</h3>
                  <p className="text-gray-400 text-sm">Review past uploads, detections, and confidence trends</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl">🔐</span>
                <div>
                  <h3 className="text-lg font-semibold text-accent">Secure Access</h3>
                  <p className="text-gray-400 text-sm">Firebase authentication with protected user data</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="glassmorphism p-8 rounded-xl mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Technology</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-white mb-2">AI/ML</h3>
              <p className="text-gray-400">Computer vision pipelines for activity recognition</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎥</div>
              <h3 className="text-lg font-semibold text-white mb-2">Video Processing</h3>
              <p className="text-gray-400">Upload, process, and render annotated output</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-lg font-semibold text-white mb-2">Web Platform</h3>
              <p className="text-gray-400">React + FastAPI with real-time WebSockets</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💾</div>
              <h3 className="text-lg font-semibold text-white mb-2">Data Layer</h3>
              <p className="text-gray-400">PostgreSQL for history, detections, and stats</p>
            </div>
          </div>
        </div>

        {/* Team & Stats */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glassmorphism p-8 rounded-xl text-center">
            <div className="text-4xl font-bold text-accent mb-2">AI‑Assisted</div>
            <p className="text-gray-300">Confidence‑scored safety results</p>
          </div>
          <div className="glassmorphism p-8 rounded-xl text-center">
            <div className="text-4xl font-bold text-accent mb-2">Real‑Time</div>
            <p className="text-gray-300">Live alert notifications</p>
          </div>
          <div className="glassmorphism p-8 rounded-xl text-center">
            <div className="text-4xl font-bold text-accent mb-2">Secure</div>
            <p className="text-gray-300">Protected access with Firebase</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
