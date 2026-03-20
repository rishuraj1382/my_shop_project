// frontend/src/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from './Toast';
import { API_URL as BASE_URL } from './config';

const API_URL = `${BASE_URL}/api/orders`;

const STATUS_CONFIG = {
  Pending:          { color: 'bg-yellow-100 text-yellow-800 border-yellow-200',  dot: 'bg-yellow-500' },
  Confirmed:        { color: 'bg-blue-100 text-blue-800 border-blue-200',        dot: 'bg-blue-500' },
  Packed:           { color: 'bg-purple-100 text-purple-800 border-purple-200',  dot: 'bg-purple-500' },
  'Ready to Deliver': { color: 'bg-green-100 text-green-800 border-green-200',   dot: 'bg-green-500' },
};

function SkeletonOrderCard() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3">
      <div className="skeleton h-6 w-2/3 rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-5 w-24 rounded-full mt-1" />
      <div className="skeleton h-4 w-1/3 rounded mt-2" />
      <div className="skeleton h-4 w-1/2 rounded" />
      <div className="flex gap-2 mt-4">
        <div className="skeleton h-9 w-32 rounded-lg" />
        <div className="skeleton h-9 w-20 rounded-lg" />
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
      Pending:   { next: 'Confirmed',        label: '✓ Confirm Order',          cls: 'btn-primary !bg-blue-600 hover:!bg-blue-700' },
      Confirmed: { next: 'Packed',           label: '📦 Mark as Packed',         cls: 'btn-primary !bg-purple-600 hover:!bg-purple-700' },
      Packed:    { next: 'Ready to Deliver', label: '🚚 Ready to Deliver',       cls: 'btn-primary !bg-green-600 hover:!bg-green-700' },
    };
    const t = transitions[order.status];
    if (!t) return <span className="text-sm font-medium text-gray-400 italic">✅ Complete</span>;
    return (
      <button
        onClick={() => handleUpdateStatus(order._id, t.next)}
        className={`${t.cls} text-sm`}
      >
        {t.label}
      </button>
    );
  };

  const statusConf = (status) => STATUS_CONFIG[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' };

  const pendingCount   = orders.filter((o) => o.status === 'Pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'Confirmed' || o.status === 'Packed').length;
  const doneCount      = orders.filter((o) => o.status === 'Ready to Deliver').length;

  return (
    <div className="container mx-auto px-4 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">Shopkeeper Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage and track all your incoming orders.</p>
      </div>

      {/* Stats bar */}
      {!isLoading && orders.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
          <StatCard label="Pending" value={pendingCount} color="text-yellow-600" bg="bg-yellow-50" />
          <StatCard label="In Progress" value={confirmedCount} color="text-blue-600" bg="bg-blue-50" />
          <StatCard label="Ready" value={doneCount} color="text-green-600" bg="bg-green-50" />
        </div>
      )}

      {/* Order cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [0, 1, 2, 3, 4, 5].map((i) => <SkeletonOrderCard key={i} />)
        ) : orders.length === 0 ? (
          <div className="col-span-full text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 text-xl font-medium">No orders yet.</p>
            <p className="text-gray-400 mt-1">New orders will appear here.</p>
          </div>
        ) : (
          orders.map((order, i) => {
            const sc = statusConf(order.status);
            return (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between
                  hover:shadow-lg transition-shadow duration-200 animate-slide-up border border-gray-100"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div>
                  {/* Customer info */}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{order.customerName}</h3>
                    <p className="text-sm text-gray-500">{order.customerContact}</p>
                    <p className="text-sm text-gray-500">{order.customerAddress}</p>
                  </div>

                  {/* Status badge */}
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.color} mb-3`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {order.status}
                  </span>

                  {/* Items */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Items</h4>
                    <ul className="space-y-0.5">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex justify-between">
                          <span>{item.name}</span>
                          <span className="text-gray-400">× {item.quantity}</span>
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
                    className="btn-danger text-sm"
                  >
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

function StatCard({ label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-xl p-4 text-center border border-gray-100`}>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500 font-medium mt-1">{label}</p>
    </div>
  );
}

export default AdminDashboard;

