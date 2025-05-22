const Ingredient = require("../models/Ingredient");

// Get all ingredients
exports.getIngredients = async (req, res) => {
  try {
    const { storeId } = req.query;

    const ingredients = await Ingredient.find({ storeId }).sort({ name: 1 });
    res.json(ingredients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get ingredient by ID
exports.getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    res.json(ingredient);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Ingredient not found" });
    }
    res.status(500).send("Server Error");
  }
};

// Create a new ingredient
exports.createIngredient = async (req, res) => {
  try {
    const { name, description, unit, stock, pricePerUnit, markup, store } =
      req.body;

    const newIngredient = new Ingredient({
      name,
      description,
      unit,
      stock,
      pricePerUnit,
      markup,
      store,
    });

    const ingredient = await newIngredient.save();
    res.json(ingredient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Update an ingredient
exports.updateIngredient = async (req, res) => {
  try {
    const { name, description, unit, stock, pricePerUnit, markup, store } =
      req.body;

    // Build ingredient object
    const ingredientFields = {};
    if (name) ingredientFields.name = name;
    if (description !== undefined) ingredientFields.description = description;
    if (unit) ingredientFields.unit = unit;
    if (stock !== undefined) ingredientFields.stock = stock;
    if (pricePerUnit !== undefined)
      ingredientFields.pricePerUnit = pricePerUnit;
    if (markup !== undefined) ingredientFields.markup = markup;
    if (store !== undefined) ingredientFields.store = store;

    // If stock is updated, update lastRestocked date
    if (stock !== undefined) {
      ingredientFields.lastRestocked = Date.now();
    }

    let ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { $set: ingredientFields },
      { new: true }
    );

    res.json(ingredient);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Ingredient not found" });
    }
    res.status(500).send("Server Error");
  }
};

// Delete an ingredient
exports.deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);

    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    res.json({ message: "Ingredient removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Ingredient not found" });
    }
    res.status(500).send("Server Error");
  }
};
