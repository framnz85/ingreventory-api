const mongoose = require("mongoose");
const conn = require("../dbconnect/ingreventory");

const IngredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  // category field removed
  description: {
    type: String,
  },
  unit: {
    type: String,
    required: true,
    default: "g",
  },
  stock: {
    type: Number,
    default: 0,
  },
  pricePerUnit: {
    type: Number,
    default: 0,
  },
  markup: {
    type: Number,
    default: 0,
  },
  store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastRestocked: {
    type: Date,
  },
});

const Ingredient = conn.model("Ingredient", IngredientSchema);

module.exports = Ingredient;
