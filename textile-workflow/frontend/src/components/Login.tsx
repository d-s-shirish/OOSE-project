import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight } from 'lucide-react';
import './Login.css';

interface LoginProps {
  onLogin: (user: any) => void;
}

const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        onLogin({ name: 'Global Admin', role: 'System Manager' });
      } else {
        setError('Unauthorized access. Invalid credentials.');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card-base animate-fade-in">
        <div className="login-brand">
          <div className="brand-logo" />
          <h1>Smart Textile Intel</h1>
          <p>Secure Enterprise Portal V1.0</p>
        </div>

        <form onSubmit={handleLogin} className="login-form-grid">
          <div className="field-group">
            <label>Employee ID / Node Identity</label>
            <div className="field-input-box">
              <User size={16} />
              <input 
                type="text" 
                placeholder="system_admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="field-group">
            <label>System Key</label>
            <div className="field-input-box">
              <Lock size={16} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-prime-btn" disabled={isLoading}>
            {isLoading ? 'Verifying...' : (
              <>
                <span>Sign In to Node</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="login-security-footer">
          <ShieldCheck size={14} />
          <span>GRS-2026 Secured Infrastructure</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
