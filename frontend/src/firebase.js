import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your Firebase configuration
// Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBeJkZ16HlG3wI1vMlnKQyjs6SJbLMgt2U",
    authDomain: "visionsafe-50ed5.firebaseapp.com",
    projectId: "visionsafe-50ed5",
    storageBucket: "visionsafe-50ed5.firebasestorage.app",
    messagingSenderId: "677721339926",
    appId: "1:677721339926:web:f6846a3d7d45739b8ddd37",
    measurementId: "G-KV7LE18VZK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export default app;
