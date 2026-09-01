const mongoose = require('mongoose');

const aiModelSchema = new mongoose.Schema({
  products: {
    type: [String],
    default: []
  },

  preferredBrands: {
    type: [String],
    default: []
  },

  startingPrice: {
    type: Number,
    default: null
  },

  endingPrice: {
    type: Number,
    default: null
  },

  releaseCategory: {
    type: [String],
    default: []
  },

  discount: {
    type: Number,
    default: null
  },

  naturalText: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const aiModel = mongoose.model("AiModel", aiModelSchema);

module.exports = aiModel;