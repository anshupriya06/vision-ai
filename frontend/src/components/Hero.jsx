import React from 'react';

const Hero = () => {
  return (
    <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-float">
          <span className="text-gradient">AI-Powered</span>
          <br />
          <span className="text-white">Public Safety Monitoring</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12">
          Real-time video analytics with intelligent threat detection to keep your spaces safe 24/7
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="group relative px-8 py-4 bg-accent text-white font-semibold rounded-xl overflow-hidden hover:shadow-lg hover:shadow-accent/50 transition-all">
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-accent to-safe transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            <span className="relative flex items-center gap-2">
              Get Started
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          
          <button className="px-8 py-4 glassmorphism border border-accent/30 text-white font-semibold rounded-xl hover:border-accent hover:shadow-lg hover:shadow-accent/30 transition-all">
            Watch Demo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
          <div className="glassmorphism p-6 rounded-xl">
            <div className="text-4xl font-bold text-accent mb-2">99.9%</div>
            <div className="text-gray-400">Detection Accuracy</div>
          </div>
          <div className="glassmorphism p-6 rounded-xl">
            <div className="text-4xl font-bold text-safe mb-2">&lt;100ms</div>
            <div className="text-gray-400">Response Time</div>
          </div>
          <div className="glassmorphism p-6 rounded-xl">
            <div className="text-4xl font-bold text-accent mb-2">24/7</div>
            <div className="text-gray-400">Live Monitoring</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
