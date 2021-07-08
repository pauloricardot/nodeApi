const mongoose = require('../Config/DataBase/db');
var ShippingSchema = new mongoose.Schema({
  zip_initial: {
    type: Number,
    required: true,
    index: true,
  },
  zip_final: {
    type: Number,
    required: true,
    index: true,
  },
  peso_from: {
    type: Number,
    required: true,
    index: true,
  },
  peso_to: {
    type: Number,
    required: true,
    index: true,
  },
  preco: {
    type: Number,
    required: true,
    index: true,
  },
  tempo: {
    type: String,
    required: true,
    index: true,
  },

});

module.exports = mongoose.model("Shipping", ShippingSchema);
