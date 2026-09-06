// frontend/src/CheckoutForm.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ShopMapView from './components/ShopMapView';
import ShopAvatar from './components/ShopAvatar';
import { API_URL } from './config';
import Card from './components/ui/Card';
import Badge from './components/ui/Badge';
import Button from './components/ui/Button';
import EmptyState from './components/ui/EmptyState';
import Spinner from './components/ui/Spinner';

function CheckoutForm() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [shop, setShop] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState(localStorage.getItem('savedCustomerName') || '');
  const [customerContact, setCustomerContact] = useState(localStorage.getItem('savedCustomerContact') || '');
  const [customerAddress, setCustomerAddress] = useState(localStorage.getItem('savedCustomerAddress') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const [fulfillmentType, setFulfillmentType] = useState('Delivery');
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

  const fetchShop = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/shops/${shopId}`);
      setShop(res.data);
    } catch (error) {
      console.error("Error fetching shop details:", error);
    }
  }, [shopId]);

  useEffect(() => {
    if (shopId) {
      fetchProducts();
      fetchShop();
    }
  }, [shopId, fetchProducts, fetchShop]);

  const isShopClosed = shop?.isOpen === false;

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

  // Handle pre-filled products from navigation state (Buy Now, Add to Cart from Search, Reorder)
  useEffect(() => {
    if (!products.length) return;
    const state = location.state;
    if (!state) return;

    if (state.buyNowProduct) {
      // Buy Now: go straight to checkout with 1 item
      const p = state.buyNowProduct;
      const cartItem = {
        id: p._id, name: p.name, price: p.price, unit: p.unit,
        quantity: 1, selectedOption: '',
      };
      setCartItems([cartItem]);
    } else if (state.preAddProduct) {
      // Add to Cart from global search
      const p = state.preAddProduct;
      const match = products.find(prod => prod._id === p._id);
      if (match) addToCart(match, 1);
    } else if (state.reorderItems) {
      // Reorder: re-add all items from a previous order
      state.reorderItems.forEach(item => {
        const match = products.find(p => p.name === item.name);
        if (match) addToCart(match, item.quantity || 1);
      });
    }
    // Clear state so re-renders don't re-add
    navigate(location.pathname, { replace: true, state: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

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


  const addToCart = (productToAdd, overrideQuantity = null) => {
    if (!productToAdd.inStock || isShopClosed) return;
    
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
      customerAddress: fulfillmentType === 'Pickup'
        ? (customerAddress.trim() || `Self-pickup — ${shop?.shopName || 'in-store'}`)
        : customerAddress,
      fulfillmentType,
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
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
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
        shopId,
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
          color: '#1F6D4C',
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
      alert(error.response?.data?.message || 'Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items first.');
      return;
    }

    if (isShopClosed) {
      alert('This shop is currently closed. You can browse products, but ordering is temporarily unavailable.');
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
        {shop && (
          <div className="mb-8 p-6 bg-surface-container-lowest rounded-2xl shadow-sm animate-slide-up">
            <div className="flex items-center gap-4">
              <ShopAvatar src={shop.shopImage} alt={shop.shopName} size="lg" lazy={false} />
              <div>
                <h1 className="font-headline text-2xl font-bold text-on-surface">{shop.shopName}</h1>
                <p className="text-on-surface-variant text-sm mt-1">{shop.fullAddress}</p>
              </div>
            </div>
            <div className="mt-4">
              <ShopMapView shopName={shop.shopName} fullAddress={shop.fullAddress} location={shop.location} />
            </div>
          </div>
        )}
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
        {isShopClosed && (
          <div className="mb-6 p-4 rounded-2xl bg-error-container flex items-center gap-3 animate-slide-down">
            <span className="material-symbols-outlined text-on-error-container">storefront</span>
            <p className="text-on-error-container text-sm font-medium">
              This shop is currently closed. You can browse products, but ordering is temporarily unavailable.
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map((product, i) => {
            const isOutOfStock = product.inStock === false;
            return (
              <Card
                key={product._id}
                as="article"
                padding="none"
                className={`overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col animate-slide-up ${
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
                      <Badge variant="danger" size="sm" className="uppercase tracking-wider shadow-lg">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                  {product.quantityType === 'weight' && !isOutOfStock && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="warm" icon="scale" size="sm" className="shadow-md">Weight</Badge>
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
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          placeholder="Kg"
                          className="w-full sm:w-16 px-2 py-2 rounded-xl bg-surface-container-high border-none text-xs sm:text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                          onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                          value={quantities[product._id] || ''}
                          disabled={isOutOfStock || isShopClosed}
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isOutOfStock || isShopClosed || !quantities[product._id]}
                          onClick={() => addToCart(product)}
                          className="sm:flex-1"
                        >
                          Add
                        </Button>
                      </div>
                    ) : (
                      (() => {
                        const cartItem = cartItems.find(item => item._id === product._id);
                        if (cartItem && !isOutOfStock) {
                          return (
                            <div className="flex items-center justify-between w-full bg-primary text-on-primary rounded-xl overflow-hidden shadow-primary/20 shadow-md">
                              <button onClick={() => updateCartQuantity(cartItem._id, -1)} disabled={isShopClosed} className="w-1/3 py-2 text-sm font-black hover:bg-on-primary/20 active:bg-on-primary/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">-</button>
                              <span className="w-1/3 text-center text-sm font-bold">{cartItem.quantity}</span>
                              <button onClick={() => updateCartQuantity(cartItem._id, 1)} disabled={isShopClosed} className="w-1/3 py-2 text-sm font-black hover:bg-on-primary/20 active:bg-on-primary/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">+</button>
                            </div>
                          );
                        }
                        return (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isOutOfStock || isShopClosed}
                            onClick={() => addToCart(product, 1)}
                            fullWidth
                          >
                            Add to Cart
                          </Button>
                        );
                      })()
                    )}
                  </div>
                </div>
              </Card>
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
            <EmptyState icon="remove_shopping_cart" title="Your cart is empty." />
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
                      <div className="flex items-center bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/30 overflow-hidden text-xs">
                        <button onClick={() => updateCartQuantity(item._id, -1)} disabled={isShopClosed} className="px-2.5 py-1 text-primary hover:bg-primary/10 font-black disabled:opacity-60 disabled:cursor-not-allowed">-</button>
                        <span className="px-1 font-bold w-6 text-center text-on-surface">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item._id, 1)} disabled={isShopClosed} className="px-2.5 py-1 text-primary hover:bg-primary/10 font-black disabled:opacity-60 disabled:cursor-not-allowed">+</button>
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
                <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Fulfillment</span>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label
                    className={`flex flex-col items-center gap-1.5 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 text-center ${
                      fulfillmentType === 'Delivery'
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                        : 'border-transparent bg-surface-container-high hover:bg-surface-container-highest'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fulfillmentType"
                      value="Delivery"
                      checked={fulfillmentType === 'Delivery'}
                      onChange={(e) => setFulfillmentType(e.target.value)}
                      className="sr-only"
                    />
                    <span className="material-symbols-outlined text-on-surface-variant">directions_bike</span>
                    <p className="font-bold text-sm text-on-surface">Delivery</p>
                  </label>
                  <label
                    className={`flex flex-col items-center gap-1.5 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 text-center ${
                      fulfillmentType === 'Pickup'
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                        : 'border-transparent bg-surface-container-high hover:bg-surface-container-highest'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fulfillmentType"
                      value="Pickup"
                      checked={fulfillmentType === 'Pickup'}
                      onChange={(e) => setFulfillmentType(e.target.value)}
                      className="sr-only"
                    />
                    <span className="material-symbols-outlined text-on-surface-variant">storefront</span>
                    <p className="font-bold text-sm text-on-surface">Self Pickup</p>
                  </label>
                </div>
              </div>

              <div>
                <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Your Details</span>
              </div>
              <input type="text" placeholder="Your Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input-stitch" required />
              <input type="text" placeholder="Contact Number" value={customerContact} onChange={(e) => setCustomerContact(e.target.value)} className="input-stitch" required />
              <textarea
                placeholder={fulfillmentType === 'Pickup' ? 'Notes for the shop (optional)' : 'Delivery Address'}
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="input-stitch resize-none"
                rows={2}
                required={fulfillmentType !== 'Pickup'}
              />

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
                      disabled={isShopClosed}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="material-symbols-outlined text-on-surface-variant">local_shipping</span>
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
                      disabled={isShopClosed}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
                    <div>
                      <p className="font-bold text-sm text-on-surface">Online Payment</p>
                      <p className="text-xs text-on-surface-variant">Pay securely via Razorpay (UPI, Card, Net Banking)</p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || isShopClosed}
                className={`w-full mt-2 ${
                  paymentMethod === 'Online'
                    ? 'btn-primary'
                    : 'btn-success'
                }`}
              >
                {isShopClosed ? (
                  <>
                    <span className="material-symbols-outlined text-lg">storefront</span>
                    Shop Closed
                  </>
                ) : isProcessing ? (
                  <>
                    <Spinner size="sm" />
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
