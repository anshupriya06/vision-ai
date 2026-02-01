import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
      const response = await axios.post('http://localhost:8000/newsletter/subscribe', null, {
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
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-accent transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-accent transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-accent transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
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
