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

const Privacy = () => {
  const toc = [
    { id: 'overview', label: 'Overview' },
    { id: 'collection', label: 'Information We Collect' },
    { id: 'usage', label: 'How We Use Your Information' },
    { id: 'sharing', label: 'Information Sharing' },
    { id: 'retention', label: 'Data Retention' },
    { id: 'security', label: 'Data Security' },
    { id: 'rights', label: 'Your Rights' },
    { id: 'cookies', label: 'Cookies & Tracking' },
    { id: 'children', label: "Children's Privacy" },
    { id: 'changes', label: 'Changes to This Policy' },
    { id: 'contact', label: 'Contact Us' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/" className="font-mono-jet text-xs text-slate-500 hover:text-neon-cyan transition-colors">HOME</Link>
            <span className="text-slate-700">/</span>
            <span className="font-mono-jet text-xs text-neon-cyan">PRIVACY POLICY</span>
          </div>
          <h1 className="font-sora text-3xl sm:text-4xl font-black text-white mb-3">
            Privacy <span className="text-neon-cyan" style={{ textShadow: '0 0 20px #00f0ff44' }}>Policy</span>
          </h1>
          <p className="font-mono-jet text-xs text-slate-500">
            Last updated: <span className="text-slate-300">May 21, 2026</span> &nbsp;·&nbsp; Effective: <span className="text-slate-300">May 21, 2026</span>
          </p>
        </div>

        <TOC items={toc} />

        <Section id="overview" title="01. OVERVIEW">
          <p>
            VisionSafe ("we," "us," or "our") is an AI-powered surveillance and safety monitoring platform. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our services at <Highlight>visionsafe.io</Highlight> and related applications.
          </p>
          <p>
            By using VisionSafe, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use of the service.
          </p>
          <div className="bg-neon-cyan/5 border border-neon-cyan/20 rounded-sm p-4">
            <p className="text-neon-cyan font-bold mb-1">Key Principle</p>
            <p>We collect only what is necessary to operate the service. We do not sell your personal data to third parties, ever.</p>
          </div>
        </Section>

        <Section id="collection" title="02. INFORMATION WE COLLECT">
          <p className="text-slate-300 font-bold">Account Information</p>
          <p>When you register, we collect your email address, display name, and profile photo (if provided via Google Sign-In). This information is used to identify your account and personalise your experience.</p>

          <p className="text-slate-300 font-bold mt-4">Video & Image Data</p>
          <p>Videos and images you upload for analysis are processed by our AI pipeline (YOLOv8 + MediaPipe). Processed results (safety status, confidence scores, detection metadata) are stored and associated with your account. Raw video files may be stored temporarily for processing and are deleted after a configurable retention period.</p>

          <p className="text-slate-300 font-bold mt-4">Usage Data</p>
          <p>We automatically collect usage information including IP address, browser type, device identifiers, pages visited, features used, timestamps, and error logs. This helps us improve reliability and user experience.</p>

          <p className="text-slate-300 font-bold mt-4">Communications</p>
          <p>If you contact us via the contact form or subscribe to our newsletter, we retain your email address and message content to respond to your inquiry and send relevant updates.</p>
        </Section>

        <Section id="usage" title="03. HOW WE USE YOUR INFORMATION">
          <ul className="space-y-2">
            {[
              ['Provide the Service', 'Authenticate you, process your video uploads, and return AI analysis results.'],
              ['Improve Accuracy', 'Aggregate (never personally identifiable) detection data to retrain and improve our models.'],
              ['Safety Alerts', 'Trigger in-app and push notifications based on your configured alert thresholds.'],
              ['Account Management', 'Send password resets, account confirmations, and security notices.'],
              ['Customer Support', 'Respond to enquiries, debug issues, and resolve billing disputes.'],
              ['Legal Compliance', 'Meet applicable legal obligations and respond to lawful requests from authorities.'],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-3">
                <span className="text-neon-cyan flex-shrink-0">→</span>
                <span><Highlight>{title}:</Highlight> {desc}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="sharing" title="04. INFORMATION SHARING">
          <p>We do not sell, rent, or trade your personal information. We may share data only in these limited circumstances:</p>
          <ul className="space-y-2 mt-3">
            {[
              ['Service Providers', 'Firebase (Auth & Storage), Google Cloud (hosting), Stripe (billing). These processors are bound by data processing agreements.'],
              ['Legal Requirements', 'When required by law, court order, or to protect the rights and safety of users or the public.'],
              ['Business Transfer', 'In the event of a merger or acquisition, your data may be transferred to the successor entity under equivalent privacy protections.'],
              ['With Your Consent', 'Any other sharing will only occur with your explicit prior consent.'],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-3">
                <span className="text-neon-cyan flex-shrink-0">▸</span>
                <span><Highlight>{title}:</Highlight> {desc}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="retention" title="05. DATA RETENTION">
          <p>We retain your data for as long as your account is active or as needed to provide services:</p>
          <div className="mt-3 space-y-2">
            {[
              ['Account data', 'Until account deletion + 30 days grace period'],
              ['Video analysis results', '90 days (configurable in account settings)'],
              ['Raw uploaded files', '24 hours after processing (then auto-deleted)'],
              ['Usage logs', '12 months'],
              ['Newsletter subscriptions', 'Until unsubscribed + 30 days'],
            ].map(([item, period]) => (
              <div key={item} className="flex items-center justify-between border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                <span className="text-slate-300">{item}</span>
                <span className="text-neon-cyan font-bold">{period}</span>
              </div>
            ))}
          </div>
          <p className="mt-4">You may request deletion of your data at any time via your account settings or by contacting us.</p>
        </Section>

        <Section id="security" title="06. DATA SECURITY">
          <p>We implement industry-standard technical and organisational measures to protect your data:</p>
          <ul className="space-y-1 mt-3">
            {[
              'All data in transit is encrypted via TLS 1.2+',
              'Firebase Authentication with secure token management',
              'API endpoints protected with Bearer token validation',
              'Database access restricted to authenticated backend services',
              'Regular security reviews and dependency audits',
              'No storage of plaintext passwords — all auth handled by Firebase',
            ].map((item, i) => (
              <li key={i} className="flex gap-2"><span className="text-neon-green">✓</span>{item}</li>
            ))}
          </ul>
          <p className="mt-4">No system is 100% secure. If you discover a vulnerability, please report it to <Highlight>security@visionsafe.io</Highlight>.</p>
        </Section>

        <Section id="rights" title="07. YOUR RIGHTS">
          <p>Depending on your jurisdiction, you may have the following rights:</p>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            {[
              ['Access', 'Request a copy of the personal data we hold about you.'],
              ['Rectification', 'Correct inaccurate or incomplete data.'],
              ['Erasure', 'Request deletion of your personal data.'],
              ['Portability', 'Export your data in a machine-readable format.'],
              ['Restriction', 'Limit how we process your data in certain circumstances.'],
              ['Objection', 'Object to processing based on legitimate interests.'],
            ].map(([right, desc]) => (
              <div key={right} className="bg-slate-800/30 border border-slate-700/50 rounded-sm p-3">
                <p className="text-neon-cyan font-bold mb-1">{right}</p>
                <p>{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4">To exercise these rights, visit your <Link to="/profile" className="text-neon-cyan hover:underline">Account Settings</Link> or email <Highlight>privacy@visionsafe.io</Highlight>. We will respond within 30 days.</p>
        </Section>

        <Section id="cookies" title="08. COOKIES & TRACKING">
          <p>We use cookies and similar technologies to operate our service. For full details, see our <Link to="/cookies" className="text-neon-cyan hover:underline">Cookie Policy</Link>.</p>
          <p className="mt-2">In summary, we use:</p>
          <ul className="space-y-1 mt-2">
            <li className="flex gap-2"><span className="text-neon-cyan">→</span><span><Highlight>Essential cookies</Highlight> — required for authentication and core functionality</span></li>
            <li className="flex gap-2"><span className="text-neon-cyan">→</span><span><Highlight>Preference cookies</Highlight> — remember your theme (dark/light) and UI settings</span></li>
            <li className="flex gap-2"><span className="text-neon-cyan">→</span><span><Highlight>Analytics cookies</Highlight> — aggregate usage statistics (no personal tracking)</span></li>
          </ul>
        </Section>

        <Section id="children" title="09. CHILDREN'S PRIVACY">
          <p>VisionSafe is not directed at children under the age of <Highlight>16</Highlight>. We do not knowingly collect personal data from children. If you believe a child under 16 has provided us with personal information, please contact us immediately and we will delete it.</p>
        </Section>

        <Section id="changes" title="10. CHANGES TO THIS POLICY">
          <p>We may update this Privacy Policy from time to time. We will notify you of material changes by:</p>
          <ul className="space-y-1 mt-2">
            <li className="flex gap-2"><span className="text-neon-cyan">→</span>Posting the new policy on this page with an updated "Last updated" date</li>
            <li className="flex gap-2"><span className="text-neon-cyan">→</span>Sending an email notification to your registered address for significant changes</li>
          </ul>
          <p className="mt-3">Your continued use of VisionSafe after changes take effect constitutes acceptance of the revised policy.</p>
        </Section>

        <Section id="contact" title="11. CONTACT US">
          <p>For privacy-related questions, data requests, or concerns:</p>
          <div className="mt-3 space-y-2">
            <div className="flex gap-3"><span className="text-neon-cyan">→</span><span><Highlight>Email:</Highlight> privacy@visionsafe.io</span></div>
            <div className="flex gap-3"><span className="text-neon-cyan">→</span><span><Highlight>Contact form:</Highlight> <Link to="/contact" className="text-neon-cyan hover:underline">visionsafe.io/contact</Link></span></div>
            <div className="flex gap-3"><span className="text-neon-cyan">→</span><span><Highlight>Response time:</Highlight> Within 30 days</span></div>
          </div>
        </Section>

        {/* Footer navigation */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-neon-cyan/10">
          <Link to="/terms" className="font-mono-jet text-xs text-slate-500 hover:text-neon-cyan transition-colors">Terms of Service →</Link>
          <Link to="/cookies" className="font-mono-jet text-xs text-slate-500 hover:text-neon-cyan transition-colors">Cookie Policy →</Link>
          <Link to="/security" className="font-mono-jet text-xs text-slate-500 hover:text-neon-cyan transition-colors">Security →</Link>
        </div>

      </div>
    </div>
  );
};

export default Privacy;
