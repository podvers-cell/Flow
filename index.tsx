import './index.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Login from './components/Login';
import { authService } from './services/authService';
import type { AuthUser } from './services/authService';
import { createFirestoreStorage } from './services/firestoreService';
import { localDatabase } from './services/localDatabase';
import type { StorageService } from './services/firestoreService';

function Root() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuth((user) => {
      setAuthUser(user);
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  const handleLoginSuccess = () => {
    if (!authService.isFirebaseConfigured()) {
      const role = authService.getStoredRole();
      setAuthUser(authService.isAuthenticated() ? { local: true, role: role ?? undefined } : null);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-bold">جاري التحميل...</div>
      </div>
    );
  }

  if (!authUser) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  const storage: StorageService =
    'uid' in authUser
      ? createFirestoreStorage(authUser.uid)
      : (localDatabase as unknown as StorageService);

  return <App onLogout={() => setAuthUser(null)} storage={storage} authUser={authUser} />;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
