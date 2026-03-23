// frontend/src/CheckoutForm.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { API_URL } from './config';

function CheckoutForm() {
  const { shopId } = useParams();
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State to hold the quantity for each product input
  const [quantities, setQuantities] = useState({});

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products/shop/${shopId}`);
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, [shopId]);

  useEffect(() => {
    if (shopId) {
      fetchProducts();
    }
  }, [shopId, fetchProducts]);

  // Handle changes in the quantity input for each product
  const handleQuantityChange = (productId, value) => {
    setQuantities({
      ...quantities,
      [productId]: value
    });
  };

  const addToCart = (productToAdd) => {
    const quantityToAdd = parseFloat(quantities[productToAdd._id]) || 1;
    if (quantityToAdd <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    const existingItem = cartItems.find(item => item._id === productToAdd._id);

    if (existingItem) {
      // If item exists, update its quantity
      setCartItems(cartItems.map(item =>
        item._id === productToAdd._id
          ? { ...item, quantity: item.quantity + quantityToAdd }
          : item
      ));
    } else {
      // If it's a new item, add it to the cart
      setCartItems([...cartItems, { ...productToAdd, quantity: quantityToAdd }]);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item._id !== productId));
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) { /* ... */ }

    // Send detailed item info to the backend
    const orderData = {
      customerName,
      customerContact,
      customerAddress,
      items: cartItems.map(item => ({ 
          name: item.name, 
          quantity: item.quantity,
          price: item.price,
          unit: item.unit
        })),
      shopId: shopId,
    };

    try {
      const res = await axios.post(`${API_URL}/api/orders`, orderData);
      alert(`Order placed successfully! Your Order ID is: ${res.data._id}`);
      setCustomerName('');
      setCustomerContact('');
      setCustomerAddress('');
      setCartItems([]);
      setQuantities({});
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order.');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Products Section */}
      <div className="lg:col-span-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Catalog</span>
            <h2 className="font-headline text-3xl font-bold text-on-surface mt-1">Available Products</h2>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
            <input
              type="text"
              placeholder="Search products…"
              className="input-stitch pl-10 pr-4 max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product, i) => (
            <div
              key={product._id}
              className="bg-surface-container-lowest rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="aspect-square overflow-hidden bg-surface-container-high">
                <img
                  src={product.productImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-headline font-bold text-on-surface tracking-tight">{product.name}</h3>
                <p className="text-on-surface-variant text-sm mt-1">
                  ₹{product.price.toFixed(2)} <span className="text-xs text-outline">({product.unit})</span>
                </p>
                <div className="mt-auto pt-4 flex items-center gap-2">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="Qty"
                    className="w-20 px-3 py-2.5 rounded-xl bg-surface-container-high border-none text-sm text-on-surface placeholder-outline focus:ring-2 focus:ring-primary/20 outline-none"
                    onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                  />
                  <button
                    onClick={() => addToCart(product)}
                    className="flex-1 bg-primary text-on-primary py-2.5 rounded-xl font-bold text-sm
                      hover:bg-primary-container active:scale-95 transition-all shadow-lg shadow-primary/20"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart and Checkout Section */}
      <div className="lg:col-span-1 lg:sticky lg:top-28 self-start">
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary text-2xl">shopping_cart</span>
            <h2 className="font-headline text-xl font-bold text-on-surface">Your Cart</h2>
          </div>
          {cartItems.length === 0 ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-5xl text-outline/40">remove_shopping_cart</span>
              <p className="text-on-surface-variant text-sm mt-3">Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item._id} className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
                  <div>
                    <p className="font-bold text-sm text-on-surface">{item.name}</p>
                    <p className="text-xs text-on-surface-variant">{item.quantity} {item.unit} × ₹{item.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-error hover:bg-error-container/20 p-1.5 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              ))}
              <div className="border-t border-outline-variant/30 pt-4 flex justify-between">
                <span className="font-headline font-bold text-on-surface">Total</span>
                <span className="font-headline font-extrabold text-primary text-lg">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
          
          {cartItems.length > 0 && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Delivery Details</span>
              </div>
              <input type="text" placeholder="Your Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input-stitch" required />
              <input type="text" placeholder="Contact Number" value={customerContact} onChange={(e) => setCustomerContact(e.target.value)} className="input-stitch" required />
              <textarea placeholder="Delivery Address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="input-stitch resize-none" rows={2} required />
              <button type="submit" className="btn-success w-full">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                Place Order
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutForm;
