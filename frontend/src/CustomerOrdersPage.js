// frontend/src/CustomerOrdersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useToast } from './Toast';
import ReviewModal from './components/ReviewModal';
import Card from './components/ui/Card';
import Badge from './components/ui/Badge';
import Button from './components/ui/Button';
import Skeleton from './components/ui/Skeleton';
import EmptyState from './components/ui/EmptyState';
import { API_URL } from './config';

const STATUS_CONFIG = {
  Pending:              { variant: 'warning', icon: 'schedule' },
  Confirmed:            { variant: 'info', icon: 'check_circle' },
  Packed:               { variant: 'warm', icon: 'inventory_2' },
  'Ready to Deliver':   { variant: 'success', icon: 'local_shipping' },
  'Out For Delivery':   { variant: 'info', icon: 'directions_bike' },
  'Ready for Pickup':   { variant: 'warm', icon: 'storefront' },
  Delivered:            { variant: 'success', icon: 'done_all' },
  Cancelled:            { variant: 'danger', icon: 'cancel' },
};

const CUSTOMER_CANCELLABLE_STATUSES = ['Pending', 'Confirmed'];

const DATE_FILTERS = [
  { id: 'all', label: 'All Orders' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '6m', label: 'Last 6 Months' },
  { id: '1y', label: 'Last Year' },
];

function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewModal, setReviewModal] = useState({ open: false, shopId: null, shopName: null, orderId: null });
  const { getAuthHeader } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter !== 'all') params.set('filter', dateFilter);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      const res = await axios.get(
        `${API_URL}/api/orders/my-orders?${params.toString()}`,
        getAuthHeader()
      );
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateFilter, searchTerm, getAuthHeader]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const handleReorder = (order) => {
    navigate(`/shop/${order.shop?._id || order.shop}`, {
      state: { reorderItems: order.items }
    });
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await axios.patch(`${API_URL}/api/orders/${orderId}/cancel`, {}, getAuthHeader());
      toast({ message: 'Order cancelled.', type: 'info' });
      fetchOrders();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to cancel order.';
      toast({ message: msg, type: 'error' });
    }
  };

  const statusConf = (status) => STATUS_CONFIG[status] || { variant: 'neutral', icon: 'help' };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Order History</span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mt-2">My Orders</h1>
          <p className="text-on-surface-variant mt-2">View all your previous orders and track their status.</p>
        </div>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Date filter tabs */}
        <div className="flex bg-surface-container-high rounded-xl p-1 self-start">
          {DATE_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                dateFilter === f.id
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by shop or product…"
            className="input-stitch pl-10"
          />
        </div>
      </div>

      {/* Order cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <Card key={i} padding="lg" className="flex flex-col gap-4">
              <Skeleton height="1.25rem" width="60%" />
              <Skeleton height="1rem" width="40%" />
              <Skeleton height="1rem" width="80%" />
              <Skeleton height="1.5rem" width="6rem" rounded="full" className="mt-1" />
            </Card>
          ))
        ) : orders.length === 0 ? (
          <div className="col-span-full">
            <EmptyState icon="shopping_bag" title={searchTerm || dateFilter !== 'all' ? 'No orders match your filters.' : 'No orders yet.'}>
              <Link to="/" className="btn-primary mt-6 inline-flex">
                <span className="material-symbols-outlined text-lg">storefront</span>
                Browse Shops
              </Link>
            </EmptyState>
          </div>
        ) : (
          orders.map((order, i) => {
            const sc = statusConf(order.status);
            const isDelivered = order.status === 'Delivered';
            const isActive = ['Pending','Confirmed','Packed','Ready to Deliver','Out For Delivery','Ready for Pickup'].includes(order.status);

            return (
              <Card
                key={order._id}
                as="article"
                padding="lg"
                className="flex flex-col justify-between hover:shadow-xl transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div>
                  {/* Shop name & date */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">storefront</span>
                      <span className="font-bold text-on-surface">{order.shop?.shopName || order.shopName || 'Shop'}</span>
                    </div>
                    <p className="text-xs text-outline mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Status & Payment badges */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Badge variant={sc.variant} icon={sc.icon} size="sm">{order.status}</Badge>
                    <Badge variant="neutral" icon={order.paymentMethod === 'Online' ? 'credit_card' : 'local_shipping'} size="sm">
                      {order.paymentMethod || 'COD'}
                    </Badge>
                  </div>

                  {/* Items */}
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Items</h4>
                    <ul className="space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-on-surface flex justify-between">
                          <span className="truncate">{item.name}</span>
                          <span className="text-outline font-medium ml-2 whitespace-nowrap">× {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-outline-variant/30 mt-3 pt-3 flex justify-between">
                      <span className="text-sm font-bold text-on-surface">Total</span>
                      <span className="text-sm font-extrabold text-primary">₹{order.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-col gap-2">
                  {isActive && (
                    <Button as={Link} to={`/track/${order._id}`} variant="ghost" iconLeft="local_shipping" fullWidth>
                      Track Order
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReorder(order)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-on-surface bg-surface-container-high hover:bg-surface-container-highest transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      Reorder
                    </button>
                    {isDelivered && (
                      <button
                        onClick={() => setReviewModal({ open: true, shopId: order.shop?._id || order.shop, shopName: order.shop?.shopName || order.shopName || 'Shop', orderId: order._id })}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-on-tertiary-container bg-tertiary-container hover:bg-tertiary-container/80 transition-all border border-tertiary/20"
                      >
                        <span className="material-symbols-outlined text-sm">star</span>
                        Review
                      </button>
                    )}
                    {CUSTOMER_CANCELLABLE_STATUSES.includes(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-error bg-error-container/20 hover:bg-error-container/40 transition-all border border-error/20"
                      >
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.open}
        onClose={() => setReviewModal({ open: false, shopId: null, shopName: null, orderId: null })}
        shopId={reviewModal.shopId}
        shopName={reviewModal.shopName}
        orderId={reviewModal.orderId}
        onReviewSubmitted={() => toast({ message: 'Thank you for your review!', type: 'success' })}
      />
    </div>
  );
}

export default CustomerOrdersPage;
