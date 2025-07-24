const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// ✅ التصديرات
router.get('/', orderController.getOrders);
router.post('/', orderController.addOrder);
router.patch('/:id/done', orderController.markAsDone);
router.delete('/:id', orderController.deleteOrder);
router.post('/reset', orderController.resetOrders);

module.exports = router;