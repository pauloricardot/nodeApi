const mongoose = require('../Config/DataBase/db');
var ItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    index: true,
  },
  _category: {
    type: String,
    required: true,
    index: true,
  },
  gallery: [
    {
      type: String,
      index: true,
    },
  ],
  image: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  peso: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    index: true,
  },
  short_description: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    index: true,
  },
  variant: [
    { type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      index: true,}
  ]
});

module.exports = mongoose.model("Item", ItemSchema);
