// frontend/src/ShopListPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useToast } from './Toast';
import { API_URL } from './config';

function SkeletonCard() {
  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-md overflow-hidden">
      <div className="skeleton h-48 w-full" />
      <div className="p-6 space-y-3">
        <div className="skeleton h-6 w-3/5 rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-4 w-2/5 rounded" />
        <div className="skeleton h-9 w-28 rounded-lg mt-2" />
      </div>
    </div>
  );
}

function ShopCard({ shop, index }) {
  return (
    <div
      className="w-full max-w-2xl bg-white rounded-xl shadow-md overflow-hidden
        hover:shadow-xl hover:-translate-y-1 transition-all duration-300
        animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {shop.shopImage && (
        <img
          src={shop.shopImage}
          alt={shop.shopName}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900">{shop.shopName}</h2>
        <p className="text-gray-600 mt-1">
          <span className="mr-1">📍</span>
          {shop.fullAddress}, {shop.city}
        </p>
        <p className="text-gray-500 text-sm mt-1">
          <span className="mr-1">📞</span>
          {shop.mobileNumber}
        </p>
        <Link
          to={`/shop/${shop._id}`}
          className="inline-flex items-center gap-2 mt-4 btn-primary !bg-green-600 hover:!bg-green-700 focus:!ring-green-400"
        >
          Visit Shop →
        </Link>
      </div>
    </div>
  );
}

function ShopListPage() {
  const [pincode, setPincode] = useState('');
  const [shops, setShops] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const toast = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pincode.trim()) {
      toast({ message: 'Please enter a pincode.', type: 'warning' });
      return;
    }
    setIsLoading(true);
    setSearched(true);
    setShops([]);

    try {
      const res = await axios.get(`${API_URL}/api/shops/search/${pincode}`);
      setShops(res.data);
      if (res.data.length === 0) {
        toast({ message: `No shops found for pincode "${pincode}".`, type: 'info' });
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      toast({ message: 'Could not fetch shops. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 animate-fade-in">
      {/* Hero section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Find Shops Near You</h1>
        <p className="text-gray-500 text-lg">Enter your pincode to discover local shops in your area.</p>
      </div>

      {/* Search form */}
      <form
        onSubmit={handleSearch}
        className="flex justify-center mb-12"
      >
        <div
          className={`flex w-full max-w-lg rounded-xl overflow-hidden shadow-md transition-shadow duration-200 ${
            inputFocused ? 'shadow-indigo-200 shadow-lg' : ''
          }`}
        >
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="🔍  Enter your pincode…"
            className="flex-1 px-5 py-3 border-2 border-r-0 border-gray-200 focus:border-indigo-400 focus:outline-none transition-colors duration-200 text-gray-800 text-base"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary rounded-none px-7 !py-3 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-slow" />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="flex flex-col items-center space-y-6">
        {isLoading ? (
          /* Skeleton loading state */
          [0, 1, 2].map((i) => <SkeletonCard key={i} />)
        ) : (
          searched && (
            shops.length > 0 ? (
              shops.map((shop, i) => <ShopCard key={shop._id} shop={shop} index={i} />)
            ) : (
              <div className="text-center py-16 animate-fade-in">
                <div className="text-5xl mb-4">🏪</div>
                <p className="text-gray-500 text-lg font-medium">No shops found for this pincode.</p>
                <p className="text-gray-400 text-sm mt-1">Try a different pincode.</p>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}

export default ShopListPage;

