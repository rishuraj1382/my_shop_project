// backend/controllers/productController.js
const Product = require('../models/Product');
const User = require('../models/User');

// Helper: update productCount on shop
const updateShopProductCount = async (shopId) => {
  try {
    const count = await Product.countDocuments({ shop: shopId });
    await User.findByIdAndUpdate(shopId, { productCount: count });
  } catch (e) { /* ignore */ }
};

// Gets products for the currently logged-in shopkeeper
const getShopkeeperProducts = async (req, res) => {
  try {
    const products = await Product.find({ shop: req.user.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Error in getShopkeeperProducts:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Gets all products for a specific shop, for customers
const getProductsByShop = async (req, res) => {
  try {
    const products = await Product.find({ shop: req.params.shopId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Error in getProductsByShop:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/products/:id — Get a single product by ID (for ProductDetailsPage)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shop', 'shopName city fullAddress mobileNumber shopImage averageRating totalReviews pincode isOpen');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Also fetch similar products (same category, same pincode area)
    const similar = await Product.find({
      _id: { $ne: product._id },
      shop: product.shop._id,
      inStock: true,
    }).limit(6);

    res.json({ product, similar });
  } catch (err) {
    console.error('Error in getProductById:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Handle inStock, quantityType, quantityOptions, description, category
const createProduct = async (req, res) => {
  const { name, price, unit, productImage, inStock, quantityType, quantityOptions, description, category } = req.body;
  try {
    const newProduct = new Product({
      name,
      price,
      unit,
      productImage,
      description: description || '',
      category: category || 'General',
      inStock: inStock !== undefined ? inStock : true,
      quantityType: quantityType || 'unit',
      quantityOptions: quantityOptions || [],
      shop: req.user.id,
    });
    const product = await newProduct.save();
    // Update denormalized product count
    await updateShopProductCount(req.user.id);
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Handle inStock, quantityType, quantityOptions, description, category
const updateProduct = async (req, res) => {
  const { name, price, unit, productImage, inStock, quantityType, quantityOptions, description, category } = req.body;
  try {
    let product = await Product.findById(req.params.id);
    if (!product || product.shop.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Product not found or not authorized' });
    }
    product.name = name || product.name;
    product.price = price || product.price;
    product.unit = unit || product.unit;
    product.productImage = productImage || product.productImage;
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (inStock !== undefined) product.inStock = inStock;
    if (quantityType) product.quantityType = quantityType;
    if (quantityOptions) product.quantityOptions = quantityOptions;
    await product.save();
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).send('Server Error');
  }
};

// Toggle stock status
const toggleStock = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product || product.shop.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Product not found or not authorized' });
    }
    product.inStock = !product.inStock;
    await product.save();
    res.json(product);
  } catch (err) {
    console.error('Error toggling stock:', err.message);
    res.status(500).send('Server Error');
  }
};

const deleteProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product || product.shop.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Product not found or not authorized' });
    }
    await product.deleteOne();
    // Update denormalized product count
    await updateShopProductCount(req.user.id);
    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getShopkeeperProducts,
  getProductsByShop,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleStock,
};
