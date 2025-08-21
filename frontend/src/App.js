// // frontend/src/App.js
// import React from 'react';
// import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
// import AdminDashboard from './AdminDashboard';
// import CheckoutForm from './CheckoutForm';
// import ProductManager from './ProductManager';
// import LoginPage from './LoginPage';
// import RegisterPage from './RegisterPage';
// import ShopListPage from './ShopListPage';
// import OrderTrackingPage from './OrderTrackingPage';
// import ShopSettingsPage from './ShopSettingsPage'; // 1. Import the new page
// import ProtectedRoute from './ProtectedRoute';
// import { OrderProvider, useOrder } from './OrderContext';
// import './App.css';

// function App() {
//   return (
//     <BrowserRouter>
//       <OrderProvider>
//         <Layout />
//       </OrderProvider>
//     </BrowserRouter>
//   );
// }

// function Layout() {
//   const navigate = useNavigate();
//   const token = localStorage.getItem('token');
//   const { lastTrackedOrderId } = useOrder();

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/login');
//   };

//   const trackLink = lastTrackedOrderId ? `/track/${lastTrackedOrderId}` : '/track';

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       <nav className="bg-white shadow-lg">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center">
//               <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition duration-300">Marketplace</Link>
//             </div>
//             <div className="hidden md:block">
//               <div className="ml-10 flex items-center space-x-4">
//                 <Link to="/" className="text-gray-700 hover:bg-indigo-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">Shops</Link>
//                 <Link to={trackLink} className="text-gray-700 hover:bg-indigo-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">Track Order</Link>
//                 {token && (
//                   <>
//                     <Link to="/admin" className="text-gray-700 hover:bg-indigo-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">Dashboard</Link>
//                     <Link to="/admin/products" className="text-gray-700 hover:bg-indigo-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">Manage Products</Link>
//                     {/* 2. Add the new settings link */}
//                     <Link to="/admin/settings" className="text-gray-700 hover:bg-indigo-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">Shop Settings</Link>
//                   </>
//                 )}
//               </div>
//             </div>
//             <div className="hidden md:block">
//               <div className="ml-4 flex items-center md:ml-6">
//                 {token ? (
//                   <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">Logout</button>
//                 ) : (
//                   <div className="space-x-2">
//                     <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Login</Link>
//                     <Link to="/register" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300">Register</Link>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <main className="py-10">
//         <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
//           <Routes>
//               <Route path="/" element={<ShopListPage />} />
//               <Route path="/shop/:shopId" element={<CheckoutForm />} />
//               <Route path="/track" element={<OrderTrackingPage />} />
//               <Route path="/track/:orderId" element={<OrderTrackingPage />} />
//               <Route path="/login" element={<LoginPage />} />
//               <Route path="/register" element={<RegisterPage />} />
//               <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
//               <Route path="/admin/products" element={<ProtectedRoute><ProductManager /></ProtectedRoute>} />
//               {/* 3. Add the new settings route */}
//               <Route path="/admin/settings" element={<ProtectedRoute><ShopSettingsPage /></ProtectedRoute>} />
//           </Routes>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default App;


// frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import CheckoutForm from './CheckoutForm';
import ProductManager from './ProductManager';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ShopListPage from './ShopListPage';
import OrderTrackingPage from './OrderTrackingPage';
import ShopSettingsPage from './ShopSettingsPage';
import ProtectedRoute from './ProtectedRoute';
import { OrderProvider, useOrder } from './OrderContext';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <OrderProvider>
        <Layout />
      </OrderProvider>
    </BrowserRouter>
  );
}

function Layout() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { lastTrackedOrderId } = useOrder();

  // DEBUGGING: Check the value from the context
  console.log('Layout component rendered. Last tracked ID is:', lastTrackedOrderId);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const trackLink = lastTrackedOrderId ? `/track/${lastTrackedOrderId}` : '/track';

  return (
    <div className="bg-gray-50 min-h-screen">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition duration-300">Marketplace</Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <Link to="/" className="text-gray-700 hover:bg-indigo-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">Shops</Link>
                <Link to={trackLink} className="text-gray-700 hover:bg-indigo-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">Track Order</Link>
                {token && (
                  <>
                    <Link to="/admin" className="text-gray-700 hover:bg-indigo-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">Dashboard</Link>
                    <Link to="/admin/products" className="text-gray-700 hover:bg-indigo-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">Manage Products</Link>
                    <Link to="/admin/settings" className="text-gray-700 hover:bg-indigo-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">Shop Settings</Link>
                  </>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                {token ? (
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">Logout</button>
                ) : (
                  <div className="space-x-2">
                    <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Login</Link>
                    <Link to="/register" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300">Register</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Routes>
              <Route path="/" element={<ShopListPage />} />
              <Route path="/shop/:shopId" element={<CheckoutForm />} />
              <Route path="/track" element={<OrderTrackingPage />} />
              <Route path="/track/:orderId" element={<OrderTrackingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute><ProductManager /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><ShopSettingsPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
