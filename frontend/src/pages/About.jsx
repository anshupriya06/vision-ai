import React from 'react';

const About = () => {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gradient mb-4">About VisionSafe</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Empowering security through advanced AI-powered surveillance and threat detection
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Side */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-300 leading-relaxed">
                VisionSafe is dedicated to revolutionizing how organizations approach security through intelligent video surveillance. We combine cutting-edge artificial intelligence with user-friendly interfaces to detect threats and anomalies in real-time.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-gray-300 leading-relaxed">
                We envision a world where security systems are proactive, not reactive. By leveraging deep learning and computer vision, we aim to create safer environments in businesses, public spaces, and communities worldwide.
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="glassmorphism p-8 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <span className="text-2xl">■</span>
                <div>
                  <h3 className="text-lg font-semibold text-accent">Real-time Detection</h3>
                  <p className="text-gray-400 text-sm">Instant identification of suspicious activities</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl">■</span>
                <div>
                  <h3 className="text-lg font-semibold text-accent">Smart Alerts</h3>
                  <p className="text-gray-400 text-sm">Automated notifications for security threats</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl">■</span>
                <div>
                  <h3 className="text-lg font-semibold text-accent">Analytics</h3>
                  <p className="text-gray-400 text-sm">Comprehensive insights into security patterns</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl">■</span>
                <div>
                  <h3 className="text-lg font-semibold text-accent">Privacy First</h3>
                  <p className="text-gray-400 text-sm">Enterprise-grade encryption and data protection</p>
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
              <div className="text-4xl mb-4">▲</div>
              <h3 className="text-lg font-semibold text-white mb-2">AI/ML</h3>
              <p className="text-gray-400">Advanced deep learning models for threat detection</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">■</div>
              <h3 className="text-lg font-semibold text-white mb-2">Video Processing</h3>
              <p className="text-gray-400">Real-time video frame analysis</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">◆</div>
              <h3 className="text-lg font-semibold text-white mb-2">Cloud Native</h3>
              <p className="text-gray-400">Scalable and reliable infrastructure</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">●</div>
              <h3 className="text-lg font-semibold text-white mb-2">Performance</h3>
              <p className="text-gray-400">Sub-second detection latency</p>
            </div>
          </div>
        </div>

        {/* Team & Stats */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glassmorphism p-8 rounded-xl text-center">
            <div className="text-4xl font-bold text-accent mb-2">99.9%</div>
            <p className="text-gray-300">Detection Accuracy</p>
          </div>
          <div className="glassmorphism p-8 rounded-xl text-center">
            <div className="text-4xl font-bold text-accent mb-2">1000+</div>
            <p className="text-gray-300">Active Deployments</p>
          </div>
          <div className="glassmorphism p-8 rounded-xl text-center">
            <div className="text-4xl font-bold text-accent mb-2">24/7</div>
            <p className="text-gray-300">Support Available</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
