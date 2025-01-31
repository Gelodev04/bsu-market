// src/models/productModel.js
const db = require('./db');

const createProduct = async (name, price, description, image, location) => {
  const [result] = await db.execute('INSERT INTO products (name, price, description, image, location) VALUES (?, ?, ?, ?, ?)', [name, price, description, image, location]);
  return result;
};

const getAllProducts = async () => {
  const [rows] = await db.execute('SELECT * FROM products');
  return rows;
};

module.exports = {
  createProduct,
  getAllProducts,
};