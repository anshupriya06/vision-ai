import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) { setStatus('error'); setMessage('Invalid email address'); setTimeout(() => { setStatus('idle'); setMessage(''); }, 3000); return; }
    setStatus('loading');
    try {
      const r = await axios.post(`${API_BASE}/newsletter/subscribe`, null, { params: { email } });
      setStatus('success'); setMessage(r.data.message || 'Subscribed successfully'); setEmail('');
      setTimeout(() => { setStatus('idle'); setMessage(''); }, 5000);
    } catch (err) {
      setStatus('error'); setMessage(err.response?.data?.detail || 'Failed to subscribe');
      setTimeout(() => { setStatus('idle'); setMessage(''); }, 3000);
    }
  };

  const links = {
    SYSTEM: [{ label: 'Dashboard', path: '/' }, { label: 'History', path: '/history' }, { label: 'Pricing', path: '/pricing' }, { label: 'About', path: '/about' }],
    SUPPORT: [{ label: 'Contact', path: '/contact' }, { label: 'Documentation', path: '/documentation' }, { label: 'API', path: '/api' }],
    LEGAL: [{ label: 'Privacy', path: '/privacy' }, { label: 'Terms', path: '/terms' }, { label: 'Security', path: '/security' }],
  };

  return (
    <footer className="border-t border-neon-cyan/10 mt-20 bg-cyber-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 border border-neon-cyan/30 rounded-sm">
                <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="font-orbitron text-sm font-bold"><span className="text-neon-cyan">VISION</span><span className="text-white">SAFE</span></span>
            </div>
            <p className="font-mono-jet text-xs text-slate-500 leading-relaxed">AI-powered surveillance for a safer tomorrow.</p>
            <div className="flex gap-3 mt-4">
              {[
                { href: 'https://x.com/Anshu__Priya', label: 'X' },
                { href: 'https://github.com/anshupriya06', label: 'GH' },
                { href: 'https://www.linkedin.com/in/anshu-priya06/', label: 'LI' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                  className="w-7 h-7 border border-neon-cyan/20 rounded-sm flex items-center justify-center font-mono-jet text-xs text-slate-500 hover:text-neon-cyan hover:border-neon-cyan transition-all">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="font-orbitron text-xs text-neon-cyan tracking-widest mb-4">{cat}</h3>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item.label}>
                    <Link to={item.path} className="font-mono-jet text-xs text-slate-500 hover:text-neon-cyan transition-colors tracking-wide">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="glass-panel rounded-sm p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="font-orbitron text-xs text-white tracking-widest mb-1">STAY UPDATED</h3>
            <p className="font-mono-jet text-xs text-slate-500">Receive system updates and security alerts</p>
          </div>
          <div className="w-full md:w-auto">
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="operator@domain.io" disabled={status === 'loading'}
                className="cyber-input px-3 py-2 text-xs w-full md:w-56 disabled:opacity-50" />
              <button type="submit" disabled={status === 'loading'}
                className="btn-cyber-solid px-4 py-2 text-xs font-mono-jet tracking-widest whitespace-nowrap disabled:opacity-50">
                {status === 'loading' ? '...' : 'SUBSCRIBE'}
              </button>
            </form>
            {message && <p className={`font-mono-jet text-xs mt-2 ${status === 'success' ? 'text-neon-green' : 'text-neon-red'}`}>{message}</p>}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-neon-cyan/10">
          <p className="font-mono-jet text-xs text-slate-600">© {new Date().getFullYear()} VISIONSAFE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms', 'Cookies'].map(l => (
              <Link key={l} to="/" className="font-mono-jet text-xs text-slate-600 hover:text-neon-cyan transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-20" />
    </footer>
  );
};

export default Footer;
