const mongoose = require("mongoose");
const slugify = require("slugify");
const conn = require("../dbconnect/ingreventory");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a category name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    store: {
      type: mongoose.Schema.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for product count
CategorySchema.virtual("productCount", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
  count: true,
});

const Ingredient = conn.model("Category", CategorySchema);

module.exports = Ingredient;
