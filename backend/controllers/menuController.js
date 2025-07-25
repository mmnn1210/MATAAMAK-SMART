const fs = require('fs');
const path = require('path');

const menuFilePath = path.join(__dirname, '../../data/menu.json');

function readMenu() {
  if (fs.existsSync(menuFilePath)) {
    const data = fs.readFileSync(menuFilePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

function writeMenu(data) {
  fs.writeFileSync(menuFilePath, JSON.stringify(data, null, 2));
}

let menu = readMenu();

exports.getMenu = (req, res) => {
  res.json(menu);
};

exports.addMenuItem = (req, res) => {
  const item = {
    ...req.body,
    id: Date.now()
  };
  menu.push(item);
  writeMenu(menu);
  res.status(201).json(item);
};

exports.deleteMenuItem = (req, res) => {
  const id = parseInt(req.params.id);
  menu = menu.filter(item => item.id !== id);
  writeMenu(menu);
  res.json({ success: true });
};