const Category = require("../models/Category");
// Removed ErrorResponse import

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    // Copy req.query and remove special query parameters
    const reqQuery = { ...req.query };
    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string with MongoDB operators
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Parse query and add store filter
    const queryObj = JSON.parse(queryStr);

    // Build the base query
    let query = Category.find(queryObj);

    // Apply field selection if specified
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Apply sorting if specified, default to newest first
    const sortBy = req.query.sort
      ? req.query.sort.split(",").join(" ")
      : "-createdAt";
    query = query.sort(sortBy);

    // Apply pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    // Get total count for pagination
    const total = await Category.countDocuments(queryObj);

    // Apply skip and limit to query
    query = query.skip(startIndex).limit(limit);

    // Populate virtual fields
    query = query.populate("productCount");

    // Execute query
    const categories = await query;

    // Build pagination object
    const pagination = {};
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }
    if (startIndex + categories.length < total) {
      pagination.next = { page: page + 1, limit };
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      count: categories.length,
      pagination,
      data: categories,
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "productCount"
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        error: `Category not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    console.error("Error fetching category by ID:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res) => {
  try {
    // Add store to req.body

    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (err) {
    console.error("Error creating category:", err);

    // Check for duplicate key error (MongoDB error code 11000)
    if (err.code === 11000) {
      // Extract the duplicate field name from the error message
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];

      return res.status(400).json({
        success: false,
        error: `A category with this ${field} already exists: "${value}"`,
        code: "DUPLICATE_KEY",
        field: field,
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: `Category not found with id of ${req.params.id}`,
      });
    }

    // Make sure user is category owner or admin
    if (
      category.store.toString() !== req.body.store &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        error: `User ${req.user.id} is not authorized to update this category`,
      });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    console.error("Error creating category:", err);

    // Check for duplicate key error (MongoDB error code 11000)
    if (err.code === 11000) {
      // Extract the duplicate field name from the error message
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];

      return res.status(400).json({
        success: false,
        error: `A category with this ${field} already exists: "${value}"`,
        code: "DUPLICATE_KEY",
        field: field,
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: `Category not found with id of ${req.params.id}`,
      });
    }

    // Make sure user is category owner or admin
    if (
      category.store.toString() !== req.body.store &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        error: `User ${req.user.id} is not authorized to delete this category`,
      });
    }

    // Replace category.remove() with findByIdAndDelete
    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
