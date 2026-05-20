import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Try VisionSafe with no commitment',
    monthlyPrice: 0,
    yearlyPrice: 0,
    accent: 'slate',
    badge: null,
    popular: false,
    cta: 'Get Started Free',
    features: [
      { text: '5 video analyses / month',         included: true },
      { text: 'Up to 2 min video length',          included: true },
      { text: 'SAFE / UNSAFE classification',       included: true },
      { text: 'Basic activity detection',           included: true },
      { text: '7-day video history',                included: true },
      { text: 'Batch upload (1 at a time)',         included: true },
      { text: 'Live webcam analysis',               included: false },
      { text: 'Smart alert thresholds',             included: false },
      { text: 'CSV / PDF export',                   included: false },
      { text: 'Push notifications',                 included: false },
      { text: 'Admin panel',                        included: false },
      { text: 'Priority support',                   included: false },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For individuals and small teams',
    monthlyPrice: 9,
    yearlyPrice: 7,
    accent: 'cyan',
    badge: null,
    popular: false,
    cta: 'Start Starter',
    features: [
      { text: '50 video analyses / month',          included: true },
      { text: 'Up to 10 min video length',          included: true },
      { text: 'SAFE / UNSAFE classification',       included: true },
      { text: 'Full activity detection',             included: true },
      { text: '30-day video history',               included: true },
      { text: 'Batch upload (4 slots)',              included: true },
      { text: 'Live webcam analysis',               included: false },
      { text: 'Smart alert thresholds',             included: false },
      { text: 'CSV export',                         included: true },
      { text: 'Push notifications',                 included: false },
      { text: 'Admin panel',                        included: false },
      { text: 'Email support',                      included: true },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For teams that need real-time monitoring',
    monthlyPrice: 29,
    yearlyPrice: 23,
    accent: 'cyan',
    badge: 'Most Popular',
    popular: true,
    cta: 'Start Pro',
    features: [
      { text: '300 video analyses / month',         included: true },
      { text: 'Up to 30 min video length',          included: true },
      { text: 'SAFE / UNSAFE classification',       included: true },
      { text: 'Full activity detection (6 classes)', included: true },
      { text: '90-day video history',               included: true },
      { text: 'Batch upload (4 slots, parallel)',   included: true },
      { text: 'Live webcam analysis',               included: true },
      { text: 'Smart alert thresholds',             included: true },
      { text: 'CSV + PDF export',                   included: true },
      { text: 'Browser push notifications',         included: true },
      { text: 'Admin panel',                        included: false },
      { text: 'Priority email support (24h)',        included: true },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For organizations with custom requirements',
    monthlyPrice: 99,
    yearlyPrice: 79,
    accent: 'green',
    badge: 'Full Access',
    popular: false,
    cta: 'Contact Sales',
    features: [
      { text: 'Unlimited video analyses',           included: true },
      { text: 'Unlimited video length',             included: true },
      { text: 'Custom activity classifiers',        included: true },
      { text: 'Multi-user team management',         included: true },
      { text: 'Unlimited video history',            included: true },
      { text: 'Unlimited batch upload',             included: true },
      { text: 'Live webcam + RTSP streams',         included: true },
      { text: 'Advanced smart alerts + webhooks',   included: true },
      { text: 'All export formats',                 included: true },
      { text: 'Push + SMS notifications',           included: true },
      { text: 'Full admin panel',                   included: true },
      { text: 'Dedicated support + SLA',            included: true },
    ],
  },
];

const COMPARISON = [
  { label: 'Analyses / month',     free: '5',          starter: '50',          pro: '300',              enterprise: 'Unlimited' },
  { label: 'Max video length',     free: '2 min',      starter: '10 min',      pro: '30 min',           enterprise: 'Unlimited' },
  { label: 'Batch upload slots',   free: '1',          starter: '4',           pro: '4 (parallel)',     enterprise: 'Unlimited' },
  { label: 'Video history',        free: '7 days',     starter: '30 days',     pro: '90 days',          enterprise: 'Unlimited' },
  { label: 'Live webcam',          free: false,        starter: false,         pro: true,               enterprise: true },
  { label: 'Smart alerts',         free: false,        starter: false,         pro: true,               enterprise: true },
  { label: 'CSV export',           free: false,        starter: true,          pro: true,               enterprise: true },
  { label: 'PDF reports',          free: false,        starter: false,         pro: true,               enterprise: true },
  { label: 'Push notifications',   free: false,        starter: false,         pro: true,               enterprise: true },
  { label: 'Admin panel',          free: false,        starter: false,         pro: false,              enterprise: true },
  { label: 'Custom classifiers',   free: false,        starter: false,         pro: false,              enterprise: true },
  { label: 'Support',              free: 'Community',  starter: 'Email',       pro: 'Priority (24h)',   enterprise: 'Dedicated SLA' },
];

const FAQ = [
  { q: 'Is the Free plan really free forever?', a: 'Yes — no credit card needed, no expiry. You get 5 analyses per month on the Free plan indefinitely.' },
  { q: 'Can I upgrade or downgrade anytime?', a: 'Absolutely. Switch plans anytime from your profile. Upgrades are instant; downgrades take effect on your next billing date.' },
  { q: 'What counts as one analysis?', a: 'Each video sent through the AI pipeline counts as one analysis, regardless of duration (within your plan limit).' },
  { q: 'Is there a free trial on paid plans?', a: '14-day free trial on Starter and Pro — no credit card required. Cancel before the trial ends and you won\'t be charged.' },
  { q: 'Do unused analyses roll over?', a: 'Monthly allocations reset on your billing date. Yearly plans pool the full annual quota so nothing is wasted.' },
  { q: 'Is my video data private?', a: 'Yes. Videos are processed in isolated environments and never shared or used for training. Enterprise supports on-premise deployment.' },
];

const Tick = ({ size = 'sm' }) => (
  <svg className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-neon-green flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const Cross = () => (
  <svg className="w-4 h-4 text-slate-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CellVal = ({ val }) => {
  if (val === true)  return <Tick size="sm" />;
  if (val === false) return <Cross />;
  return <span className="font-mono-jet text-xs text-slate-300">{val}</span>;
};

const Pricing = () => {
  const [billing, setBilling]   = useState('monthly');
  const [openFaq, setOpenFaq]   = useState(null);
  const [showTable, setShowTable] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleCTA = (plan) => {
    if (plan.id === 'enterprise') { navigate('/contact'); return; }
    if (!currentUser) navigate('/');
    else navigate('/');
  };

  return (
    <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen cyber-grid">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-cyan/30 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
            <span className="font-mono-jet text-xs text-neon-cyan tracking-widest">TRANSPARENT PRICING</span>
          </div>
          <h1 className="font-sora text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
            Start free.<br className="hidden sm:block" />
            <span className="text-gradient">Scale as you grow.</span>
          </h1>
          <p className="font-inter text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            No hidden fees. No credit card required for the Free plan. Upgrade, downgrade or cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 mt-8 p-1 glass-panel rounded-full border border-neon-cyan/20">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-6 py-2 font-mono-jet text-xs tracking-widest rounded-full transition-all ${
                billing === 'monthly' ? 'bg-neon-cyan text-cyber-black font-bold' : 'text-slate-400 hover:text-neon-cyan'
              }`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-6 py-2 font-mono-jet text-xs tracking-widest rounded-full transition-all flex items-center gap-2 ${
                billing === 'yearly' ? 'bg-neon-cyan text-cyber-black font-bold' : 'text-slate-400 hover:text-neon-cyan'
              }`}
            >
              YEARLY
              <span className="bg-neon-green/20 text-neon-green text-xs px-2 py-0.5 rounded-full font-bold">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* ── Plan cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {PLANS.map((plan) => {
            const price   = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const savings = plan.monthlyPrice > 0
              ? Math.round(((plan.monthlyPrice - plan.yearlyPrice) / plan.monthlyPrice) * 100)
              : 0;
            const isFree  = plan.id === 'free';
            const isGreen = plan.accent === 'green';

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-xl border transition-all duration-300 hover:-translate-y-1
                  ${plan.popular
                    ? 'border-neon-cyan bg-neon-cyan/5 shadow-[0_0_40px_rgba(0,240,255,0.12)]'
                    : isGreen
                      ? 'border-neon-green/30 glass-panel'
                      : 'border-white/8 glass-panel'
                  }`}
              >
                {/* Popular ribbon */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                    <span className={`font-mono-jet text-xs font-black px-4 py-1 rounded-full tracking-widest ${
                      isGreen ? 'bg-neon-green text-cyber-black' : 'bg-neon-cyan text-cyber-black'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Plan name + tagline */}
                  <div className="mb-5">
                    <div className={`font-sora text-lg font-extrabold mb-1 ${
                      plan.popular ? 'text-neon-cyan' : isGreen ? 'text-neon-green' : 'text-white'
                    }`}>
                      {plan.name}
                    </div>
                    <p className="font-inter text-xs text-slate-500 leading-relaxed">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {isFree ? (
                      <div className="flex items-end gap-1">
                        <span className="font-sora text-5xl font-black text-white">Free</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-end gap-1">
                          <span className="font-sora text-lg text-slate-400 mb-2">$</span>
                          <span className="font-sora text-5xl font-black text-white">{price}</span>
                          <span className="font-mono-jet text-sm text-slate-500 mb-2">/mo</span>
                        </div>
                        <p className="font-mono-jet text-xs mt-1.5">
                          {billing === 'yearly'
                            ? <span className="text-neon-green">Billed ${price * 12}/yr — {savings}% off</span>
                            : <span className="text-slate-500">Save {savings}% with yearly billing</span>
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleCTA(plan)}
                    className={`w-full py-2.5 rounded-lg font-inter text-sm font-bold tracking-wide mb-6 transition-all ${
                      plan.popular
                        ? 'bg-neon-cyan text-cyber-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                        : isGreen
                          ? 'bg-neon-green/10 border border-neon-green/40 text-neon-green hover:bg-neon-green/20'
                          : isFree
                            ? 'bg-white/8 border border-white/15 text-white hover:bg-white/12'
                            : 'border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10'
                    }`}
                  >
                    {plan.cta}
                  </button>

                  {/* Divider */}
                  <div className="h-px bg-white/5 mb-5" />

                  {/* Features */}
                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2.5">
                        {f.included
                          ? <Tick />
                          : <Cross />
                        }
                        <span className={`font-inter text-xs leading-relaxed ${
                          f.included ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Comparison table toggle ── */}
        <div className="text-center mb-10">
          <button
            onClick={() => setShowTable(v => !v)}
            className="inline-flex items-center gap-2 font-inter text-sm text-neon-cyan border border-neon-cyan/30 px-5 py-2 rounded-full hover:bg-neon-cyan/10 transition-all"
          >
            {showTable ? 'Hide' : 'View'} full comparison table
            <svg className={`w-4 h-4 transition-transform duration-300 ${showTable ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* ── Full comparison table ── */}
        {showTable && (
          <div className="glass-panel rounded-xl border border-white/8 overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left px-6 py-4 font-mono-jet text-xs text-slate-500 tracking-widest w-1/3">FEATURE</th>
                    {PLANS.map(p => (
                      <th key={p.id} className={`text-center px-4 py-4 font-sora text-sm font-bold ${
                        p.popular ? 'text-neon-cyan' : p.accent === 'green' ? 'text-neon-green' : 'text-white'
                      }`}>
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={row.label} className={`border-b border-white/4 ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                      <td className="px-6 py-3 font-inter text-xs text-slate-400">{row.label}</td>
                      <td className="px-4 py-3 text-center"><CellVal val={row.free} /></td>
                      <td className="px-4 py-3 text-center"><CellVal val={row.starter} /></td>
                      <td className="px-4 py-3 text-center bg-neon-cyan/3"><CellVal val={row.pro} /></td>
                      <td className="px-4 py-3 text-center"><CellVal val={row.enterprise} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Trust bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          {[
            { icon: '🔒', label: 'SOC 2 Ready',      sub: 'Security first' },
            { icon: '⚡', label: 'Real-time AI',       sub: 'YOLOv8 + MediaPipe' },
            { icon: '🌍', label: 'GDPR Compliant',    sub: 'Data stays yours' },
            { icon: '🎯', label: '99.9% Uptime SLA',  sub: 'Enterprise grade' },
          ].map(t => (
            <div key={t.label} className="glass-panel rounded-xl border border-white/8 p-4 flex items-center gap-3">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="font-inter text-xs font-semibold text-white">{t.label}</p>
                <p className="font-mono-jet text-xs text-slate-500">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FAQ ── */}
        <div className="mb-14">
          <h2 className="font-sora text-xl sm:text-2xl font-bold text-white text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-2">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="glass-panel rounded-xl border border-white/8 overflow-hidden"
              >
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

        {/* ── Bottom CTA ── */}
        <div className="glass-panel rounded-2xl border border-neon-cyan/20 p-8 sm:p-12 text-center bg-neon-cyan/3">
          <h2 className="font-sora text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Ready to secure your workspace?
          </h2>
          <p className="font-inter text-slate-400 text-sm sm:text-base mb-8 max-w-md mx-auto">
            Start with the Free plan — no credit card, no commitment. Upgrade when you're ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="bg-neon-cyan text-cyber-black font-inter font-bold px-8 py-3 rounded-lg hover:bg-cyan-300 shadow-[0_0_24px_rgba(0,240,255,0.3)] transition-all text-sm w-full sm:w-auto"
            >
              Get started free →
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="border border-neon-cyan/40 text-neon-cyan font-inter font-semibold px-8 py-3 rounded-lg hover:bg-neon-cyan/10 transition-all text-sm w-full sm:w-auto"
            >
              Talk to sales
            </button>
          </div>
          <p className="font-mono-jet text-xs text-slate-600 mt-6">
            No credit card required · Cancel anytime · 14-day trial on paid plans
          </p>
        </div>

      </div>
    </section>
  );
};

export default Pricing;
