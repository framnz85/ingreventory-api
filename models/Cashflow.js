const mongoose = require("mongoose");
const conn = require("../dbconnect/ingreventory");

const cashflowSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["in", "out"], required: true },
    amount: { type: Number, required: true },
    note: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Cashflow = conn.model("Cashflow", cashflowSchema);

module.exports = Cashflow;
