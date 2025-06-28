const User = require("../models/User");
const Store = require("../models/Store");
const jwt = require("jsonwebtoken");

// Helper function to generate JWT
// Make sure your generateToken function is using the environment variable
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
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
      currency,
      currencyCode,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new store
    const store = new Store({
      name: storeName,
      address: storeAddress,
      phone: storePhone,
      email: storeEmail || email, // Use user email as fallback
      businessType,
      slug: storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""), // Generate slug from store name
      currency: currency || "$", // Default to $ if not provided
      currencyCode: currencyCode || "USD", // Default to USD if not provided
    });

    // Save store to database
    const savedStore = await store.save();

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: "admin", // First user is admin by default
      store: savedStore._id,
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
      store: savedStore,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).populate("store");

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
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
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
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
        message: "Please provide all required fields",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Verify store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Create new user with customer role
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role: "user", // Changed from 'customer' to 'user' to match valid enum values
      store: storeId,
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
      store: store,
    });
  } catch (err) {
    console.error("Error registering customer:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error during customer registration",
      error: err.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  const { firstName, lastName, phone, address, city, state, zipCode } =
    req.body;

  // Find user by id
  let user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update fields
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.phone = phone || user.phone;
  user.address = address || user.address;
  user.city = city || user.city;
  user.state = state || user.state;
  user.zipCode = zipCode || user.zipCode;

  // Save updated user
  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    data: {
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      city: updatedUser.city,
      state: updatedUser.state,
      zipCode: updatedUser.zipCode,
    },
  });
};

// @desc    Update user password
// @route   PUT /api/users/:id/password
// @access  Private
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Find user by id with password
  const user = await User.findById(req.params.id).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if current password matches
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
};

const addSubscriber = async (user) => {
  const url = new URL("https://api.sender.net/v2/subscribers");

  let headers = {
    Authorization: "Bearer " + process.env.SENDER_NET_API_KEY,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  let data = {
    email: user.email,
    firstname: user.firstName,
    lastname: user.lastName,
    groups: ["dB9pnx"],
    trigger_automation: false,
  };

  const result = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  }).then((response) => response.json());

  return result.success;
};

const executeCampaign = async (code, user) => {
  let url = new URL("https://api.sender.net/v2/campaigns");

  let headers = {
    Authorization: "Bearer " + process.env.SENDER_NET_API_KEY,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  let data = {
    title: "Password Reset Code",
    subject: "Your Password Reset Code",
    from: "Ingreventory",
    reply_to: "admin@ingreventory.com",
    preheader:
      "This contains the Password Reset Code for your Forgot Password request",
    content_type: "text",
    groups: ["dB9pnx"],
    content: `<p>Your password reset code is: <b>${code}</b></p>`,
  };

  const createCampaign = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  }).then((response) => response.json());

  if (createCampaign && createCampaign.success) {
    const campaignId = createCampaign.data.id;
    url = new URL(`https://api.sender.net/v2/campaigns/${campaignId}/send`);
    const sendCampaign = await fetch(url, {
      method: "POST",
      headers,
    }).then((response) => response.json());
    if (sendCampaign && sendCampaign.success) {
      setTimeout(async () => {
        url = new URL(
          `https://api.sender.net/v2/campaigns?ids=[${campaignId}]`
        );
        data = {
          title: "Campaign's title",
        };
        await fetch(url, {
          method: "DELETE",
          headers,
          body: JSON.stringify(data),
        }).then((response) => response.json());
        deleteUser(user);
      }, 120000);
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

const deleteUser = async (user) => {
  const url = new URL("https://api.sender.net/v2/subscribers");

  let headers = {
    Authorization: "Bearer " + process.env.SENDER_NET_API_KEY,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  let data = {
    subscribers: [user.email],
  };

  const result = await fetch(url, {
    method: "DELETE",
    headers,
    body: JSON.stringify(data),
  }).then((response) => response.json());
  return result.success;
};

// Forgot Password - Send Verification Code
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.passwordResetCode = code;
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  // Send code via Sender.net API
  try {
    const addUser = await addSubscriber(user);
    if (addUser) {
      await executeCampaign(code, user);
    }
    res.json({ success: true, message: "Verification code sent to email" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: err.message,
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  const user = await User.findOne({ email, passwordResetCode: code });
  if (
    !user ||
    !user.passwordResetExpires ||
    user.passwordResetExpires < Date.now()
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired code" });
  }
  user.password = newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({ success: true, message: "Password reset successful" });
};
