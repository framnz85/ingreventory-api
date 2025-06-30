const Store = require("../models/Store");

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
