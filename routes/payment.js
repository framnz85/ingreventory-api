const express = require("express");
const router = express.Router();
const paymentSettingController = require("../controllers/payment");
const { uploadPaymentImg } = require("../middlewares/upload");

router.get("/payments", paymentSettingController.getPaymentSetting);
router.post("/payments", paymentSettingController.savePaymentSetting);

// Payment image upload route
router.post(
  "/payments/image/:storeId/:payid",
  uploadPaymentImg.single("image"),
  paymentSettingController.uploadPaymentImage
);

module.exports = router;
