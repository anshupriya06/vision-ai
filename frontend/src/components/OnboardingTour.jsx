import React, { useState, useEffect } from 'react';

const STEPS = [
  {
    title: 'Welcome to VisionSafe',
    description: 'Your AI-powered video surveillance platform. Let\'s walk you through the key features in under a minute.',
    icon: '👁',
    position: 'center',
    highlight: null,
  },
  {
    title: 'Upload a Video Feed',
    description: 'Drag and drop any video file into the Upload Feed tab. VisionSafe will analyze every frame using YOLOv8 and MediaPipe AI models.',
    icon: '📤',
    position: 'center',
    highlight: 'upload',
  },
  {
    title: 'Real-Time Analysis',
    description: 'Watch the AI pipeline run live — object detection, pose estimation, and activity classification all happen automatically. Results appear in seconds.',
    icon: '🤖',
    position: 'center',
    highlight: 'status',
  },
  {
    title: 'Review Your History',
    description: 'Every analyzed video is saved to your History. Filter by status, search by filename, or filter by confidence score to find what matters.',
    icon: '📋',
    position: 'center',
    highlight: 'history',
  },
  {
    title: 'Export & Share Reports',
    description: 'Download annotated videos, export reports as CSV or PDF, and share safety analysis results directly from the History page.',
    icon: '📊',
    position: 'center',
    highlight: null,
  },
];

const ProgressDots = ({ total, current }) => (
  <div className="flex items-center gap-2 justify-center">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`rounded-full transition-all duration-300 ${
          i === current
            ? 'w-5 h-2 bg-neon-cyan shadow-neon-cyan'
            : i < current
            ? 'w-2 h-2 bg-neon-cyan/50'
            : 'w-2 h-2 bg-slate-700'
        }`}
      />
    ))}
  </div>
);

const OnboardingTour = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleDone();
    } else {
      setStep(s => s + 1);
    }
  };

  const handlePrev = () => setStep(s => s - 1);

  const handleDone = () => {
    setVisible(false);
    setTimeout(onComplete, 300);
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="onboarding-overlay" onClick={handleDone} />

      {/* Card */}
      <div
        className="onboarding-card"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Skip */}
        <button
          onClick={handleDone}
          className="absolute top-3 right-3 text-slate-600 hover:text-slate-400 transition-colors font-mono-jet text-xs"
        >
          SKIP ✕
        </button>

        {/* Step count */}
        <div className="font-mono-jet text-xs text-neon-cyan/60 tracking-widest mb-4">
          STEP {step + 1} / {STEPS.length}
        </div>

        {/* Icon */}
        <div className="text-4xl mb-4">{current.icon}</div>

        {/* Title */}
        <h2 className="font-sora text-base font-bold text-white mb-3 leading-snug">
          {current.title}
        </h2>

        {/* Description */}
        <p className="font-inter text-sm text-slate-400 leading-relaxed mb-6">
          {current.description}
        </p>

        {/* Progress dots */}
        <ProgressDots total={STEPS.length} current={step} />

        {/* Navigation */}
        <div className="flex gap-3 mt-5">
          {step > 0 && (
            <button
              onClick={handlePrev}
              className="btn-cyber flex-1 py-2 text-xs font-mono-jet tracking-widest"
            >
              <span>← BACK</span>
            </button>
          )}
          <button
            onClick={handleNext}
            className="btn-cyber-solid flex-1 py-2 text-xs font-mono-jet tracking-widest"
          >
            {isLast ? 'GET STARTED →' : 'NEXT →'}
          </button>
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
