const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// Register route
router.post("/auth/register", authController.register);

// Register customer route
router.post("/auth/register-customer", authController.registerCustomer);

// Login route
router.post("/auth/login", authController.login);

// Forgot password
router.post("/auth/forgot-password", authController.forgotPassword);

router.post("/auth/reset-password", authController.resetPassword);

// Update user profile
router.put("/users/:id", authController.updateUser);

// Update user password
router.put("/users/:id/password", authController.updatePassword);

module.exports = router;
