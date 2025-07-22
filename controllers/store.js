const Store = require("../models/Store");
const User = require("../models/User");

// Get store by slug
exports.getStoreBySlug = async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug });

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });
    }

    res.json({ success: true, data: store });
  } catch (error) {
    console.error("Error fetching store by slug:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get store by ID
exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });
    }

    // Find admin users for this store
    const adminUsers = await User.find({
      store: req.params.id,
      role: "admin",
    }).select("-password"); // Exclude password field for security

    // Import jwt at the top of the file if not already imported
    const jwt = require("jsonwebtoken");
    
    // Helper function to generate JWT (add this after imports)
    const generateToken = (userId) => {
      return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
    };
    
    // In the getStoreById function, modify the response:
    res.json({
      success: true,
      data: {
        store,
        adminUsers,
        token: adminUsers.length > 0 ? generateToken(adminUsers[0]._id) : null,
      },
    });
  } catch (error) {
    console.error("Error fetching store by ID:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add other store controller methods here
// For example:
// exports.createStore = async (req, res) => { ... }
exports.updateStore = async (req, res) => {
  try {
    const storeId = req.params.id;
    const updateData = req.body;

    // Optionally, only allow certain fields to be updated
    // For now, allow address and currency to be updated
    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      {
        $set: updateData,
      },
      { new: true }
    );

    if (!updatedStore) {
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });
    }

    res.json({ success: true, data: updatedStore });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update store",
      error: error.message,
    });
  }
};
// exports.deleteStore = async (req, res) => { ... }
// exports.getAllStores = async (req, res) => { ... }

exports.uploadStoreImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file provided" });
    }

    // The S3 URL is available at req.file.location when using multer-s3
    const imageUrl = req.file.location;

    res.json({
      success: true,
      url: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading payment image:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
