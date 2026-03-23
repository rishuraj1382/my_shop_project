// frontend/src/ShopSettingsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL as BASE_URL } from './config';

const API_URL = `${BASE_URL}/api/users/shop`;

function ShopSettingsPage() {
  const [formData, setFormData] = useState({
    shopName: '',
    fullAddress: '',
    city: '',
    pincode: '',
    mobileNumber: '',
    shopImage: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getConfig = useCallback(() => ({
    headers: { 'x-auth-token': localStorage.getItem('token') }
  }), []);

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const res = await axios.get(API_URL, getConfig());
        setFormData({
          shopName: res.data.shopName || '',
          fullAddress: res.data.fullAddress || '',
          city: res.data.city || '',
          pincode: res.data.pincode || '',
          mobileNumber: res.data.mobileNumber || '',
          shopImage: res.data.shopImage || '',
        });
      } catch (error) {
        console.error("Failed to fetch shop details:", error);
        alert("Could not load your shop details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchShopDetails();
  }, [getConfig]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(API_URL, formData, getConfig());
      alert('Shop details updated successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Failed to update shop details:', error);
      alert('Update failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <span className="inline-block w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin-slow" />
          <p className="text-on-surface-variant mt-4 text-sm">Loading your shop settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4 animate-fade-in">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-primary text-4xl mb-4 block">settings</span>
          <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Settings</span>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mt-2">Shop Details</h2>
          <p className="text-on-surface-variant text-sm mt-2">Update your business information below.</p>
        </div>

        <div className="bg-surface-container-lowest p-8 md:p-10 rounded-2xl shadow-sm animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-stitch">Shop Name</label>
              <input name="shopName" value={formData.shopName} onChange={handleChange} className="input-stitch" required />
            </div>
            <div>
              <label className="label-stitch">Full Address</label>
              <textarea name="fullAddress" value={formData.fullAddress} onChange={handleChange} className="input-stitch resize-none" rows={2} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-stitch">City</label>
                <input name="city" value={formData.city} onChange={handleChange} className="input-stitch" required />
              </div>
              <div>
                <label className="label-stitch">Pincode</label>
                <input name="pincode" value={formData.pincode} onChange={handleChange} className="input-stitch" required />
              </div>
            </div>
            <div>
              <label className="label-stitch">Mobile Number</label>
              <input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="input-stitch" required />
            </div>
            <div>
              <label className="label-stitch">Shop Image URL</label>
              <input name="shopImage" value={formData.shopImage} onChange={handleChange} className="input-stitch" />
            </div>
            <button type="submit" className="btn-success w-full mt-4">
              <span className="material-symbols-outlined text-lg">save</span>
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ShopSettingsPage;
