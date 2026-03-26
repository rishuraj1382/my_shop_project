// frontend/src/ProductManager.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL as BASE_URL } from './config';

const API_URL = `${BASE_URL}/api/products`;

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [productImage, setProductImage] = useState('');
  const [quantityType, setQuantityType] = useState('unit');
  const [quantityOptions, setQuantityOptions] = useState('');
  
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
    const productData = { 
      name, price, unit, productImage,
      quantityType,
      quantityOptions: quantityOptions ? quantityOptions.split(',').map(o => o.trim()).filter(Boolean) : [],
    };
    
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

  const handleToggleStock = async (productId) => {
    try {
      await axios.put(`${API_URL}/${productId}/toggle-stock`, {}, getConfig());
      fetchProducts();
    } catch (error) {
      console.error("Error toggling stock:", error);
      alert('Failed to toggle stock status.');
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
    setQuantityType(product.quantityType || 'unit');
    setQuantityOptions(product.quantityOptions ? product.quantityOptions.join(', ') : '');
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setName('');
    setPrice('');
    setUnit('');
    setProductImage('');
    setQuantityType('unit');
    setQuantityOptions('');
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Inventory</span>
        <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mt-2">Product Manager</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1 lg:sticky lg:top-28 self-start">
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-2xl">{isEditing ? 'edit' : 'add_circle'}</span>
              <h2 className="font-headline text-xl font-bold text-on-surface">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-stitch">Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Fresh Milk" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="input-stitch"
                  required 
                />
              </div>
              <div>
                <label className="label-stitch">Price (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g., 50.00" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  className="input-stitch"
                  required 
                  step="0.01" 
                />
              </div>
              <div>
                <label className="label-stitch">Unit</label>
                <input 
                  type="text" 
                  placeholder="e.g., per kg, 500ml bottle" 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)} 
                  className="input-stitch"
                  required 
                />
              </div>

              {/* Quantity Type Selector */}
              <div>
                <label className="label-stitch">Quantity Type</label>
                <div className="flex bg-surface-container-high rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setQuantityType('unit')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                      quantityType === 'unit'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">numbers</span>
                    Unit-based
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantityType('weight')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                      quantityType === 'weight'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">scale</span>
                    Weight-based
                  </button>
                </div>
              </div>

              {/* Quantity Options */}
              <div>
                <label className="label-stitch">Quantity Options</label>
                <input 
                  type="text" 
                  placeholder={quantityType === 'weight' ? 'e.g., 250g, 500g, 1kg' : 'e.g., 1, 2, 3, 5'}
                  value={quantityOptions} 
                  onChange={(e) => setQuantityOptions(e.target.value)} 
                  className="input-stitch"
                />
                <p className="text-xs text-outline mt-1 ml-1">Comma-separated values. Leave empty to allow free input.</p>
              </div>

              <div>
                <label className="label-stitch">Image URL</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/image.jpg" 
                  value={productImage} 
                  onChange={(e) => setProductImage(e.target.value)} 
                  className="input-stitch"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  className="btn-primary flex-1"
                >
                  <span className="material-symbols-outlined text-lg">{isEditing ? 'save' : 'add'}</span>
                  {isEditing ? 'Update' : 'Add Product'}
                </button>
                {isEditing && (
                  <button 
                    type="button" 
                    onClick={resetForm} 
                    className="px-5 py-3 rounded-xl text-sm font-bold text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest transition-all"
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
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">inventory_2</span>
            <h2 className="font-headline text-xl font-bold text-on-surface">Products ({products.length})</h2>
          </div>
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <span className="material-symbols-outlined text-6xl text-outline/30">category</span>
                <p className="text-on-surface-variant text-lg font-medium mt-4">No products yet.</p>
                <p className="text-outline text-sm mt-1">Add your first product using the form.</p>
              </div>
            ) : (
              products.map((product, i) => (
                <div
                  key={product._id}
                  className={`bg-surface-container-lowest rounded-2xl p-5 flex items-center gap-5 hover:shadow-lg transition-all duration-300 animate-slide-up border border-outline-variant/10 ${
                    !product.inStock ? 'opacity-60' : ''
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0 relative">
                    <img src={product.productImage} alt={product.name} className="w-full h-full object-cover"/>
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold uppercase tracking-wider">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-headline font-bold text-on-surface truncate">{product.name}</p>
                      {product.quantityType === 'weight' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">WEIGHT</span>
                      )}
                    </div>
                    <p className="text-on-surface-variant text-sm">₹{product.price.toFixed(2)} <span className="text-outline">({product.unit})</span></p>
                    {product.quantityOptions && product.quantityOptions.length > 0 && (
                      <p className="text-xs text-outline mt-0.5">Options: {product.quantityOptions.join(', ')}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Stock Toggle */}
                    <button
                      onClick={() => handleToggleStock(product._id)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                        product.inStock ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                      title={product.inStock ? 'In Stock – Click to mark Out of Stock' : 'Out of Stock – Click to mark In Stock'}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                          product.inStock ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => startEdit(product)}
                      className="p-2.5 rounded-xl hover:bg-primary/10 text-primary transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-2.5 rounded-xl hover:bg-error-container/30 text-error transition-colors"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductManager;
