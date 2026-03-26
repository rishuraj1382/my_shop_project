// frontend/src/CheckoutForm.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from './config';

function CheckoutForm() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState(localStorage.getItem('savedCustomerName') || '');
  const [customerContact, setCustomerContact] = useState(localStorage.getItem('savedCustomerContact') || '');
  const [customerAddress, setCustomerAddress] = useState(localStorage.getItem('savedCustomerAddress') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Fetch logged-in user details to auto-fill (overrides localStorage if logged in)
  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (token && role === 'customer') {
        try {
          const res = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { 'x-auth-token': token }
          });
          if (res.data) {
            setCustomerName(prev => res.data.name || res.data.username || prev);
            setCustomerContact(prev => res.data.mobileNumber || prev);
            setCustomerAddress(prev => res.data.fullAddress || prev);
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }
    };
    fetchUserDetails();
  }, []);

  // Load Razorpay checkout script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleQuantityChange = (productId, value) => {
    setQuantities({ ...quantities, [productId]: value });
  };

  const handleOptionChange = (productId, value) => {
    setSelectedOptions({ ...selectedOptions, [productId]: value });
  };

  const addToCart = (productToAdd, overrideQuantity = null) => {
    if (!productToAdd.inStock) return;
    
    let quantityToAdd;
    
    if (overrideQuantity !== null) {
      quantityToAdd = overrideQuantity;
    } else if (productToAdd.quantityType === 'weight') {
      quantityToAdd = parseFloat(quantities[productToAdd._id]);
    } else {
      quantityToAdd = 1;
    }
    
    if (!quantityToAdd || quantityToAdd <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }
    
    const cartItem = {
      ...productToAdd,
      quantity: quantityToAdd,
      selectedOption: '',
    };
    
    const existingItem = cartItems.find(item => item._id === productToAdd._id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        (item._id === productToAdd._id)
          ? { ...item, quantity: item.quantity + quantityToAdd }
          : item
      ));
    } else {
      setCartItems([...cartItems, cartItem]);
    }
  };

  const updateCartQuantity = (productId, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item._id === productId) {
        return { ...item, quantity: parseFloat((item.quantity + delta).toFixed(2)) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId, selectedOption) => {
    setCartItems(cartItems.filter(item => 
      !(item._id === productId && item.selectedOption === selectedOption)
    ));
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const getOrderData = () => {
    const data = {
      customerName,
      customerContact,
      customerAddress,
      items: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit,
        selectedOption: item.selectedOption,
      })),
      totalAmount: cartTotal,
      shopId,
    };
    // If logged in as customer, link the order
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role === 'customer') {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        data.customerId = payload.user.id;
      } catch (e) {
        // ignore decode errors
      }
    }
    return data;
  };

  // ---- COD Order ----
  const handleCODOrder = async () => {
    try {
      setIsProcessing(true);
      const res = await axios.post(`${API_URL}/api/payment/place-order`, getOrderData());
      navigate(`/order-success/${res.data.order._id}`);
    } catch (error) {
      console.error('Error placing COD order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ---- Razorpay Online Payment ----
  const handleOnlinePayment = async () => {
    try {
      setIsProcessing(true);

      const { data } = await axios.post(`${API_URL}/api/payment/create-order`, {
        amount: cartTotal,
      });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Marketplace',
        description: 'Order Payment',
        order_id: data.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(`${API_URL}/api/payment/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: getOrderData(),
            });
            navigate(`/order-success/${verifyRes.data.order._id}`);
          } catch (err) {
            console.error('Payment verification failed:', err);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: customerName,
          contact: customerContact,
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items first.');
      return;
    }

    // Save details to localStorage for future orders
    localStorage.setItem('savedCustomerName', customerName);
    localStorage.setItem('savedCustomerContact', customerContact);
    localStorage.setItem('savedCustomerAddress', customerAddress);

    if (paymentMethod === 'COD') {
      await handleCODOrder();
    } else {
      await handleOnlinePayment();
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
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map((product, i) => {
            const isOutOfStock = product.inStock === false;
            return (
              <div
                key={product._id}
                className={`bg-surface-container-lowest rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col animate-slide-up ${
                  isOutOfStock ? 'opacity-70' : ''
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="aspect-square overflow-hidden bg-surface-container-high relative">
                  <img
                    src={product.productImage}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isOutOfStock ? 'grayscale' : 'group-hover:scale-105'
                    }`}
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg text-center">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {product.quantityType === 'weight' && !isOutOfStock && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                        ⚖ Weight
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <h3 className="font-headline font-bold text-sm sm:text-base text-on-surface tracking-tight line-clamp-2">{product.name}</h3>
                  <p className="text-on-surface-variant text-xs sm:text-sm mt-1 mb-2">
                    ₹{product.price.toFixed(2)} <span className="text-[10px] sm:text-xs text-outline">({product.unit})</span>
                  </p>
                  
                  <div className="mt-auto pt-2">
                    {product.quantityType === 'weight' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          placeholder="Kg"
                          className="w-14 sm:w-16 px-2 py-2 rounded-xl bg-surface-container-high border-none text-xs sm:text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                          onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                          value={quantities[product._id] || ''}
                          disabled={isOutOfStock}
                        />
                        <button
                          onClick={() => addToCart(product)}
                          disabled={isOutOfStock || !quantities[product._id]}
                          className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                            isOutOfStock || !quantities[product._id]
                              ? 'bg-surface-container text-outline cursor-not-allowed shadow-none'
                              : 'bg-primary text-on-primary hover:bg-primary-container active:scale-95 shadow-primary/20'
                          }`}
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      (() => {
                        const cartItem = cartItems.find(item => item._id === product._id);
                        if (cartItem && !isOutOfStock) {
                          return (
                            <div className="flex items-center justify-between w-full bg-primary text-on-primary rounded-xl overflow-hidden shadow-primary/20 shadow-md">
                              <button onClick={() => updateCartQuantity(cartItem._id, -1)} className="w-1/3 py-2 text-sm font-black hover:bg-white/20 active:bg-white/30 transition-colors">-</button>
                              <span className="w-1/3 text-center text-sm font-bold">{cartItem.quantity}</span>
                              <button onClick={() => updateCartQuantity(cartItem._id, 1)} className="w-1/3 py-2 text-sm font-black hover:bg-white/20 active:bg-white/30 transition-colors">+</button>
                            </div>
                          );
                        }
                        return (
                          <button
                            onClick={() => addToCart(product, 1)}
                            disabled={isOutOfStock}
                            className={`w-full py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                              isOutOfStock
                                ? 'bg-surface-container text-outline cursor-not-allowed shadow-none'
                                : 'bg-primary text-on-primary border border-primary hover:bg-primary-container active:scale-95 shadow-primary/20'
                            }`}
                          >
                            Add to Cart
                          </button>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
              {cartItems.map((item, idx) => (
                <div key={`${item._id}-${idx}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface-container-low rounded-xl">
                  <div className="flex-1">
                    <p className="font-bold text-sm text-on-surface">{item.name}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      ₹{item.price.toFixed(2)} / {item.unit}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[140px]">
                    {item.quantityType === 'unit' ? (
                      <div className="flex items-center bg-white rounded-lg shadow-sm border border-outline-variant/30 overflow-hidden text-xs">
                        <button onClick={() => updateCartQuantity(item._id, -1)} className="px-2.5 py-1 text-primary hover:bg-primary/10 font-black">-</button>
                        <span className="px-1 font-bold w-6 text-center text-on-surface">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item._id, 1)} className="px-2.5 py-1 text-primary hover:bg-primary/10 font-black">+</button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-on-surface bg-surface-container-high px-2 py-1 rounded-md">
                        {item.quantity} {item.unit}
                      </span>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-on-surface">₹{(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        onClick={() => removeFromCart(item._id, item.selectedOption)}
                        className="text-outline hover:text-error transition-colors"
                        title="Remove"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                  </div>
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

              {/* Payment Method Selection */}
              <div className="pt-2">
                <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Payment Method</span>
                <div className="mt-3 space-y-3">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      paymentMethod === 'COD'
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                        : 'border-transparent bg-surface-container-high hover:bg-surface-container-highest'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary accent-indigo-600"
                    />
                    <span className="material-symbols-outlined text-emerald-600">local_shipping</span>
                    <div>
                      <p className="font-bold text-sm text-on-surface">Cash on Delivery</p>
                      <p className="text-xs text-on-surface-variant">Pay when you receive your order</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      paymentMethod === 'Online'
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                        : 'border-transparent bg-surface-container-high hover:bg-surface-container-highest'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Online"
                      checked={paymentMethod === 'Online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary accent-indigo-600"
                    />
                    <span className="material-symbols-outlined text-indigo-600">credit_card</span>
                    <div>
                      <p className="font-bold text-sm text-on-surface">Online Payment</p>
                      <p className="text-xs text-on-surface-variant">Pay securely via Razorpay (UPI, Card, Net Banking)</p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full mt-2 ${
                  paymentMethod === 'Online'
                    ? 'btn-primary'
                    : 'btn-success'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing…
                  </>
                ) : paymentMethod === 'Online' ? (
                  <>
                    <span className="material-symbols-outlined text-lg">lock</span>
                    Pay ₹{cartTotal.toFixed(2)}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    Place Order (COD)
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutForm;
