const express = require('express');
const router = express.Router();
const ProductSchema = require('../models/ProductCollectionSchema');
const OrderSchema = require('../models/OrderScema');
const CartSchema = require('../models/CartChema');
const axios = require('axios');

// PayPal API configuration
const PAYPAL_CLIENT_ID = 'Aav70MBDtYfXE1Fc1sBk5FPqSmvesuuEX95ou65iEHQVjl-x6864sfb1ic5-TIab-ClHLRNWoWEqQoHH';
const PAYPAL_CLIENT_SECRET = 'EMvrlLpibIh20TS4H5Rp9NOJ87EqIXuWdfeHGC_cjBobP-_6SHI41-melxSaKZN-l60g6OwrVanPTOe5';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

// Generate PayPal access token
const generateAccessToken = async () => {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await axios.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error generating PayPal access token:', error.response?.data || error.message);
    throw new Error('Failed to generate access token');
  }
};

// Validate product exists
const validateProduct = async (productId) => {
  try {
    const product = await ProductSchema.findById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    return product;
  } catch (error) {
    throw new Error(error.message || 'Error validating product');
  }
};

// Create product
router.post('/products', async (req, res) => {
  const { name, price, category, stock } = req.body;
  try {
    if (!name || typeof name !== 'string' || isNaN(price) || price < 0 || !category || typeof category !== 'string' || isNaN(stock) || stock < 0) {
      return res.status(400).json({ message: 'All fields (name, price, category, stock) are required and must be valid' });
    }
    const newProduct = new ProductSchema({ name, price: parseFloat(price), category, stock: parseInt(stock, 10) });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await ProductSchema.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({ message: 'Error retrieving products' });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await ProductSchema.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // Clean up cart items referencing this product
    await CartSchema.deleteMany({ productId: id });
    res.status(200).json({ message: 'Product and related cart items deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Add to cart
router.post('/cart', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    if (!userId || typeof userId !== 'string' || !productId || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Invalid input: userId, productId, and quantity (positive integer) are required' });
    }
    const product = await validateProduct(productId);
    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
    }
    const existingCartItem = await CartSchema.findOne({ userId, productId }).populate('productId');
    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      if (existingCartItem.quantity > product.stock) {
        return res.status(400).json({ message: `Total quantity exceeds stock (${product.stock})` });
      }
      await existingCartItem.save();
      res.status(200).json({ message: 'Cart item updated', cartItem: existingCartItem });
    } else {
      const newCartItem = new CartSchema({ userId, productId, quantity });
      await newCartItem.save();
      const populatedCartItem = await CartSchema.findById(newCartItem._id).populate('productId');
      res.status(201).json({ message: 'Item added to cart', cartItem: populatedCartItem });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: error.message || 'Error adding item to cart' });
  }
});

// Get cart items
router.get('/cart', async (req, res) => {
  try {
    const cartItems = await CartSchema.find().populate('productId');
    const validItems = cartItems.filter(item => item.productId !== null);
    if (validItems.length < cartItems.length) {
      // Clean up invalid cart items
      await CartSchema.deleteMany({ productId: null });
      console.warn('Cleaned up invalid cart items:', cartItems.filter(item => item.productId === null));
    }
    res.status(200).json(validItems);
  } catch (error) {
    console.error('Error retrieving cart items:', error);
    res.status(500).json({ message: 'Error retrieving cart items' });
  }
});

// Update cart item quantity
router.put('/cart/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }
    const cartItem = await CartSchema.findById(id).populate('productId');
    if (!cartItem || !cartItem.productId) {
      return res.status(404).json({ message: 'Cart item or product not found' });
    }
    if (quantity > cartItem.productId.stock) {
      return res.status(400).json({ message: `Only ${cartItem.productId.stock} items available in stock` });
    }
    cartItem.quantity = quantity;
    await cartItem.save();
    res.status(200).json({ message: 'Cart item quantity updated', cartItem });
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    res.status(500).json({ message: 'Error updating cart item quantity' });
  }
});

// Delete cart item
router.delete('/cart/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedItem = await CartSchema.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Error removing item from cart' });
  }
});

// Create PayPal order
router.post('/create-paypal-order', async (req, res) => {
  const { cartItems, totalAmount } = req.body;
  try {
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty cart items' });
    }
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid total amount' });
    }
    for (const item of cartItems) {
      await validateProduct(item.productId);
    }
    const accessToken = await generateAccessToken();
    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: totalAmount.toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: 'http://localhost:3000/success',
          cancel_url: 'http://localhost:3000/cancel',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const approvalUrl = response.data.links.find(link => link.rel === 'approve').href;
    res.status(201).json({ id: response.data.id, approvalUrl });
  } catch (error) {
    console.error('Error creating PayPal order:', error.response?.data || error.message);
    res.status(500).json({ message: error.message || 'Error creating PayPal order' });
  }
});

// Capture PayPal order and save to database
router.post('/capture-paypal-order', async (req, res) => {
  const { orderId, cartItems, totalAmount } = req.body;
  try {
    if (!orderId || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty order data' });
    }
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid total amount' });
    }
    for (const item of cartItems) {
      await validateProduct(item.productId);
    }
    const accessToken = await generateAccessToken();
    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (response.data.status === 'COMPLETED') {
      const newOrder = new OrderSchema({
        cartItems,
        totalAmount,
        status: 'Processing',
        paymentStatus: 'Completed',
        updatedAt: new Date(),
      });
      await newOrder.save();
      // Clear the cart for the user
      await CartSchema.deleteMany({ userId: cartItems[0]?.userId || 'user123' });
      const populatedOrder = await OrderSchema.findById(newOrder._id).populate('cartItems.productId');
      res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
    } else {
      res.status(400).json({ message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error capturing PayPal order:', error.response?.data || error.message);
    res.status(500).json({ message: error.message || 'Error capturing order' });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await OrderSchema.find().populate('cartItems.productId');
    const validOrders = orders.map(order => ({
      ...order.toObject(),
      cartItems: order.cartItems.filter(item => item.productId !== null),
    }));
    res.status(200).json(validOrders);
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({ message: 'Error retrieving orders' });
  }
});

module.exports = router;