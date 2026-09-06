// backend/controllers/searchController.js
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * GET /api/search?pincode=XXX&q=milk&minPrice=0&maxPrice=1000&inStock=true&category=dairy&sort=price_asc
 * Search products across all shops in a pincode
 */
exports.globalSearch = async (req, res) => {
  try {
    const { pincode, q, minPrice, maxPrice, inStock, category, sort } = req.query;

    if (!pincode) {
      return res.status(400).json({ message: 'Pincode is required for search' });
    }

    // Step 1: Find all shopkeeper IDs in this pincode
    const shops = await User.find({ pincode, role: 'shopkeeper' })
      .select('_id shopName city fullAddress mobileNumber shopImage averageRating totalReviews pincode');
    
    if (!shops.length) {
      return res.json({ products: [], shops: [] });
    }

    const shopIds = shops.map(s => s._id);
    const shopMap = {};
    shops.forEach(s => { shopMap[s._id.toString()] = s; });

    // Step 2: Build product query
    let productQuery = { shop: { $in: shopIds } };

    if (q && q.trim()) {
      // Use text search if query provided
      productQuery.$text = { $search: q.trim() };
    }

    if (inStock === 'true') {
      productQuery.inStock = true;
    }

    if (category && category !== 'all') {
      productQuery.category = { $regex: new RegExp(category, 'i') };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      productQuery.price = {};
      if (minPrice !== undefined) productQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) productQuery.price.$lte = parseFloat(maxPrice);
    }

    // Step 3: Determine sort order (Priority: lowest price first = smart ranking)
    let sortOption = { price: 1 }; // default: price ascending
    if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = {}; // will sort by shop rating after
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const products = await Product.find(productQuery)
      .sort(sortOption)
      .limit(100);

    // Step 4: Enrich each product with shop info
    let enrichedProducts = products.map(product => {
      const shop = shopMap[product.shop.toString()] || {};
      return {
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        unit: product.unit,
        productImage: product.productImage,
        inStock: product.inStock,
        quantityType: product.quantityType,
        quantityOptions: product.quantityOptions,
        category: product.category,
        shopId: product.shop,
        shopName: shop.shopName || '',
        shopCity: shop.city || '',
        shopAddress: shop.fullAddress || '',
        shopImage: shop.shopImage || '',
        shopRating: shop.averageRating || 0,
        shopTotalReviews: shop.totalReviews || 0,
        shopMobile: shop.mobileNumber || '',
      };
    });

    // Sort by shop rating if requested
    if (sort === 'rating') {
      enrichedProducts.sort((a, b) => b.shopRating - a.shopRating);
    }

    res.json({
      products: enrichedProducts,
      shops: shops,
      total: enrichedProducts.length,
    });
  } catch (err) {
    console.error('[searchController ERROR]', err.message);
    res.status(500).send('Server error');
  }
};
