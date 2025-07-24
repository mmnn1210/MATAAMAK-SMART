const fs = require('fs');
const path = require('path');

// مسار ملف الطلبات
const filePath = path.join(__dirname, '../../data/orders.json');

// قراءة الطلبات
function readOrders() {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

// حفظ الطلبات
function writeOrders(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// تحميل الطلبات
let orders = readOrders();
// ✅ تصدير الدوال
exports.getOrders = (req, res) => {
  res.json(orders);
};

// **************************************
// ✅ مسار ملف المبيعات
// **************************************
const salesFilePath = path.join(__dirname, '../../data/sales.json');

// قراءة المبيعات
function readSales() {
  if (fs.existsSync(salesFilePath)) {
    const data = fs.readFileSync(salesFilePath, 'utf8');
    return JSON.parse(data);
  }
  return { dailySales: 0, monthlySales: 0 };
}

// حفظ المبيعات
function writeSales(data) {
  fs.writeFileSync(salesFilePath, JSON.stringify(data, null, 2), 'utf8');
}

// تحميل المبيعات
let sales = readSales();

// إضافة طلب جديد
exports.addOrder = (req, res) => {
  const order = {
    ...req.body,
    id: Date.now(),
    timestamp: new Date().toISOString()
  };

  // إضافة الطلب
  orders.push(order);

  // ✅ إضافة المبلغ إلى المبيعات
  sales.dailySales += order.total || 0;
  sales.monthlySales += order.total || 0;

  // ✅ حفظ التغييرات
  writeOrders(orders);
  writeSales(sales);

  console.log('طلب جديد:', order);
  res.status(201).json({ message: 'تم إرسال الطلب' });
};

exports.deleteOrder = (req, res) => {
  const id = parseInt(req.params.id);
  const lengthBefore = orders.length;

  // حذف الطلب من القائمة
  orders = orders.filter(order => order.id !== id);

  // حفظ التغييرات في الملف
  writeOrders(orders);

  // إرسال استجابة
  res.json({ deleted: lengthBefore !== orders.length });
};