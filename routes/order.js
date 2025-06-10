const express = require("express");
const router = express.Router();
const order = require("../controllers/order");

// Create a new order
router.post("/order", order.createOrder);

// Get all orders (admin only)
router.get("/orders", order.getAllOrders);

// Get orders by user ID
router.get("/user/:userId", order.getUserOrder);

// Get orders by store ID
router.get("/store/:storeId", order.getStoreOrders);

// Get order by ID
router.get("/order/:id", order.getOrderById);

// Get orders by user ID
router.get("/orders/user/:userId", order.getUserOrders);

// Update order status (admin only)
router.patch("/order/:id/status", order.updateOrderStatus);

// Update order status (user)
router.patch("/orders/:id", order.updateOrder);

module.exports = router;
