// frontend/src/RegisterPage.js
import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from './Toast';
import { API_URL } from './config';

/* ---------- Password strength helper ---------- */
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { label: 'Too short', color: 'bg-red-400' },
    { label: 'Weak', color: 'bg-red-400' },
    { label: 'Fair', color: 'bg-yellow-400' },
    { label: 'Good', color: 'bg-blue-400' },
    { label: 'Strong', color: 'bg-green-500' },
  ];
  return { score, ...levels[score] };
}

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        password,
        shopName,
        city,
        pincode,
        fullAddress,
        mobileNumber,
      });
      localStorage.setItem('token', res.data.token);
      toast({ message: 'Shop registered successfully!', type: 'success' });
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gradient-to-br from-teal-400 to-blue-600 p-4">
      <div className="w-full max-w-md p-8 space-y-5 bg-white rounded-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teal-100 mb-3">
            <span className="text-2xl">🏪</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Register Your Shop</h2>
          <p className="mt-1 text-sm text-gray-500">Create your shopkeeper account below.</p>
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Username */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-animated"
              placeholder="Choose a username"
              autoComplete="username"
              required
            />
          </div>

          {/* Shop Name */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Shop Name</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="input-animated"
              placeholder="Your shop's name"
              required
            />
          </div>

          {/* Full Address */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Full Address</label>
            <textarea
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              className="input-animated resize-none"
              placeholder="Street, area, landmark…"
              rows={2}
              required
            />
          </div>

          {/* City + Pincode side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-animated"
                placeholder="City"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="input-animated"
                placeholder="Pincode"
                required
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Mobile Number</label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="input-animated"
              placeholder="10-digit mobile number"
              required
            />
          </div>

          {/* Password + strength indicator */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-animated"
              placeholder="Create a strong password"
              autoComplete="new-password"
              required
            />
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="space-y-1 animate-slide-down">
                <div className="flex gap-1 h-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${strength.score >= 3 ? 'text-green-600' : strength.score >= 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full !bg-teal-600 hover:!bg-teal-700 focus:!ring-teal-400 mt-2"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-slow" />
                Registering…
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;

