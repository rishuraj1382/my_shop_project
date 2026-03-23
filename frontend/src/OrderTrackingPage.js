// frontend/src/OrderTrackingPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrder } from './OrderContext';
import { API_URL } from './config';

const socket = io(API_URL);

function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { setLastTrackedOrderId } = useOrder();

  const [inputId, setInputId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      const fetchInitialOrder = async () => {
        setIsLoading(true);
        setError('');
        setOrderDetails(null);
        try {
          const res = await axios.get(`${API_URL}/api/orders/track/${orderId}`);
          setOrderDetails(res.data);
          setLastTrackedOrderId(orderId);
        } catch (err) {
          setError('Order not found. Please check the ID and try again.');
          setOrderDetails(null);
          setLastTrackedOrderId(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchInitialOrder();
    }
  }, [orderId, setLastTrackedOrderId]);

  useEffect(() => {
    if (orderDetails && orderId) {
      const eventName = `orderUpdate:${orderId}`;
      const handleOrderUpdate = (data) => {
        setOrderDetails(prevDetails => ({ ...prevDetails, status: data.status }));
      };
      socket.on(eventName, handleOrderUpdate);
      return () => {
        socket.off(eventName, handleOrderUpdate);
      };
    }
  }, [orderDetails, orderId]);

  const handleTrackOrder = (e) => {
    e.preventDefault();
    if (!inputId.trim()) {
      setError('Please enter an Order ID.');
      return;
    }
    navigate(`/track/${inputId}`);
  };

  const statuses = ['Pending', 'Confirmed', 'Packed', 'Ready to Deliver'];
  const statusIcons = ['schedule', 'check_circle', 'inventory_2', 'local_shipping'];
  const currentStatusIndex = orderDetails ? statuses.indexOf(orderDetails.status) : -1;

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-200px)] p-4 animate-fade-in">
      <div className="w-full max-w-2xl space-y-8">
        {/* Hero */}
        <div className="text-center">
          <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Live Updates</span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mt-3">
            Track Your <span className="text-primary italic">Order</span>
          </h1>
        </div>

        {/* Search Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleTrackOrder} className="flex gap-2">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">qr_code</span>
              <input
                type="text"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                placeholder="Paste your Order ID here"
                className="input-stitch pl-12 pr-4"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary px-8"
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-slow" />
              ) : (
                'Track'
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-error-container text-on-error-container text-sm animate-slide-down">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {orderDetails && (
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm animate-scale-in space-y-8">
            <div>
              <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Order Status</span>
              <h3 className="font-headline text-2xl font-bold text-on-surface mt-2">
                Hi, {orderDetails.customerName}!
              </h3>
              <p className="text-on-surface-variant text-sm mt-1">Here's the latest on your order.</p>
            </div>
            
            {/* Status Timeline */}
            <div className="relative">
              {/* Vertical on mobile, horizontal on desktop */}
              <div className="flex flex-col md:flex-row gap-0 md:gap-0 justify-between relative">
                {/* Line connector */}
                <div className="hidden md:block absolute top-5 left-0 right-0 h-0.5 bg-surface-container-high z-0"></div>
                <div
                  className="hidden md:block absolute top-5 left-0 h-0.5 bg-primary transition-all duration-700 z-0"
                  style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
                ></div>

                {statuses.map((status, index) => (
                  <div key={status} className="flex md:flex-col items-center md:items-center gap-4 md:gap-3 relative z-10 flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        index <= currentStatusIndex
                          ? 'bg-primary text-white shadow-lg shadow-primary/30'
                          : 'bg-surface-container-high text-outline'
                      }`}>
                        <span className="material-symbols-outlined text-lg">
                          {index < currentStatusIndex ? 'check' : statusIcons[index]}
                        </span>
                      </div>
                      {/* Vertical line for mobile */}
                      {index < statuses.length - 1 && (
                        <div className={`md:hidden w-0.5 h-8 my-1 transition-all duration-300 ${
                          index < currentStatusIndex ? 'bg-primary' : 'bg-surface-container-high'
                        }`}></div>
                      )}
                    </div>
                    <p className={`text-xs font-bold text-center transition-colors ${
                      index <= currentStatusIndex ? 'text-on-surface' : 'text-outline'
                    }`}>
                      {status}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-surface-container-low rounded-xl p-6">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Items in your order</h4>
              <div className="space-y-3">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-lg">shopping_bag</span>
                      <span className="font-medium text-sm text-on-surface">{item.name}</span>
                    </div>
                    <span className="text-on-surface-variant text-sm font-bold">× {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderTrackingPage;
