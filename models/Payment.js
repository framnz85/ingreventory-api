const mongoose = require("mongoose");
const conn = require("../dbconnect/ingreventory");

const PaymentOptionSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: String,
  enabled: { type: Boolean, default: false },
  config: mongoose.Schema.Types.Mixed,
  image: String, // base64 string or URL
});

const CustomMethodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  enabled: { type: Boolean, default: false },
  config: mongoose.Schema.Types.Mixed,
  image: String, // base64 string or URL
});

const PaymentSettingSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
    unique: true,
  },
  options: [PaymentOptionSchema],
  customMethods: [CustomMethodSchema],
});

const Payment = conn.model("Payment", PaymentSettingSchema);

module.exports = Payment;
