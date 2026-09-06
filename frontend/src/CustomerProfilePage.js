// frontend/src/CustomerProfilePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './contexts/AuthContext';
import { useToast } from './Toast';
import StarRating from './components/StarRating';
import { API_URL } from './config';
import Card from './components/ui/Card';
import Input from './components/ui/Input';
import EmptyState from './components/ui/EmptyState';
import Spinner from './components/ui/Spinner';
import ShopAvatar from './components/ShopAvatar';

function CustomerProfilePage() {
  const { user, getAuthHeader, updateUser } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState('');
  const [myReviews, setMyReviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
      });
      setSavedAddresses(user.savedAddresses || []);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      axios.get(`${API_URL}/api/reviews/mine`, getAuthHeader())
        .then(res => setMyReviews(res.data))
        .catch(err => console.error(err));
    }
  }, [activeTab, getAuthHeader]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axios.patch(
        `${API_URL}/api/auth/profile`,
        { ...formData, savedAddresses },
        getAuthHeader()
      );
      updateUser(res.data);
      toast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Update failed.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAddress = () => {
    if (!newAddress.trim()) return;
    setSavedAddresses(prev => [...prev, newAddress.trim()]);
    setNewAddress('');
  };

  const removeAddress = (index) => {
    setSavedAddresses(prev => prev.filter((_, i) => i !== index));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'manage_accounts' },
    { id: 'addresses', label: 'Addresses', icon: 'home_pin' },
    { id: 'reviews', label: 'My Reviews', icon: 'star' },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Account</span>
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mt-2">My Profile</h1>
      </div>

      {/* Avatar card */}
      <Card padding="md" className="mb-6 flex items-center gap-5 animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-on-primary text-2xl font-bold shadow-lg shadow-primary/20 flex-shrink-0">
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-headline font-bold text-lg text-on-surface">{user?.name || 'Customer'}</h2>
          <p className="text-on-surface-variant text-sm">{user?.email || user?.username}</p>
          <p className="text-on-surface-variant text-sm">{user?.mobileNumber}</p>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex bg-surface-container-high rounded-xl p-1 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <Card padding="lg" className="animate-scale-in">
          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your full name"
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
            />
            <Input
              label="Mobile Number"
              type="tel"
              value={formData.mobileNumber}
              onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
              placeholder="+91 98765 43210"
            />
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-4">
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">save</span>
                  Save Profile
                </>
              )}
            </button>
          </form>
        </Card>
      )}

      {/* Tab: Addresses */}
      {activeTab === 'addresses' && (
        <Card padding="lg" className="animate-scale-in space-y-5">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label="Add New Address"
                type="text"
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
                placeholder="Enter delivery address..."
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAddress();
                  }
                }}
              />
            </div>
            <button type="button" onClick={addAddress} className="btn-primary px-4" aria-label="Add address">
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>

          <div className="space-y-3">
            {savedAddresses.length === 0 ? (
              <EmptyState icon="home" title="No saved addresses yet." className="py-8" />
            ) : (
              savedAddresses.map((address, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-surface-container-low rounded-xl">
                  <span className="material-symbols-outlined text-primary mt-0.5">home_pin</span>
                  <p className="flex-1 text-sm text-on-surface">{address}</p>
                  <button
                    onClick={() => removeAddress(i)}
                    className="text-outline hover:text-error transition-colors"
                    aria-label={`Remove address: ${address}`}
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {savedAddresses.length > 0 && (
            <button onClick={handleProfileUpdate} disabled={isSubmitting} className="btn-success w-full">
              <span className="material-symbols-outlined text-lg">save</span>
              Save Addresses
            </button>
          )}
        </Card>
      )}

      {/* Tab: My Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-4 animate-scale-in">
          {myReviews.length === 0 ? (
            <Card padding="none">
              <EmptyState
                icon="star_border"
                title="No reviews yet."
                description="Reviews you write will appear here."
              />
            </Card>
          ) : (
            myReviews.map((rev, i) => (
              <Card
                key={rev._id}
                as="article"
                className="animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start gap-4">
                  <ShopAvatar src={rev.shop?.shopImage} alt={rev.shop?.shopName} size="sm" useThumbnail />
                  <div className="flex-1">
                    <p className="font-headline font-bold text-on-surface">{rev.shop?.shopName}</p>
                    <StarRating rating={rev.rating} size="sm" />
                    {rev.review && (
                      <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">"{rev.review}"</p>
                    )}
                    <p className="text-xs text-outline mt-2">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default CustomerProfilePage;
