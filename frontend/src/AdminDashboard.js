// frontend/src/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';

function AdminDashboard() {
  const [orders, setOrders] = useState([]);

  const getConfig = () => ({ headers: { 'x-auth-token': localStorage.getItem('token') } });

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(API_URL, getConfig());
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/${orderId}`, { status: newStatus }, getConfig());
      fetchOrders();
    } catch (error) {
      alert(`Failed to update order status.`);
    }
  };

  const handleRemoveOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to permanently delete this order?')) {
      try {
        await axios.delete(`${API_URL}/${orderId}`, getConfig());
        fetchOrders();
      } catch (error) {
        alert("Failed to remove order.");
      }
    }
  };

  const renderStatusButtons = (order) => {
    const buttonBaseStyles = "px-4 py-2 text-sm font-medium text-white rounded-md transition duration-300";
    switch (order.status) {
      case 'Pending':
        return <button onClick={() => handleUpdateStatus(order._id, 'Confirmed')} className={`${buttonBaseStyles} bg-blue-500 hover:bg-blue-600`}>Confirm Order</button>;
      case 'Confirmed':
        return <button onClick={() => handleUpdateStatus(order._id, 'Packed')} className={`${buttonBaseStyles} bg-yellow-500 hover:bg-yellow-600`}>Mark as Packed</button>;
      case 'Packed':
        return <button onClick={() => handleUpdateStatus(order._id, 'Ready to Deliver')} className={`${buttonBaseStyles} bg-green-500 hover:bg-green-600`}>Mark as Ready to Deliver</button>;
      default:
        return <span className="text-sm font-medium text-gray-500">Order Complete</span>;
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Shopkeeper Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{order.customerName}</h3>
                <p className="text-sm text-gray-600">{order.customerContact}</p>
                <p className="text-sm text-gray-600">{order.customerAddress}</p>
              </div>
              <div className="mb-4">
                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                  Status: {order.status}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Items:</h4>
                <ul className="list-disc list-inside mt-2 text-gray-700">
                  {order.items.map((item, index) => (
                    <li key={index}>{item.name} - Qty: {item.quantity}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              {renderStatusButtons(order)}
              <button onClick={() => handleRemoveOrder(order._id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
