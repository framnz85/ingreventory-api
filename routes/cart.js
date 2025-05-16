const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart");

// POST /api/cart/check-ingredients
router.post("/cart/check-ingredients", cartController.checkCartIngredients);

module.exports = router;
