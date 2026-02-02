import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setSubscribeStatus('error');
      setMessage('Please enter a valid email address');
      setTimeout(() => {
        setSubscribeStatus('idle');
        setMessage('');
      }, 3000);
      return;
    }

    setSubscribeStatus('loading');
    
    try {
      // Call actual backend endpoint
      const response = await axios.post(`${API_BASE}/newsletter/subscribe`, null, {
        params: { email }
      });
      
      setSubscribeStatus('success');
      setMessage(response.data.message || 'Successfully subscribed! Check your inbox.');
      setEmail('');
      
      setTimeout(() => {
        setSubscribeStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      setSubscribeStatus('error');
      setMessage(error.response?.data?.detail || 'Failed to subscribe. Please try again.');
      setTimeout(() => {
        setSubscribeStatus('idle');
        setMessage('');
      }, 3000);
    }
  };

  const footerLinks = {
    Product: [
      { label: 'Features', path: '/features' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'API', path: '/api' },
      { label: 'Documentation', path: '/documentation' }
    ],
    Company: [
      { label: 'About', path: '/about' },
      { label: 'Blog', path: '/blog' },
      { label: 'Careers', path: '/careers' },
      { label: 'Contact', path: '/contact' }
    ],
    Resources: [
      { label: 'Help Center', path: '/help-center' },
      { label: 'Community', path: '/community' },
      { label: 'Guides', path: '/guides' },
      { label: 'Partners', path: '/partners' }
    ],
    Legal: [
      { label: 'Privacy', path: '/privacy' },
      { label: 'Terms', path: '/terms' },
      { label: 'Security', path: '/security' },
      { label: 'Compliance', path: '/compliance' }
    ]
  };

  return (
    <footer className="relative mt-20 border-t border-accent/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-br from-accent to-safe p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gradient">VisionSafe</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              AI-powered surveillance for a safer tomorrow
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://x.com/Anshu__Priya"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="text-gray-400 hover:text-accent transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.5 11.24h-6.67l-5.22-6.82-5.97 6.82H1.66l7.73-8.84-8.15-10.66h6.84l4.72 6.26 5.44-6.26Zm-1.16 17.52h1.83L7.11 4.13H5.15l11.93 15.64Z" />
                </svg>
              </a>
              <a
                href="https://github.com/anshupriya06"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="text-gray-400 hover:text-accent transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.687-.103-.253-.446-1.27.098-2.647 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.6 9.6 0 0 1 2.5.336c1.909-1.296 2.748-1.026 2.748-1.026.546 1.377.202 2.394.1 2.647.64.7 1.028 1.594 1.028 2.687 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/anshu-priya06/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-accent transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554V14.88c0-1.328-.027-3.036-1.85-3.036-1.851 0-2.135 1.445-2.135 2.939v5.669H9.355V9h3.414v1.561h.048c.476-.9 1.637-1.85 3.367-1.85 3.6 0 4.264 2.368 4.264 5.452v6.289ZM5.337 7.433a2.065 2.065 0 1 1 0-4.13 2.065 2.065 0 0 1 0 4.13ZM6.115 20.452H4.56V9h1.556v11.452Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      onClick={scrollToTop}
                      className="text-gray-400 hover:text-accent transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="glassmorphism p-6 rounded-xl mb-8">
          <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-semibold mb-1">Stay Updated</h3>
              <p className="text-gray-400 text-sm">Get the latest news and updates from VisionSafe</p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={subscribeStatus === 'loading'}
                  className="px-4 py-2 bg-slate-800 border border-accent/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors flex-1 md:w-64 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button 
                  type="submit"
                  disabled={subscribeStatus === 'loading'}
                  className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent/80 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {subscribeStatus === 'loading' ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Subscribing...
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
              {message && (
                <p className={`text-sm ${subscribeStatus === 'success' ? 'text-emerald-400' : 'text-red-400'} animate-fade-in`}>
                  {message}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-accent/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} VisionSafe. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link to="/privacy" onClick={scrollToTop} className="hover:text-accent transition-colors">Privacy Policy</Link>
              <Link to="/terms" onClick={scrollToTop} className="hover:text-accent transition-colors">Terms of Service</Link>
              <Link to="/cookies" onClick={scrollToTop} className="hover:text-accent transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
    </footer>
  );
};

export default Footer;
