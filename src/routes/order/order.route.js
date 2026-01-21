const express = require('express');
const { auth } = require('../../middleware/auth.middleware');
const {
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderById,
  getAllOrders,
} = require('../../controllers/order.controller');

const router = express.Router();

router.post('/create', auth, createOrder);
router.put('/update/:id', auth, updateOrder);
router.delete('/delete/:id', auth, deleteOrder);
router.get('/getbyid/:id', auth, getOrderById);
router.get('/getall', auth, getAllOrders);

module.exports = router;


