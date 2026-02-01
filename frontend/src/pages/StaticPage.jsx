import React from 'react';
import { useParams } from 'react-router-dom';

const STATIC_PAGES = {
  features: {
    title: 'Features',
    subtitle: 'Explore the capabilities that power VisionSafe',
    sections: [
      { heading: 'Real-time Intelligence', body: 'Detect suspicious activity instantly with AI-driven monitoring.' },
      { heading: 'Smart Alerts', body: 'Get notified when unsafe events are detected and respond faster.' },
      { heading: 'Video Insights', body: 'Review timelines, detections, and analytics in one dashboard.' }
    ]
  },
  pricing: {
    title: 'Pricing',
    subtitle: 'Flexible plans for teams of every size',
    sections: [
      { heading: 'Starter', body: 'Designed for small teams getting started with AI monitoring.' },
      { heading: 'Professional', body: 'Advanced insights, team collaboration, and priority support.' },
      { heading: 'Enterprise', body: 'Custom deployment, SLAs, and dedicated success team.' }
    ]
  },
  api: {
    title: 'API',
    subtitle: 'Integrate VisionSafe with your existing systems',
    sections: [
      { heading: 'RESTful Endpoints', body: 'Upload videos, retrieve detections, and manage alerts.' },
      { heading: 'Secure Access', body: 'Token-based authentication and fine-grained permissions.' },
      { heading: 'Webhooks', body: 'Automate workflows when unsafe events occur.' }
    ]
  },
  documentation: {
    title: 'Documentation',
    subtitle: 'Everything you need to deploy VisionSafe confidently',
    sections: [
      { heading: 'Quick Start', body: 'Launch the platform and connect your cameras in minutes.' },
      { heading: 'Integrations', body: 'Connect to storage, messaging, and alerting providers.' },
      { heading: 'Best Practices', body: 'Optimize performance with proven deployment guides.' }
    ]
  },
  blog: {
    title: 'Blog',
    subtitle: 'Latest updates from the VisionSafe team',
    sections: [
      { heading: 'Product News', body: 'Release highlights and roadmap previews.' },
      { heading: 'Security Insights', body: 'Trends and research on safer environments.' },
      { heading: 'Customer Stories', body: 'How teams use VisionSafe to stay secure.' }
    ]
  },
  careers: {
    title: 'Careers',
    subtitle: 'Build the future of AI safety with us',
    sections: [
      { heading: 'Why VisionSafe', body: 'Work on meaningful problems in AI and safety.' },
      { heading: 'Teams', body: 'Engineering, design, product, and customer success roles.' },
      { heading: 'Benefits', body: 'Flexible work, growth opportunities, and inclusive culture.' }
    ]
  },
  'help-center': {
    title: 'Help Center',
    subtitle: 'Answers to common questions and troubleshooting',
    sections: [
      { heading: 'Getting Started', body: 'Setup guides, onboarding, and first-time workflows.' },
      { heading: 'Account & Billing', body: 'Manage subscriptions, invoices, and account access.' },
      { heading: 'Troubleshooting', body: 'Diagnose connectivity or processing issues quickly.' }
    ]
  },
  community: {
    title: 'Community',
    subtitle: 'Connect with other VisionSafe users',
    sections: [
      { heading: 'Forums', body: 'Discuss product updates and share best practices.' },
      { heading: 'Events', body: 'Join webinars and live demos.' },
      { heading: 'Feedback', body: 'Help shape the product roadmap.' }
    ]
  },
  guides: {
    title: 'Guides',
    subtitle: 'Deep dives for advanced use cases',
    sections: [
      { heading: 'Operational Playbooks', body: 'Respond effectively to alerts and incidents.' },
      { heading: 'Deployment', body: 'Scale VisionSafe across multiple locations.' },
      { heading: 'Analytics', body: 'Make decisions with actionable insights.' }
    ]
  },
  partners: {
    title: 'Partners',
    subtitle: 'Trusted ecosystem powering VisionSafe deployments',
    sections: [
      { heading: 'Technology Partners', body: 'Integrations with security and infrastructure vendors.' },
      { heading: 'Service Partners', body: 'Deployment and managed services.' },
      { heading: 'Become a Partner', body: 'Collaborate with VisionSafe to deliver value.' }
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How VisionSafe collects and protects your data',
    sections: [
      { heading: 'Data Collection', body: 'We collect only what is needed to deliver the service.' },
      { heading: 'Data Usage', body: 'Your data is used to improve safety insights and alerts.' },
      { heading: 'Your Rights', body: 'Access, delete, or export your data at any time.' }
    ]
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'Usage rules and service terms for VisionSafe',
    sections: [
      { heading: 'Account Terms', body: 'Keep your credentials secure and accurate.' },
      { heading: 'Acceptable Use', body: 'Use VisionSafe in compliance with applicable laws.' },
      { heading: 'Service Availability', body: 'We strive for high uptime with transparent updates.' }
    ]
  },
  security: {
    title: 'Security',
    subtitle: 'Safeguarding your infrastructure and data',
    sections: [
      { heading: 'Infrastructure', body: 'Hardened systems with continuous monitoring.' },
      { heading: 'Encryption', body: 'Data encrypted in transit and at rest.' },
      { heading: 'Compliance', body: 'Industry-aligned practices and audits.' }
    ]
  },
  compliance: {
    title: 'Compliance',
    subtitle: 'Meeting industry standards and regulations',
    sections: [
      { heading: 'Policies', body: 'Clear policies to support regulated environments.' },
      { heading: 'Audit Readiness', body: 'Documentation and controls for audits.' },
      { heading: 'Certifications', body: 'Ongoing efforts toward key certifications.' }
    ]
  },
  cookies: {
    title: 'Cookie Policy',
    subtitle: 'Understanding how cookies are used',
    sections: [
      { heading: 'Essential Cookies', body: 'Required for secure access and core features.' },
      { heading: 'Analytics', body: 'Help us improve performance and reliability.' },
      { heading: 'Preferences', body: 'Customize your experience.' }
    ]
  }
};

const StaticPage = ({ page }) => {
  const params = useParams();
  const key = page || params.page;
  const content = STATIC_PAGES[key];

  if (!content) {
    return null;
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="glassmorphism p-10 rounded-2xl mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-4">{content.title}</h1>
          <p className="text-gray-400 text-lg max-w-2xl">{content.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {content.sections?.map((section) => (
            <div key={section.heading} className="glassmorphism p-6 rounded-2xl transition-all hover:scale-[1.01]">
              <h3 className="text-xl font-semibold text-white mb-3">{section.heading}</h3>
              <p className="text-gray-400 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StaticPage;
