// src/routes/productRoutes.js
const express = require('express');
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authenticate, authorize(['admin']), productController.createProduct);
router.get('/', productController.getAllProducts);

module.exports = router;