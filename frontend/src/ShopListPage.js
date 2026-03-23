// frontend/src/ShopListPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useToast } from './Toast';
import { API_URL } from './config';

function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden animate-pulse">
      <div className="h-14 bg-surface-container-high" />
      <div className="p-6 space-y-3">
        <div className="skeleton h-4 w-3/5 rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="skeleton h-3 w-2/5 rounded" />
        <div className="skeleton h-10 w-28 rounded-xl mt-2" />
      </div>
    </div>
  );
}

function ShopCard({ shop, index }) {
  return (
    <div
      className="bg-surface-container-lowest rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 flex flex-col h-full animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="bg-primary px-6 py-5">
        <h3 className="font-headline text-xl font-bold text-white tracking-tight">{shop.shopName}</h3>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-sm mt-0.5">pin_drop</span>
            <p className="text-sm">{shop.fullAddress}, {shop.city}</p>
          </div>
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">call</span>
            <p className="text-sm font-medium">{shop.mobileNumber}</p>
          </div>
        </div>
        <div className="mt-auto">
          <Link
            to={`/shop/${shop._id}`}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold font-headline text-sm transition-all inline-flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            Visit Shop
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ShopListPage() {
  const [pincode, setPincode] = useState('');
  const [shops, setShops] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-on-surface tracking-tighter mb-8 leading-[1.1]">
            Find Shops <span className="text-primary italic">Near You</span>
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-12 max-w-2xl mx-auto">
            <div className="bg-surface-container-lowest p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-xl shadow-on-surface/5 border border-outline-variant/20">
              <div className="flex-1 flex items-center px-4 gap-3">
                <span className="material-symbols-outlined text-outline">location_on</span>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter pincode (e.g. 799046)"
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface py-3 font-medium placeholder-outline/60"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-white px-10 py-4 rounded-xl font-bold font-headline transition-all hover:bg-primary-container active:scale-95 disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-slow" />
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Results */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {(searched || isLoading) && (
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Results</span>
              <h2 className="font-headline text-3xl font-bold text-on-surface mt-2">
                {isLoading ? 'Searching…' : shops.length > 0 ? 'Shops in your area' : 'No results'}
              </h2>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [0, 1, 2].map((i) => <SkeletonCard key={i} />)
          ) : (
            searched && (
              shops.length > 0 ? (
                shops.map((shop, i) => <ShopCard key={shop._id} shop={shop} index={i} />)
              ) : (
                <div className="col-span-full text-center py-20 animate-fade-in">
                  <div className="text-6xl mb-4">🏪</div>
                  <p className="text-on-surface-variant text-lg font-medium">No shops found for this pincode.</p>
                  <p className="text-outline text-sm mt-1">Try a different pincode.</p>
                </div>
              )
            )
          )}
        </div>
      </section>
    </div>
  );
}

export default ShopListPage;
