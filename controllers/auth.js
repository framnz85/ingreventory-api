const User = require('../models/User');
const Store = require('../models/Store');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
// Make sure your generateToken function is using the environment variable
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register a new user and store
exports.register = async (req, res) => {
  try {
    const { 
      // User details
      email, 
      password, 
      firstName, 
      lastName,
      
      // Store details
      storeName,
      storeAddress,
      storePhone,
      storeEmail,
      businessType,
      taxId
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Create new store
    const store = new Store({
      name: storeName,
      address: storeAddress,
      phone: storePhone,
      email: storeEmail || email, // Use user email as fallback
      businessType,
      taxId
    });

    // Save store to database
    const savedStore = await store.save();

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: 'admin', // First user is admin by default
      store: savedStore._id
    });

    // Save user to database
    const savedUser = await user.save();

    // Generate JWT token
    const token = generateToken(savedUser._id);

    // Return success response with token and user data (excluding password)
    const userData = savedUser.toObject();
    delete userData.password;

    res.status(201).json({
      success: true,
      token,
      user: userData,
      store: savedStore
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).populate('store');
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success response with token and user data (excluding password)
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login',
      error: error.message
    });
  }
};

// Add this new controller function for customer registration

/**
 * Register a customer for an existing store
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.registerCustomer = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, storeId } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !storeId) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Verify store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ 
        success: false,
        message: 'Store not found' 
      });
    }

    // Create new user with customer role
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role: 'user', // Changed from 'customer' to 'user' to match valid enum values
      store: storeId
    });

    // Save user - password hashing happens in the User model
    const savedUser = await user.save();

    // Generate JWT token
    const token = generateToken(savedUser._id);

    // Return success response with token and user data (excluding password)
    const userData = savedUser.toObject();
    delete userData.password;

    res.status(201).json({
      success: true,
      token,
      user: userData,
      store: store
    });
  } catch (err) {
    console.error('Error registering customer:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error during customer registration',
      error: err.message
    });
  }
};