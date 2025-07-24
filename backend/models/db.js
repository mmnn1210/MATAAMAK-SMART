const fs = require("fs");
const initSqlJs = require("sql.js");

let db;

// تهيئة قاعدة البيانات
module.exports = async () => {
  if (!db) {
    const SQL = await initSqlJs({
      locateFile: (file) => `node_modules/sql.js/dist/${file}`,
    });

    // إذا في ملف قاعدة بيانات جاهز، افتحه، وإلا أنشئ جديد
    if (fs.existsSync("./mataamak.db")) {
      const filebuffer = fs.readFileSync("./mataamak.db");
      db = new SQL.Database(filebuffer);
    } else {
      db = new SQL.Database();
    }

    // أنشئ الجداول
    db.exec(`
      CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        category TEXT,
        image TEXT,
        available INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tableNumber INTEGER,
        items TEXT,
        status TEXT DEFAULT 'pending',
        timestamp TEXT DEFAULT (datetime('now','localtime'))
      );
      CREATE TABLE IF NOT EXISTS tables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number INTEGER UNIQUE,
        qrCode TEXT
      );
    `);

    // أضف أصناف افتراضية
    const count = db.exec("SELECT COUNT(*) AS count FROM menu")[0].values[0][0];
    if (count === 0) {
      db.exec(`
        INSERT INTO menu (name, price, category, image) VALUES
        ('برجر لحم', 15, 'أطعمة', 'burger.jpg'),
        ('بيتزا', 20, 'أطعمة', 'pizza.jpg'),
        ('كولا', 5, 'مشروبات', 'cola.jpg');
      `);
      console.log("✅ تم إضافة أصناف افتراضية");
    }

    // احفظ عند الإغلاق
    process.on("exit", () => {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync("mataamak.db", buffer);
    });
  }
  return db;
};
