const express = require('express');
const router = express.Router();
const { getSales, resetDaily, resetMonthly } = require('../controllers/salesController');

router.get('/', getSales);
router.post('/reset-daily', resetDaily);
router.post('/reset-monthly', resetMonthly);

module.exports = router;