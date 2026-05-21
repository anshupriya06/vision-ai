import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Section = ({ id, title, children }) => (
  <section id={id} className="glass-panel rounded-sm overflow-hidden mb-6">
    <div className="px-6 py-4 border-b border-neon-cyan/10">
      <h2 className="font-sora text-sm font-bold text-neon-cyan tracking-widest">{title}</h2>
    </div>
    <div className="px-6 py-5 space-y-3 font-mono-jet text-xs text-slate-400 leading-relaxed">
      {children}
    </div>
  </section>
);

const Highlight = ({ children }) => (
  <span className="text-slate-200 font-semibold">{children}</span>
);

const TOC = ({ items }) => (
  <div className="glass-panel rounded-sm p-5 mb-8 border border-neon-cyan/10">
    <p className="font-sora text-xs text-neon-cyan tracking-widest mb-4">TABLE OF CONTENTS</p>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i}>
          <a href={`#${item.id}`} className="font-mono-jet text-xs text-slate-500 hover:text-neon-cyan transition-colors flex items-center gap-2">
            <span className="text-neon-cyan/40">{String(i + 1).padStart(2, '0')}.</span>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const CookieRow = ({ name, purpose, duration, type }) => {
  const typeColors = {
    Essential: 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/5',
    Analytics: 'text-neon-green border-neon-green/30 bg-neon-green/5',
    Preference: 'text-violet-400 border-violet-400/30 bg-violet-400/5',
  };
  return (
    <div className="grid grid-cols-[1fr_2fr_auto_auto] gap-3 py-3 border-b border-slate-800 last:border-0 items-start text-xs">
      <span className="font-mono-jet text-slate-200 font-bold break-all">{name}</span>
      <span className="font-mono-jet text-slate-500">{purpose}</span>
      <span className="font-mono-jet text-slate-600 whitespace-nowrap">{duration}</span>
      <span className={`font-mono-jet text-xs px-2 py-0.5 rounded-sm border whitespace-nowrap ${typeColors[type] || 'text-slate-500 border-slate-700'}`}>{type}</span>
    </div>
  );
};

const Cookies = () => {
  const toc = [
    { id: 'what', label: 'What Are Cookies?' },
    { id: 'how', label: 'How We Use Cookies' },
    { id: 'essential', label: 'Essential Cookies' },
    { id: 'analytics', label: 'Analytics Cookies' },
    { id: 'preference', label: 'Preference Cookies' },
    { id: 'third-party', label: 'Third-Party Cookies' },
    { id: 'manage', label: 'Managing Your Cookies' },
    { id: 'updates', label: 'Updates to This Policy' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/" className="font-mono-jet text-xs text-slate-500 hover:text-neon-cyan transition-colors">HOME</Link>
            <span className="text-slate-700">/</span>
            <span className="font-mono-jet text-xs text-neon-cyan">COOKIE POLICY</span>
          </div>
          <h1 className="font-sora text-3xl sm:text-4xl font-black text-white mb-3">
            Cookie <span className="text-neon-cyan" style={{ textShadow: '0 0 20px #00f0ff44' }}>Policy</span>
          </h1>
          <p className="font-mono-jet text-xs text-slate-500">
            Last updated: <span className="text-slate-300">May 21, 2026</span> &nbsp;·&nbsp; Effective: <span className="text-slate-300">May 21, 2026</span>
          </p>
        </div>

        <TOC items={toc} />

        <Section id="what" title="01. WHAT ARE COOKIES?">
          <p>
            Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work efficiently, remember your preferences, and provide usage information to site owners.
          </p>
          <p>
            Cookies set by the website operator (VisionSafe) are called <Highlight>first-party cookies</Highlight>. Cookies set by third parties (such as Google Firebase) are called <Highlight>third-party cookies</Highlight>.
          </p>
          <p>
            Cookies can be <Highlight>session cookies</Highlight> (deleted when you close your browser) or <Highlight>persistent cookies</Highlight> (remain on your device for a set period).
          </p>
        </Section>

        <Section id="how" title="02. HOW WE USE COOKIES">
          <p>VisionSafe uses cookies and similar local storage mechanisms for three purposes:</p>
          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            {[
              {
                type: 'Essential',
                color: 'border-neon-cyan/30 bg-neon-cyan/5',
                label: 'text-neon-cyan',
                desc: 'Required for the service to function. Cannot be disabled.',
              },
              {
                type: 'Analytics',
                color: 'border-neon-green/30 bg-neon-green/5',
                label: 'text-neon-green',
                desc: 'Help us understand usage patterns to improve the service.',
              },
              {
                type: 'Preference',
                color: 'border-violet-400/30 bg-violet-400/5',
                label: 'text-violet-400',
                desc: 'Remember your settings such as theme and display options.',
              },
            ].map(c => (
              <div key={c.type} className={`border rounded-sm p-3 ${c.color}`}>
                <p className={`font-sora text-xs font-bold mb-1 ${c.label}`}>{c.type}</p>
                <p className="font-mono-jet text-xs text-slate-400">{c.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="essential" title="03. ESSENTIAL COOKIES">
          <p>These cookies are strictly necessary for the website to function and cannot be switched off. They include authentication tokens and security mechanisms.</p>
          <div className="mt-4">
            <div className="grid grid-cols-[1fr_2fr_auto_auto] gap-3 pb-2 border-b border-neon-cyan/20 text-xs font-sora text-neon-cyan/60 tracking-widest">
              <span>NAME</span><span>PURPOSE</span><span>DURATION</span><span>TYPE</span>
            </div>
            <CookieRow name="firebase-auth-token" purpose="Stores your Firebase authentication session to keep you logged in" duration="Session" type="Essential" />
            <CookieRow name="__Secure-1PSID" purpose="Google Sign-In session identifier for authentication flow" duration="2 years" type="Essential" />
            <CookieRow name="vs-csrf" purpose="Cross-Site Request Forgery protection token" duration="Session" type="Essential" />
          </div>
        </Section>

        <Section id="analytics" title="04. ANALYTICS COOKIES">
          <p>Analytics cookies help us understand how visitors interact with VisionSafe. All data is aggregated and does not identify individual users personally.</p>
          <div className="mt-4">
            <div className="grid grid-cols-[1fr_2fr_auto_auto] gap-3 pb-2 border-b border-neon-cyan/20 text-xs font-sora text-neon-cyan/60 tracking-widest">
              <span>NAME</span><span>PURPOSE</span><span>DURATION</span><span>TYPE</span>
            </div>
            <CookieRow name="_ga" purpose="Google Analytics: distinguishes users for aggregate traffic reporting" duration="2 years" type="Analytics" />
            <CookieRow name="_ga_*" purpose="Google Analytics: persists session state" duration="2 years" type="Analytics" />
            <CookieRow name="vs-session-id" purpose="Internal session identifier for error and performance tracking" duration="Session" type="Analytics" />
          </div>
          <p className="mt-4">You can opt out of Google Analytics by installing the <Highlight>Google Analytics Opt-out Browser Add-on</Highlight> or by disabling analytics cookies in your browser settings.</p>
        </Section>

        <Section id="preference" title="05. PREFERENCE COOKIES">
          <p>Preference cookies (often stored via <code className="text-neon-cyan bg-neon-cyan/10 px-1 rounded">localStorage</code>) allow VisionSafe to remember choices you make to personalise your experience.</p>
          <div className="mt-4">
            <div className="grid grid-cols-[1fr_2fr_auto_auto] gap-3 pb-2 border-b border-neon-cyan/20 text-xs font-sora text-neon-cyan/60 tracking-widest">
              <span>NAME</span><span>PURPOSE</span><span>DURATION</span><span>TYPE</span>
            </div>
            <CookieRow name="vs-theme" purpose="Remembers your dark/light mode preference" duration="Persistent" type="Preference" />
            <CookieRow name="vs-alert-settings" purpose="Saves your Smart Alert threshold configuration" duration="Persistent" type="Preference" />
            <CookieRow name="vs-alert-history" purpose="Stores local alert history for the Smart Alerts panel" duration="Persistent" type="Preference" />
          </div>
          <p className="mt-4">These are stored locally in your browser and not transmitted to our servers. You can clear them at any time by clearing your browser's local storage.</p>
        </Section>

        <Section id="third-party" title="06. THIRD-PARTY COOKIES">
          <p>Some third-party services we use may place their own cookies on your device:</p>
          <div className="space-y-4 mt-3">
            {[
              {
                provider: 'Google Firebase',
                purpose: 'Authentication and database services. Firebase may set cookies as part of the Google Sign-In flow.',
                link: 'https://firebase.google.com/support/privacy',
                linkLabel: "Firebase Privacy Policy",
              },
              {
                provider: 'Google Analytics',
                purpose: 'Usage analytics. We use Google Analytics 4 with IP anonymization enabled.',
                link: 'https://policies.google.com/privacy',
                linkLabel: "Google Privacy Policy",
              },
              {
                provider: 'Stripe',
                purpose: 'Payment processing for paid subscription plans. Stripe sets cookies to prevent fraud.',
                link: 'https://stripe.com/privacy',
                linkLabel: "Stripe Privacy Policy",
              },
            ].map(p => (
              <div key={p.provider} className="border-l-2 border-neon-cyan/30 pl-4">
                <p className="text-slate-200 font-bold mb-1">{p.provider}</p>
                <p className="text-slate-500">{p.purpose}</p>
                <p className="text-slate-600 mt-1">See their <span className="text-neon-cyan">{p.linkLabel}</span> for details.</p>
              </div>
            ))}
          </div>
          <p className="mt-4">We do not control third-party cookies. You can opt out via the respective providers' privacy settings.</p>
        </Section>

        <Section id="manage" title="07. MANAGING YOUR COOKIES">
          <p>You have several options for managing cookies:</p>

          <p className="text-slate-300 font-bold mt-4">Browser Settings</p>
          <p>Most browsers allow you to refuse or delete cookies. Note that disabling essential cookies will prevent you from logging in.</p>
          <div className="space-y-2 mt-2">
            {[
              ['Chrome', 'Settings → Privacy and security → Cookies and other site data'],
              ['Firefox', 'Settings → Privacy & Security → Cookies and Site Data'],
              ['Safari', 'Preferences → Privacy → Manage Website Data'],
              ['Edge', 'Settings → Cookies and site permissions → Cookies and site data'],
            ].map(([browser, path]) => (
              <div key={browser} className="flex gap-3">
                <span className="text-neon-cyan font-bold w-16 flex-shrink-0">{browser}</span>
                <span className="text-slate-500">{path}</span>
              </div>
            ))}
          </div>

          <p className="text-slate-300 font-bold mt-4">Local Storage</p>
          <p>VisionSafe preference data stored in localStorage can be cleared via:</p>
          <ul className="space-y-1 mt-1">
            <li className="flex gap-2"><span className="text-neon-cyan">→</span>Your browser's Developer Tools → Application → Local Storage → clear entries prefixed with <code className="text-neon-cyan bg-neon-cyan/10 px-1 rounded">vs-</code></li>
            <li className="flex gap-2"><span className="text-neon-cyan">→</span>Deleting your account (clears all associated data)</li>
          </ul>

          <p className="text-slate-300 font-bold mt-4">Do Not Track</p>
          <p>We respect the <Highlight>Do Not Track (DNT)</Highlight> browser signal. When DNT is enabled, we disable non-essential analytics tracking.</p>
        </Section>

        <Section id="updates" title="08. UPDATES TO THIS POLICY">
          <p>We may update this Cookie Policy to reflect changes in the cookies we use or for other operational, legal, or regulatory reasons. Changes will be posted on this page with an updated "Last updated" date.</p>
          <p className="mt-2">For significant changes, we will provide prominent notice on our website or notify you by email.</p>
        </Section>

        <Section id="contact" title="09. CONTACT">
          <p>For questions about our use of cookies:</p>
          <div className="mt-3 space-y-2">
            <div className="flex gap-3"><span className="text-neon-cyan">→</span><span><Highlight>Email:</Highlight> privacy@visionsafe.io</span></div>
            <div className="flex gap-3"><span className="text-neon-cyan">→</span><span><Highlight>Contact form:</Highlight> <Link to="/contact" className="text-neon-cyan hover:underline">visionsafe.io/contact</Link></span></div>
          </div>
        </Section>

        {/* Footer navigation */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-neon-cyan/10">
          <Link to="/privacy" className="font-mono-jet text-xs text-slate-500 hover:text-neon-cyan transition-colors">Privacy Policy →</Link>
          <Link to="/terms" className="font-mono-jet text-xs text-slate-500 hover:text-neon-cyan transition-colors">Terms of Service →</Link>
          <Link to="/security" className="font-mono-jet text-xs text-slate-500 hover:text-neon-cyan transition-colors">Security →</Link>
        </div>

      </div>
    </div>
  );
};

export default Cookies;
