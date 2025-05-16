const Order = require("../models/Order");
const Product = require("../models/Product");
const Ingredient = require("../models/Ingredient");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Create the order
    const order = new Order(orderData);
    await order.save();

    // Update product inventory (optional)
    if (orderData.items && orderData.items.length > 0) {
      for (const item of orderData.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { inventory: -item.quantity },
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get orders by user ID
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user orders",
      error: error.message,
    });
  }
};

// Get orders by store ID
exports.getStoreOrders = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const orders = await Order.find({ storeId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch store orders",
      error: error.message,
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user orders",
      error: error.message,
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // Find the order first (not just update)
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // If status is being set to "shipped" and wasn't already shipped
    if (status === "shipped" && order.status !== "shipped") {
      for (const item of order.items) {
        // Deduct main product ingredients
        const product = await Product.findById(item.productId).populate(
          "ingredients.ingredient"
        );
        if (product && product.ingredients && product.ingredients.length > 0) {
          let outOfStock = false;
          for (const prodIng of product.ingredients) {
            const subtractQty = prodIng.count * item.quantity;
            // Subtract from ingredient stock (not quantity)
            const updatedIng = await Ingredient.findByIdAndUpdate(
              prodIng.ingredient._id,
              { $inc: { stock: -subtractQty } },
              { new: true }
            );
            if (updatedIng.stock <= 0) {
              outOfStock = true;
            }
          }
          if (outOfStock) {
            await Product.findByIdAndUpdate(product._id, { inStock: false });
          }
        }

        // Deduct ingredients for each addon
        if (item.addons && item.addons.length > 0) {
          for (const addon of item.addons) {
            if (addon.label) {
              const count = product.addons.filter(
                (prod) => prod.label === addon.label
              );
              const subtractQty = count[0].quantity;
              await Ingredient.findByIdAndUpdate(
                count[0].ingredient,
                { $inc: { stock: -subtractQty } },
                { new: true }
              );
            }
          }
        }
      }
    }

    // Now update the order status
    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(id, req.body, { new: true });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
