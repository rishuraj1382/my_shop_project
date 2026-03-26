// frontend/src/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from './Toast';
import { API_URL as BASE_URL } from './config';

const API_URL = `${BASE_URL}/api/orders`;

const STATUS_CONFIG = {
  Pending:            { color: 'bg-yellow-50 text-yellow-800 border-yellow-200',  dot: 'bg-yellow-500', icon: 'schedule' },
  Confirmed:          { color: 'bg-blue-50 text-blue-800 border-blue-200',        dot: 'bg-blue-500', icon: 'check_circle' },
  Packed:             { color: 'bg-purple-50 text-purple-800 border-purple-200',  dot: 'bg-purple-500', icon: 'inventory_2' },
  'Ready to Deliver': { color: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', icon: 'local_shipping' },
};

function SkeletonOrderCard() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col gap-4">
      <div className="skeleton h-5 w-3/5 rounded" />
      <div className="skeleton h-4 w-2/5 rounded" />
      <div className="skeleton h-4 w-4/5 rounded" />
      <div className="skeleton h-6 w-24 rounded-full mt-1" />
      <div className="flex gap-2 mt-3">
        <div className="skeleton h-10 w-32 rounded-xl" />
        <div className="skeleton h-10 w-20 rounded-xl" />
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const getConfig = () => ({ headers: { 'x-auth-token': localStorage.getItem('token') } });

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
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      Pending:   { next: 'Confirmed',        label: 'Confirm',           icon: 'check',       cls: 'bg-blue-600 hover:bg-blue-700' },
      Confirmed: { next: 'Packed',           label: 'Mark Packed',       icon: 'inventory_2', cls: 'bg-purple-600 hover:bg-purple-700' },
      Packed:    { next: 'Ready to Deliver', label: 'Ready to Deliver',  icon: 'local_shipping', cls: 'bg-emerald-600 hover:bg-emerald-700' },
    };
    const t = transitions[order.status];
    if (!t) return <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><span className="material-symbols-outlined text-sm">done_all</span>Complete</span>;
    return (
      <button
        onClick={() => handleUpdateStatus(order._id, t.next)}
        className={`${t.cls} text-white px-4 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 active:scale-95 transition-all shadow-sm`}
      >
        <span className="material-symbols-outlined text-sm">{t.icon}</span>
        {t.label}
      </button>
    );
  };

  const statusConf = (status) => STATUS_CONFIG[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400', icon: 'help' };

  const pendingCount   = orders.filter((o) => o.status === 'Pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'Confirmed' || o.status === 'Packed').length;
  const doneCount      = orders.filter((o) => o.status === 'Ready to Deliver').length;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0,0,0,0);
  const startOfToday = new Date(now);
  startOfToday.setHours(0,0,0,0);

  const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const monthlySales = orders.filter(o => new Date(o.createdAt) >= startOfMonth).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const weeklySales = orders.filter(o => new Date(o.createdAt) >= startOfWeek).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const todaySales = orders.filter(o => new Date(o.createdAt) >= startOfToday).reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Admin Panel</span>
        <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mt-2">Shopkeeper Dashboard</h1>
        <p className="text-on-surface-variant mt-2">Manage and track all your incoming orders.</p>
      </div>

      {/* Stats bar */}
      {!isLoading && orders.length > 0 && (
        <div className="space-y-4 mb-10 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Pending Orders" value={pendingCount} icon="schedule" bg="bg-yellow-50" color="text-yellow-700" iconColor="text-yellow-500" />
            <StatCard label="In Progress" value={confirmedCount} icon="sync" bg="bg-blue-50" color="text-blue-700" iconColor="text-blue-500" />
            <StatCard label="Ready" value={doneCount} icon="check_circle" bg="bg-emerald-50" color="text-emerald-700" iconColor="text-emerald-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Today's Sales" value={`₹${todaySales.toFixed(2)}`} icon="today" bg="bg-sky-50" color="text-sky-700" iconColor="text-sky-500" />
            <StatCard label="This Week's Sales" value={`₹${weeklySales.toFixed(2)}`} icon="trending_up" bg="bg-indigo-50" color="text-indigo-700" iconColor="text-indigo-500" />
            <StatCard label="This Month's Sales" value={`₹${monthlySales.toFixed(2)}`} icon="calendar_month" bg="bg-fuchsia-50" color="text-fuchsia-700" iconColor="text-fuchsia-500" />
            <StatCard label="All-Time Sales" value={`₹${totalSales.toFixed(2)}`} icon="account_balance_wallet" bg="bg-rose-50" color="text-rose-700" iconColor="text-rose-500" />
          </div>
        </div>
      )}

      {/* Order cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [0, 1, 2, 3, 4, 5].map((i) => <SkeletonOrderCard key={i} />)
        ) : orders.length === 0 ? (
          <div className="col-span-full text-center py-24 animate-fade-in">
            <span className="material-symbols-outlined text-6xl text-outline/30">receipt_long</span>
            <p className="text-on-surface-variant text-lg font-medium mt-4">No orders yet.</p>
            <p className="text-outline text-sm mt-1">New orders will appear here.</p>
          </div>
        ) : (
          orders.map((order, i) => {
            const sc = statusConf(order.status);
            return (
              <div
                key={order._id}
                className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col justify-between
                  hover:shadow-xl transition-all duration-300 animate-slide-up border border-outline-variant/10"
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
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${sc.color}`}>
                      <span className="material-symbols-outlined text-xs">{sc.icon}</span>
                      {order.status}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border ${order.paymentMethod === 'Online' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      <span className="material-symbols-outlined text-xs">{order.paymentMethod === 'Online' ? 'credit_card' : 'local_shipping'}</span>
                      {order.paymentMethod || 'COD'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border bg-surface-container-high text-on-surface border-outline-variant/30">
                      <span className="material-symbols-outlined text-xs">payments</span>
                      ₹{order.totalAmount?.toFixed(2) || '0.00'}
                    </span>
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
                  <button
                    onClick={() => handleRemoveOrder(order._id)}
                    className="btn-danger text-xs"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, bg, color, iconColor }) {
  return (
    <div className={`${bg} rounded-2xl p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
        <span className={`material-symbols-outlined text-2xl ${iconColor}`}>{icon}</span>
      </div>
      <div>
        <p className={`text-2xl font-headline font-extrabold ${color}`}>{value}</p>
        <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

export default AdminDashboard;
