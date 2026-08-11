// frontend/src/FavoritesPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useToast } from './Toast';
import StarRating from './components/StarRating';
import { API_URL } from './config';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import Skeleton from './components/ui/Skeleton';
import EmptyState from './components/ui/EmptyState';
import ShopAvatar from './components/ShopAvatar';

function SkeletonCard() {
  return (
    <Card padding="none" className="overflow-hidden animate-pulse">
      <div className="h-32 bg-surface-container-high" />
      <div className="p-5 space-y-3">
        <Skeleton height="1.25rem" width="60%" />
        <Skeleton height="1rem" width="80%" />
        <Skeleton height="2.5rem" width="100%" rounded="xl" className="mt-2" />
      </div>
    </Card>
  );
}

function FavoriteCard({ shop, index, onRemove }) {
  return (
    <Card
      as="article"
      padding="none"
      interactive
      className="overflow-hidden group flex flex-col h-full animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Banner */}
      <div className="relative h-32 bg-primary-container overflow-hidden">
        <ShopAvatar
          src={shop.shopImage}
          alt={shop.shopName}
          size="cover"
          useThumbnail
          className="group-hover:scale-105 transition-transform duration-500"
        />
        {/* Remove favorite button */}
        <button
          onClick={() => onRemove(shop._id)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
          title="Remove from favourites"
        >
          <span
            className="material-symbols-outlined text-lg text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-headline text-lg font-bold text-on-surface line-clamp-1">{shop.shopName}</h3>

        {shop.averageRating > 0 && (
          <div className="mt-1">
            <StarRating rating={shop.averageRating} totalReviews={shop.totalReviews} size="sm" />
          </div>
        )}

        <div className="mt-3 space-y-2 flex-1">
          <div className="flex items-start gap-2 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-sm mt-0.5 flex-shrink-0">pin_drop</span>
            <p className="line-clamp-2">{shop.fullAddress}, {shop.city}</p>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-sm">call</span>
            <p>{shop.mobileNumber}</p>
          </div>
          {shop.productCount > 0 && (
            <div className="flex items-center gap-2 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-sm">inventory_2</span>
              <p>{shop.productCount} products</p>
            </div>
          )}
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

function FavoritesPage() {
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAuthHeader, toggleFavorite } = useAuth();
  const toast = useToast();

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customer/favorites`, getAuthHeader());
      setShops(res.data);
    } catch (err) {
      toast({ message: 'Could not load favorites.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeader, toast]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleToggle = async (shopId) => {
    await toggleFavorite(shopId);
    setShops(prev => prev.filter(s => s._id !== shopId));
    toast({ message: 'Removed from favorites.', type: 'info' });
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Saved</span>
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mt-2">Favourite Shops</h1>
        <p className="text-on-surface-variant mt-2">Your saved shops for quick access.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : shops.length === 0 ? (
        <EmptyState
          icon="favorite"
          title="No saved shops yet"
          description="Browse shops and tap the heart to save your favourites."
        >
          <Button as={Link} to="/" variant="primary" iconLeft="storefront" className="mt-6">
            Browse Shops
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {shops.map((shop, i) => (
            <FavoriteCard key={shop._id} shop={shop} index={i} onRemove={handleToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
