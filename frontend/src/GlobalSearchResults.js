// frontend/src/GlobalSearchResults.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useToast } from './Toast';
import StarRating from './components/StarRating';
import { API_URL } from './config';
import Card from './components/ui/Card';
import Badge from './components/ui/Badge';
import Button from './components/ui/Button';
import Skeleton from './components/ui/Skeleton';
import EmptyState from './components/ui/EmptyState';

const CATEGORIES = ['all', 'Food', 'Dairy', 'Beverages', 'Vegetables', 'Fruits', 'Snacks', 'General'];

function ProductSearchCard({ product, onAddToCart, onBuyNow }) {
  return (
    <Card
      as="article"
      padding="none"
      className={`overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col animate-slide-up ${
        !product.inStock ? 'opacity-70' : ''
      }`}
    >
      {/* Product Image */}
      <div className="aspect-square overflow-hidden bg-surface-container-high relative">
        <img
          src={product.productImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${product.inStock ? 'group-hover:scale-105' : 'grayscale'}`}
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Badge variant="danger" size="sm" className="uppercase tracking-wider shadow-lg">Out of Stock</Badge>
          </div>
        )}
        {/* Price badge */}
        <div className="absolute bottom-2 left-2">
          <span className="bg-surface-container-lowest/90 text-on-surface text-xs font-extrabold px-2 py-1 rounded-lg shadow">
            ₹{product.price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-headline font-bold text-sm text-on-surface line-clamp-2">{product.name}</h3>
        <p className="text-xs text-outline mt-0.5">{product.unit}</p>

        {/* Shop info */}
        <Link
          to={`/shop/${product.shopId}`}
          className="flex items-center gap-1.5 mt-2 group/shop"
        >
          <span className="material-symbols-outlined text-xs text-primary">storefront</span>
          <span className="text-xs font-medium text-primary group-hover/shop:underline line-clamp-1">{product.shopName}</span>
        </Link>
        {product.shopRating > 0 && (
          <div className="mt-1">
            <StarRating rating={product.shopRating} totalReviews={product.shopTotalReviews} size="sm" />
          </div>
        )}

        {/* Buttons */}
        <div className="mt-auto pt-3 flex flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={!product.inStock}
            onClick={() => onAddToCart(product)}
            className="sm:flex-1"
          >
            Add
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!product.inStock}
            onClick={() => onBuyNow(product)}
            className="sm:flex-1"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </Card>
  );
}

function GlobalSearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, role, getAuthHeader } = useAuth();
  const toast = useToast();

  const pincode = searchParams.get('pincode') || '';
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter state
  const [sortBy, setSortBy] = useState('price_asc');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [localQuery, setLocalQuery] = useState(query);
  const [localPincode, setLocalPincode] = useState(pincode);

  const debounceTimer = useRef(null);

  const performSearch = useCallback(async (params) => {
    const { pincode: pc, q, sort, inStock, category, maxP } = params;
    if (!pc) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const queryParams = new URLSearchParams({ pincode: pc });
      if (q) queryParams.set('q', q);
      if (sort) queryParams.set('sort', sort);
      if (inStock) queryParams.set('inStock', 'true');
      if (category && category !== 'all') queryParams.set('category', category);
      if (maxP) queryParams.set('maxPrice', maxP);

      const res = await axios.get(`${API_URL}/api/search?${queryParams.toString()}`);
      setResults(res.data.products || []);
      setShops(res.data.shops || []);

      // Save recent search for logged-in customers
      if (token && role === 'customer' && q) {
        axios.post(`${API_URL}/api/customer/recent-searches`, { term: q }, getAuthHeader()).catch(() => {});
      }
    } catch (err) {
      toast({ message: 'Search failed. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [token, role, getAuthHeader, toast]);

  // Auto-search when URL params change
  useEffect(() => {
    if (pincode) {
      performSearch({ pincode, q: query, sort: sortBy, inStock: inStockOnly, category: selectedCategory, maxP: maxPrice });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincode, query, sortBy, inStockOnly, selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ pincode: localPincode, q: localQuery });
  };

  const handleFilterChange = (key, value) => {
    if (key === 'sort') setSortBy(value);
    if (key === 'inStock') setInStockOnly(value);
    if (key === 'category') setSelectedCategory(value);
    if (key === 'maxPrice') setMaxPrice(value);

    // Debounce re-search
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      performSearch({
        pincode,
        q: query,
        sort: key === 'sort' ? value : sortBy,
        inStock: key === 'inStock' ? value : inStockOnly,
        category: key === 'category' ? value : selectedCategory,
        maxP: key === 'maxPrice' ? value : maxPrice,
      });
    }, 400);
  };

  const handleAddToCart = (product) => {
    navigate(`/shop/${product.shopId}`, { state: { preAddProduct: product } });
  };

  const handleBuyNow = (product) => {
    navigate(`/shop/${product.shopId}`, { state: { buyNowProduct: product } });
  };

  return (
    <div className="animate-fade-in">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="bg-surface-container-lowest p-3 rounded-2xl flex flex-col md:flex-row gap-2 shadow-md border border-outline-variant/20">
          <div className="flex items-center px-4 gap-3 border-r border-outline-variant/20">
            <span className="material-symbols-outlined text-outline">location_on</span>
            <input
              type="text"
              value={localPincode}
              onChange={e => setLocalPincode(e.target.value)}
              placeholder="Pincode"
              className="w-28 bg-transparent border-none focus:ring-0 text-on-surface py-2 font-medium placeholder-outline/60 outline-none text-sm"
            />
          </div>
          <div className="flex-1 flex items-center px-4 gap-3">
            <span className="material-symbols-outlined text-outline">search</span>
            <input
              type="text"
              value={localQuery}
              onChange={e => setLocalQuery(e.target.value)}
              placeholder="Search products across all shops…"
              className="w-full bg-transparent border-none focus:ring-0 text-on-surface py-2 font-medium placeholder-outline/60 outline-none"
            />
          </div>
          <Button type="submit" variant="primary" className="px-8">
            Search
          </Button>
        </div>
      </form>

      {hasSearched && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-lowest rounded-2xl p-6 sticky top-28">
              <h3 className="font-headline font-bold text-on-surface mb-4">Filters</h3>

              {/* Sort */}
              <div className="mb-5">
                <label className="label-stitch">Sort By</label>
                <select
                  value={sortBy}
                  onChange={e => handleFilterChange('sort', e.target.value)}
                  className="input-stitch mt-1"
                >
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="rating">Best Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              {/* Category */}
              <div className="mb-5">
                <label className="label-stitch">Category</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleFilterChange('category', cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all capitalize ${
                        selectedCategory === cat
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price */}
              <div className="mb-5">
                <label className="label-stitch">Max Price (₹)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="e.g. 500"
                  className="input-stitch mt-1"
                  min="0"
                />
              </div>

              {/* In Stock */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => handleFilterChange('inStock', !inStockOnly)}
                  className="sr-only peer"
                />
                <div
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface ${inStockOnly ? 'bg-success' : 'bg-surface-container-highest'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-surface-container-lowest shadow-md transition-transform duration-300 ${inStockOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm font-medium text-on-surface">In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Results</span>
                <h2 className="font-headline text-2xl font-bold text-on-surface mt-1">
                  {isLoading ? 'Searching…' : `${results.length} products found`}
                  {query && !isLoading && (
                    <span className="text-primary italic"> for "{query}"</span>
                  )}
                </h2>
                {shops.length > 0 && !isLoading && (
                  <p className="text-on-surface-variant text-sm mt-0.5">across {shops.length} shops in {pincode}</p>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[0,1,2,3,4,5].map(i => (
                  <Card key={i} padding="none" className="overflow-hidden animate-pulse">
                    <div className="aspect-square bg-surface-container-high" />
                    <div className="p-4 space-y-2">
                      <Skeleton height="1rem" width="75%" />
                      <Skeleton height="0.75rem" width="50%" />
                      <Skeleton height="2rem" width="100%" rounded="xl" className="mt-2" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : results.length === 0 ? (
              <EmptyState
                icon="search_off"
                title="No products found."
                description="Try a different search term or adjust filters."
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {results.map((product) => (
                  <ProductSearchCard
                    key={`${product._id}`}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Initial state: no search yet */}
      {!hasSearched && (
        <div className="text-center py-20 animate-fade-in">
          <span className="material-symbols-outlined text-7xl text-outline/30">travel_explore</span>
          <h2 className="text-3xl font-headline font-bold text-on-surface mt-4">Search Products Near You</h2>
          <p className="text-on-surface-variant mt-3 text-lg">Enter a pincode and product name above to find the best prices across all local shops.</p>
        </div>
      )}
    </div>
  );
}

export default GlobalSearchResults;
