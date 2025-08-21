// // frontend/src/ShopListPage.js
// import React, { useState } from 'react';
// import axios from 'axios';
// import { Link } from 'react-router-dom';

// function ShopListPage() {
//   const [pincode, setPincode] = useState('');
//   const [shops, setShops] = useState([]);
//   const [searched, setSearched] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!pincode.trim()) {
//       alert('Please enter a pincode.');
//       return;
//     }
//     setIsLoading(true);
//     setSearched(true);
//     setShops([]);

//     try {
//       const res = await axios.get(`http://localhost:5000/api/shops/search/${pincode}`);
//       setShops(res.data);
//     } catch (error) {
//       console.error("Error fetching shops:", error);
//       alert('Could not find shops. Please try again later.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto px-4">
//       <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Find Shops Near You</h1>
//       <form onSubmit={handleSearch} className="flex justify-center mb-12">
//         <input
//           type="text"
//           value={pincode}
//           onChange={(e) => setPincode(e.target.value)}
//           placeholder="Enter your pincode"
//           className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />
//         <button 
//           type="submit" 
//           className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-r-md transition duration-300"
//           disabled={isLoading}
//         >
//           {isLoading ? 'Searching...' : 'Search'}
//         </button>
//       </form>

//       {/* Search Results */}
//       {searched && !isLoading && (
//         <div className="flex flex-col items-center space-y-4">
//           {shops.length > 0 ? (
//             shops.map(shop => (
//               <Link 
//                 key={shop._id} 
//                 to={`/shop/${shop._id}`} 
//                 className="w-full max-w-lg bg-white rounded-lg shadow-md p-6 text-center text-gray-900 no-underline transition duration-300 hover:shadow-xl hover:scale-105"
//               >
//                 <h2 className="text-2xl font-semibold">{shop.shopName}</h2>
//                 <p className="text-gray-600 mt-1">{shop.city}</p>
//               </Link>
//             ))
//           ) : (
//             <p className="text-gray-600 text-lg">No shops found for this pincode.</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default ShopListPage;


// frontend/src/ShopListPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ShopListPage() {
  const [pincode, setPincode] = useState('');
  const [shops, setShops] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pincode.trim()) {
      alert('Please enter a pincode.');
      return;
    }
    setIsLoading(true);
    setSearched(true);
    setShops([]);

    try {
      const res = await axios.get(`http://localhost:5000/api/shops/search/${pincode}`);
      setShops(res.data);
    } catch (error) {
      console.error("Error fetching shops:", error);
      alert('Could not find shops. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Find Shops Near You</h1>
      <form onSubmit={handleSearch} className="flex justify-center mb-12">
        <input
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          placeholder="Enter your pincode"
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-r-md transition duration-300"
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Search Results */}
      {searched && !isLoading && (
        <div className="flex flex-col items-center space-y-6">
          {shops.length > 0 ? (
            shops.map(shop => (
              <div key={shop._id} className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
                <img src={shop.shopImage} alt={shop.shopName} className="w-full h-48 object-cover"/>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900">{shop.shopName}</h2>
                  <p className="text-gray-700 mt-2">{shop.fullAddress}, {shop.city}</p>
                  <p className="text-gray-600 mt-1">Contact: {shop.mobileNumber}</p>
                  <Link 
                    to={`/shop/${shop._id}`} 
                    className="inline-block mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                  >
                    Visit Shop
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-lg">No shops found for this pincode.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ShopListPage;
