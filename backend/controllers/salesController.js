const fs = require('fs');
const path = require('path');

// 📁 مسار ملف المبيعات
const salesFilePath = path.join(__dirname, '../../data/sales.json');

// 🔍 قراءة المبيعات
function readSales() {
  if (fs.existsSync(salesFilePath)) {
    const data = fs.readFileSync(salesFilePath, 'utf8');
    return JSON.parse(data);
  }
  return { dailySales: 0, monthlySales: 0 };
}
// ✅ تحميل المبيعات عند تشغيل السيرفر
let sales = readSales(); // ⚠️ مهم: لا تنساها

// 💾 حفظ المبيعات
function writeSales(data) {
  fs.writeFileSync(salesFilePath, JSON.stringify(data, null, 2), 'utf8');
}


// ✅ تصدير الدوال
exports.getSales = (req, res) => {
  res.json(sales);
};

exports.resetDaily = (req, res) => {
  sales.dailySales = 0;
  writeSales(sales);
  res.json({ message: 'تم مسح مبيعات اليوم' });
};

exports.resetMonthly = (req, res) => {
  sales.monthlySales = 0;
  writeSales(sales);
  res.json({ message: 'تم مسح مبيعات الشهر' });
};