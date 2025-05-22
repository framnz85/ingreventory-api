const express = require("express");
const router = express.Router();
const storeController = require("../controllers/store");
const { upload, deleteExistingImage } = require("../middlewares/upload");
const Store = require("../models/Store");

// Get store by slug - public route
router.get("/stores/slug/:slug", storeController.getStoreBySlug);

// Other existing routes...
// For example:
// router.post("/", auth, storeController.createStore);
router.put("/stores/:id", storeController.updateStore);
// router.delete("/:id", auth, storeController.deleteStore);
// router.get("/", storeController.getAllStores);

router.post(
  "/stores/background-image/:storeId",
  upload.single("image"),
  async (req, res, next) => {
    try {
      const store = await Store.findById(req.params.storeId);

      // Delete the existing image if it exists
      if (store.backgroundImage) {
        await deleteExistingImage(store.backgroundImage);
      }
      if (req.file.location) {
        await Store.findByIdAndUpdate(
          req.params.storeId,
          {
            $set: {
              backgroundImage: req.file.location,
            },
          },
          { new: true }
        );
      }
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  storeController.uploadStoreImage
);

router.post(
  "/stores/logo-image/:storeId",
  upload.single("image"),
  async (req, res, next) => {
    try {
      const store = await Store.findById(req.params.storeId);

      // Delete the existing image if it exists
      if (store.logoImage) {
        await deleteExistingImage(store.logoImage);
      }
      if (req.file.location) {
        await Store.findByIdAndUpdate(
          req.params.storeId,
          {
            $set: {
              logoImage: req.file.location,
            },
          },
          { new: true }
        );
      }
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  storeController.uploadStoreImage
);

module.exports = router;
