import React from 'react';
import { useNavigate } from 'react-router-dom';

const Features = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Real-time Activity Detection',
      description: 'YOLOv8 and MediaPipe powered AI classifies park activities in real-time, distinguishing between safe activities (walking, sitting, yoga) and potential threats instantly.',
      gradient: 'from-accent to-blue-600',
      link: '/feature-details#activity-detection'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      title: 'Safe/Unsafe Alerts',
      description: 'Automated alerts when unsafe behaviors are detected in parks - fighting, fire hazards, smoking violations, and unauthorized vehicle entry to protect public spaces.',
      gradient: 'from-safe to-emerald-600',
      link: '/feature-details#alerts'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Video Analytics',
      description: 'Advanced pose estimation and behavioral pattern analysis to understand park visitor activities, generating detailed safety reports and activity statistics.',
      gradient: 'from-purple-500 to-pink-600',
      link: '/feature-details#analytics'
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Powerful Features</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to monitor and secure your environment with cutting-edge AI technology
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => navigate(feature.link)}
              className="group glassmorphism p-8 rounded-xl hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/20 cursor-pointer"
            >
              {/* Icon */}
              <div className="relative mb-6">
                <div className={`relative bg-gradient-to-r ${feature.gradient} p-4 rounded-xl text-white w-fit`}>
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-gradient transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Arrow */}
              <div className="mt-6 flex items-center text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-semibold">Learn more</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features List */}
        <div className="mt-20 glassmorphism p-8 rounded-xl">
          <h3 className="text-2xl font-bold text-center mb-8 text-gradient">
            Additional Capabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Pose Estimation',
              'Object Detection',
              'Threat Classification',
              'Cloud Storage',
              'Multi-Camera Support',
              'Historical Playback',
              'Custom Alerts',
              'API Integration',
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3 text-gray-300">
                <svg className="w-5 h-5 text-safe flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
