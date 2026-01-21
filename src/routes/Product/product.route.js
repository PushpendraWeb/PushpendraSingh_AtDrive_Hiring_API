const express = require('express');
const { auth } = require('../../middleware/auth.middleware');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProducts,
} = require('../../controllers/product.controller');

const router = express.Router();
router.post('/create',auth, createProduct);
router.put('/update/:id',auth, updateProduct);
router.delete('/delete/:id',auth, deleteProduct);
router.get('/getbyid/:id',auth, getProductById);
router.get('/getall',auth, getAllProducts);

module.exports = router;
