// backend/controllers/productController.js
const Product = require('../models/Product');

// Gets products for the currently logged-in shopkeeper
const getShopkeeperProducts = async (req, res) => {
  try {
    const products = await Product.find({ shop: req.user.id });
    res.json(products);
  } catch (err) {
    console.error('Error in getShopkeeperProducts:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Gets all products for a specific shop, for customers
const getProductsByShop = async (req, res) => {
    try {
      const products = await Product.find({ shop: req.params.shopId });
      res.json(products);
    } catch (err) {
      console.error('Error in getProductsByShop:', err.message);
      res.status(500).json({ message: 'Server Error' });
    }
};

// UPDATED: Handle inStock, quantityType, quantityOptions
const createProduct = async (req, res) => {
  const { name, price, unit, productImage, inStock, quantityType, quantityOptions } = req.body;
  try {
    const newProduct = new Product({
      name,
      price,
      unit,
      productImage,
      inStock: inStock !== undefined ? inStock : true,
      quantityType: quantityType || 'unit',
      quantityOptions: quantityOptions || [],
      shop: req.user.id,
    });
    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// UPDATED: Handle inStock, quantityType, quantityOptions
const updateProduct = async (req, res) => {
  const { name, price, unit, productImage, inStock, quantityType, quantityOptions } = req.body;
  try {
    let product = await Product.findById(req.params.id);
    if (!product || product.shop.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Product not found or not authorized' });
    }
    product.name = name || product.name;
    product.price = price || product.price;
    product.unit = unit || product.unit;
    product.productImage = productImage || product.productImage;
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

// NEW: Toggle stock status
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
    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getShopkeeperProducts,
  getProductsByShop,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleStock,
};
