const mongoose = require('../Config/DataBase/db');
var OrdersSchema = new mongoose.Schema({
  Orderid: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true
  },
  Shop: {
    type: String,
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  mycode: {
    type: String,
    required: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    required: true,
    index: true,
  },
  paid_at: {
    type: Date,
    index: true,
  },
  valor: {
    type: String,
    required: true,
    index: true,
  },
  boletolink: {
    type: String,
    index: true,
  },
});

module.exports = mongoose.model("Order", OrdersSchema);
