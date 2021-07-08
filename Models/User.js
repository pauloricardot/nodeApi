const mongoose = require('../Config/DataBase/db');
var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    index: true,
  },
  wire_id: {
    type: String,
    unique: true,
    index: true,
  },
  insc: {
    type: String,
    index: true,
  },
  pis: {
    type: String,
    index: true,
  },
  cpf: {
    type: String,
    unique: true,
    index: true,
  },
  picture: {
    type: String,
    index: true,
  },
  level: {
    type: Number,
    required: false,
    index: true,
  },
  ative: {
    type: Boolean,
    required: false,
    index: true,
  },
  token: {
    type: String,
    required: false,
    index: true,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    index: true,
  },
});

module.exports = mongoose.model("User", userSchema);
