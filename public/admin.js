
// 📥 تحميل القائمة
async function fetchAndDisplayMenu() {
  try {
    const res = await fetch('/api/menu');
    const items = await res.json();
    const menuList = document.getElementById('menu-list');
    menuList.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.name} - ${item.price} ل.س</span> <button onclick="deleteMenuItem(${item.id})">حذف</button>`;
      menuList.appendChild(li);
    });
  } catch (err) {
    console.error("خطأ في تحميل القائمة:", err);
  }
  
}

// ➕ إضافة صنف
document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const price = parseFloat(document.getElementById('price').value);
  const category = document.getElementById('category').value;
  await fetch('/api/menu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, category })
  });
  alert('تمت الإضافة!');
  document.getElementById('addForm').reset();
  fetchAndDisplayMenu();
});

// ❌ حذف صنف
async function deleteMenuItem(id) {
  if (confirm('حذف هذا الصنف؟')) {
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    fetchAndDisplayMenu();
  }
}

// 📥 تحميل الطلبات
let lastOrderCount = parseInt(localStorage.getItem('lastOrderCount')) || 0;

async function fetchAndDisplayOrders() {
  try {
    const res = await fetch('/api/orders');
    const orders = await res.json();
    const count = orders.length;

    // تنبيه عند طلب جديد
    if (count > lastOrderCount && lastOrderCount !== 0) {
      playNotification();
    }
    lastOrderCount = count;
    localStorage.setItem('lastOrderCount', count);

    const container = document.getElementById('orders-list');
    container.innerHTML = '';
    if (count === 0) {
      container.innerHTML = '<p class="no-orders">لا يوجد طلبات جديدة</p>';
      return;
    }

    // عرض الطلبات الجديدة فقط (اللي status !== 'done')
    const newOrders = orders.filter(order => order.status !== 'done');
    if (newOrders.length === 0) {
      container.innerHTML = '<p class="no-orders">لا يوجد طلبات جديدة</p>';
      return;
    }

    newOrders.forEach(order => {
      const card = document.createElement('div');
      card.className = 'order-card';
      card.innerHTML = `
        <button onclick="markAsDone(${order.id})" class="done-btn">✅ تم</button>
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

// 🔔 تنبيه
function playNotification() {
  const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
  audio.play().catch(() => {});
  alert('طلب جديد وصل!');
}

// ✅ تم التحضير (غير الحالة، ما تحذف)
async function markAsDone(orderId) {
  if (confirm('هل تم التحضير؟')) {
    await fetch(`/api/orders/${orderId}/done`, { method: 'PATCH' });
    fetchAndDisplayOrders();
  }
}

// 📄 حفظ تقرير يومي
async function saveDailyReport() {
  try {
    const res = await fetch('/api/orders');
    const orders = await res.json();
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => order.timestamp.startsWith(today));

    if (todayOrders.length === 0) {
      alert('لا يوجد طلبات ليوم اليوم');
      return;
    }

    let report = `تقرير مبيعات مطعم MIAMI\n`;
    report += `تاريخ: ${today}\n`;
    report += `==============================\n\n`;

    todayOrders.forEach((order, index) => {
      report += `الطلب #${index + 1} - طاولة ${order.tableNumber}\n`;
      order.items.forEach(item => {
        report += `  - ${item.name} × ${item.quantity} = ${item.price * item.quantity} ل.س\n`;
      });
      report += `  المجموع: ${order.total} ل.س\n\n`;
    });

    const total = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    report += `==============================\n`;
    report += `إجمالي المبيعات: ${total} ل.س`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_${today}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('فشل حفظ التقرير');
  }
}

// 🗑️ تصفير اليوم (مسح جميع الطلبات)
async function resetDailyData() {
  if (confirm('هل أنت متأكد من تصفير اليوم؟')) {
    await fetch('/api/orders/reset', { method: 'POST' });
    localStorage.removeItem('lastOrderCount');
    lastOrderCount = 0;
    fetchAndDisplayOrders();
    alert('تم تصفير اليوم');
  }
}

// 🔄 تحديث كل 3 ثواني
setInterval(fetchAndDisplayOrders, 3000);

// 🚀 أول تحميل
window.onload = () => {
  fetchAndDisplayMenu();
  fetchAndDisplayOrders();
};