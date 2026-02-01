# VisionSafe Frontend

Modern React + Tailwind CSS dashboard for AI-powered public safety monitoring with Firebase Google Authentication.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account (free tier works)

### Installation

```bash
# Install dependencies
npm install

# Configure Firebase (see FIREBASE_SETUP.md)
# Edit src/firebase.js with your Firebase credentials

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔥 Firebase Setup

**⚠️ IMPORTANT:** Before running the app, you must:
1. Create a Firebase project
2. Enable Google Authentication
3. Update `src/firebase.js` with your credentials

📖 **See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions**  
⚡ **See [QUICKSTART.md](./QUICKSTART.md) for 5-minute setup**  
✅ **See [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) for step-by-step checklist**

## 🎨 Features

- **Google Authentication** - Secure Firebase-powered Google sign-in with persistent sessions
- **Protected Dashboard** - User-specific dashboard visible only after login
- **User Profile UI** - Display user avatar, name, and email in navbar
- **Auth Context** - Global authentication state with React Context API
- **Modern Dark Theme** - Professional SaaS-style UI with glassmorphism effects
- **Responsive Design** - Mobile-first approach with smooth animations
- **Tailwind CSS** - Utility-first styling with custom design tokens
- **React 18** - Latest React features with Vite for fast development
- **Component-Based** - Modular architecture for easy maintenance

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx         # Navigation with Google auth & user avatar
│   │   ├── Hero.jsx           # Hero section with CTA
│   │   ├── Features.jsx       # Feature cards grid
│   │   ├── Dashboard.jsx      # Protected dashboard (auth required)
│   │   ├── Footer.jsx         # Footer with links
│   │   └── LoadingSpinner.jsx # Loading component
│   ├── contexts/
│   │   └── AuthContext.jsx    # Firebase auth state management
│   ├── hooks/
│   │   └── useAuth.js         # Custom hook for accessing auth
│   ├── firebase.js            # Firebase configuration
│   ├── App.jsx                # Main app (wrapped with AuthProvider)
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles + Tailwind
├── index.html
├── package.json
├── vite.config.js
├── .env.example               # Environment variables template
├── FIREBASE_SETUP.md          # Detailed Firebase setup guide
├── QUICKSTART.md              # Quick start guide
├── SETUP_CHECKLIST.md         # Step-by-step checklist
├── ARCHITECTURE.md            # System architecture documentation
├── UI_PREVIEW.md              # Visual UI preview
├── tailwind.config.js
└── postcss.config.js
```

## 🔑 Authentication Features

### Google Sign-In
- **Firebase v10.7.1** - Modern modular SDK
- **Google OAuth** - One-click sign-in with Google account
- **Auth Persistence** - User stays logged in after page refresh
- **Protected Routes** - Dashboard only accessible when logged in

### User Experience
- **Loading States** - Spinner during authentication
- **Error Handling** - User-friendly error messages
- **User Avatar** - Profile picture from Google account
- **Display Name** - Shows user's first name in navbar
- **Smooth Transitions** - Animated login/logout flows

### Implementation
```javascript
// Use auth anywhere in your app
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { currentUser, loginWithGoogle, logout } = useAuth();
  
  return currentUser ? (
    <div>Welcome {currentUser.displayName}!</div>
  ) : (
    <button onClick={loginWithGoogle}>Sign In</button>
  );
}
```

## 🎨 Design System

### Colors
- **Primary Background**: `#0F172A` (slate-900)
- **Accent**: `#3B82F6` (blue-500)
- **Safe Status**: `#10B981` (emerald-500)
- **Unsafe Alert**: `#EF4444` (red-500)

### Key Features
- Glassmorphism cards with backdrop blur
- Smooth hover animations and transitions
- Gradient text and backgrounds
- Responsive grid layouts
- Custom animations (glow, float)

## 🔧 Configuration

The project uses Vite for fast development and includes:
- Hot Module Replacement (HMR)
- Proxy configuration for backend API
- Optimized production builds
- Tailwind CSS with custom utilities

## 📝 Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🌐 API Integration

The Vite config includes a proxy for backend API calls:
```javascript
'/api': 'http://localhost:8000'
```

## 📄 License

MIT License - See LICENSE file for details
