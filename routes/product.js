const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductsByPage,
  createProduct,
  uploadProductImage,
  getProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} = require("../controllers/product");
const { upload, deleteExistingImage } = require("../middlewares/upload");
const Product = require("../models/Product");

// Get all products
router.get("/products", getProducts);
router.get("/products/page", getProductsByPage);

// Get a single product
router.get("/products/:id", getProduct);

// Create a product
router.post("/products/:storeId", upload.single("image"), createProduct);

// Upload product image
router.post(
  "/products/:storeId/:id/image",
  upload.single("image"),
  async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);

      // Delete the existing image if it exists
      if (product.image) {
        await deleteExistingImage(product.image);
        await Product.findByIdAndUpdate(
          req.params.id,
          {
            image: req.file.location,
          },
          { new: true }
        );
      }
      next();
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  uploadProductImage
);

// Update a product
router.put("/products/:id", updateProduct);

// Delete a product
router.delete("/products/:id", deleteProduct);

// Delete product image
router.delete("/products/:id/image/:key", deleteProductImage);

module.exports = router;
