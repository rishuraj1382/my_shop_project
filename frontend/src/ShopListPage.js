// frontend/src/ShopListPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useToast } from './Toast';
import StarRating from './components/StarRating';
import { API_URL } from './config';
import Card from './components/ui/Card';
import Badge from './components/ui/Badge';
import Button from './components/ui/Button';
import Skeleton from './components/ui/Skeleton';
import EmptyState from './components/ui/EmptyState';
import ShopAvatar from './components/ShopAvatar';

function SkeletonCard() {
  return (
    <Card padding="none" className="overflow-hidden animate-pulse">
      <div className="h-36 bg-surface-container-high" />
      <div className="p-5 space-y-3">
        <Skeleton height="1.25rem" width="60%" />
        <Skeleton height="1rem" width="80%" />
        <Skeleton height="1rem" width="40%" />
        <Skeleton height="2.5rem" width="7rem" rounded="xl" className="mt-2" />
      </div>
    </Card>
  );
}

function ShopCard({ shop, index }) {
  const { role, token, isFavorite, toggleFavorite } = useAuth();
  const [favLoading, setFavLoading] = useState(false);
  const isCustomer = token && role === 'customer';
  const faved = isFavorite(shop._id);

  const handleFav = async (e) => {
    e.preventDefault();
    if (!isCustomer) return;
    setFavLoading(true);
    await toggleFavorite(shop._id);
    setFavLoading(false);
  };

  return (
    <Card
      as="article"
      padding="none"
      interactive
      className="overflow-hidden group flex flex-col h-full animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Banner */}
      <div className="relative h-36 bg-primary-container overflow-hidden">
        <ShopAvatar
          src={shop.shopImage}
          alt={shop.shopName}
          size="cover"
          useThumbnail
          className="group-hover:scale-105 transition-transform duration-500"
        />
        {/* Open/Closed badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={shop.isOpen === false ? 'danger' : 'success'}
            icon={shop.isOpen === false ? 'cancel' : 'check_circle'}
            size="sm"
            className="shadow"
          >
            {shop.isOpen === false ? 'Closed' : 'Open Now'}
          </Badge>
        </div>
        {/* Favorite button */}
        {isCustomer && (
          <button
            onClick={handleFav}
            disabled={favLoading}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
            title={faved ? 'Remove from favourites' : 'Add to favourites'}
          >
            <span
              /* Favorite red is a conventional heart-toggle color, intentionally kept
                 separate from the `error` status token (favoriting isn't an error state). */
              className={`material-symbols-outlined text-lg transition-colors ${faved ? 'text-rose-500' : 'text-on-surface-variant'}`}
              style={{ fontVariationSettings: faved ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        )}
        {/* Product count badge */}
        {shop.productCount > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="neutral" size="sm" className="shadow">{shop.productCount} items</Badge>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-headline text-lg font-bold text-on-surface tracking-tight line-clamp-1">{shop.shopName}</h3>

        {/* Rating */}
        {shop.averageRating > 0 ? (
          <div className="mt-1">
            <StarRating rating={shop.averageRating} totalReviews={shop.totalReviews} size="sm" />
          </div>
        ) : (
          <p className="text-xs text-outline mt-1">No reviews yet</p>
        )}

        {/* Details */}
        <div className="mt-3 space-y-2 flex-1">
          <div className="flex items-start gap-2 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-sm mt-0.5 flex-shrink-0">pin_drop</span>
            <p className="line-clamp-2">{shop.fullAddress}, {shop.city}</p>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-sm">call</span>
            <p className="font-medium">{shop.mobileNumber}</p>
          </div>
        </div>

        <div className="mt-4">
          <Button as={Link} to={`/shop/${shop._id}`} variant="primary" size="sm" iconRight="arrow_forward" fullWidth>
            Visit Shop
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ShopListPage() {
  const [pincode, setPincode] = useState('');
  const [globalQuery, setGlobalQuery] = useState('');
  const [shops, setShops] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'closed'
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const { token, role, getAuthHeader } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Load recent searches on mount for customers
  React.useEffect(() => {
    if (token && role === 'customer') {
      axios.get(`${API_URL}/api/customer/recent-searches`, getAuthHeader())
        .then(res => setRecentSearches(res.data))
        .catch(() => {});
    }
  }, [token, role, getAuthHeader]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pincode.trim()) {
      toast({ message: 'Please enter a pincode.', type: 'warning' });
      return;
    }

    // If product query entered, go to global search page
    if (globalQuery.trim()) {
      navigate(`/search?pincode=${pincode}&q=${encodeURIComponent(globalQuery)}`);
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

  const filteredShops = shops.filter((shop) => {
    if (statusFilter === 'open') return shop.isOpen !== false;
    if (statusFilter === 'closed') return shop.isOpen === false;
    return true;
  });

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!pincode.trim()) {
      toast({ message: 'Please enter a pincode first.', type: 'warning' });
      return;
    }
    navigate(`/search?pincode=${pincode}&q=${encodeURIComponent(globalQuery)}`);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Local Marketplace</span>
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-on-surface tracking-tighter mb-4 leading-[1.05] mt-3">
            Find Everything From <span className="text-primary italic">Nearby Shops</span>
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto">
            Search for local shops by pincode or search products directly across all shops in your area.
          </p>

          {/* Search Forms */}
          <div className="mt-10 space-y-3 max-w-2xl mx-auto">
            {/* Shop search */}
            <form onSubmit={handleSearch}>
              <div className="bg-surface-container-lowest p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-xl shadow-on-surface/5 border border-outline-variant/20">
                <div className="flex-1 flex items-center px-4 gap-3">
                  <span className="material-symbols-outlined text-outline">location_on</span>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter pincode (e.g. 231206,799046)"
                    className="w-full bg-transparent border-none focus:ring-0 text-on-surface py-3 font-medium placeholder-outline/60 outline-none"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" loading={isLoading} className="font-headline">
                  Find Shops
                </Button>
              </div>
            </form>

            {/* Product global search */}
            <form onSubmit={handleGlobalSearch}>
              <div className="bg-surface-container-lowest p-2 rounded-2xl flex gap-2 shadow-md border border-outline-variant/10">
                <div className="flex-1 flex items-center px-4 gap-3">
                  <span className="material-symbols-outlined text-outline">search</span>
                  <input
                    type="text"
                    value={globalQuery}
                    onChange={(e) => setGlobalQuery(e.target.value)}
                    placeholder="Search a product across all shops (e.g. Milk, Bread)…"
                    className="w-full bg-transparent border-none focus:ring-0 text-on-surface py-3 text-sm font-medium placeholder-outline/60 outline-none"
                  />
                </div>
                {globalQuery && (
                  <Button type="submit" variant="secondary">
                    Search Products
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mt-5 animate-slide-down">
              <p className="text-xs text-on-surface-variant mb-2">Recent searches:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {recentSearches.slice(0, 6).map((term, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setGlobalQuery(term);
                      if (pincode) navigate(`/search?pincode=${pincode}&q=${encodeURIComponent(term)}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">history</span>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Background Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
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
            {shops.length > 0 && !isLoading && (
              <button
                onClick={() => navigate(`/search?pincode=${pincode}`)}
                className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">search</span>
                Search products in these shops
              </button>
            )}
          </div>
        )}

        {shops.length > 0 && !isLoading && (
          <div className="flex gap-2 mb-6">
            {[
              { key: 'all', label: 'All Shops' },
              { key: 'open', label: 'Open Shops' },
              { key: 'closed', label: 'Closed Shops' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setStatusFilter(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  statusFilter === t.key
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [0, 1, 2].map((i) => <SkeletonCard key={i} />)
          ) : (
            searched && (
              shops.length > 0 ? (
                filteredShops.length > 0 ? (
                  filteredShops.map((shop, i) => <ShopCard key={shop._id} shop={shop} index={i} />)
                ) : (
                  <div className="col-span-full">
                    <EmptyState
                      icon="search_off"
                      title="No shops match this filter."
                      description="Try a different status filter."
                    />
                  </div>
                )
              ) : (
                <div className="col-span-full">
                  <EmptyState
                    icon="storefront"
                    title="No shops found for this pincode."
                    description="Try a different pincode."
                  />
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
