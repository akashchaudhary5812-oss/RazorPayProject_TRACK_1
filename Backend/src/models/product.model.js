const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

   productName: {
      type: String,
      required: true
   },

   stockAvailable: {
      type: Number,
      required: true
   },

   brandName: {
      type: String,
      required: true
   },

   releaseDate: {
      type: String,
      required: true
   },

   discount: {
      type: Number,
      default: 0
   },

   price: {
      type: Number,
      required: true
   },

   category: {
      type: String,
      required: true
   },

   productImage: {
      type: String,
   }
});

const productModel = mongoose.model('products', productSchema);

module.exports = productModel;