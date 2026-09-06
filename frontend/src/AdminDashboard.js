// frontend/src/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useToast } from './Toast';
import { useAuth } from './contexts/AuthContext';
import StatCard from './components/ui/StatCard';
import Card from './components/ui/Card';
import Badge from './components/ui/Badge';
import Button from './components/ui/Button';
import Skeleton from './components/ui/Skeleton';
import EmptyState from './components/ui/EmptyState';
import { API_URL as BASE_URL } from './config';

const socket = io(BASE_URL);
const API_URL = `${BASE_URL}/api/orders`;

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

function SkeletonOrderCard() {
  return (
    <Card padding="lg" className="flex flex-col gap-4">
      <Skeleton height="1.25rem" width="60%" />
      <Skeleton height="1rem" width="40%" />
      <Skeleton height="1rem" width="80%" />
      <Skeleton height="1.5rem" width="6rem" rounded="full" className="mt-1" />
      <div className="flex gap-2 mt-3">
        <Skeleton height="2.5rem" width="8rem" rounded="xl" />
        <Skeleton height="2.5rem" width="5rem" rounded="xl" />
      </div>
    </Card>
  );
}

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [shopStatus, setShopStatus] = useState(null);
  const [statusToggling, setStatusToggling] = useState(false);
  const { user, getAuthHeader } = useAuth();
  const toast = useToast();

  const getConfig = useCallback(() => getAuthHeader(), [getAuthHeader]);

  const fetchShopStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/shop`, getConfig());
      setShopStatus(res.data.isOpen !== false);
    } catch (error) {
      console.error('Error fetching shop status:', error);
    }
  }, [getConfig]);

  useEffect(() => {
    fetchShopStatus();
  }, [fetchShopStatus]);

  const handleToggleShopStatus = async () => {
    setStatusToggling(true);
    try {
      const res = await axios.put(`${BASE_URL}/api/users/shop/toggle-status`, {}, getConfig());
      setShopStatus(res.data.isOpen);
      toast({ message: `Shop is now ${res.data.isOpen ? 'Open' : 'Closed'}.`, type: res.data.isOpen ? 'success' : 'info' });
    } catch (error) {
      toast({ message: 'Failed to update shop status.', type: 'error' });
    } finally {
      setStatusToggling(false);
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(API_URL, getConfig());
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({ message: 'Failed to load orders.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [getConfig, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Join shopkeeper's socket room for new order notifications
  useEffect(() => {
    if (user?._id) {
      socket.emit('joinShopRoom', user._id);
    }
  }, [user]);

  // Listen for new orders
  useEffect(() => {
    const handleNewOrder = (order) => {
      toast({ message: `🛒 New order received from ${order.customerName}!`, type: 'success', duration: 6000 });
      setNewOrderCount(prev => prev + 1);
      fetchOrders();
    };
    socket.on('newOrder', handleNewOrder);
    return () => socket.off('newOrder', handleNewOrder);
  }, [fetchOrders, toast]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/${orderId}`, { status: newStatus }, getConfig());
      toast({ message: `Order marked as "${newStatus}".`, type: 'success' });
      fetchOrders();
    } catch (error) {
      toast({ message: 'Failed to update order status.', type: 'error' });
    }
  };

  const handleRemoveOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to permanently delete this order?')) return;
    try {
      await axios.delete(`${API_URL}/${orderId}`, getConfig());
      toast({ message: 'Order removed.', type: 'info' });
      fetchOrders();
    } catch (error) {
      toast({ message: 'Failed to remove order.', type: 'error' });
    }
  };

  const renderStatusButton = (order) => {
    const transitions = {
      Pending:            { next: 'Confirmed',          label: 'Confirm',           icon: 'check' },
      Confirmed:          { next: 'Packed',             label: 'Mark Packed',       icon: 'inventory_2' },
      Packed: order.fulfillmentType === 'Pickup'
        ? { next: 'Ready for Pickup', label: 'Ready for Pickup', icon: 'storefront' }
        : { next: 'Ready to Deliver', label: 'Ready to Deliver', icon: 'local_shipping' },
      'Ready to Deliver': { next: 'Out For Delivery',   label: 'Out For Delivery',  icon: 'directions_bike' },
      'Out For Delivery': { next: 'Delivered',          label: 'Mark Delivered',    icon: 'done_all' },
      'Ready for Pickup': { next: 'Delivered',          label: 'Mark Picked Up',    icon: 'done_all' },
    };
    if (order.status === 'Cancelled') return <Badge variant="danger" icon="cancel" size="sm">Cancelled</Badge>;
    const t = transitions[order.status];
    if (!t) return <Badge variant="success" icon="done_all" size="sm">Delivered</Badge>;
    return (
      <Button variant="primary" size="sm" iconLeft={t.icon} onClick={() => handleUpdateStatus(order._id, t.next)}>
        {t.label}
      </Button>
    );
  };

  const statusConf = (status) => STATUS_CONFIG[status] || { variant: 'neutral', icon: 'help' };

  // Stats
  const pendingCount   = orders.filter((o) => o.status === 'Pending').length;
  const confirmedCount = orders.filter((o) => ['Confirmed', 'Packed', 'Ready to Deliver', 'Out For Delivery', 'Ready for Pickup'].includes(o.status)).length;
  const doneCount      = orders.filter((o) => o.status === 'Delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // Cancelled orders don't count as revenue
  const revenueOrders = orders.filter(o => o.status !== 'Cancelled');
  const totalSales   = revenueOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const monthlySales = revenueOrders.filter(o => new Date(o.createdAt) >= startOfMonth).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const weeklySales  = revenueOrders.filter(o => new Date(o.createdAt) >= startOfWeek).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const todaySales   = revenueOrders.filter(o => new Date(o.createdAt) >= startOfToday).reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Admin Panel</span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mt-2">Shopkeeper Dashboard</h1>
          <p className="text-on-surface-variant mt-2">Manage and track all your incoming orders.</p>
        </div>
        <div className="flex items-center flex-wrap gap-4">
          {shopStatus !== null && (
            <button
              onClick={handleToggleShopStatus}
              disabled={statusToggling}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60 border ${
                shopStatus
                  ? 'bg-success-container text-on-success-container border-success/30 hover:bg-success-container/80'
                  : 'bg-error-container text-on-error-container border-error/30 hover:bg-error-container/80'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{shopStatus ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
              {shopStatus ? 'Shop Open' : 'Shop Closed'}
              <span className="text-xs opacity-70 ml-1">(tap to {shopStatus ? 'close' : 'open'})</span>
            </button>
          )}
          {newOrderCount > 0 && (
            <div className="animate-slide-down flex items-center gap-3 px-5 py-3 bg-success-container border border-success/30 rounded-2xl">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <p className="text-on-success-container font-bold text-sm">
                {newOrderCount} new order{newOrderCount > 1 ? 's' : ''} received!
              </p>
              <button
                onClick={() => { setNewOrderCount(0); fetchOrders(); }}
                className="text-xs text-on-success-container hover:underline font-bold"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {!isLoading && orders.length > 0 && (
        <div className="space-y-4 mb-10 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Pending Orders" value={pendingCount} icon="schedule" bg="bg-warning-container" color="text-on-warning-container" iconColor="text-on-warning-container" />
            <StatCard label="In Progress" value={confirmedCount} icon="sync" bg="bg-info-container" color="text-on-info-container" iconColor="text-on-info-container" />
            <StatCard label="Delivered" value={doneCount} icon="done_all" bg="bg-success-container" color="text-on-success-container" iconColor="text-on-success-container" />
            <StatCard label="Cancelled" value={cancelledCount} icon="cancel" bg="bg-error-container" color="text-on-error-container" iconColor="text-on-error-container" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Today's Sales" value={`₹${todaySales.toFixed(2)}`} icon="today" bg="bg-primary/10" color="text-primary" iconColor="text-primary" />
            <StatCard label="This Week's Sales" value={`₹${weeklySales.toFixed(2)}`} icon="trending_up" bg="bg-secondary-container" color="text-on-secondary-container" iconColor="text-on-secondary-container" />
            <StatCard label="This Month's Sales" value={`₹${monthlySales.toFixed(2)}`} icon="calendar_month" bg="bg-tertiary-container" color="text-on-tertiary-container" iconColor="text-on-tertiary-container" />
            <StatCard label="All-Time Sales" value={`₹${totalSales.toFixed(2)}`} icon="account_balance_wallet" bg="bg-success-container" color="text-on-success-container" iconColor="text-on-success-container" />
          </div>
        </div>
      )}

      {/* Order cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [0, 1, 2, 3, 4, 5].map((i) => <SkeletonOrderCard key={i} />)
        ) : orders.length === 0 ? (
          <div className="col-span-full">
            <EmptyState icon="receipt_long" title="No orders yet." description="New orders will appear here automatically." />
          </div>
        ) : (
          orders.map((order, i) => {
            const sc = statusConf(order.status);
            return (
              <Card
                as="article"
                padding="lg"
                className="flex flex-col justify-between hover:shadow-xl transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div>
                  {/* Customer info */}
                  <div className="mb-4">
                    <h3 className="font-headline font-bold text-on-surface text-lg">{order.customerName}</h3>
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm mt-1">
                      <span className="material-symbols-outlined text-sm">call</span>
                      {order.customerContact}
                    </div>
                    <div className="flex items-start gap-2 text-on-surface-variant text-sm mt-1">
                      <span className="material-symbols-outlined text-sm mt-0.5">pin_drop</span>
                      {order.customerAddress}
                    </div>
                  </div>

                  {/* Status & Payment badges */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Badge variant={sc.variant} icon={sc.icon} size="sm">{order.status}</Badge>
                    <Badge variant="neutral" icon={order.paymentMethod === 'Online' ? 'credit_card' : 'local_shipping'} size="sm">
                      {order.paymentMethod || 'COD'}
                    </Badge>
                    <Badge variant={order.fulfillmentType === 'Pickup' ? 'warm' : 'neutral'} icon={order.fulfillmentType === 'Pickup' ? 'storefront' : 'directions_bike'} size="sm">
                      {order.fulfillmentType === 'Pickup' ? 'Pickup' : 'Delivery'}
                    </Badge>
                    <Badge variant="neutral" icon="payments" size="sm">₹{order.totalAmount?.toFixed(2) || '0.00'}</Badge>
                  </div>

                  {/* Items */}
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Items</h4>
                    <ul className="space-y-1.5 max-h-32 overflow-y-auto pr-2">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-on-surface flex justify-between gap-3">
                          <span className="truncate">{item.name}</span>
                          <span className="text-outline font-medium whitespace-nowrap">× {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center gap-3 flex-wrap">
                  {renderStatusButton(order)}
                  {!['Delivered', 'Cancelled'].includes(order.status) && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'Cancelled')}
                      className="text-error border border-error/30 hover:bg-error-container/20 px-4 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">cancel</span>
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveOrder(order._id)}
                    className="btn-danger text-xs"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Remove
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
