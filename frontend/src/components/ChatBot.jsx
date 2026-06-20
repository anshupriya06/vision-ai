import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

/* ── Knowledge base ── */
const KB = [
  {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'howdy', 'sup'],
    answer: (name) => `Hey${name ? ` ${name}` : ''}! 👋 I'm the VisionSafe Assistant. I can help you with uploading videos, understanding results, smart alerts, pricing, and more. What do you need?`,
  },
  {
    patterns: ['what is visionsafe', 'what does this do', 'what is this', 'explain visionsafe', 'about visionsafe'],
    answer: () => `**VisionSafe** is an AI-powered workplace video surveillance platform.\n\nYou upload video footage (or stream your webcam) and the system automatically analyses every frame using:\n• **YOLOv8** — detects people and objects\n• **MediaPipe** — extracts 33 body pose landmarks\n• **Custom AI classifier** — labels activity as SAFE or UNSAFE\n\nResults come back in seconds with confidence scores, annotated video, and exportable reports.`,
  },
  {
    patterns: ['upload', 'how to upload', 'upload video', 'add video', 'drag drop'],
    answer: () => `**Uploading a video is simple:**\n\n1. Go to the **Dashboard** (home when logged in)\n2. You'll see **4 feed slots** — drag & drop a video onto any slot, or click to browse\n3. Analysis starts **automatically** — no extra button needed\n4. Results appear in the same slot: SAFE ✅ or UNSAFE ⚠️ with a confidence score\n\nAll 4 slots can analyse videos **simultaneously**. Supported formats: MP4, AVI, MOV, MKV.`,
  },
  {
    patterns: ['safe', 'unsafe', 'what is safe', 'classification', 'how does it classify', 'how is safe determined'],
    answer: () => `**SAFE vs UNSAFE classification:**\n\nThe AI labels each frame's activity, then calculates:\n\`unsafe% = unsafe frames ÷ total frames × 100\`\n\n• If **unsafe% > 10%** → video is marked **UNSAFE** ⚠️\n• Otherwise → **SAFE** ✅\n\n**Safe activities:** Walking, Running, Standing, Sitting, Yoga\n**Unsafe activities:** Fighting, Falling, Aggressive gestures, and others\n\nThe **confidence score** = proportion of safe frames (higher = safer).`,
  },
  {
    patterns: ['confidence', 'confidence score', 'what is confidence', 'percentage'],
    answer: () => `**Confidence score** represents how safe the video is:\n\n• **90–100%** → Very safe, minimal unsafe frames detected\n• **70–90%** → Mostly safe, minor incidents\n• **50–70%** → Notable unsafe activity detected\n• **Below 50%** → Significant unsafe activity\n\nIt's calculated as: \`confidence = 1 - (unsafe_frames / total_frames)\``,
  },
  {
    patterns: ['live camera', 'webcam', 'live stream', 'live mode', 'camera'],
    answer: () => `**Live Camera mode** lets your webcam act as a continuous feed:\n\n1. Click **LIVE CAM** in the sidebar\n2. Select your camera device from the dropdown\n3. Set the **capture interval** (2–30 seconds between snapshots)\n4. Click **START CAMERA** then **START ANALYSIS**\n\nEvery N seconds, a frame is captured and sent through the full AI pipeline. Results update in real time with a **session stats panel** tracking safe/unsafe frame counts.`,
  },
  {
    patterns: ['smart alert', 'alert', 'notification', 'threshold', 'push notification'],
    answer: () => `**Smart Alerts** fire when unsafe activity crosses a threshold you set:\n\n• **Unsafe event threshold** — how many unsafe results trigger an alert (1–20)\n• **Time window** — the rolling window to count events in (10s–5min)\n• **Browser push notifications** — get a system notification even when the tab is in background\n• **Sound alert** — audible beep on threshold breach\n\nFind Smart Alerts in the **left sidebar** of the Dashboard. Use the TEST ALERT button to verify it works.`,
  },
  {
    patterns: ['history', 'past videos', 'previous', 'old videos', 'video history'],
    answer: () => `**Video History** is at **/history** (click HISTORY in the sidebar or navbar):\n\n• See all your past analysed videos with status + confidence\n• Use the **confidence filter slider** to show only high/low confidence results\n• Click any video to open a **detail panel** with full stats, frame-level detections, and an embedded video player\n• **Delete** any video you no longer need\n• **Export** results as CSV or PDF`,
  },
  {
    patterns: ['export', 'download', 'csv', 'pdf', 'report'],
    answer: () => `**Exporting results:**\n\n• **Annotated video** — after analysis, click the download link in the slot to get the AI-annotated MP4\n• **CSV export** — from the History page, export your video list as a spreadsheet\n• **PDF reports** — available on Pro and Enterprise plans; includes charts, detection breakdown, and timestamps\n\nAll exports include: filename, status, confidence, duration, safe%, unsafe%.`,
  },
  {
    patterns: ['admin', 'admin panel', 'admin page', 'administrator'],
    answer: () => `**Admin Panel** is only accessible to authorised admin emails.\n\nIt gives a **platform-wide view:**\n• **Overview** — total videos, users, unsafe counts, recent activity feed\n• **All Videos** — every upload across all users; search, flag, or delete\n• **Flagged** — review queue for suspicious videos you've flagged\n• **Users** — per-user breakdown: upload count, unsafe rate, last activity\n\nIf you need admin access, contact the platform owner.`,
  },
  {
    patterns: ['pricing', 'price', 'plan', 'cost', 'how much', 'subscription', 'free plan'],
    answer: () => `**VisionSafe plans:**\n\n🆓 **Free** — 5 analyses/month, 2-min videos, 7-day history. No card needed.\n\n💡 **Starter** — $9/mo — 50 analyses, 10-min videos, CSV export, email support.\n\n⚡ **Pro** — $29/mo — 300 analyses, 30-min videos, live cam, smart alerts, PDF reports, push notifications.\n\n🏢 **Enterprise** — $99/mo — Unlimited everything, custom classifiers, admin panel, dedicated SLA.\n\nYearly billing saves **~20%**. 14-day free trial on paid plans. Visit the **Pricing page** for full details.`,
  },
  {
    patterns: ['free', 'free plan', 'is it free', 'free tier', 'no cost'],
    answer: () => `Yes! VisionSafe has a **forever-free plan**:\n\n• 5 video analyses per month\n• Up to 2-minute videos\n• SAFE / UNSAFE classification\n• 7-day history\n• No credit card required\n\nUpgrade to a paid plan when you need more analyses, longer videos, or features like live cam and smart alerts.`,
  },
  {
    patterns: ['sign up', 'register', 'create account', 'login', 'log in', 'sign in', 'google'],
    answer: () => `**Creating an account is easy:**\n\n1. Click **LOGIN / SIGN UP** in the top navbar\n2. Choose **Email + Password** or **Sign in with Google** (one click!)\n3. Once logged in, you go straight to the Dashboard\n\nYour first login triggers a **5-step onboarding tour** to walk you through every feature. You can replay it from your Profile page.`,
  },
  {
    patterns: ['profile', 'account', 'settings', 'edit profile', 'change name'],
    answer: () => `**Your Profile** is at **/profile** (click your avatar or name in the navbar):\n\n• View your display name, email, and account creation date\n• Add/edit your **mobile number** and **bio**\n• See your profile picture (synced from Google if you used Google sign-in)\n\nClick **Edit Profile** to update your details.`,
  },
  {
    patterns: ['dark mode', 'light mode', 'theme', 'dark', 'light'],
    answer: () => `**Switching themes:**\n\nClick the **sun/moon icon** in the top navbar to toggle between dark and light mode.\n\n• **Dark mode** (default) — cyberpunk neon palette, easy on the eyes in low light\n• **Light mode** — clean indigo/slate palette, better for bright environments\n\nYour preference is saved and persists across sessions.`,
  },
  {
    patterns: ['onboarding', 'tour', 'tutorial', 'guide', 'walkthrough', 'how to use'],
    answer: () => `**The onboarding tour** is a 5-step walkthrough shown on first login.\n\nIf you want to replay it:\n1. Go to your **Profile page**\n2. Look for the "Replay Tour" option\n\nOr just ask me anything here — I know the whole platform! 😊`,
  },
  {
    patterns: ['yolo', 'mediapipe', 'model', 'ai model', 'how does ai work', 'machine learning', 'neural network'],
    answer: () => `**The AI pipeline (3 stages):**\n\n**1. YOLOv8n** (You Only Look Once)\n→ Detects people and vehicles in each frame. Draws bounding boxes.\n\n**2. MediaPipe PoseLandmarker**\n→ Extracts 33 body landmarks (joints) per detected person.\n\n**3. Scikit-learn Classifier (PKL)**\n→ Takes 10 joint angles computed from landmarks → predicts activity label.\n→ Falls back to rule-based thresholds if confidence is low.\n\nAll 3 run on every frame of your video — results are aggregated into the final SAFE/UNSAFE verdict.`,
  },
  {
    patterns: ['how long', 'processing time', 'how fast', 'speed', 'wait time'],
    answer: () => `**Processing time** depends on video length:\n\n• Short clips (< 30s) → usually **5–15 seconds**\n• 1-minute video → roughly **20–40 seconds**\n• 5-minute video → **2–5 minutes**\n\nThe AI processes every frame individually (YOLO + MediaPipe + classifier), so longer videos take proportionally more time. You can upload to all 4 slots in parallel to analyse multiple videos simultaneously.`,
  },
  {
    patterns: ['error', 'not working', 'broken', 'failed', 'issue', 'problem', 'bug', 'cant upload', "can't upload"],
    answer: () => `**Common issues and fixes:**\n\n🔴 **"Cannot reach backend"** → The server may be offline. Try again in a moment.\n\n🔴 **"Auth failed"** → Your session expired. Log out and log back in.\n\n🔴 **"Invalid file"** → Only video files are accepted (MP4, AVI, MOV, MKV). Images won't work.\n\n🔴 **Camera not starting** → Check browser permissions — allow camera access in your browser settings.\n\nStill stuck? Use the **Contact page** to reach support.`,
  },
  {
    patterns: ['contact', 'support', 'help', 'reach out', 'email us'],
    answer: () => `**Getting support:**\n\n• **Contact form** → /contact page — fill in your name, email, and message\n• **Email support** — available on Starter plan (general response)\n• **Priority support (24h SLA)** — Pro plan\n• **Dedicated support + SLA** — Enterprise plan\n\nFor bugs or feature requests, use the contact form and we'll get back to you!`,
  },
  {
    patterns: ['privacy', 'data', 'secure', 'gdpr', 'my data', 'video privacy', 'stored'],
    answer: () => `**Your data is private and secure:**\n\n• Videos are processed in **isolated environments** and never shared\n• Videos are **never used** for AI training without explicit consent\n• Processed videos are stored on the server; you can **delete them anytime** from History\n• Enterprise plans support **on-premise deployment** so data never leaves your infrastructure\n• The platform is **GDPR-ready**`,
  },
  {
    patterns: ['sidebar', 'panel', 'navigation', 'menu', 'hamburger'],
    answer: () => `**The Dashboard sidebar** contains:\n\n• **Navigation** — switch between Upload, Live Cam, History, Statistics\n• **System status** — AI model, YOLO, MediaPipe readiness\n• **My Stats** — your total analyses, safe count, confidence average\n• **Smart Alerts** — configure and monitor alert thresholds\n\nClick the **≡ hamburger icon** at the top of the sidebar to close it and give the feed slots more space. Click the same icon that appears in the top bar to reopen it.`,
  },
  {
    patterns: ['batch', 'multiple videos', '4 slots', 'simultaneous', 'parallel'],
    answer: () => `**Batch upload** means you can analyse **4 videos at once**:\n\n• The Dashboard shows a 2×2 grid of upload slots\n• Each slot is completely independent — its own file, its own analysis, its own result\n• Drop a video in each slot and all 4 start analysing in parallel\n• Results appear in each slot as they complete\n\nThis is great for processing a batch of surveillance footage quickly without waiting for each one to finish.`,
  },
];

const FALLBACK = `I'm not sure I have a specific answer for that. Here are some things I can help with:\n\n• How to upload videos\n• Understanding SAFE/UNSAFE results\n• Live camera setup\n• Smart alerts configuration\n• Pricing and plans\n• Account & profile\n• Privacy & data security\n\nTry rephrasing your question, or visit the **Contact page** for human support.`;

function getAnswer(input, userName) {
  const lower = input.toLowerCase().trim();
  for (const entry of KB) {
    if (entry.patterns.some(p => lower.includes(p))) {
      return typeof entry.answer === 'function' ? entry.answer(userName) : entry.answer;
    }
  }
  return FALLBACK;
}

/* render markdown-lite: **bold**, bullet • */
function renderText(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={i} className="block">
        {parts.map((part, j) =>
          j % 2 === 1
            ? <strong key={j} className="font-semibold text-white">{part}</strong>
            : <span key={j}>{part}</span>
        )}
        {i < lines.length - 1 && ''}
      </span>
    );
  });
}

const QUICK_PROMPTS = [
  'How do I upload a video?',
  'What does SAFE / UNSAFE mean?',
  'How do smart alerts work?',
  'What are the pricing plans?',
  'How does the AI work?',
];

const ChatBot = () => {
  const { currentUser } = useAuth();
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: `Hi there! 👋 I'm the VisionSafe Assistant.\n\nAsk me anything about uploading videos, understanding results, alerts, pricing, or how the AI works!`,
    },
  ]);
  const [typing, setTyping]   = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  const userName = currentUser?.displayName?.split(' ')[0] || null;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text) => {
    const q = text || input.trim();
    if (!q) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    setTimeout(() => {
      const answer = getAnswer(q, userName);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: answer }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => setMessages([{
    id: Date.now(),
    role: 'bot',
    text: `Chat cleared! Ask me anything about VisionSafe.`,
  }]);

  return (
    <>
      {/* ── Floating bubble ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-[9990] w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300
          ${open
            ? 'bg-slate-800 border border-white/10 rotate-0'
            : 'bg-neon-cyan hover:scale-110 shadow-[0_0_24px_rgba(0,240,255,0.5)]'
          }`}
        title={open ? 'Close chat' : 'Open VisionSafe Assistant'}
      >
        {open ? (
          <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-cyber-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Unread dot when closed */}
      {!open && (
        <span className="fixed bottom-[66px] right-6 z-[9991] w-3 h-3 rounded-full bg-neon-red border-2 border-[#020617] animate-pulse" />
      )}

      {/* ── Chat window ── */}
      <div className={`fixed bottom-24 right-6 z-[9989] w-[340px] sm:w-[380px] transition-all duration-300 origin-bottom-right
        ${open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}`}
      >
        <div className="flex flex-col rounded-2xl overflow-hidden border border-neon-cyan/20 shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_40px_rgba(0,240,255,0.08)]"
          style={{ height: '520px', background: 'rgba(5,15,30,0.97)', backdropFilter: 'blur(20px)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-neon-cyan/10 flex-shrink-0"
            style={{ background: 'rgba(0,240,255,0.05)' }}
          >
            <div className="w-8 h-8 rounded-full bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sora text-sm font-bold text-white">VisionSafe Assistant</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                <span className="font-mono-jet text-xs text-slate-500">Always online</span>
              </div>
            </div>
            <button onClick={clearChat} title="Clear chat"
              className="font-mono-jet text-xs text-slate-600 hover:text-slate-400 transition-colors px-2 py-1 rounded border border-transparent hover:border-white/10"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                    <span className="text-neon-cyan text-xs">V</span>
                  </div>
                )}
                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-inter
                  ${msg.role === 'user'
                    ? 'bg-neon-cyan text-cyber-black font-semibold rounded-tr-sm'
                    : 'bg-white/5 border border-white/8 text-slate-300 rounded-tl-sm'
                  }`}
                >
                  {renderText(msg.text)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                  <span className="text-neon-cyan text-xs">V</span>
                </div>
                <div className="bg-white/5 border border-white/8 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="flex-shrink-0 font-mono-jet text-xs px-3 py-1.5 rounded-full border border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/10 transition-all whitespace-nowrap"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 flex-shrink-0 border-t border-white/5 pt-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-neon-cyan/40 transition-all">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me anything…"
                className="flex-1 bg-transparent font-inter text-xs text-white placeholder-slate-600 outline-none"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || typing}
                className="w-7 h-7 rounded-lg bg-neon-cyan flex items-center justify-center flex-shrink-0 disabled:opacity-30 hover:bg-cyan-300 transition-all"
              >
                <svg className="w-3.5 h-3.5 text-cyber-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="font-mono-jet text-xs text-slate-700 text-center mt-2">VisionSafe AI Assistant · Press Enter to send</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
