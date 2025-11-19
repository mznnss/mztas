/* js/script.js — FINAL
   Fitur:
   - Modal produk detail (pilih ukuran+warna)
   - Badge HABIS otomatis
   - Keranjang (localStorage)
   - Checkout mengurangi stok & WA validation
   - Reviews (localStorage)
   - Admin page (edit stok/harga/variasi/reset)
   - Modal & cart ada di semua halaman
*/

/* --------- Helpers & storage --------- */
const STORAGE_DB_KEY = "dbProduk";
const STORAGE_CART_KEY = "mz_cart";
const STORAGE_REV_KEY = "mz_reviews";

// load DB: prefer localStorage (updated stok), fallback to global `produk` from db.js
let db = JSON.parse(localStorage.getItem(STORAGE_DB_KEY) || "null");
if (!db) {
  // `produk` should be defined in js/db.js
  db = typeof produk !== "undefined" ? produk : [];
  localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(db));
} else {
  // ensure produk var exists for legacy code
  window.produk = db;
}

// Cart
let cart = JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || "[]");

function saveDB() {
  localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(db));
}
function saveCart() {
  localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

/* Format IDR */
function formatIDR(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

/* Update cart badge on all pages */
function updateCartBadge() {
  const totalQty = cart.reduce((s, it) => s + it.qty, 0);
  document
    .querySelectorAll(
      "#cart-count, #cart-count-2, #cart-count-3, #cart-count-pemesanan"
    )
    .forEach((el) => {
      if (el) el.textContent = totalQty;
    });
}
updateCartBadge();

/* --------- NAV / Mobile menu --------- */
function toggleMenu() {
  const menu = document.getElementById("mobile-menu");
  if (menu) menu.classList.toggle("hidden");
}

/* --------- Landing featured (3 favorit) --------- */
function renderLandingFeatured() {
  const el = document.getElementById("landing-featured");
  if (!el) return;
  const fav = db.filter((p) => p.favorit).slice(0, 3);
  el.innerHTML = fav
    .map(
      (p) => `
    <div class="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition cursor-pointer"
         onclick="openProductDetail(${p.id})">
      <div class="h-52 overflow-hidden bg-gray-100">
        <img src="img/produk/${p.gambar}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="font-bold">${p.nama}</h3>
        <div class="text-blue-700 font-semibold mt-2">${formatIDR(
          getLowestPrice(p)
        )}</div>
      </div>
    </div>
  `
    )
    .join("");
}
function getLowestPrice(product) {
  return Math.min(...product.variasi.map((v) => v.harga));
}

/* --------- Katalog render (cards) --------- */
function renderKatalog() {
  const container = document.getElementById("katalog-list");
  if (!container) return;
  container.innerHTML = db
    .map((p) => {
      const lowest = getLowestPrice(p);
      // is all variations sold out?
      const outAll = p.variasi.every((v) => v.stok <= 0);
      const badge = outAll
        ? `<span class="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm">HABIS</span>`
        : "";
      return `
      <div class="relative bg-white rounded-xl shadow p-3 cursor-pointer hover:shadow-lg transition" onclick="openProductDetail(${
        p.id
      })">
        ${badge}
        <div class="h-44 overflow-hidden rounded-lg">
          <img src="img/produk/${p.gambar}" class="w-full h-full object-cover">
        </div>
        <h3 class="font-semibold mt-3">${p.nama}</h3>
        <div class="text-blue-700 font-bold mt-1">${formatIDR(lowest)}</div>
        <div class="mt-3 text-sm text-gray-600">Klik untuk lihat detail</div>
      </div>
    `;
    })
    .join("");
}

/* --------- Product Modal (detail + pilih variasi) --------- */
let currentProduct = null;

function openProductDetail(id) {
  currentProduct = db.find((d) => d.id === id);
  if (!currentProduct) return alert("Produk tidak ditemukan");

  const modal = document.getElementById("product-modal");
  const body = document.getElementById("product-detail-body");
  if (!modal || !body) return;

  const ukuranList = [...new Set(currentProduct.variasi.map((v) => v.ukuran))];

  body.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <img src="img/produk/${
          currentProduct.gambar
        }" class="w-full h-64 object-cover rounded-lg">
      </div>
      <div>
        <h2 class="text-xl font-bold mb-1">${currentProduct.nama}</h2>
        <div id="modal-price" class="text-blue-700 font-semibold mb-3">${formatIDR(
          getLowestPrice(currentProduct)
        )}</div>

        <label class="block text-sm font-medium">Ukuran</label>
        <select id="modal-ukuran" class="w-full p-2 border rounded mb-3" onchange="onModalUkuranChange()">
          <option value="">-- Pilih ukuran --</option>
          ${ukuranList
            .map((u) => `<option value="${u}">${u}</option>`)
            .join("")}
        </select>

        <label class="block text-sm font-medium">Warna</label>
        <select id="modal-warna" class="w-full p-2 border rounded mb-3" disabled>
          <option value="">Pilih ukuran dulu</option>
        </select>

        <div id="modal-stock" class="text-sm text-gray-600 mb-3"></div>

        <div class="flex items-center gap-2 mb-3">
          <button onclick="changeModalQty(-1)" class="px-3 py-1 border rounded">-</button>
          <input id="modal-qty" type="number" value="1" min="1" class="w-20 p-2 border rounded text-center">
          <button onclick="changeModalQty(1)" class="px-3 py-1 border rounded">+</button>
        </div>

        <div class="flex gap-2">
          <button id="btn-modal-add" onclick="modalAddToCart()" class="flex-1 bg-blue-700 text-white p-2 rounded">Tambah ke Keranjang</button>
          <button onclick="closeProductModal()" class="flex-1 border p-2 rounded">Batal</button>
        </div>
      </div>
    </div>
  `;

  // show HABIS badge if all variations out
  const outAll = currentProduct.variasi.every((v) => v.stok <= 0);
  const btn = document.getElementById("btn-modal-add");
  if (outAll) {
    btn.textContent = "HABIS";
    btn.disabled = true;
    btn.classList.add("bg-gray-400");
  } else {
    btn.textContent = "Tambah ke Keranjang";
    btn.disabled = false;
    btn.classList.remove("bg-gray-400");
  }

  modal.classList.remove("hidden");
  document.getElementById("product-title").textContent = currentProduct.nama;
}

function closeProductModal() {
  const modal = document.getElementById("product-modal");
  if (modal) modal.classList.add("hidden");
}

function onModalUkuranChange() {
  const ukuran = document.getElementById("modal-ukuran").value;
  const warnaSelect = document.getElementById("modal-warna");
  const stockInfo = document.getElementById("modal-stock");
  if (!ukuran) {
    warnaSelect.disabled = true;
    warnaSelect.innerHTML = `<option value="">Pilih ukuran dulu</option>`;
    stockInfo.textContent = "";
    return;
  }
  const variations = currentProduct.variasi.filter((v) => v.ukuran === ukuran);
  warnaSelect.disabled = false;
  warnaSelect.innerHTML =
    `<option value="">-- Pilih warna --</option>` +
    variations
      .map((v) => {
        const disabled = v.stok <= 0 ? "disabled" : "";
        const label = v.stok <= 0 ? `${v.warna} (Habis)` : v.warna;
        return `<option value="${v.warna}" ${disabled} data-stok="${v.stok}" data-harga="${v.harga}">${label}</option>`;
      })
      .join("");

  stockInfo.textContent = "";
  document.getElementById("modal-qty").value = 1;
}

function changeModalQty(delta) {
  const qEl = document.getElementById("modal-qty");
  let v = parseInt(qEl.value || "1") + delta;
  if (v < 1) v = 1;
  qEl.value = v;
}

function modalAddToCart() {
  const ukuran = document.getElementById("modal-ukuran")?.value;
  const warna = document.getElementById("modal-warna")?.value;
  const qty = parseInt(document.getElementById("modal-qty")?.value || "1");
  if (!ukuran || !warna)
    return alert("Pilih ukuran dan warna terlebih dahulu.");

  const varObj = currentProduct.variasi.find(
    (v) => v.ukuran === ukuran && v.warna === warna
  );
  if (!varObj) return alert("Variasi tidak ditemukan.");
  if (varObj.stok <= 0) return alert("Stok habis.");
  if (qty > varObj.stok) return alert("Stok tidak cukup.");

  // push to cart (merge if same product+variasi)
  const exist = cart.find(
    (c) =>
      c.id === currentProduct.id && c.ukuran === ukuran && c.warna === warna
  );
  if (exist) exist.qty += qty;
  else
    cart.push({
      id: currentProduct.id,
      nama: currentProduct.nama,
      gambar: currentProduct.gambar,
      ukuran,
      warna,
      harga: varObj.harga,
      qty,
    });

  saveCart();
  alert("Berhasil ditambahkan ke keranjang.");
  closeProductModal();
  renderKatalog(); // update badges if needed
}

/* --------- Cart modal --------- */
function openCartModal() {
  updateCartModal();
  document
    .querySelectorAll("#cart-modal")
    .forEach((m) => m.classList.remove("hidden"));
}
function closeCartModal() {
  document
    .querySelectorAll("#cart-modal")
    .forEach((m) => m.classList.add("hidden"));
}
function updateCartModal() {
  document.querySelectorAll("#cart-modal-body").forEach((body) => {
    if (!body) return;
    if (cart.length === 0) {
      body.innerHTML = `<div class="text-center text-gray-500 py-6">Keranjang kosong</div>`;
      document
        .querySelectorAll("#cart-total")
        .forEach((t) => (t.textContent = "Rp 0"));
      return;
    }
    body.innerHTML = cart
      .map(
        (it, idx) => `
      <div class="flex items-center justify-between gap-4 border-b py-3">
        <div class="flex items-center gap-3">
          <img src="img/produk/${
            it.gambar
          }" class="w-16 h-16 object-cover rounded">
          <div>
            <div class="font-semibold">${it.nama}</div>
            <div class="text-sm text-gray-600">${it.ukuran} • ${it.warna}</div>
            <div class="text-blue-700 font-bold mt-1">${formatIDR(
              it.harga
            )}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="flex items-center gap-2 justify-end">
            <button onclick="changeCartQty(${idx}, -1)" class="px-2 py-1 border rounded">-</button>
            <div>${it.qty}</div>
            <button onclick="changeCartQty(${idx}, 1)" class="px-2 py-1 border rounded">+</button>
          </div>
          <button onclick="removeCartItem(${idx})" class="text-sm text-red-500 mt-2">Hapus</button>
        </div>
      </div>
    `
      )
      .join("");

    const total = cart.reduce((s, i) => s + i.qty * i.harga, 0);
    document
      .querySelectorAll("#cart-total")
      .forEach((t) => (t.textContent = formatIDR(total)));
  });
  updateCartBadge();
}

function changeCartQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  updateCartModal();
}
function removeCartItem(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartModal();
}
function clearCart() {
  cart = [];
  saveCart();
  updateCartModal();
}
function checkoutFromModal() {
  closeCartModal();
  window.location.href = "pemesanan.html";
}

/* --------- Pemesanan page: render order summary --------- */
function renderOrderSummary() {
  const el = document.getElementById("order-summary");
  if (!el) return;
  if (cart.length === 0) {
    el.innerHTML = `<div class="text-center text-gray-500 py-6">Keranjang kosong — <a href="katalog.html" class="text-blue-600">Kembali ke katalog</a></div>`;
    return;
  }
  el.innerHTML =
    cart
      .map(
        (it) => `
    <div class="border-b py-3">
      <div class="flex justify-between">
        <div>
          <div class="font-semibold">${it.nama}</div>
          <div class="text-sm text-gray-600">${it.ukuran} • ${it.warna}</div>
          <div class="text-gray-600">Jumlah: ${it.qty}</div>
        </div>
        <div class="font-semibold">${formatIDR(it.qty * it.harga)}</div>
      </div>
    </div>
  `
      )
      .join("") +
    `<div class="mt-4 text-right font-bold">${formatIDR(
      cart.reduce((s, i) => s + i.harga * i.qty, 0)
    )}</div>`;
}

/* WA phone format helper: convert 08... to 628... */
function normalizePhoneToWA(no) {
  no = no.trim();
  no = no.replace(/\s+/g, "");
  if (no.startsWith("0")) no = "62" + no.slice(1);
  if (no.startsWith("+")) no = no.slice(1);
  return no;
}

/* completeOrder: reduce stok and open WA */
function completeOrder(e) {
  e.preventDefault();
  if (cart.length === 0) return alert("Keranjang kosong.");

  const name = document.getElementById("cust-name").value?.trim();
  let wa = document.getElementById("cust-wa").value?.trim();
  const address = document.getElementById("cust-address").value?.trim();
  if (!name || !wa || !address) return alert("Lengkapi data pemesan.");

  // check stok again and reduce
  for (const it of cart) {
    const prod = db.find((p) => p.id === it.id);
    const varObj = prod.variasi.find(
      (v) => v.ukuran === it.ukuran && v.warna === it.warna
    );
    if (!varObj) return alert(`Variasi ${it.nama} tidak ditemukan.`);
    if (varObj.stok < it.qty)
      return alert(`Stok ${it.nama} (${it.ukuran}, ${it.warna}) tidak cukup.`);
  }

  // Reduce stok
  cart.forEach((it) => {
    const prod = db.find((p) => p.id === it.id);
    const varObj = prod.variasi.find(
      (v) => v.ukuran === it.ukuran && v.warna === it.warna
    );
    varObj.stok -= it.qty;
    if (varObj.stok < 0) varObj.stok = 0;
  });

  saveDB();

  // prepare WA message
  const total = cart.reduce((s, i) => s + i.harga * i.qty, 0);
  let pesan = `Halo MZ Collection, saya ingin memesan:%0A%0A`;
  cart.forEach((it) => {
    pesan += `- ${it.nama} (${it.ukuran}, ${it.warna}) x${it.qty} = ${formatIDR(
      it.harga * it.qty
    )}%0A`;
  });
  pesan += `%0ATotal: ${formatIDR(total)}%0A%0A`;
  pesan += `Nama: ${encodeURIComponent(name)}%0A`;
  // normalize WA number
  const waNorm = normalizePhoneToWA(wa);
  pesan += `WhatsApp: ${waNorm}%0AAlamat: ${encodeURIComponent(
    address
  )}%0A%0ATerima kasih!`;

  // open WA to your number (fixed)
  const merchantWA = "628976272428";
  // clear cart, but save after building message
  cart = [];
  saveCart();
  saveDB();
  updateCartBadge();
  window.open(`https://wa.me/${merchantWA}?text=${pesan}`, "_blank");
}

/* --------- Reviews (localStorage) --------- */
function getReviews() {
  return JSON.parse(localStorage.getItem(STORAGE_REV_KEY) || "[]");
}
function saveReviews(rev) {
  localStorage.setItem(STORAGE_REV_KEY, JSON.stringify(rev));
}
function renderReviews() {
  const el = document.getElementById("review-list");
  if (!el) return;
  const rev = getReviews();
  if (rev.length === 0) {
    el.innerHTML = `<div class="text-center text-gray-500 py-10">Belum ada ulasan.</div>`;
    return;
  }
  el.innerHTML = rev
    .map(
      (r) => `
    <div class="bg-white p-5 rounded-xl shadow">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">${
          r.icon || "👤"
        }</div>
        <div>
          <div class="font-semibold">${r.name}</div>
          <div class="text-xs text-gray-500">${r.date}</div>
        </div>
      </div>
      <div class="font-semibold">${r.title}</div>
      <div class="text-gray-700 mt-1">${r.text}</div>
      <div class="text-yellow-500 mt-2">${"★".repeat(r.rating)}</div>
    </div>
  `
    )
    .join("");
}
function sendReview(e) {
  e.preventDefault();
  const name = document.getElementById("ulasan-nama").value.trim();
  const title = document.getElementById("ulasan-judul").value.trim();
  const text = document.getElementById("ulasan-text").value.trim();
  const rating = Number(document.getElementById("ulasan-rating").value);
  if (!name || !title || !text) return alert("Lengkapi semua field.");
  const rev = getReviews();
  rev.unshift({
    name,
    title,
    text,
    rating,
    date: new Date().toLocaleDateString("id-ID"),
    icon: "👤",
  });
  saveReviews(rev);
  renderReviews();
  document.getElementById("form-review")?.reset();
  alert("Terima kasih! Ulasan Anda telah disimpan.");
}

/* --------- ADMIN FUNCTIONS (admin.html) --------- */
function renderAdmin() {
  const el = document.getElementById("admin-body");
  if (!el) return;
  el.innerHTML = db
    .map(
      (p) => `
    <div class="bg-white p-4 rounded shadow mb-3">
      <div class="flex items-start gap-4">
        <img src="img/produk/${
          p.gambar
        }" class="w-20 h-20 object-cover rounded">
        <div class="flex-1">
          <div class="font-bold">${p.nama}</div>
          <div class="text-sm text-gray-600">ID: ${p.id}</div>
          <div class="mt-2">
            ${p.variasi
              .map(
                (v, idx) => `
              <div class="flex items-center gap-2 mt-2">
                <div class="flex-1 text-sm">${v.ukuran} • ${
                  v.warna
                } — ${formatIDR(v.harga)} — Stok: <strong>${
                  v.stok
                }</strong></div>
                <input type="number" min="0" value="${
                  v.stok
                }" id="admin-stock-${
                  p.id
                }-${idx}" class="w-24 p-1 border rounded">
                <button onclick="adminUpdateStock(${
                  p.id
                }, ${idx})" class="px-3 py-1 bg-blue-600 text-white rounded">Simpan</button>
                <button onclick="adminRemoveVariation(${
                  p.id
                }, ${idx})" class="px-3 py-1 bg-red-500 text-white rounded">Hapus</button>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function adminUpdateStock(productId, variationIndex) {
  const input = document.getElementById(
    `admin-stock-${productId}-${variationIndex}`
  );
  if (!input) return;
  const newStock = parseInt(input.value || "0");
  const prod = db.find((p) => p.id === productId);
  if (!prod) return alert("Produk tidak ditemukan.");
  prod.variasi[variationIndex].stok = newStock;
  saveDB();
  renderAdmin();
  renderKatalog();
  alert("Stok diperbarui.");
}

function adminRemoveVariation(productId, variationIndex) {
  const prod = db.find((p) => p.id === productId);
  if (!prod) return;
  if (!confirm("Hapus variasi ini?")) return;
  prod.variasi.splice(variationIndex, 1);
  saveDB();
  renderAdmin();
  renderKatalog();
}

function adminResetDB() {
  if (
    !confirm("Reset database ke versi awal? Semua perubahan stok akan hilang.")
  )
    return;
  localStorage.removeItem(STORAGE_DB_KEY);
  location.reload();
}

/* --------- INIT on load for pages --------- */
window.addEventListener("load", () => {
  renderLandingFeatured();
  renderKatalog();
  renderReviews();
  renderOrderSummary();
  renderAdmin?.();
  updateCartBadge();
});
