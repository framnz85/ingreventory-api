const PaymentSetting = require("../models/Payment");

exports.getPaymentSetting = async (req, res) => {
  try {
    const { storeId } = req.query;
    if (!storeId)
      return res
        .status(400)
        .json({ success: false, message: "storeId is required" });

    let setting = await PaymentSetting.findOne({ storeId });
    if (!setting) {
      // Optionally, create default settings if not found
      setting = new PaymentSetting({ storeId, options: [], customMethods: [] });
      await setting.save();
    }
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get payment settings",
      error: error.message,
    });
  }
};

exports.savePaymentSetting = async (req, res) => {
  try {
    const { storeId, options, customMethods } = req.body;
    if (!storeId)
      return res
        .status(400)
        .json({ success: false, message: "storeId is required" });

    let setting = await PaymentSetting.findOneAndUpdate(
      { storeId },
      { options, customMethods },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save payment settings",
      error: error.message,
    });
  }
};

exports.uploadPaymentImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
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
