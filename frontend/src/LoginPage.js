// frontend/src/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from './Toast';
import { API_URL } from './config';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });
      localStorage.setItem('token', res.data.token);
      toast({ message: 'Logged in successfully!', type: 'success' });
      navigate('/admin');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
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
          <p className="text-on-surface-variant mt-2 text-sm">Please enter your details to sign in</p>
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

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="username" className="label-stitch">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-stitch"
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label htmlFor="password" className="text-[0.6875rem] font-medium tracking-widest uppercase text-on-surface-variant">Password</label>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-stitch"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-slow" />
                  Signing in…
                </>
              ) : (
                'Login'
              )}
            </button>
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
