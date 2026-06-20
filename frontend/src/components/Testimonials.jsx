import React, { useState, useEffect, useRef } from 'react';

const TESTIMONIALS = [
  {
    name: 'Rahul Mehra',
    role: 'Head of Security',
    company: 'InfraTech Solutions',
    avatar: 'RM',
    color: 'cyan',
    rating: 5,
    text: 'VisionSafe cut our incident review time by 80%. What used to take a team of three analysts an entire morning now happens automatically overnight. The SAFE/UNSAFE classification is remarkably accurate — we\'ve had almost zero false positives in three months of production use.',
  },
  {
    name: 'Priya Sharma',
    role: 'Operations Manager',
    company: 'LogiCore Warehouses',
    avatar: 'PS',
    color: 'green',
    rating: 5,
    text: 'We monitor 12 warehouse zones and the live webcam mode has been a game changer. Smart alerts notify us the moment unsafe behaviour crosses our threshold — before an incident becomes an accident. Setup took less than 20 minutes.',
  },
  {
    name: 'James Whitfield',
    role: 'Campus Safety Director',
    company: 'Northgate University',
    avatar: 'JW',
    color: 'cyan',
    rating: 5,
    text: 'The confidence score and annotated video export are invaluable for compliance reporting. We upload overnight footage and have a full report ready by morning. The admin panel lets me oversee all campus feeds from one place.',
  },
  {
    name: 'Aisha Okonkwo',
    role: 'Founder',
    company: 'SafeGuard Retail',
    avatar: 'AO',
    color: 'green',
    rating: 5,
    text: 'As a small business, I needed an AI surveillance tool that didn\'t require a dedicated IT team. VisionSafe\'s interface is intuitive enough that I set it up myself in an afternoon. The free plan let me test it thoroughly before committing to Pro.',
  },
  {
    name: 'Dr. Vikram Nair',
    role: 'Research Lead',
    company: 'ISRO Safety Labs',
    avatar: 'VN',
    color: 'cyan',
    rating: 5,
    text: 'The three-stage AI pipeline — YOLOv8, MediaPipe, and the pose classifier — gives us explainable results we can actually present to stakeholders. Other tools just give a score. VisionSafe shows exactly which frames triggered the alert and why.',
  },
  {
    name: 'Sofia Reyes',
    role: 'Facility Manager',
    company: 'Medica Health Group',
    avatar: 'SR',
    color: 'green',
    rating: 5,
    text: 'Patient safety in our corridors is critical. VisionSafe\'s falling detection has already flagged two incidents our staff didn\'t catch in time. The push notification system meant someone was alerted within seconds. Genuinely life-saving technology.',
  },
];

const colorMap = {
  cyan:  { ring: 'ring-neon-cyan/40', avatar: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30', quote: 'text-neon-cyan', border: 'border-neon-cyan/15' },
  green: { ring: 'ring-neon-green/40', avatar: 'bg-neon-green/10 text-neon-green border-neon-green/30', quote: 'text-neon-green', border: 'border-neon-green/15' },
};

const Stars = ({ count = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const Testimonials = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % TESTIMONIALS.length);
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  const goTo = (i) => {
    setActive(i);
    setPaused(true);
    clearInterval(timerRef.current);
    timerRef.current = setTimeout(() => setPaused(false), 8000);
  };

  const t = TESTIMONIALS[active];
  const c = colorMap[t.color];

  return (
    <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen cyber-grid relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="absolute top-0 left-1/3 w-64 h-64 bg-neon-cyan/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-neon-green/4 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-cyan/30 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
            <span className="font-mono-jet text-xs text-neon-cyan tracking-widest">TRUSTED BY TEAMS</span>
          </div>
          <h2 className="font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            What our users <span className="text-gradient">are saying</span>
          </h2>
          <p className="font-inter text-slate-400 text-base max-w-xl mx-auto">
            From warehouse managers to university safety directors — teams rely on VisionSafe every day.
          </p>
        </div>

        {/* Main featured card */}
        <div className="relative mb-8">
          <div
            key={active}
            className={`glass-panel rounded-2xl border ${c.border} p-8 sm:p-10 max-w-3xl mx-auto transition-all duration-500`}
            style={{ animation: 'fadeSlideIn 0.4s ease' }}
          >
            {/* Big quote mark */}
            <div className={`font-sora text-7xl leading-none ${c.quote} opacity-20 mb-2 select-none`}>"</div>

            {/* Quote text */}
            <p className="font-inter text-base sm:text-lg text-slate-200 leading-relaxed mb-8 -mt-4">
              {t.text}
            </p>

            {/* Author row */}
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center font-sora font-extrabold text-sm flex-shrink-0 ${c.avatar}`}>
                {t.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sora text-sm font-bold text-white">{t.name}</p>
                <p className="font-inter text-xs text-slate-400">{t.role} · {t.company}</p>
              </div>
              <Stars count={t.rating} />
            </div>
          </div>
        </div>

        {/* Dots navigation */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === active
                  ? 'w-6 h-2 bg-neon-cyan'
                  : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        {/* Thumbnail row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TESTIMONIALS.map((testimonial, i) => {
            const tc = colorMap[testimonial.color];
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`glass-panel rounded-xl border p-3 text-left transition-all duration-200 ${
                  i === active
                    ? `${tc.border} scale-105 shadow-lg`
                    : 'border-white/5 hover:border-white/15 opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-sora font-bold text-xs mb-2 ${tc.avatar}`}>
                  {testimonial.avatar}
                </div>
                <p className="font-inter text-xs font-semibold text-white leading-tight truncate">{testimonial.name}</p>
                <p className="font-mono-jet text-xs text-slate-600 truncate">{testimonial.company}</p>
              </button>
            );
          })}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-14">
          {[
            { value: '500+', label: 'Teams using VisionSafe' },
            { value: '2M+',  label: 'Videos analysed' },
            { value: '99.9%', label: 'Platform uptime' },
            { value: '4.9★', label: 'Average rating' },
          ].map(s => (
            <div key={s.label} className="glass-panel rounded-xl border border-white/8 p-5 text-center">
              <p className="font-sora text-2xl sm:text-3xl font-extrabold text-gradient mb-1">{s.value}</p>
              <p className="font-inter text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
