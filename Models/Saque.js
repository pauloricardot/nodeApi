const mongoose = require('../Config/DataBase/db');
var SaqSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  value: {
    type: Number,
    required: true,
    index: true,
  },
  status: {
    type: String,
    required: true,
    index: true,
  },

});

module.exports = mongoose.model("Saque", SaqSchema);
