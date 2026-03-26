// frontend/src/CustomerOrdersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from './config';

const STATUS_CONFIG = {
  Pending:            { color: 'bg-yellow-50 text-yellow-800 border-yellow-200', icon: 'schedule' },
  Confirmed:          { color: 'bg-blue-50 text-blue-800 border-blue-200', icon: 'check_circle' },
  Packed:             { color: 'bg-purple-50 text-purple-800 border-purple-200', icon: 'inventory_2' },
  'Ready to Deliver': { color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: 'local_shipping' },
};

function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getConfig = () => ({ headers: { 'x-auth-token': localStorage.getItem('token') } });

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders/my-orders`, getConfig());
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const statusConf = (status) => STATUS_CONFIG[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'help' };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Order History</span>
        <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mt-2">My Orders</h1>
        <p className="text-on-surface-variant mt-2">View all your previous orders and track their status.</p>
      </div>

      {/* Order cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col gap-4">
              <div className="skeleton h-5 w-3/5 rounded" />
              <div className="skeleton h-4 w-2/5 rounded" />
              <div className="skeleton h-4 w-4/5 rounded" />
              <div className="skeleton h-6 w-24 rounded-full mt-1" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="col-span-full text-center py-24 animate-fade-in">
            <span className="material-symbols-outlined text-6xl text-outline/30">shopping_bag</span>
            <p className="text-on-surface-variant text-lg font-medium mt-4">No orders yet.</p>
            <p className="text-outline text-sm mt-1">Your past orders will appear here.</p>
            <Link to="/" className="btn-primary mt-6 inline-flex">
              <span className="material-symbols-outlined text-lg">storefront</span>
              Browse Shops
            </Link>
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
                  {/* Shop name & date */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                      <span className="material-symbols-outlined text-sm">storefront</span>
                      <span className="font-bold text-on-surface">{order.shop?.shopName || 'Shop'}</span>
                    </div>
                    <p className="text-xs text-outline mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                  </div>

                  {/* Status & Payment badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${sc.color}`}>
                      <span className="material-symbols-outlined text-xs">{sc.icon}</span>
                      {order.status}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border ${order.paymentMethod === 'Online' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      <span className="material-symbols-outlined text-xs">{order.paymentMethod === 'Online' ? 'credit_card' : 'local_shipping'}</span>
                      {order.paymentMethod || 'COD'}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Items</h4>
                    <ul className="space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-on-surface flex justify-between">
                          <span>{item.name}</span>
                          <span className="text-outline font-medium">× {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-outline-variant/30 mt-3 pt-3 flex justify-between">
                      <span className="text-sm font-bold text-on-surface">Total</span>
                      <span className="text-sm font-extrabold text-primary">₹{order.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Track link */}
                <div className="mt-5">
                  <Link
                    to={`/track/${order._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-primary 
                      bg-primary/5 hover:bg-primary/10 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">local_shipping</span>
                    Track Order
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CustomerOrdersPage;
