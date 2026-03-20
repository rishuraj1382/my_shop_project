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
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gradient-to-br from-purple-600 to-blue-500 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100 mb-3">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Shopkeeper Login</h2>
          <p className="mt-1 text-sm text-gray-500">Welcome back! Sign in to your account.</p>
        </div>

        {/* Inline error */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm animate-slide-down"
          >
            <span className="text-base font-bold">✕</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-1">
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-animated"
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-animated"
              placeholder="Enter your password"
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

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

