const mongoose = require("mongoose");
const conn = require("../dbconnect/ingreventory");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    ingredients: [
      {
        ingredient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
        },
        count: {
          type: Number,
          default: 1,
        },
      },
    ],
    addonTypes: [
      {
        label: {
          type: String,
          required: true,
        },
      },
    ],
    addons: [
      {
        type: {
          type: String, // or mongoose.Schema.Types.ObjectId if you want to use ObjectId
          required: true,
        },
        label: {
          type: String,
          required: true,
        },
        ingredient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        cost: {
          type: Number,
          default: 0,
        },
        price: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

const Product = conn.model("Product", productSchema);

module.exports = Product;
