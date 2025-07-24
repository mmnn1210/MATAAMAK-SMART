const express = require("express");
const router = express.Router();
const {
  getItems,
  addItem,
  deleteItem,
} = require("../controllers/menuController");

router.get("/", getItems);
router.post("/", addItem);
router.delete("/:id", deleteItem);

module.exports = router;
