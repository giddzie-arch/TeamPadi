import React, { useState } from 'react';
import { Auth } from './components/Authcard';
import { Dashboard } from './components/Dashboard';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('auth_token'));
  });

  return (
    <div>
      {isAuthenticated ? (
        <Dashboard onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <Auth onSuccess={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
};

export default App;