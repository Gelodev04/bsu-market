// src/controllers/productController.js
const productModel = require('../models/productModel');

const createProduct = async (req, res) => {
  const { name, price, description, image, location } = req.body;

  try {
    await productModel.createProduct(name, price, description, image, location);
    res.status(201).json({ message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
};