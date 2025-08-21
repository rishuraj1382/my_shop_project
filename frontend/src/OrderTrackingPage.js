// frontend/src/OrderTrackingPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrder } from './OrderContext';

const socket = io('http://localhost:5000');

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
          const res = await axios.get(`http://localhost:5000/api/orders/track/${orderId}`);
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
  const currentStatusIndex = orderDetails ? statuses.indexOf(orderDetails.status) : -1;

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-200px)] p-4">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800">Track Your Order</h2>
        <form onSubmit={handleTrackOrder} className="flex">
          <input
            type="text"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="Enter Your Order ID"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 text-white bg-purple-600 rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-purple-300 transition duration-300"
          >
            {isLoading ? 'Tracking...' : 'Track'}
          </button>
        </form>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        {orderDetails && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-800">Status for {orderDetails.customerName}</h3>
            
            {/* Status Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between">
                {statuses.map((status, index) => (
                  <div key={status} className="flex-1 text-center">
                    <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-white ${index <= currentStatusIndex ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {index < currentStatusIndex ? '✓' : index + 1}
                    </div>
                    <p className={`mt-2 text-sm ${index <= currentStatusIndex ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>{status}</p>
                  </div>
                ))}
              </div>
              <div className="relative mt-2">
                <div className="h-1 bg-gray-300 rounded-full"></div>
                <div 
                  className="absolute top-0 left-0 h-1 bg-green-500 rounded-full transition-all duration-500" 
                  style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-lg">Items in your order:</h4>
              <ul className="list-disc list-inside mt-2">
                {orderDetails.items.map((item, index) => (
                  <li key={index}>{item.name} (Quantity: {item.quantity})</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderTrackingPage;
