// frontend/src/ProductDetailsPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StarRating from './components/StarRating';
import ReviewModal from './components/ReviewModal';
import { useAuth } from './contexts/AuthContext';
import { useToast } from './Toast';
import { API_URL } from './config';
import Badge from './components/ui/Badge';
import Button from './components/ui/Button';
import ShopAvatar from './components/ShopAvatar';

function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { role, token } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [shopReviews, setShopReviews] = useState([]);
  const [weightQty, setWeightQty] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const [productRes, reviewsRes] = await Promise.all([
          axios.get(`${API_URL}/api/products/${productId}`),
          axios.get(`${API_URL}/api/reviews/shop/${productId}`).catch(() => ({ data: { reviews: [] } })),
        ]);
        setProduct(productRes.data.product);
        setSimilar(productRes.data.similar || []);
        setShopReviews(reviewsRes.data.reviews || []);
      } catch (err) {
        toast({ message: 'Product not found.', type: 'error' });
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId, navigate, toast]);

  // Fetch shop reviews separately once we have shopId
  useEffect(() => {
    if (product?.shop?._id) {
      axios.get(`${API_URL}/api/reviews/shop/${product.shop._id}?limit=5`)
        .then(res => setShopReviews(res.data.reviews || []))
        .catch(() => {});
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    navigate(`/shop/${product.shop._id}`, {
      state: { preAddProduct: { ...product, shopId: product.shop._id, shopName: product.shop.shopName } }
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    navigate(`/shop/${product.shop._id}`, {
      state: { buyNowProduct: { ...product, shopId: product.shop._id, shopName: product.shop.shopName } }
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square bg-surface-container-high rounded-2xl" />
        <div className="space-y-5">
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-6 w-1/4 rounded" />
          <div className="skeleton h-20 w-full rounded" />
          <div className="skeleton h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!product) return null;
  const shop = product.shop;

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Shops</Link>
        <span>/</span>
        <Link to={`/shop/${shop._id}`} className="hover:text-primary transition-colors">{shop.shopName}</Link>
        <span>/</span>
        <span className="text-on-surface font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container-high relative group">
            <img
              src={product.productImage}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-700 ${product.inStock ? 'group-hover:scale-105' : 'grayscale'}`}
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Badge variant="danger" className="uppercase tracking-wider shadow-lg">Out of Stock</Badge>
              </div>
            )}
            {product.quantityType === 'weight' && (
              <div className="absolute top-4 left-4">
                <Badge variant="warm" icon="scale" className="shadow-md">Weight-based</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Category */}
          {product.category && (
            <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase mb-2">
              {product.category}
            </span>
          )}

          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-4xl font-extrabold text-primary">₹{product.price.toFixed(2)}</span>
            <span className="text-on-surface-variant text-lg">/ {product.unit}</span>
          </div>

          {/* Stock status */}
          <div className="mt-3">
            <Badge variant={product.inStock ? 'success' : 'danger'} icon={product.inStock ? 'check_circle' : 'cancel'}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </Badge>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-5">
              <p className="text-on-surface-variant leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Quantity selector for weight-based */}
          {product.quantityType === 'weight' && product.inStock && (
            <div className="mt-5">
              <label className="label-stitch">Quantity (in kg)</label>
              {product.quantityOptions?.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.quantityOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setWeightQty(opt)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                        weightQty === opt
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant text-on-surface hover:border-primary'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weightQty}
                  onChange={e => setWeightQty(e.target.value)}
                  className="input-stitch w-32 mt-1"
                  placeholder="e.g. 0.5"
                />
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              variant="ghost"
              size="lg"
              iconLeft="add_shopping_cart"
              disabled={!product.inStock}
              onClick={handleAddToCart}
              className="sm:flex-1"
            >
              Add to Cart
            </Button>
            <Button
              variant="primary"
              size="lg"
              iconLeft="bolt"
              disabled={!product.inStock}
              onClick={handleBuyNow}
              className="sm:flex-1"
            >
              Buy Now
            </Button>
          </div>

          {/* Shop Card */}
          <div className="mt-8 p-5 bg-surface-container-low rounded-2xl">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Sold By</p>
            <div className="flex items-center gap-4">
              <ShopAvatar src={shop.shopImage} alt={shop.shopName} size="md" useThumbnail />
              <div className="flex-1">
                <p className="font-headline font-bold text-on-surface">{shop.shopName}</p>
                <StarRating rating={shop.averageRating || 0} totalReviews={shop.totalReviews || 0} size="sm" />
                <p className="text-xs text-on-surface-variant mt-1">{shop.city}</p>
              </div>
              <Link
                to={`/shop/${shop._id}`}
                className="text-sm font-bold text-primary hover:underline whitespace-nowrap"
              >
                View Shop →
              </Link>
            </div>

            {token && role === 'customer' && (
              <button
                onClick={() => setReviewModalOpen(true)}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-on-tertiary-container bg-tertiary-container hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">star</span>
                Rate This Shop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Shop Reviews */}
      {shopReviews.length > 0 && (
        <div className="mt-16">
          <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Customer Reviews</span>
          <h2 className="text-2xl font-headline font-bold text-on-surface mt-2 mb-6">
            What customers say about {shop.shopName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shopReviews.map((rev, i) => (
              <div key={rev._id} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/10 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {(rev.customerName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-on-surface">{rev.customerName || 'Customer'}</p>
                    <StarRating rating={rev.rating} size="sm" />
                  </div>
                  <span className="ml-auto text-xs text-outline">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {rev.review && (
                  <p className="text-sm text-on-surface-variant leading-relaxed">"{rev.review}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar Products */}
      {similar.length > 0 && (
        <div className="mt-16">
          <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">More From This Shop</span>
          <h2 className="text-2xl font-headline font-bold text-on-surface mt-2 mb-6">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {similar.map((p, i) => (
              <Link
                key={p._id}
                to={`/product/${p._id}`}
                className="bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-lg transition-all animate-slide-up group"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="aspect-square overflow-hidden bg-surface-container-high">
                  <img src={p.productImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-3">
                  <p className="font-bold text-xs text-on-surface line-clamp-2">{p.name}</p>
                  <p className="text-primary font-extrabold text-sm mt-1">₹{p.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        shopId={shop._id}
        shopName={shop.shopName}
        onReviewSubmitted={() => {
          axios.get(`${API_URL}/api/reviews/shop/${shop._id}?limit=5`)
            .then(res => setShopReviews(res.data.reviews || []))
            .catch(() => {});
        }}
      />
    </div>
  );
}

export default ProductDetailsPage;
