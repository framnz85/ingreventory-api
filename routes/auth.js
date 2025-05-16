const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// Register route
router.post("/auth/register", authController.register);

// Register customer route
router.post("/auth/register-customer", authController.registerCustomer);

// Login route
router.post("/auth/login", authController.login);

module.exports = router;
