const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../data/menu.json");

function readMenu() {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }
  return [];
}

function writeMenu(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

let menuItems = readMenu();

exports.getItems = (req, res) => {
  res.json(menuItems);
};

exports.addItem = (req, res) => {
  const newItem = { ...req.body, id: Date.now() };
  menuItems.push(newItem);
  writeMenu(menuItems);
  res.status(201).json(newItem);
};

exports.deleteItem = (req, res) => {
  const id = parseInt(req.params.id);
  const lengthBefore = menuItems.length;
  menuItems = menuItems.filter((item) => item.id !== id);
  writeMenu(menuItems);
  res.json({ deleted: lengthBefore !== menuItems.length });
};
