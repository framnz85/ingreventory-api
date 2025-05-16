const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const ingredientController = require("../controllers/ingredient");

// @route   GET api/ingredients
// @desc    Get all ingredients
// @access  Public
router.get("/ingredients", ingredientController.getIngredients);

// @route   GET api/ingredients/:id
// @desc    Get ingredient by ID
// @access  Public
router.get("/ingredients/:id", ingredientController.getIngredientById);

// @route   POST api/ingredients
// @desc    Create a new ingredient
// @access  Private
router.post("/ingredients", auth.auth, ingredientController.createIngredient);

// @route   PUT api/ingredients/:id
// @desc    Update an ingredient
// @access  Private
router.put(
  "/ingredients/:id",
  auth.auth,
  ingredientController.updateIngredient
);

// @route   DELETE api/ingredients/:id
// @desc    Delete an ingredient
// @access  Private
router.delete(
  "/ingredients/:id",
  auth.auth,
  ingredientController.deleteIngredient
);

module.exports = router;
