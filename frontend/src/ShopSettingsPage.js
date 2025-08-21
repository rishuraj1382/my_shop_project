// frontend/src/ShopSettingsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/users/shop';

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
      navigate('/admin'); // Navigate back to the dashboard after saving
    } catch (error) {
      console.error('Failed to update shop details:', error);
      alert('Update failed. Please try again.');
    }
  };

  if (isLoading) {
    return <div>Loading your shop settings...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800">Update Your Shop Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Shop Name</label>
            <input name="shopName" value={formData.shopName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Full Address</label>
            <textarea name="fullAddress" value={formData.fullAddress} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">City</label>
            <input name="city" value={formData.city} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Pincode</label>
            <input name="pincode" value={formData.pincode} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Mobile Number</label>
            <input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Shop Image URL</label>
            <input name="shopImage" value={formData.shopImage} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition duration-300">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShopSettingsPage;
