const mongoose = require("mongoose");

const Products = mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    company: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Products", Products);
