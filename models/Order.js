const mongoose = require("mongoose");
const conn = require("../dbconnect/ingreventory");

const OrderSchema = new mongoose.Schema({
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  paymentMethod: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      addons: [
        {
          _id: false,
          label: { type: String, required: true },
          price: { type: Number, required: true },
        },
      ],
    },
  ],
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  storeName: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  totalCost: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  total: { type: Number, required: true },
  cashGiven: { type: Number },
  status: {
    type: String,
    required: true,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Order = conn.model("Order", OrderSchema);

module.exports = Order;
