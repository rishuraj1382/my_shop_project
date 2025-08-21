// // frontend/src/CheckoutForm.js
// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';

// function CheckoutForm() {
//   const { shopId } = useParams();
//   const [products, setProducts] = useState([]);
//   const [cartItems, setCartItems] = useState([]);
//   const [customerName, setCustomerName] = useState('');
//   const [customerContact, setCustomerContact] = useState('');
//   const [customerAddress, setCustomerAddress] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');

//   const fetchProducts = useCallback(async () => {
//     try {
//       const res = await axios.get(`http://localhost:5000/api/products/shop/${shopId}`);
//       setProducts(res.data);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   }, [shopId]);

//   useEffect(() => {
//     if (shopId) {
//       fetchProducts();
//     }
//   }, [shopId, fetchProducts]);

//   const addToCart = (productToAdd) => {
//     const existingItem = cartItems.find(item => item._id === productToAdd._id);
//     if (existingItem) {
//       setCartItems(cartItems.map(item =>
//         item._id === productToAdd._id
//           ? { ...item, quantity: item.quantity + 1 }
//           : item
//       ));
//     } else {
//       setCartItems([...cartItems, { ...productToAdd, quantity: 1 }]);
//     }
//   };

//   const removeFromCart = (productId) => {
//     setCartItems(cartItems.filter(item => item._id !== productId));
//   };

//   const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (cartItems.length === 0) {
//       alert('Please add items to your cart!');
//       return;
//     }

//     const orderData = {
//       customerName,
//       customerContact,
//       customerAddress,
//       items: cartItems.map(item => ({ name: item.name, quantity: item.quantity })),
//       shopId: shopId,
//     };

//     try {
//       const res = await axios.post('http://localhost:5000/api/orders', orderData);
//       alert(`Order placed successfully! Your Order ID is: ${res.data._id}`);
//       setCustomerName('');
//       setCustomerContact('');
//       setCustomerAddress('');
//       setCartItems([]);
//     } catch (error) {
//       console.error('Error placing order:', error);
//       alert('Failed to place order.');
//     }
//   };

//   const filteredProducts = products.filter(product =>
//     product.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//       {/* Products Section */}
//       <div className="md:col-span-2">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-3xl font-bold text-gray-800">Available Products</h2>
//           {/* THE SEARCH BAR */}
//           <input
//             type="text"
//             placeholder="Search for a product..."
//             className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         {/* UPDATED FOR HORIZONTAL SCROLL */}
//         <div className="flex overflow-x-auto space-x-6 py-4">
//           {filteredProducts.map((product) => (
//             <div key={product._id} className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between w-64 flex-shrink-0">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
//                 <p className="text-gray-600 mt-1">Rs {product.price.toFixed(2)}</p>
//               </div>
//               <button 
//                 onClick={() => addToCart(product)}
//                 className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
//               >
//                 Add to Cart
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Cart and Checkout Section */}
//       <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Shopping Cart</h2>
//         {cartItems.length === 0 ? (
//           <p className="text-gray-500">Your cart is empty.</p>
//         ) : (
//           <div className="space-y-3">
//             {cartItems.map(item => (
//               <div key={item._id} className="flex justify-between items-center">
//                 <div>
//                   <p className="font-semibold">{item.name}</p>
//                   <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
//                 </div>
//                 <button 
//                   onClick={() => removeFromCart(item._id)} 
//                   className="text-red-500 hover:text-red-700 font-semibold"
//                 >
//                   Remove
//                 </button>
//               </div>
//             ))}
//             <hr className="my-4" />
//             <div className="flex justify-between font-bold text-lg">
//               <span>Total:</span>
//               <span>Rs {cartTotal.toFixed(2)}</span>
//             </div>
//           </div>
//         )}
        
//         {cartItems.length > 0 && (
//           <form onSubmit={handleSubmit} className="mt-6">
//             <h3 className="text-xl font-bold text-gray-800 mb-4">Enter Your Details to Checkout</h3>
//             <div className="space-y-4">
//               <input 
//                 type="text" 
//                 placeholder="Your Name" 
//                 value={customerName} 
//                 onChange={(e) => setCustomerName(e.target.value)} 
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 required 
//               />
//               <input 
//                 type="text" 
//                 placeholder="Contact Number" 
//                 value={customerContact} 
//                 onChange={(e) => setCustomerContact(e.target.value)} 
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 required 
//               />
//               <textarea 
//                 placeholder="Delivery Address" 
//                 value={customerAddress} 
//                 onChange={(e) => setCustomerAddress(e.target.value)} 
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 required 
//               />
//             </div>
//             <button 
//               type="submit" 
//               className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
//             >
//               Place Order
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }

// export default CheckoutForm;




// frontend/src/CheckoutForm.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

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
      const res = await axios.get(`http://localhost:5000/api/products/shop/${shopId}`);
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
          price: item.price, // Price at time of order
          unit: item.unit    // Unit at time of order
        })),
      shopId: shopId,
    };

    try {
      const res = await axios.post('http://localhost:5000/api/orders', orderData);
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Products Section */}
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Available Products</h2>
          <input
            type="text"
            placeholder="Search for a product..."
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
              <img src={product.productImage} alt={product.name} className="w-full h-40 object-cover rounded-md mb-4"/>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="text-gray-600 mt-1">Rs {product.price.toFixed(2)} <span className="text-sm">({product.unit})</span></p>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <input 
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Qty"
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                  onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                />
                <button 
                  onClick={() => addToCart(product)}
                  className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart and Checkout Section */}
      <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Shopping Cart</h2>
        {cartItems.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <div className="space-y-3">
            {cartItems.map(item => (
              <div key={item._id} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.quantity} {item.unit} x Rs {item.price.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item._id)} 
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
            <hr className="my-4" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>Rs {cartTotal.toFixed(2)}</span>
            </div>
          </div>
        )}
        
        {cartItems.length > 0 && (
          <form onSubmit={handleSubmit} className="mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Enter Your Details to Checkout</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Your Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
              <input type="text" placeholder="Contact Number" value={customerContact} onChange={(e) => setCustomerContact(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
              <textarea placeholder="Delivery Address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <button type="submit" className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">
              Place Order
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default CheckoutForm;
