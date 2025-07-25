let cart = [];
let tableNumber = null;

// جلب رقم الطاولة من الرابط (مثل: ?table=5)
const urlParams = new URLSearchParams(window.location.search);
tableNumber = urlParams.get("table");

// إذا ما كان في رقم طاولة في الرابط، اسأله
if (!tableNumber) {
  tableNumber = prompt("أدخل رقم طاولتك:");
  if (!tableNumber) {
    alert("رقم الطاولة مطلوب");
    window.location.href = "/";
  }
}

// تحميل القائمة من السيرفر
async function loadMenu() {
  try {
    const res = await fetch("/api/menu");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const items = await res.json();

    // مسح كل الأقسام
    document.querySelectorAll(".items-grid").forEach(grid => grid.innerHTML = "");

    // خريطة الفئات
    const sectionMap = {
      "عروض اليوم": "offers",
      بيتزا: "pizza",
      سلطات: "salads",
      مقبلات: "appetizers",
      فطور: "ftor",
      "أطباق رئيسية": "main-dishes",
      مشاوي: "mashawe",
      حلويات: "desserts",
      كوكتيلات: "koktel",
      "مشروبات باردة": "cold-drinks",
      "مشروبات ساخنة": "hot-drinks",
      شوربات: "soups",
      أراكيل: "arakeel"
    };

    items.forEach(item => {
      const sectionKey = sectionMap[item.category];
      if (!sectionKey) return;

      const grid = document.querySelector(`#${sectionKey}-section .items-grid`);
      if (!grid) return;

      const div = document.createElement("div");
      div.className = "item-card";

      // إضافة كلاس حسب القسم
      const classMap = {
        بيتزا: "pizza",
        "مشروبات باردة": "cold",
        "مشروبات ساخنة": "hot",
        "أطباق رئيسية": "main",
        حلويات: "desserts",
        مقبلات: "appetizers",
        أراكيل: "arakeel",
        فطور: "ftor",
        شوربات: "soups",
        كوكتيلات: "koktel",
        "عروض اليوم": "offers",
        سلطات: "salads",
        مشاوي: "mashawe"
      };

      const cssClass = classMap[item.category];
      if (cssClass) div.classList.add(cssClass);

      div.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.price} ل.س</p>
        <button onclick="addToCart(${item.id}, '${item.name.replace(/'/g, "\\'")}', ${item.price})">+</button>
      `;
      grid.appendChild(div);
    });
  } catch (err) {
    console.error("خطأ في تحميل القائمة", err);
    alert("فشل تحميل الأصناف. تأكد من اتصال السيرفر.");
  }
}
// إضافة صنف للسلة
function addToCart(id, name, price) {
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.quantity++;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  updateCart();
}
function updateCart() {
  const cartBody = document.querySelector('.cart-body');
  const counter = document.getElementById('cart-counter');
  const totalAmount = document.getElementById('total-amount');

  cartBody.innerHTML = '';
  let total = 0;
  let count = 0;

  cart.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <span>${item.name} × ${item.quantity}</span>
      <span>${item.price * item.quantity} ل.س</span>
      <div>
        <button onclick="decreaseQuantity(${index})" style="margin:0 5px;">-</button>
        <button onclick="removeItem(${index})" style="background:#d6336c; color:white; border:none; padding:5px 10px; border-radius:6px;">🗑️</button>
      </div>
    `;
    cartBody.appendChild(div);

    total += item.price * item.quantity;
    count += item.quantity;
  });

  counter.textContent = count;
  totalAmount.textContent = total;
}
// نقص كمية الصنف (إذا الكمية 1 → يحذفه)
function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    cart.splice(index, 1); // إذا الكمية 1، احذفه
  }
  updateCart();
}

// حذف الصنف كلياً من السلة
function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}
async function submitOrder() {
  if (cart.length === 0) {
    alert("السلة فارغة!");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    tableNumber: parseInt(tableNumber),
    items: cart,
    total: total
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });

    if (res.ok) {
      alert(`تم إرسال طلبك من الطاولة ${tableNumber}!`);
      cart = [];
      updateCart();
      document.getElementById('cart-container').classList.remove('show');
    } else {
      const error = await res.text();
      alert(`فشل الإرسال: ${res.status} - ${error}`);
    }
  } catch (err) {
    alert('خطأ في الاتصال بالسيرفر. تأكد من تشغيله.');
  }
}
// أقسام
function toggleSectionMenu() {
  document.getElementById("section-menu").classList.toggle("hidden");
}

function selectSection(section) {
  document.getElementById("section-menu").classList.add("hidden");
  const sectionMap = {
    "عروض اليوم": "offers",
    بيتزا: "pizza",
    سلطات: "salads",
    مقبلات: "appetizers",
    فطور: "ftor",
    "أطباق رئيسية": "main-dishes",
    حلويات: "desserts",
    كوكتيلات: "koktel",
    "مشروبات باردة": "cold-drinks",
    "مشروبات ساخنة": "hot-drinks",
    شوربات: "soups",
    أراكيل: "arakeel",
  };
  const sectionId = `${sectionMap[section]}-section`;
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

// عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  loadMenu();
  updateCart();

  // تحديث تلقائي كل 15 ثانية
  setInterval(loadMenu, 15000);
});

// تفعيل ظهور السلة
document.getElementById("cart-fab").onclick = () => {
  document.getElementById("cart-container").classList.toggle("show");
};
