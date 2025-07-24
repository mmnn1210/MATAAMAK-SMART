const fs = require('fs');
const path = require('path');

const salesFilePath = path.join(__dirname, '../../data/sales.json');

function readSales() {
  if (fs.existsSync(salesFilePath)) {
    const data = fs.readFileSync(salesFilePath, 'utf8');
    return JSON.parse(data);
  }
  return { dailySales: 0, monthlySales: 0 };
}

function writeSales(data) {
  fs.writeFileSync(salesFilePath, JSON.stringify(data, null, 2), 'utf8');
}

let sales = readSales();

exports.getSales = (req, res) => {
  res.json(sales);
};

// ✅ مسح مبيعات اليوم
exports.resetDaily = (req, res) => {
  sales.dailySales = 0; // ⚠️ مهم: تصفير القيمة
  writeSales(sales);    // ⚠️ مهم: حفظ التغييرات
  res.json({ message: 'تم مسح مبيعات اليوم' });
};

// ✅ مسح مبيعات الشهر
exports.resetMonthly = (req, res) => {
  sales.monthlySales = 0;
  writeSales(sales);
  res.json({ message: 'تم مسح مبيعات الشهر' });
};