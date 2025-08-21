// // backend/controllers/productController.js
// const Product = require('../models/Product');

// // PRIVATE: Gets products for the currently logged-in shopkeeper
// const getShopkeeperProducts = async (req, res) => {
//   try {
//     // req.user.id comes from the auth middleware
//     const products = await Product.find({ shop: req.user.id });
//     res.json(products);
//   } catch (err) {
//     console.error('Error in getShopkeeperProducts controller:', err.message);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// // PUBLIC: Gets all products for a specific shop, for customers
// const getProductsByShop = async (req, res) => {
//     try {
//       const products = await Product.find({ shop: req.params.shopId });
//       res.json(products);
//     } catch (err) {
//       console.error('Error in getProductsByShop:', err.message);
//       res.status(500).json({ message: 'Server Error' });
//     }
// };

// // Private: Creates a product for the logged-in shopkeeper
// const createProduct = async (req, res) => {
//   const { name, price } = req.body;
//   try {
//     const newProduct = new Product({ name, price, shop: req.user.id });
//     const product = await newProduct.save();
//     res.status(201).json(product);
//   } catch (err) {
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// // Private: Updates a product for the logged-in shopkeeper
// const updateProduct = async (req, res) => {
//   const { name, price } = req.body;
//   try {
//     let product = await Product.findById(req.params.id);
//     if (!product || product.shop.toString() !== req.user.id) {
//       return res.status(404).json({ msg: 'Product not found or not authorized' });
//     }
//     product.name = name;
//     product.price = price;
//     await product.save();
//     res.json(product);
//   } catch (err) {
//     res.status(500).send('Server Error');
//   }
// };

// // Private: Deletes a product for the logged-in shopkeeper
// const deleteProduct = async (req, res) => {
//   try {
//     let product = await Product.findById(req.params.id);
//     if (!product || product.shop.toString() !== req.user.id) {
//       return res.status(404).json({ msg: 'Product not found or not authorized' });
//     }
//     await product.deleteOne();
//     res.json({ msg: 'Product removed' });
//   } catch (err) {
//     res.status(500).send('Server Error');
//   }
// };

// // This is the corrected export block
// module.exports = {
//   getShopkeeperProducts,
//   getProductsByShop,
//   createProduct,
//   updateProduct,
//   deleteProduct,
// };


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

// UPDATED to handle unit and productImage
const createProduct = async (req, res) => {
  const { name, price, unit, productImage } = req.body;
  try {
    const newProduct = new Product({
      name,
      price,
      unit,
      productImage,
      shop: req.user.id,
    });
    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// UPDATED to handle unit and productImage
const updateProduct = async (req, res) => {
  const { name, price, unit, productImage } = req.body;
  try {
    let product = await Product.findById(req.params.id);
    if (!product || product.shop.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Product not found or not authorized' });
    }
    product.name = name || product.name;
    product.price = price || product.price;
    product.unit = unit || product.unit;
    product.productImage = productImage || product.productImage;
    await product.save();
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).send('Server Error');
  }
};

// deleteProduct remains the same
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
};
