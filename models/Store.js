const mongoose = require("mongoose");
const conn = require("../dbconnect/ingreventory");

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true,
    index: true,
    trim: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  currency: { type: String }, // e.g. "$"
  currencyCode: { type: String }, // e.g. "$"
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  businessType: {
    type: String,
    enum: ["restaurant", "cafe", "bakery", "grocery", "other"],
    required: true,
  },
  taxId: {
    type: String,
    trim: true,
  },
  backgroundImage: {
    type: String,
  },
  logoImage: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to generate slug from store name
storeSchema.pre("save", function (next) {
  // Only generate slug if name is modified or it's a new document
  if (this.isModified("name") || this.isNew) {
    // Convert name to lowercase, replace spaces with hyphens, and remove special characters
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }
  next();
});

const Store = conn.model("Store", storeSchema);

module.exports = Store;
