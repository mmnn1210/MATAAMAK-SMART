const express = require('express');
const router = express.Router();
const { getMenu, addMenuItem, deleteMenuItem } = require('../controllers/menuController');

router.get('/', getMenu);
router.post('/', addMenuItem);
router.delete('/:id', deleteMenuItem);

module.exports = router;