const express = require('express');
const path = require('path');
const cors = require('cors');

// إنشاء تطبيق إكسبرس
const app = express();

// منفذ السيرفر
const PORT = process.env.PORT || 3000;

// تمكين CORS (ضروري للاتصال من الجوال)
app.use(cors());

// قراءة البيانات كـ JSON
app.use(express.json());

// تقديم الملفات الثابتة من مجلد public
app.use(express.static('public'));

// مسار ملفات القائمة والطلبات
const dataPath = path.join(__dirname, '../data');

// استخدام الروتات
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));

// الجذر: يعرض index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}`);
});