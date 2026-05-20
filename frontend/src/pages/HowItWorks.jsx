import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  {
    number: '01',
    title: 'Upload or stream your video',
    desc: 'Drag and drop a video file onto any of the 4 feed slots on the Dashboard, or switch to Live Camera mode to use your webcam. Supported formats: MP4, AVI, MOV, MKV.',
    detail: 'The moment a file is dropped, the upload begins automatically — no extra button to click. You can fill all 4 slots at once and they all analyse in parallel.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    color: 'cyan',
  },
  {
    number: '02',
    title: 'YOLOv8 detects every person',
    desc: 'The first AI model — YOLOv8n — scans each frame of your video to locate every person and vehicle with a bounding box.',
    detail: 'YOLOv8 runs at sub-second speed per frame. Bounding boxes are stabilised using an Exponential Moving Average (α = 0.7) so they don\'t flicker between frames. Vehicles are annotated separately but don\'t affect the final safety verdict.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    color: 'cyan',
  },
  {
    number: '03',
    title: 'MediaPipe maps body pose',
    desc: 'For each detected person, Google\'s MediaPipe PoseLandmarker extracts 33 precise body landmarks — every joint and keypoint in 3D space.',
    detail: '33 landmarks × 4 values each (x, y, z, visibility). From these, the system computes 10 key joint angles: left/right elbow, knee, hip, shoulder, and ankle. These angles form the input vector for the activity classifier.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: 'cyan',
  },
  {
    number: '04',
    title: 'AI classifies the activity',
    desc: 'A trained scikit-learn classifier takes the 10 joint angles as input and predicts the activity label: Walking, Running, Standing, Sitting, Fighting, or Falling.',
    detail: 'If the classifier confidence is low, a rule-based fallback activates — using angle thresholds (e.g. elbow < 90° + hip < 45° → Fighting). This hybrid approach ensures reliable results even in unusual poses.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'green',
  },
  {
    number: '05',
    title: 'SAFE or UNSAFE verdict',
    desc: 'After all frames are processed, the system calculates the unsafe frame percentage and delivers the final verdict for the whole video.',
    detail: 'Formula: unsafe% = (unsafe frames ÷ total frames) × 100. If unsafe% > 10% → UNSAFE. Otherwise → SAFE. The confidence score = 1 − (unsafe% ÷ 100). This 10% threshold means brief accidental gestures won\'t flag an entire video — only sustained unsafe activity does.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: 'green',
  },
  {
    number: '06',
    title: 'Results, alerts & export',
    desc: 'The annotated video is ready to download. Results are saved to your history. If you set up Smart Alerts, a threshold breach fires a notification instantly.',
    detail: 'The annotated MP4 has coloured bounding boxes (green = SAFE, red = UNSAFE), activity labels, and confidence overlays on every frame. Export the detection log as CSV or PDF. Smart Alerts listen via a browser event and fire push notifications or sounds based on your configured thresholds.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    color: 'red',
  },
];

const colorMap = {
  cyan:  { num: 'text-neon-cyan', border: 'border-neon-cyan/30', icon: 'text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20', line: 'bg-neon-cyan/20', dot: 'bg-neon-cyan' },
  green: { num: 'text-neon-green', border: 'border-neon-green/30', icon: 'text-neon-green bg-neon-green/10 border border-neon-green/20', line: 'bg-neon-green/20', dot: 'bg-neon-green' },
  red:   { num: 'text-neon-red', border: 'border-neon-red/30', icon: 'text-neon-red bg-neon-red/10 border border-neon-red/20', line: 'bg-neon-red/20', dot: 'bg-neon-red' },
};

const FAQ = [
  { q: 'Do I need any technical knowledge to use VisionSafe?', a: 'None at all. Drag a video, wait a few seconds, read the result. Everything else is optional.' },
  { q: 'How long does analysis take?', a: 'Short clips under 30 seconds typically complete in 5–15 seconds. A 5-minute video takes 2–5 minutes. All 4 slots process in parallel so you can batch-analyse efficiently.' },
  { q: 'What if no person is detected in the frame?', a: 'Frames with no detected person are not classified — they are simply skipped. The verdict is based only on frames where at least one person was found.' },
  { q: 'Can I use my own IP camera or CCTV?', a: 'RTSP stream support is available on the Enterprise plan. For other plans, you can export footage from your CCTV system and upload the video file.' },
  { q: 'Is the confidence score always accurate?', a: 'The AI is highly accurate for the 6 trained activity classes. Unusual lighting, occlusion, or activities outside the training set may reduce confidence. The rule-based fallback helps cover edge cases.' },
];

const HowItWorks = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeStep, setActiveStep] = useState(null);

  return (
    <div className="min-h-screen cyber-grid pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-cyan/30 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
            <span className="font-mono-jet text-xs text-neon-cyan tracking-widest">HOW IT WORKS</span>
          </div>
          <h1 className="font-sora text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
            From video to verdict<br className="hidden sm:block" />
            <span className="text-gradient"> in seconds</span>
          </h1>
          <p className="font-inter text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            VisionSafe runs a three-stage AI pipeline on every frame of your footage. Here's exactly what happens — step by step.
          </p>
        </div>

        {/* ── Pipeline diagram ── */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-16 px-4">
          {['Upload', 'YOLOv8', 'MediaPipe', 'Classifier', 'Verdict', 'Alerts'].map((s, i) => (
            <React.Fragment key={s}>
              <div className="glass-panel border border-neon-cyan/20 rounded-lg px-4 py-2 text-center">
                <p className="font-mono-jet text-xs text-neon-cyan font-bold">{s}</p>
              </div>
              {i < 5 && (
                <svg className="w-4 h-4 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── Steps ── */}
        <div className="space-y-6 mb-20">
          {STEPS.map((step, i) => {
            const c = colorMap[step.color];
            const isOpen = activeStep === i;
            return (
              <div
                key={step.number}
                className={`glass-panel rounded-2xl border transition-all duration-300 cursor-pointer ${isOpen ? c.border : 'border-white/8 hover:border-white/15'}`}
                onClick={() => setActiveStep(isOpen ? null : i)}
              >
                <div className="p-6 flex items-start gap-5">
                  {/* Step number */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <span className={`font-sora text-3xl font-black leading-none ${c.num}`}>{step.number}</span>
                  </div>

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
                    {step.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-sora text-lg font-extrabold text-white mb-1">{step.title}</h3>
                    <p className="font-inter text-sm text-slate-400 leading-relaxed">{step.desc}</p>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div className={`mt-4 pl-4 border-l-2 ${c.border}`}>
                        <p className="font-inter text-sm text-slate-300 leading-relaxed">{step.detail}</p>
                      </div>
                    )}
                  </div>

                  {/* Expand chevron */}
                  <svg
                    className={`w-5 h-5 text-slate-500 flex-shrink-0 mt-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Decision logic visual ── */}
        <div className="glass-panel rounded-2xl border border-white/8 p-8 mb-16">
          <h2 className="font-sora text-xl sm:text-2xl font-extrabold text-white text-center mb-8">
            The safety decision formula
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
            <div className="glass-panel rounded-xl border border-white/10 p-4 w-full sm:w-auto">
              <p className="font-mono-jet text-xs text-slate-500 mb-1">UNSAFE FRAMES</p>
              <p className="font-sora text-2xl font-black text-neon-red">N</p>
            </div>
            <span className="font-sora text-2xl text-slate-600">÷</span>
            <div className="glass-panel rounded-xl border border-white/10 p-4 w-full sm:w-auto">
              <p className="font-mono-jet text-xs text-slate-500 mb-1">TOTAL FRAMES</p>
              <p className="font-sora text-2xl font-black text-slate-300">T</p>
            </div>
            <span className="font-sora text-2xl text-slate-600">×</span>
            <div className="glass-panel rounded-xl border border-white/10 p-4 w-full sm:w-auto">
              <p className="font-mono-jet text-xs text-slate-500 mb-1">SCALE</p>
              <p className="font-sora text-2xl font-black text-slate-300">100</p>
            </div>
            <span className="font-sora text-2xl text-slate-600">=</span>
            <div className="glass-panel rounded-xl border border-neon-cyan/20 p-4 w-full sm:w-auto">
              <p className="font-mono-jet text-xs text-neon-cyan mb-1">UNSAFE %</p>
              <p className="font-sora text-2xl font-black text-neon-cyan">X%</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 max-w-lg mx-auto">
            <div className="flex-1 rounded-xl border border-neon-green/30 bg-neon-green/5 p-4 text-center">
              <p className="font-mono-jet text-xs text-neon-green font-bold mb-1">X% ≤ 10%</p>
              <p className="font-sora text-lg font-black text-neon-green">SAFE ✓</p>
              <p className="font-inter text-xs text-slate-500 mt-1">Confidence = 1 − (X ÷ 100)</p>
            </div>
            <div className="flex-1 rounded-xl border border-neon-red/30 bg-neon-red/5 p-4 text-center">
              <p className="font-mono-jet text-xs text-neon-red font-bold mb-1">X% &gt; 10%</p>
              <p className="font-sora text-lg font-black text-neon-red">UNSAFE ⚠</p>
              <p className="font-inter text-xs text-slate-500 mt-1">Review annotated video</p>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mb-16">
          <h2 className="font-sora text-xl sm:text-2xl font-extrabold text-white text-center mb-8">
            Common questions
          </h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="glass-panel rounded-xl border border-white/8 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-inter text-sm font-semibold text-white pr-4">{item.q}</span>
                  <svg
                    className={`w-4 h-4 text-neon-cyan flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 border-t border-white/5">
                    <p className="font-inter text-sm text-slate-400 leading-relaxed pt-4">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="glass-panel rounded-2xl border border-neon-cyan/20 p-8 sm:p-12 text-center bg-neon-cyan/3">
          <h2 className="font-sora text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Ready to try it yourself?
          </h2>
          <p className="font-inter text-slate-400 text-sm sm:text-base mb-8 max-w-md mx-auto">
            The free plan gives you 5 analyses with no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="bg-neon-cyan text-cyber-black font-inter font-bold px-8 py-3 rounded-lg hover:bg-cyan-300 shadow-[0_0_24px_rgba(0,240,255,0.3)] transition-all text-sm w-full sm:w-auto"
            >
              Get started free →
            </button>
            <button
              onClick={() => navigate('/features')}
              className="border border-neon-cyan/40 text-neon-cyan font-inter font-semibold px-8 py-3 rounded-lg hover:bg-neon-cyan/10 transition-all text-sm w-full sm:w-auto"
            >
              Explore all features
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HowItWorks;
