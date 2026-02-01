import React, { useState } from 'react';
import LoginModal from './LoginModal';

const Hero = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => setIsLoginModalOpen(false)}
      />
      
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-float">
            <span className="text-gradient">AI-Powered Park Safety</span>
            <br />
            <span className="text-white">Smart Activity Monitoring</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12">
            Intelligent AI that monitors park activities in real-time, detecting unsafe behaviors like fighting, fire, smoking, and unauthorized vehicles to keep public spaces secure.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="group relative px-8 py-4 bg-accent text-white font-semibold rounded-xl overflow-hidden hover:shadow-lg hover:shadow-accent/50 transition-all"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-accent to-safe transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              <span className="relative flex items-center gap-2">
                Get Started
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
          <div className="glassmorphism p-6 rounded-xl">
            <div className="text-4xl font-bold text-accent mb-2">90%+</div>
            <div className="text-gray-400">Model Accuracy</div>
          </div>
          <div className="glassmorphism p-6 rounded-xl">
            <div className="text-4xl font-bold text-safe mb-2">Real-time</div>
            <div className="text-gray-400">Video Processing</div>
          </div>
          <div className="glassmorphism p-6 rounded-xl">
            <div className="text-4xl font-bold text-accent mb-2">8</div>
            <div className="text-gray-400">Activity Classes</div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default Hero;
