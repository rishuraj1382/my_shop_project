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
  const [role, setRole] = useState('customer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  // Shopkeeper-specific fields
  const [shopName, setShopName] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  
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
      const payload = { username, password, role, name, mobileNumber };
      if (role === 'shopkeeper') {
        payload.shopName = shopName;
        payload.city = city;
        payload.pincode = pincode;
        payload.fullAddress = fullAddress;
      }
      const res = await axios.post(`${API_URL}/api/auth/register`, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      if (res.data.name) {
        localStorage.setItem('name', res.data.name);
      }
      toast({ message: role === 'shopkeeper' ? 'Shop registered successfully!' : 'Account created successfully!', type: 'success' });
      navigate(role === 'shopkeeper' ? '/admin' : '/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4 animate-fade-in">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left: Branding */}
        <div className="hidden md:block">
          <h2 className="text-4xl font-headline font-extrabold tracking-tighter leading-tight text-on-surface">
            Join the <br /><span className="text-primary">Marketplace.</span>
          </h2>
          <p className="mt-6 text-on-surface-variant leading-relaxed max-w-sm">
            {role === 'shopkeeper' 
              ? 'Scale your business with our editorial-first marketplace platform. Designed for makers and merchants.'
              : 'Discover local shops, browse products, and order with ease. Your neighborhood marketplace.'}
          </p>
          <div className="mt-10 flex gap-6">
            <div className="p-6 bg-surface-container-low rounded-xl flex-1">
              <span className="material-symbols-outlined text-primary text-3xl mb-4 block">
                {role === 'shopkeeper' ? 'storefront' : 'shopping_bag'}
              </span>
              <p className="font-headline font-bold text-sm">
                {role === 'shopkeeper' ? 'Local Reach' : 'Local Shops'}
              </p>
            </div>
            <div className="p-6 bg-surface-container-low rounded-xl flex-1">
              <span className="material-symbols-outlined text-primary text-3xl mb-4 block">
                {role === 'shopkeeper' ? 'payments' : 'local_shipping'}
              </span>
              <p className="font-headline font-bold text-sm">
                {role === 'shopkeeper' ? 'Easy Orders' : 'Fast Delivery'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Register Form */}
        <div className="bg-surface-container-lowest p-8 md:p-10 rounded-xl shadow-sm relative overflow-hidden animate-scale-in">
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="mb-6">
              <h2 className="text-on-surface font-headline font-bold text-2xl mb-1">Create Account</h2>
              <p className="text-on-surface-variant text-sm">Choose your account type below.</p>
            </div>

            {/* Role Selector Tabs */}
            <div className="flex bg-surface-container-high rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                  role === 'customer'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-lg">person</span>
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('shopkeeper')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                  role === 'shopkeeper'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-lg">storefront</span>
                Shopkeeper
              </button>
            </div>

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

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5" noValidate>
              {/* Common Fields */}
              <div className="md:col-span-2">
                <label className="label-stitch">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-stitch" placeholder="Choose a username" autoComplete="username" required />
              </div>

              <div className={role === 'customer' ? 'md:col-span-2' : ''}>
                <label className="label-stitch">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-stitch" placeholder="Your full name" required />
              </div>

              <div>
                <label className="label-stitch">Contact Number</label>
                <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className="input-stitch" placeholder="+91 98765 43210" required />
              </div>

              {/* Shopkeeper-specific Fields */}
              {role === 'shopkeeper' && (
                <>
                  <div className="md:col-span-2">
                    <label className="label-stitch">Shop Name</label>
                    <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} className="input-stitch" placeholder="Your shop's name" required />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label-stitch">Business Address</label>
                    <textarea value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} className="input-stitch resize-none" placeholder="Street, area, landmark…" rows={2} required />
                  </div>

                  <div>
                    <label className="label-stitch">City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input-stitch" placeholder="City" required />
                  </div>

                  <div>
                    <label className="label-stitch">Pincode</label>
                    <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="input-stitch" placeholder="799046" required />
                  </div>
                </>
              )}

              {/* Password + strength indicator */}
              <div className={role === 'customer' ? 'md:col-span-2' : ''}>
                <label className="label-stitch">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-stitch" placeholder="••••••••" autoComplete="new-password" required />
                {password.length > 0 && (
                  <div className="space-y-1 mt-2 animate-slide-down">
                    <div className="flex gap-1 h-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            i <= strength.score ? strength.color : 'bg-surface-container-high'
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
                className="md:col-span-2 btn-primary w-full mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-slow" />
                    Registering…
                  </>
                ) : (
                  role === 'shopkeeper' ? 'Create Merchant Account' : 'Create Customer Account'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-on-surface-variant mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
