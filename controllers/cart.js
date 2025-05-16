const Product = require("../models/Product");
const Ingredient = require("../models/Ingredient");

// POST /api/cart/check-ingredients
exports.checkCartIngredients = async (req, res) => {
  try {
    const cartItems = req.body.items; // [{ productId, quantity }]
    let insufficientIngredients = [];

    for (const cartItem of cartItems) {
      const product = await Product.findById(cartItem.productId).populate("ingredients.ingredient");
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${cartItem.productId}` });
      }
      for (const prodIng of product.ingredients) {
        const requiredQty = prodIng.count * cartItem.quantity;
        // Get the latest stock for this ingredient
        const ingredient = prodIng.ingredient;
        if (!ingredient) {
          return res.status(404).json({ success: false, message: `Ingredient not found for product: ${product.name}` });
        }
        if (ingredient.stock < requiredQty) {
          insufficientIngredients.push({
            ingredientId: ingredient._id,
            ingredientName: ingredient.name,
            required: requiredQty,
            available: ingredient.stock,
            product: product.name
          });
        }
      }
    }

    if (insufficientIngredients.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient ingredient stock for one or more items.",
        insufficientIngredients
      });
    }

    return res.status(200).json({ success: true, message: "All ingredients have sufficient stock." });
  } catch (error) {
    console.error("Error checking cart ingredients:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};