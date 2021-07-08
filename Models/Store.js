const mongoose = require('../Config/DataBase/db');
var StoreSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  banco: {
    type: String,
    index: true,
  },
  agenc: {
    type: String,
    index: true,
  },
  conta: {
    type: String,
    index: true,
  },
  tipo: {
    type: String,
    index: true,
  },
});

module.exports = mongoose.model("Store", StoreSchema);
