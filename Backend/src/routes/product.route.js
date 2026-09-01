const express = require('express');
const productController = require('../controllers/product.controller');
const router = express.Router();

router.post("/addProduct",productController.addProducts);
router.get("/product/:id",productController.getProductsById);
router.get("/products",productController.allProducts);

module.exports = router;