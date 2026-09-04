const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
   productName: {
      type: String,
      required: true,
      index: true
   },
   stockAvailable: {
      type: Number,
      required: true,
      default: 50
   },
   brandName: {
      type: String,
      required: true,
      index: true
   },
   releaseDate: {
      type: String,
      default: '2024'
   },
   discount: {
      type: Number,
      default: 0
   },
   price: {
      type: Number,
      required: true
   },
   oldPrice: {
      type: Number
   },
   category: {
      type: String,
      required: true,
      index: true
   },
   subcategory: {
      type: String,
      index: true
   },
   rating: {
      type: Number,
      default: 4.5
   },
   reviewsCount: {
      type: Number,
      default: 100
   },
   badge: {
      type: String,
      default: ''
   },
   image: {
      type: String
   },
   images: [{
      type: String
   }],
   description: {
      type: String
   },
   specs: [{
      type: String
   }],
   inStock: {
      type: Boolean,
      default: true
   },
   deliveryDate: {
      type: String,
      default: 'Tomorrow, 2 PM'
   },
   catalogId: {
      type: String,
      index: true
   }
}, { timestamps: true });

const productModel = mongoose.model('products', productSchema);

module.exports = productModel;