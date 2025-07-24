// 🔐 كلمة السر (غيرها حسب رغبتك)
const ADMIN_PASSWORD = 'mataamak123';

// 🔐 التحقق من كلمة السر عند الدخول
function checkAdminPassword() {
  const saved = localStorage.getItem('adminLoggedIn');
  if (saved === 'true') return true;

  const password = prompt('أدخل كلمة السر لفتح لوحة التحكم:');
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem('adminLoggedIn', 'true');
    return true;
  } else {
    alert('كلمة السر خاطئة!');
    window.location.href = '/';
    return false;
  }
}

// إذا ما نجح التحقق، لا تظهر الصفحة
if (!checkAdminPassword()) {
  window.location.href = '/';
}

// 📥 تحميل القائمة (الأصناف)
async function fetchAndDisplayMenu() {
  try {
    const res = await fetch('/api/menu');
    const items = await res.json();
    const menuList = document.getElementById('menu-list');
    menuList.innerHTML = '';

    items.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${item.name} - ${item.price} ل.س</span>
        <button onclick="deleteMenuItem(${item.id})">حذف</button>
      `;
      menuList.appendChild(li);
    });
  } catch (err) {
    console.error("خطأ في تحميل القائمة:", err);
  }
}

// ➕ إضافة صنف جديد
document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const price = parseFloat(document.getElementById('price').value);
  const category = document.getElementById('category').value;
  const image = document.getElementById('image').value;

  await fetch('/api/menu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, category, image })
  });

  alert('تمت إضافة الصنف!');
  document.getElementById('addForm').reset();
  fetchAndDisplayMenu();
});

// ❌ حذف صنف
async function deleteMenuItem(id) {
  if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    alert('تم الحذف!');
    fetchAndDisplayMenu();
  }
}

// 📥 تحميل الطلبات
let lastOrderCount = 0;

async function fetchAndDisplayOrders() {
  try {
    const res = await fetch('/api/orders');
    const orders = await res.json();

    // 🔔 تنبيه عند طلب جديد
    if (orders.length > lastOrderCount && lastOrderCount !== 0) {
      playOrderNotification();
    }
    lastOrderCount = orders.length;

    const container = document.getElementById('orders-list');
    container.innerHTML = '';

    if (orders.length === 0) {
      container.innerHTML = '<p class="no-orders">لا يوجد طلبات جديدة</p>';
      return;
    }

    orders.forEach(order => {
      const card = document.createElement('div');
      card.className = 'order-card';
      card.innerHTML = `
        <button onclick="markOrderAsDone(${order.id})" class="done-btn">✅ تم</button>
        <div class="order-header">طلب من الطاولة ${order.tableNumber}</div>
        <ul class="items-list">
          ${order.items.map(item => `<li>${item.name} × ${item.quantity}</li>`).join('')}
        </ul>
        <div class="total">المجموع: ${order.total} ل.س</div>
        <small>تم الإرسال: ${new Date(order.timestamp).toLocaleTimeString()}</small>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("فشل تحميل الطلبات", err);
  }
}

// 🔔 تنبيه عند طلب جديد
function playOrderNotification() {
  const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
  audio.play().catch(() => {});
  alert('طلب جديد وصل!');
}

// ✅ حذف الطلب بعد التحضير
async function markOrderAsDone(orderId) {
  if (confirm('هل تم تحضير الطلب؟')) {
    await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    alert('تم حذف الطلب');
    fetchAndDisplayOrders();
  }
}

// 📥 تحميل المبيعات
async function fetchAndDisplaySales() {
  try {
    const res = await fetch('/api/sales');
    const sales = await res.json();

    document.getElementById('daily-sales').textContent = `مبيعات اليوم: ${sales.dailySales} ل.س`;
    document.getElementById('monthly-sales').textContent = `مبيعات الشهر: ${sales.monthlySales} ل.س`;
  } catch (err) {
    console.error("فشل تحميل المبيعات", err);
  }
}

// 🗑️ مسح مبيعات اليوم
async function resetDailySales() {
  if (confirm('هل أنت متأكد من مسح مبيعات اليوم؟')) {
    await fetch('/api/sales/reset-daily', { method: 'POST' });
    alert('تم مسح مبيعات اليوم');
    fetchAndDisplaySales();
  }
}

// 🗑️ مسح مبيعات الشهر
async function resetMonthlySales() {
  if (confirm('هل أنت متأكد من مسح مبيعات الشهر؟')) {
    await fetch('/api/sales/reset-monthly', { method: 'POST' });
    alert('تم مسح مبيعات الشهر');
    fetchAndDisplaySales();
  }
}

// 🔄 تحديث تلقائي كل 3 و 5 ثواني
setInterval(fetchAndDisplayOrders, 3000);
setInterval(fetchAndDisplaySales, 5000);

// 🚀 أول تحميل (يجب أن يكون في النهاية)
window.onload = () => {
  fetchAndDisplayMenu();
  fetchAndDisplayOrders();
  fetchAndDisplaySales();
};