const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);