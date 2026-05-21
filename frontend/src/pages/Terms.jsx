import React from 'react';
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

const Terms = () => {
  const toc = [
    { id: 'acceptance', label: 'Acceptance of Terms' },
    { id: 'service', label: 'Description of Service' },
    { id: 'accounts', label: 'Accounts & Registration' },
    { id: 'acceptable-use', label: 'Acceptable Use Policy' },
    { id: 'content', label: 'User Content' },
    { id: 'intellectual-property', label: 'Intellectual Property' },
    { id: 'payment', label: 'Payment & Billing' },
    { id: 'disclaimers', label: 'Disclaimers & Limitations' },
    { id: 'indemnification', label: 'Indemnification' },
    { id: 'termination', label: 'Termination' },
    { id: 'governing-law', label: 'Governing Law' },
    { id: 'changes', label: 'Changes to Terms' },
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
            <span className="font-mono-jet text-xs text-neon-cyan">TERMS OF SERVICE</span>
          </div>
          <h1 className="font-sora text-3xl sm:text-4xl font-black text-white mb-3">
            Terms of <span className="text-neon-cyan" style={{ textShadow: '0 0 20px #00f0ff44' }}>Service</span>
          </h1>
          <p className="font-mono-jet text-xs text-slate-500">
            Last updated: <span className="text-slate-300">May 21, 2026</span> &nbsp;·&nbsp; Effective: <span className="text-slate-300">May 21, 2026</span>
          </p>
        </div>

        <TOC items={toc} />

        <Section id="acceptance" title="01. ACCEPTANCE OF TERMS">
          <p>
            By accessing or using VisionSafe ("Service," "Platform"), operated by VisionSafe Technologies ("Company," "we," "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
          </p>
          <p>
            These Terms apply to all visitors, users, and others who access or use the Service. By creating an account or using any part of the Service, you confirm that you are at least <Highlight>16 years of age</Highlight> and have the legal capacity to enter into this agreement.
          </p>
          <div className="bg-neon-red/5 border border-neon-red/20 rounded-sm p-4">
            <p className="text-neon-red font-bold mb-1">Important Notice</p>
            <p>Section 8 contains limitations of liability and warranty disclaimers that significantly affect your legal rights. Please read them carefully.</p>
          </div>
        </Section>

        <Section id="service" title="02. DESCRIPTION OF SERVICE">
          <p>VisionSafe provides an AI-powered safety monitoring platform that includes:</p>
          <ul className="space-y-1 mt-2">
            {[
              'Video and image upload for AI-based safety analysis',
              'Live camera monitoring with real-time threat detection',
              'Batch processing of multiple video feeds simultaneously',
              'Smart alert system with configurable thresholds',
              'Historical analysis, reporting, and analytics',
              'User account management and personal history',
            ].map((item, i) => (
              <li key={i} className="flex gap-2"><span className="text-neon-cyan">→</span>{item}</li>
            ))}
          </ul>
          <p className="mt-3">We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time with reasonable notice. We will not be liable to you or any third party for any such modification, suspension, or discontinuation.</p>
        </Section>

        <Section id="accounts" title="03. ACCOUNTS & REGISTRATION">
          <p className="text-slate-300 font-bold">Account Creation</p>
          <p>You may register using email/password or Google Sign-In. You agree to provide accurate, current, and complete information and to keep it updated.</p>

          <p className="text-slate-300 font-bold mt-4">Account Security</p>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us at <Highlight>security@visionsafe.io</Highlight> of any unauthorised use of your account.</p>

          <p className="text-slate-300 font-bold mt-4">One Account Per User</p>
          <p>Each user may maintain only one account. Creating multiple accounts to circumvent restrictions or access free tier limits is prohibited.</p>

          <p className="text-slate-300 font-bold mt-4">Account Types</p>
          <div className="mt-2 space-y-2">
            {[
              ['Free', 'Limited uploads, basic features, community support'],
              ['Pro', 'Extended limits, advanced analytics, priority support'],
              ['Business', 'Team access, API, custom integrations, SLA'],
              ['Enterprise', 'Custom deployment, dedicated support, compliance features'],
            ].map(([tier, desc]) => (
              <div key={tier} className="flex items-start gap-3 border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                <span className="text-neon-cyan font-bold w-20 flex-shrink-0">{tier}</span>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="acceptable-use" title="04. ACCEPTABLE USE POLICY">
          <p>You agree not to use the Service to:</p>
          <ul className="space-y-2 mt-2">
            {[
              'Upload content that is illegal, harmful, threatening, abusive, or defamatory',
              'Violate any applicable laws or regulations, including privacy and surveillance laws in your jurisdiction',
              'Upload content depicting minors in any inappropriate context',
              'Attempt to reverse-engineer, decompile, or extract our AI models',
              'Use automated scripts or bots to bulk-upload content or scrape data',
              'Attempt to gain unauthorised access to other users\' accounts or our infrastructure',
              'Use the Service in a manner that could disable, overburden, or impair it',
              'Resell or sublicense access to the Service without explicit written permission',
              'Use the Service for illegal surveillance, stalking, or privacy violations',
            ].map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-neon-red flex-shrink-0">✕</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="bg-neon-cyan/5 border border-neon-cyan/20 rounded-sm p-4 mt-4">
            <p>VisionSafe is designed for <Highlight>legitimate safety and security purposes</Highlight> only. You are responsible for ensuring your use complies with all local surveillance, recording, and data protection laws.</p>
          </div>
        </Section>

        <Section id="content" title="05. USER CONTENT">
          <p className="text-slate-300 font-bold">Ownership</p>
          <p>You retain full ownership of all videos, images, and data you upload to VisionSafe. We do not claim ownership of your content.</p>

          <p className="text-slate-300 font-bold mt-4">License to Us</p>
          <p>By uploading content, you grant VisionSafe a limited, non-exclusive, royalty-free licence to process, analyse, and store your content solely for the purpose of providing the Service to you.</p>

          <p className="text-slate-300 font-bold mt-4">Responsibility</p>
          <p>You are solely responsible for ensuring you have all necessary rights, consents, and permissions to upload and process the content. This includes obtaining consent from individuals who appear in your videos where required by law.</p>

          <p className="text-slate-300 font-bold mt-4">Content Removal</p>
          <p>We reserve the right to remove any content that violates these Terms or applicable law, without prior notice.</p>
        </Section>

        <Section id="intellectual-property" title="06. INTELLECTUAL PROPERTY">
          <p>The Service and its original content, features, and functionality (excluding User Content) are and will remain the exclusive property of VisionSafe Technologies and its licensors. This includes:</p>
          <ul className="space-y-1 mt-2">
            <li className="flex gap-2"><span className="text-neon-cyan">→</span>VisionSafe name, logo, and branding</li>
            <li className="flex gap-2"><span className="text-neon-cyan">→</span>AI models and detection algorithms</li>
            <li className="flex gap-2"><span className="text-neon-cyan">→</span>Software code, architecture, and APIs</li>
            <li className="flex gap-2"><span className="text-neon-cyan">→</span>User interface design and documentation</li>
          </ul>
          <p className="mt-3">Nothing in these Terms grants you any right to use our trademarks without prior written permission.</p>
        </Section>

        <Section id="payment" title="07. PAYMENT & BILLING">
          <p className="text-slate-300 font-bold">Paid Plans</p>
          <p>Paid subscriptions are billed in advance on a monthly or annual basis. Prices are listed on our <Link to="/pricing" className="text-neon-cyan hover:underline">Pricing page</Link> and are subject to change with 30 days notice.</p>

          <p className="text-slate-300 font-bold mt-4">Free Tier</p>
          <p>A limited free tier is available with no credit card required. Free tier usage is subject to rate limits and feature restrictions as described on the Pricing page.</p>

          <p className="text-slate-300 font-bold mt-4">Refunds</p>
          <p>We offer a <Highlight>7-day refund</Highlight> on first-time subscriptions if you are unsatisfied. After 7 days, subscriptions are non-refundable. Contact <Highlight>billing@visionsafe.io</Highlight> for refund requests.</p>

          <p className="text-slate-300 font-bold mt-4">Cancellation</p>
          <p>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. Your data is retained for 30 days after cancellation.</p>
        </Section>

        <Section id="disclaimers" title="08. DISCLAIMERS & LIMITATIONS">
          <div className="bg-neon-red/5 border border-neon-red/20 rounded-sm p-4 mb-4">
            <p className="text-neon-red font-bold mb-2">DISCLAIMER OF WARRANTIES</p>
            <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.</p>
          </div>

          <p className="text-slate-300 font-bold">AI Accuracy</p>
          <p>Our AI models provide probabilistic assessments, not guaranteed decisions. <Highlight>VisionSafe should not be the sole basis for critical safety decisions</Highlight>. Always supplement AI analysis with human judgement and appropriate professional oversight.</p>

          <p className="text-slate-300 font-bold mt-4">Limitation of Liability</p>
          <p>To the maximum extent permitted by law, VisionSafe shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, even if we have been advised of the possibility of such damages.</p>

          <p className="text-slate-300 font-bold mt-4">Maximum Liability</p>
          <p>Our total liability to you for any claim arising from these Terms or your use of the Service shall not exceed the amount you paid to us in the <Highlight>12 months preceding the claim</Highlight>.</p>
        </Section>

        <Section id="indemnification" title="09. INDEMNIFICATION">
          <p>You agree to defend, indemnify, and hold harmless VisionSafe, its affiliates, and their officers, directors, employees, and agents from any claims, damages, obligations, losses, liabilities, and expenses arising from:</p>
          <ul className="space-y-1 mt-2">
            <li className="flex gap-2"><span className="text-neon-cyan">→</span>Your use of or access to the Service</li>
            <li className="flex gap-2"><span className="text-neon-cyan">→</span>Your violation of these Terms</li>
            <li className="flex gap-2"><span className="text-neon-cyan">→</span>Your violation of any third-party rights, including intellectual property or privacy rights</li>
            <li className="flex gap-2"><span className="text-neon-cyan">→</span>Content you upload that causes harm to a third party</li>
          </ul>
        </Section>

        <Section id="termination" title="10. TERMINATION">
          <p>We may terminate or suspend your account at any time, with or without cause, with or without notice, effective immediately, if:</p>
          <ul className="space-y-1 mt-2">
            <li className="flex gap-2"><span className="text-neon-red">✕</span>You breach these Terms</li>
            <li className="flex gap-2"><span className="text-neon-red">✕</span>Your account is used for illegal activity</li>
            <li className="flex gap-2"><span className="text-neon-red">✕</span>We receive a valid legal order requiring termination</li>
            <li className="flex gap-2"><span className="text-neon-red">✕</span>Your account poses a security risk to our platform or other users</li>
          </ul>
          <p className="mt-3">You may delete your account at any time via your <Link to="/profile" className="text-neon-cyan hover:underline">Profile settings</Link>. Upon termination, your right to use the Service ceases immediately.</p>
        </Section>

        <Section id="governing-law" title="11. GOVERNING LAW">
          <p>These Terms shall be governed by and construed in accordance with the laws of <Highlight>India</Highlight>, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in <Highlight>India</Highlight>.</p>
          <p className="mt-2">If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.</p>
        </Section>

        <Section id="changes" title="12. CHANGES TO TERMS">
          <p>We reserve the right to modify these Terms at any time. Material changes will be communicated by:</p>
          <ul className="space-y-1 mt-2">
            <li className="flex gap-2"><span className="text-neon-cyan">→</span>Updating the "Last updated" date on this page</li>
            <li className="flex gap-2"><span className="text-neon-cyan">→</span>Sending an email notification to registered users</li>
            <li className="flex gap-2"><span className="text-neon-cyan">→</span>Displaying a notice in the application</li>
          </ul>
          <p className="mt-3">Continued use of the Service after changes take effect constitutes your acceptance of the revised Terms.</p>
        </Section>

        <Section id="contact" title="13. CONTACT">
          <p>For questions about these Terms:</p>
          <div className="mt-3 space-y-2">
            <div className="flex gap-3"><span className="text-neon-cyan">→</span><span><Highlight>Email:</Highlight> legal@visionsafe.io</span></div>
            <div className="flex gap-3"><span className="text-neon-cyan">→</span><span><Highlight>Contact form:</Highlight> <Link to="/contact" className="text-neon-cyan hover:underline">visionsafe.io/contact</Link></span></div>
          </div>
        </Section>

        {/* Footer navigation */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-neon-cyan/10">
          <Link to="/privacy" className="font-mono-jet text-xs text-slate-500 hover:text-neon-cyan transition-colors">Privacy Policy →</Link>
          <Link to="/cookies" className="font-mono-jet text-xs text-slate-500 hover:text-neon-cyan transition-colors">Cookie Policy →</Link>
          <Link to="/security" className="font-mono-jet text-xs text-slate-500 hover:text-neon-cyan transition-colors">Security →</Link>
        </div>

      </div>
    </div>
  );
};

export default Terms;
