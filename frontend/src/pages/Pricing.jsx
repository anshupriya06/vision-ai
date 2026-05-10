import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PLANS = [
  {
    id: 'starter',
    name: 'STARTER',
    tagline: 'For solo operators getting started with AI surveillance',
    monthlyPrice: 9,
    yearlyPrice: 7,
    borderClass: 'border-neon-cyan/30',
    badge: null,
    features: [
      { text: '25 video analyses / month', included: true },
      { text: 'Up to 5 min video length', included: true },
      { text: 'SAFE / UNSAFE classification', included: true },
      { text: 'Basic activity detection', included: true },
      { text: 'Video history (30 days)', included: true },
      { text: 'CSV export', included: true },
      { text: 'Batch upload (up to 3 videos)', included: true },
      { text: 'Live webcam stream analysis', included: false },
      { text: 'Smart alert thresholds', included: false },
      { text: 'PDF reports', included: false },
      { text: 'Admin panel access', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'GET STARTER',
    ctaClass: 'btn-cyber',
  },
  {
    id: 'pro',
    name: 'PRO',
    tagline: 'For teams that need serious real-time monitoring',
    monthlyPrice: 29,
    yearlyPrice: 23,
    borderClass: 'border-neon-cyan',
    badge: 'MOST POPULAR',
    features: [
      { text: '200 video analyses / month', included: true },
      { text: 'Up to 30 min video length', included: true },
      { text: 'SAFE / UNSAFE classification', included: true },
      { text: 'Full activity detection (6 classes)', included: true },
      { text: 'Video history (90 days)', included: true },
      { text: 'CSV + PDF export', included: true },
      { text: 'Batch upload (up to 20 videos)', included: true },
      { text: 'Live webcam stream analysis', included: true },
      { text: 'Smart alert thresholds', included: true },
      { text: 'PDF reports with analytics', included: true },
      { text: 'Admin panel access', included: false },
      { text: 'Email support (48h SLA)', included: true },
    ],
    cta: 'GET PRO',
    ctaClass: 'btn-cyber-solid',
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    tagline: 'For organizations with custom security requirements',
    monthlyPrice: 99,
    yearlyPrice: 79,
    borderClass: 'border-neon-green/50',
    badge: 'FULL ACCESS',
    features: [
      { text: 'Unlimited video analyses', included: true },
      { text: 'Unlimited video length', included: true },
      { text: 'Custom activity classifiers', included: true },
      { text: 'Multi-user team management', included: true },
      { text: 'Video history (unlimited)', included: true },
      { text: 'All export formats', included: true },
      { text: 'Unlimited batch upload', included: true },
      { text: 'Live webcam + RTSP stream', included: true },
      { text: 'Smart alerts + push notifications', included: true },
      { text: 'Custom branded reports', included: true },
      { text: 'Full admin panel + flag management', included: true },
      { text: 'Dedicated support + SLA', included: true },
    ],
    cta: 'GET ENTERPRISE',
    ctaClass: 'btn-cyber',
  },
];

const CheckIcon = () => (
  <svg className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon = () => (
  <svg className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Pricing = () => {
  const [billing, setBilling] = useState('monthly');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleCTA = (plan) => {
    if (plan.id === 'enterprise') navigate('/contact');
    else if (!currentUser) navigate('/');
    else navigate('/');
  };

  const starterSavings = Math.round(((9 - 7) / 9) * 100);
  const proSavings = Math.round(((29 - 23) / 29) * 100);
  const entSavings = Math.round(((99 - 79) / 99) * 100);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-cyan/30 rounded-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
            <span className="font-mono-jet text-xs text-neon-cyan tracking-widest">PRICING PLANS</span>
          </div>
          <h1 className="font-orbitron text-4xl sm:text-5xl font-black text-white mb-4">
            Choose Your <span className="text-gradient">Clearance Level</span>
          </h1>
          <p className="font-space text-slate-400 text-lg max-w-xl mx-auto">
            Every plan includes AI-powered detection, real-time analysis, and secure video storage.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 mt-8 p-1 glass-panel rounded-sm border border-neon-cyan/20">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 font-mono-jet text-xs tracking-widest rounded-sm transition-all ${
                billing === 'monthly' ? 'bg-neon-cyan text-cyber-black font-bold' : 'text-slate-500 hover:text-neon-cyan'
              }`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 font-mono-jet text-xs tracking-widest rounded-sm transition-all flex items-center gap-2 ${
                billing === 'yearly' ? 'bg-neon-cyan text-cyber-black font-bold' : 'text-slate-500 hover:text-neon-cyan'
              }`}
            >
              YEARLY
              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                billing === 'yearly' ? 'bg-cyber-black text-neon-green' : 'bg-neon-green/20 text-neon-green'
              }`}>
                SAVE UP TO -{entSavings}%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => {
            const price = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const monthlyPrice = plan.monthlyPrice;
            const yearlyPrice = plan.yearlyPrice;
            const savings = Math.round(((monthlyPrice - yearlyPrice) / monthlyPrice) * 100);
            const isEnterprise = plan.id === 'enterprise';
            const isPro = plan.id === 'pro';

            return (
              <div
                key={plan.id}
                className={`glass-panel rounded-sm p-7 flex flex-col relative border ${plan.borderClass} ${
                  isPro ? 'ring-1 ring-neon-cyan/40' : ''
                } ${isEnterprise ? 'ring-1 ring-neon-green/20' : ''} transition-all hover:scale-[1.02]`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`font-mono-jet text-xs font-black px-4 py-1 rounded-sm tracking-widest ${
                      isEnterprise
                        ? 'bg-neon-green text-cyber-black'
                        : 'bg-neon-cyan text-cyber-black'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <div className="mb-6">
                  <div className={`font-orbitron text-xs tracking-widest mb-2 ${
                    isEnterprise ? 'text-neon-green' : 'text-neon-cyan'
                  }`}>
                    {plan.name}
                  </div>
                  <p className="font-space text-sm text-slate-400 leading-snug">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-end gap-1">
                    <span className={`font-orbitron text-xl ${isEnterprise ? 'text-neon-green' : 'text-slate-400'}`}>$</span>
                    <span className="font-orbitron text-4xl font-black text-white">{price}</span>
                    <span className="font-mono-jet text-sm text-slate-500 mb-1">/mo</span>
                  </div>
                  {billing === 'yearly' ? (
                    <p className="font-mono-jet text-xs text-neon-green mt-1">
                      Billed ${price * 12}/yr — saves {savings}% vs monthly
                    </p>
                  ) : (
                    <p className="font-mono-jet text-xs text-slate-500 mt-1">
                      Or ${yearlyPrice}/mo billed yearly (save {savings}%)
                    </p>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleCTA(plan)}
                  className={`${plan.ctaClass} w-full py-3 text-xs font-mono-jet tracking-widest mb-8`}
                >
                  {plan.ctaClass === 'btn-cyber' ? <span>{plan.cta}</span> : plan.cta}
                </button>

                {/* Divider */}
                <div className={`h-px mb-6 ${isEnterprise ? 'bg-neon-green/10' : 'bg-neon-cyan/10'}`} />

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-3">
                      {f.included ? <CheckIcon /> : <CrossIcon />}
                      <span className={`font-mono-jet text-xs leading-relaxed ${
                        f.included ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Feature comparison strip */}
        <div className="glass-panel rounded-sm p-6 border border-neon-cyan/10 mb-8">
          <h2 className="font-orbitron text-sm text-neon-cyan tracking-widest text-center mb-6">KEY DIFFERENTIATORS</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '📡', title: 'Live Stream Analysis', desc: 'Webcam and RTSP feed processing in real-time — Pro & Enterprise only.' },
              { icon: '🛡', title: 'Smart Alert Thresholds', desc: 'Set custom unsafe frame limits per window. Get browser push notifications.' },
              { icon: '👥', title: 'Admin Panel', desc: 'Full user management, system-wide analytics, and flag review — Enterprise only.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 p-4 border border-neon-cyan/10 rounded-sm">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-orbitron text-xs text-white tracking-wide mb-1">{item.title}</h3>
                  <p className="font-mono-jet text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="glass-panel rounded-sm p-8 border border-neon-cyan/10">
          <h2 className="font-orbitron text-lg text-white text-center mb-8 tracking-wide">FREQUENTLY ASKED</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: 'Can I switch plans anytime?', a: 'Yes. Upgrade or downgrade at any time. Proration is applied automatically to your next bill.' },
              { q: 'What counts as one video analysis?', a: 'Each video processed through the AI pipeline counts as one analysis, regardless of length (within your plan limit).' },
              { q: 'Is there a free trial?', a: 'Yes — 14 days free on any paid plan. No credit card required. Cancel before the trial ends and you won\'t be charged.' },
              { q: 'What payment methods are accepted?', a: 'Visa, Mastercard, Amex, and wire transfer for Enterprise annual contracts.' },
              { q: 'Do unused analyses roll over?', a: 'No. Monthly allocations reset on your billing date. Yearly plans pool the full annual quota.' },
              { q: 'Is my video data private?', a: 'Yes. Videos are processed in isolated environments and never shared. Enterprise plans support on-premise deployment.' },
            ].map((item) => (
              <div key={item.q} className="border-l-2 border-neon-cyan/20 pl-4">
                <h3 className="font-space text-sm font-semibold text-white mb-1">{item.q}</h3>
                <p className="font-mono-jet text-xs text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="font-mono-jet text-xs text-slate-500 tracking-wide">
            Need a custom volume deal or on-premise deployment?{' '}
            <button onClick={() => navigate('/contact')} className="text-neon-cyan hover:underline">
              Talk to us →
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
