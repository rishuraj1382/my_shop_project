// // frontend/src/ProductManager.js
// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/products';

// function ProductManager() {
//   const [products, setProducts] = useState([]);
//   const [name, setName] = useState('');
//   const [price, setPrice] = useState('');
  
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentProduct, setCurrentProduct] = useState(null);

//   const getConfig = () => ({ headers: { 'x-auth-token': localStorage.getItem('token') } });

//   const fetchProducts = useCallback(async () => {
//     try {
//       const res = await axios.get(API_URL, getConfig());
//       setProducts(res.data);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       alert("Could not load products. You may not be logged in.");
//     }
//   }, []);

//   useEffect(() => {
//     fetchProducts();
//   }, [fetchProducts]);
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const productData = { name, price };
    
//     try {
//       if (isEditing) {
//         await axios.put(`${API_URL}/${currentProduct._id}`, productData, getConfig());
//         alert('Product updated!');
//       } else {
//         await axios.post(API_URL, productData, getConfig());
//         alert('Product added!');
//       }
//       resetForm();
//       fetchProducts();
//     } catch (error) {
//       console.error("Error in handleSubmit:", error);
//       alert('Operation failed. You may not be authorized.');
//     }
//   };

//   const handleDelete = async (productId) => {
//     if (window.confirm('Are you sure you want to delete this product?')) {
//       try {
//         await axios.delete(`${API_URL}/${productId}`, getConfig());
//         fetchProducts();
//       } catch (error) {
//         console.error("Error deleting product:", error);
//         alert('Failed to delete product.');
//       }
//     }
//   };

//   const startEdit = (product) => {
//     setIsEditing(true);
//     setCurrentProduct(product);
//     setName(product.name);
//     setPrice(product.price);
//   };

//   const resetForm = () => {
//     setIsEditing(false);
//     setCurrentProduct(null);
//     setName('');
//     setPrice('');
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//       {/* Form Section */}
//       <div className="lg:col-span-1">
//         <div className="bg-white p-8 rounded-lg shadow-lg">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="text-sm font-medium text-gray-700">Product Name</label>
//               <input 
//                 type="text" 
//                 placeholder="e.g., Fresh Milk" 
//                 value={name} 
//                 onChange={(e) => setName(e.target.value)} 
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 required 
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700">Price (Rs)</label>
//               <input 
//                 type="number" 
//                 placeholder="e.g., 50.00" 
//                 value={price} 
//                 onChange={(e) => setPrice(e.target.value)} 
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 required 
//                 step="0.01" 
//               />
//             </div>
//             <div className="flex space-x-2 pt-2">
//               <button 
//                 type="submit" 
//                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
//               >
//                 {isEditing ? 'Update Product' : 'Add Product'}
//               </button>
//               {isEditing && (
//                 <button 
//                   type="button" 
//                   onClick={resetForm} 
//                   className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
//                 >
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Product List Section */}
//       <div className="lg:col-span-2">
//         <h2 className="text-3xl font-bold text-gray-800 mb-6">Existing Products</h2>
//         <div className="bg-white p-6 rounded-lg shadow-lg">
//           <ul className="space-y-4">
//             {products.map((product) => (
//               <li key={product._id} className="flex items-center justify-between p-4 border rounded-md">
//                 <div>
//                   <p className="font-semibold text-gray-900">{product.name}</p>
//                   <p className="text-gray-600">Rs {product.price.toFixed(2)}</p>
//                 </div>
//                 <div className="space-x-2">
//                   <button onClick={() => startEdit(product)} className="text-blue-500 hover:text-blue-700 font-semibold">Edit</button>
//                   <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700 font-semibold">Delete</button>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProductManager;



// frontend/src/ProductManager.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products';

function ProductManager() {
  const [products, setProducts] = useState([]);
  // Add state for new fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [productImage, setProductImage] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const getConfig = () => ({ headers: { 'x-auth-token': localStorage.getItem('token') } });

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(API_URL, getConfig());
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Could not load products. You may not be logged in.");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Include new fields in the data
    const productData = { name, price, unit, productImage };
    
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${currentProduct._id}`, productData, getConfig());
        alert('Product updated!');
      } else {
        await axios.post(API_URL, productData, getConfig());
        alert('Product added!');
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert('Operation failed. You may not be authorized.');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/${productId}`, getConfig());
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert('Failed to delete product.');
      }
    }
  };

  const startEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setName(product.name);
    setPrice(product.price);
    setUnit(product.unit);
    setProductImage(product.productImage);
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setName('');
    setPrice('');
    setUnit('');
    setProductImage('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Product Name</label>
              <input 
                type="text" 
                placeholder="e.g., Fresh Milk" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Price (Rs)</label>
              <input 
                type="number" 
                placeholder="e.g., 50.00" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required 
                step="0.01" 
              />
            </div>
            {/* New Fields Added to the Form */}
            <div>
              <label className="text-sm font-medium text-gray-700">Unit</label>
              <input 
                type="text" 
                placeholder="e.g., per kg, 500ml bottle" 
                value={unit} 
                onChange={(e) => setUnit(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Product Image URL</label>
              <input 
                type="text" 
                placeholder="https://example.com/image.jpg" 
                value={productImage} 
                onChange={(e) => setProductImage(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <button 
                type="submit" 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
              >
                {isEditing ? 'Update Product' : 'Add Product'}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Product List Section */}
      <div className="lg:col-span-2">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Existing Products</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <ul className="space-y-4">
            {products.map((product) => (
              <li key={product._id} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center">
                  <img src={product.productImage} alt={product.name} className="w-16 h-16 object-cover rounded-md mr-4"/>
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-gray-600">Rs {product.price.toFixed(2)} ({product.unit})</p>
                  </div>
                </div>
                <div className="space-x-2">
                  <button onClick={() => startEdit(product)} className="text-blue-500 hover:text-blue-700 font-semibold">Edit</button>
                  <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700 font-semibold">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProductManager;
