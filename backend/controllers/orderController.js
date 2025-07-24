const fs = require('fs');
const path = require('path');

// 📁 مسار ملف الطلبات
const filePath = path.join(__dirname, '../../data/orders.json');

// 🔍 قراءة الطلبات من الملف
function readOrders() {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

// 💾 حفظ الطلبات في الملف
function writeOrders(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// 🚀 تحميل الطلبات عند تشغيل السيرفر
let orders = readOrders();

// 📤 إرجاع الطلبات للعميل
exports.getOrders = (req, res) => {
  res.json(orders);
};

// ➕ إضافة طلب جديد
exports.addOrder = (req, res) => {
  const order = {
    ...req.body,
    id: Date.now(),
    timestamp: new Date().toISOString()
  };

  orders.push(order);
  writeOrders(orders);

  res.status(201).json({ message: 'تم إرسال الطلب بنجاح' });
};

// ✅ تغيير حالة الطلب إلى "تم" (بدلاً من الحذف)
exports.markAsDone = (req, res) => {
  const id = parseInt(req.params.id);
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = 'done';
    writeOrders(orders);
    res.json({ message: 'تم التحديث' });
  } else {
    res.status(404).json({ error: 'الطلب غير موجود' });
  }
};

// 🗑️ حذف الطلب (نستخدمه فقط في "تصفير اليوم")
exports.deleteOrder = (req, res) => {
  const id = parseInt(req.params.id);
  const lengthBefore = orders.length;
  orders = orders.filter(order => order.id !== id);
  writeOrders(orders);
  res.json({ deleted: lengthBefore !== orders.length });
};

// 🔄 تصفير جميع الطلبات (يستخدمه الأدمن لبدء يوم جديد)
exports.resetOrders = (req, res) => {
  orders = [];
  writeOrders(orders);
  res.json({ message: 'تم تصفير الطلبات' });
};