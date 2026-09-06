// frontend/src/CustomerDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import StarRating from './components/StarRating';
import StatCard from './components/ui/StatCard';
import Badge from './components/ui/Badge';
import EmptyState from './components/ui/EmptyState';
import ShopAvatar from './components/ShopAvatar';
import { API_URL } from './config';

const STATUS_CONFIG = {
  Pending:              { variant: 'warning', icon: 'schedule' },
  Confirmed:            { variant: 'info', icon: 'check_circle' },
  Packed:               { variant: 'warm', icon: 'inventory_2' },
  'Ready to Deliver':   { variant: 'success', icon: 'local_shipping' },
  'Out For Delivery':   { variant: 'info', icon: 'directions_bike' },
  'Ready for Pickup':   { variant: 'warm', icon: 'storefront' },
  Delivered:            { variant: 'success', icon: 'done_all' },
};

function CustomerDashboard() {
  const { name, getAuthHeader } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteShops, setFavoriteShops] = useState([]);

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashRes, favRes] = await Promise.all([
        axios.get(`${API_URL}/api/customer/dashboard`, getAuthHeader()),
        axios.get(`${API_URL}/api/customer/favorites`, getAuthHeader()),
      ]);
      setData(dashRes.data);
      setFavoriteShops(favRes.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const statusConf = (status) => STATUS_CONFIG[status] || { variant: 'neutral', icon: 'help' };
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-10 skeleton h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[0, 1, 2].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[0, 1, 2].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Customer Dashboard</span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mt-2">
            {greeting}, <span className="text-primary">{name || 'there'}!</span>
          </h1>
          <p className="text-on-surface-variant mt-1">Here's a summary of your activity.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/" className="btn-primary">
            <span className="material-symbols-outlined text-lg">storefront</span>
            Browse Shops
          </Link>
          <Link to="/my-orders" className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-surface-container-high text-on-surface font-bold text-sm hover:bg-surface-container-highest transition-all">
            <span className="material-symbols-outlined text-lg">receipt_long</span>
            All Orders
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 animate-slide-up">
        <StatCard
          label="Total Orders"
          value={data?.stats?.totalOrders || 0}
          icon="shopping_bag"
          bg="bg-primary/10"
          color="text-primary"
          iconColor="text-primary"
        />
        <StatCard
          label="Total Spending"
          value={`₹${(data?.stats?.totalSpending || 0).toFixed(2)}`}
          icon="account_balance_wallet"
          bg="bg-success-container"
          color="text-on-success-container"
          iconColor="text-on-success-container"
        />
        <StatCard
          label="Saved Shops"
          value={data?.stats?.savedShops || 0}
          icon="favorite"
          bg="bg-tertiary-container"
          color="text-on-tertiary-container"
          iconColor="text-on-tertiary-container"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Orders */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Live Tracking</span>
              <h2 className="text-xl font-headline font-bold text-on-surface mt-1">Active Orders</h2>
            </div>
          </div>

          {(!data?.activeOrders || data.activeOrders.length === 0) ? (
            <div className="bg-surface-container-lowest rounded-2xl">
              <EmptyState icon="local_shipping" title="No active orders right now.">
                <Link to="/" className="btn-primary mt-5 inline-flex">
                  Start Shopping
                </Link>
              </EmptyState>
            </div>
          ) : (
            <div className="space-y-4">
              {data.activeOrders.map((order, i) => {
                const sc = statusConf(order.status);
                return (
                  <div
                    key={order._id}
                    className="bg-surface-container-lowest rounded-2xl p-5 flex items-center justify-between gap-4 hover:shadow-lg transition-all duration-300 animate-slide-up border border-outline-variant/10"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={sc.variant} icon={sc.icon} size="sm">{order.status}</Badge>
                        <span className="text-xs text-outline">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="font-bold text-on-surface text-sm truncate">
                        {order.shop?.shopName || order.shopName || 'Shop'}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''} · ₹{order.totalAmount?.toFixed(2)}
                      </p>
                    </div>
                    <Link
                      to={`/track/${order._id}`}
                      className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-sm">my_location</span>
                      Track
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Orders */}
          {data?.recentOrders?.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">History</span>
                  <h2 className="text-xl font-headline font-bold text-on-surface mt-1">Recent Orders</h2>
                </div>
                <Link to="/my-orders" className="text-sm font-bold text-primary hover:underline">View all →</Link>
              </div>
              <div className="space-y-3">
                {data.recentOrders.filter(o => !['Pending','Confirmed','Packed','Ready to Deliver','Out For Delivery','Ready for Pickup'].includes(o.status)).slice(0, 3).map((order, i) => {
                  const sc = statusConf(order.status);
                  return (
                    <div key={order._id} className="bg-surface-container-lowest rounded-xl p-4 flex items-center justify-between gap-4 hover:shadow-md transition-all animate-slide-up border border-outline-variant/10" style={{ animationDelay: `${i * 40}ms` }}>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-on-surface truncate">{order.shop?.shopName || order.shopName}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · ₹{order.totalAmount?.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant={sc.variant} icon={sc.icon} size="sm">{order.status}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Favorites + Recent Searches */}
        <div className="space-y-6">
          {/* Favorite Shops */}
          <div className="bg-surface-container-lowest rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline font-bold text-on-surface">Saved Shops</h3>
              <Link to="/favorites" className="text-xs font-bold text-primary hover:underline">See all</Link>
            </div>
            {favoriteShops.length === 0 ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-3xl text-outline/30">favorite_border</span>
                <p className="text-xs text-on-surface-variant mt-2">No saved shops yet.</p>
                <Link to="/" className="text-xs text-primary font-bold hover:underline mt-1 inline-block">Browse shops</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {favoriteShops.slice(0, 4).map((shop) => (
                  <Link
                    key={shop._id}
                    to={`/shop/${shop._id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors"
                  >
                    <ShopAvatar src={shop.shopImage} alt={shop.shopName} size="sm" useThumbnail />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-on-surface truncate">{shop.shopName}</p>
                      {shop.averageRating > 0 && (
                        <StarRating rating={shop.averageRating} totalReviews={shop.totalReviews} size="sm" />
                      )}
                    </div>
                    <span className="material-symbols-outlined text-outline text-sm">chevron_right</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Searches */}
          {data?.recentSearches?.length > 0 && (
            <div className="bg-surface-container-lowest rounded-2xl p-6">
              <h3 className="font-headline font-bold text-on-surface mb-4">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {data.recentSearches.map((term, i) => (
                  <Link
                    key={i}
                    to={`/?search=${encodeURIComponent(term)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">history</span>
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-surface-container-lowest rounded-2xl p-6">
            <h3 className="font-headline font-bold text-on-surface mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { to: '/my-orders', icon: 'receipt_long', label: 'My Order History' },
                { to: '/favorites', icon: 'favorite', label: 'Saved Shops' },
                { to: '/profile', icon: 'manage_accounts', label: 'Edit Profile' },
                { to: '/track', icon: 'local_shipping', label: 'Track an Order' },
              ].map(({ to, icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-low hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg text-primary">{icon}</span>
                  {label}
                  <span className="material-symbols-outlined text-sm text-outline ml-auto">chevron_right</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;
