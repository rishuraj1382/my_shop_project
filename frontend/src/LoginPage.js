// frontend/src/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from './Toast';
import { useAuth } from './contexts/AuthContext';
import GoogleAuthButton from './components/GoogleAuthButton';
import Button from './components/ui/Button';
import { API_URL } from './config';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });
      login(res.data.token, res.data.role, res.data.name);
      toast({ message: 'Logged in successfully!', type: 'success' });
      if (res.data.role === 'shopkeeper') {
        navigate('/admin');
      } else if (res.data.role === 'superadmin') {
        navigate('/super-admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4 animate-fade-in">
      <div className="max-w-md w-full flex flex-col gap-8">
        {/* Branding */}
        <div className="space-y-2 text-center">
          <span className="text-primary font-headline font-black text-3xl tracking-tighter">Marketplace</span>
          <h1 className="text-3xl font-headline font-bold mt-4 tracking-tight text-on-surface">Welcome Back</h1>
          <p className="text-on-surface-variant mt-2 text-sm">Sign in with your username or email</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest p-10 rounded-xl shadow-sm animate-scale-in">
          {/* Inline error */}
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm mb-6 animate-slide-down"
            >
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{error}</span>
            </div>
          )}

          <GoogleAuthButton />

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-xs text-on-surface-variant uppercase tracking-wide">or continue with</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="username" className="label-stitch">Username or Email</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-stitch"
                placeholder="your@email.com or username"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="label-stitch">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-stitch pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" loading={isLoading} fullWidth className="mt-2">
              Login
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
