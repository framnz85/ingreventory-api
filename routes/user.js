const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

// Get all users
router.get("/users", userController.getUsers);

// Get user by ID
router.get("/users/:id", userController.getUserById);

// Create new user
router.post("/users", userController.createUser);

// Update user
// Note: We're using the controller from user.js instead of auth.js
router.put("/users/update/:id", userController.updateUser);

// Delete user
router.delete("/users/:id", userController.deleteUser);

module.exports = router;
