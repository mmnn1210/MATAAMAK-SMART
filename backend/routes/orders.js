const express = require("express");
const router = express.Router();
const {
  getOrders,
  addOrder,
  deleteOrder,
} = require("../controllers/orderController");

router.get("/", getOrders);
router.post("/", addOrder);
router.delete("/:id", deleteOrder);

module.exports = router;
