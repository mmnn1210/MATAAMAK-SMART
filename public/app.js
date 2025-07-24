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
    const items = await res.json();

    // مسح كل الأقسام
    document
      .querySelectorAll(".items-grid")
      .forEach((grid) => (grid.innerHTML = ""));

    // خريطة لربط الفئة بالمعرّف
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

    // إضافة كل صنف إلى قسمه
    items.forEach((item) => {
      const sectionKey = sectionMap[item.category];
      if (!sectionKey) return;

      const sectionId = `${sectionKey}-section`;
      const grid = document.querySelector(`#${sectionId} .items-grid`);
      if (grid) {
        const div = document.createElement("div");
        div.className = "item-card";

        // إضافة كلاس حسب القسم لتغير التوهج
        if (item.category === "بيتزا") div.classList.add("pizza");
        if (item.category === "مشروبات باردة") div.classList.add("cold");
        if (item.category === "مشروبات ساخنة") div.classList.add("hot");
        if (item.category === "أطباق رئيسية") div.classList.add("main");
        if (item.category === "حلويات") div.classList.add("desserts");
        if (item.category === "مقبلات") div.classList.add("appetizers");
        if (item.category === "أراكيل") div.classList.add("arakeel");
        if (item.category === "فطور") div.classList.add("ftor");
        if (item.category === "شوربات") div.classList.add("soups");
        if (item.category === "كوكتيلات") div.classList.add("koktel");
        if (item.category === "عروض اليوم") div.classList.add("offers");

        div.innerHTML = `
          <h3>${item.name}</h3>
          <p>${item.price} ل.س</p>
          <button onclick="addToCart(${item.id}, '${item.name}', ${item.price})">+</button>
        `;
        grid.appendChild(div);
      }
    });
  } catch (err) {
    console.error("خطأ في تحميل القائمة", err);
    alert("فشل تحميل الأصناف");
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
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = {
    tableNumber: parseInt(tableNumber),
    items: cart,
    total: total
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(order)
    });

    if (res.ok) {
      alert(`تم إرسال طلبك من الطاولة ${tableNumber}!`);
      cart = [];
      updateCart();
      document.getElementById('cart-container').classList.remove('show');
    } else {
      alert('فشل إرسال الطلب: ' + res.status);
    }
  } catch (err) {
    alert('خطأ في الإرسال: ' + err.message);
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
