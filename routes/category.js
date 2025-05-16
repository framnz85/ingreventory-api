const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const categoryController = require("../controllers/category");

// @route   GET api/categories
// @desc    Get all categories
// @access  Public
router.get("/categories", categoryController.getCategories);

// @route   GET api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get("/categories/:id", categoryController.getCategoryById);

// @route   POST api/categories
// @desc    Create a new category
// @access  Private
router.post("/categories", auth.auth, categoryController.createCategory);

// @route   PUT api/categories/:id
// @desc    Update a category
// @access  Private
router.put(
  "/categories/:id",
  auth.auth,
  categoryController.updateCategory
);

// @route   DELETE api/categories/:id
// @desc    Delete a category
// @access  Private
router.delete(
  "/categories/:id",
  auth.auth,
  categoryController.deleteCategory
);

module.exports = router;