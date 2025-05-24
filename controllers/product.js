const Product = require("../models/Product");
const { s3 } = require("../middlewares/upload");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const { storeId } = req.query;
    // Filter products by store ID if provided
    const query = storeId ? { store: storeId } : {};

    const products = await Product.find(query).populate(
      "category",
      "name slug"
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add this new controller method for pagination
exports.getProductsByPage = async (req, res) => {
  try {
    const { page = 1, limit = 3, category, storeId } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (category.name && category.name !== "All") {
      query.category = category._id;
    }
    if (storeId) {
      query.storeId = storeId;
    }

    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate("category", "name slug");

    const total = await Product.countDocuments(query);

    res.status(200).json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

// Make sure this function exists and is properly exported
// Update the createProduct function to include ingredients
exports.createProduct = async (req, res) => {
  try {
    const { name, slug, description, cost, price, category, store } = req.body;
    let ingredients = [];
    let finaladdonTypes = [];
    let finalAddons = [];

    // Parse ingredients if they exist in the request body
    if (req.body.ingredients) {
      try {
        // If ingredients is a string (JSON), parse it
        if (typeof req.body.ingredients === "string") {
          ingredients = JSON.parse(req.body.ingredients);
        } else {
          ingredients = req.body.ingredients;
        }

        // Ensure each ingredient has a valid structure
        ingredients = ingredients.map((item) => ({
          ingredient: item.ingredient, // This should be an ObjectId
          count: item.count || 1,
        }));
      } catch (error) {
        console.error("Error parsing ingredients:", error);
        // Continue with empty ingredients array if parsing fails
      }
    }
    // Parse ingredients if they exist in the request body
    if (req.body.addonTypes) {
      try {
        if (typeof req.body.addonTypes === "string") {
          try {
            finaladdonTypes = JSON.parse(req.body.addonTypes);
          } catch (e) {
            finaladdonTypes = [];
          }
        }
      } catch (error) {
        console.error("Error parsing addons:", error);
        // Continue with empty ingredients array if parsing fails
      }
    }

    // Parse ingredients if they exist in the request body
    if (req.body.addons) {
      try {
        if (typeof req.body.addons === "string") {
          try {
            finalAddons = JSON.parse(req.body.addons);
          } catch (e) {
            finalAddons = [];
          }
        }
      } catch (error) {
        console.error("Error parsing addons:", error);
        // Continue with empty ingredients array if parsing fails
      }
    }

    const image = req.file ? req.file.location : "";

    const product = await new Product({
      name,
      slug,
      description,
      cost,
      price,
      category,
      addonTypes: finaladdonTypes,
      addons: finalAddons,
      image,
      ingredients: ingredients,
      store,
    }).save();

    // Populate the category and ingredients fields after saving
    await product.populate([
      { path: "category", select: "name slug" },
      { path: "ingredients.ingredient", select: "name unit" },
    ]);

    res.json(product);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      err: err.message,
    });
  }
};

// Update the updateProduct function to include ingredients
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      cost,
      price,
      category,
      image,
      addonTypes,
      addons,
      ingredients,
      store,
    } = req.body;

    // Find the product and update it
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug,
        description,
        cost,
        price,
        category,
        image,
        addonTypes,
        addons,
        ingredients,
        store,
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "category", select: "name slug" },
      { path: "ingredients.ingredient", select: "name unit" },
    ]);

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      err: err.message,
    });
  }
};

// Update the getProduct function to populate ingredients
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate("ingredients.ingredient", "name unit");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({
      err: err.message,
    });
  }
};

// Upload product image
exports.uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Get the product ID from the request params
    const { id } = req.params;

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update the product with the new image URL
    const imageUrl = req.file.location; // S3 URL from multer-s3
    product.image = imageUrl;
    await product.save();

    res.json({
      message: "Image uploaded successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add this function to your existing controller
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug"
    );
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({
      err: err.message,
    });
  }
};

// Get product by slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({
      err: err.message,
    });
  }
};

// Delete product image from S3
exports.deleteProductImage = async (req, res) => {
  try {
    const { id, key } = req.params;

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete the image from S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `store${product.store}/${key}`,
    };

    const command = new DeleteObjectCommand(params);
    await s3.send(command);

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: error.message });
  }
};
