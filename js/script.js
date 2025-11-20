/* js/script.js — MODIFIED BY ChatGPT (final)
   Integrasi:
   - Support `produk` (old) or window.APP_DB.PRODUCTS (new)
   - Favorite discount support (FAVORITE_DISCOUNT)
   - Category filter + search
   - Floating cart (.fc-ultra) + cart modal usable on mobile
   - Modal product detail + variasi/stock checks
   - Cart saved in localStorage (mz_cart)
   - Checkout reduces stock, opens WA, clears cart
   - Reviews localStorage, admin helpers
*/

/* ====== Config & storage keys ====== */
const STORAGE_DB_KEY = "dbProduk";
const STORAGE_CART_KEY = "mz_cart";
const STORAGE_REV_KEY = "mz_reviews";

// Favorite discount (try APP_DB, fallback 20)
const FAVORITE_DISCOUNT =
  (window.APP_DB && window.APP_DB.FAVORITE_DISCOUNT) || 20;

/* ====== Load DB (normalize structure) ====== */
let db = JSON.parse(localStorage.getItem(STORAGE_DB_KEY) || "null");
if (!db) {
  // try several sources: produk (old format) or APP_DB.PRODUCTS (simpler format)
  if (typeof produk !== "undefined") {
    // assume produk already has {id,nama,gambar,variasi:[{ukuran,warna,harga,stok}],favorit}
    db = produk;
  } else if (window.APP_DB && Array.isArray(window.APP_DB.PRODUCTS)) {
    // convert PRODUCTS to our expected schema with one default variation
    db = window.APP_DB.PRODUCTS.map((p, i) => ({
      id: p.id ?? i + 1,
      nama: p.name ?? p.nama ?? `Produk ${i + 1}`,
      gambar: p.image?.replace(/^img\//, "")?.replace(/^\/+/, "") ?? (p.gambar || `tas${i+1}.png`),
      favorit: !!p.favorite || !!p.favorit,
      variasi: [
        {
          ukuran: p.size || p.ukuran || "S",
          warna: p.color || p.warna || "Default",
          harga: p.price || p.harga || 0,
          stok: typeof p.stock !== "undefined" ? p.stock : (p.stok ?? 999)
        }
      ]
    }));
  } else {
    db = [];
  }
  localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(db));
} else {
  // ensure window.produk exists for legacy pages
  window.produk = db;
}

/* ====== Cart ====== */
let cart = JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || "[]");
function saveDB() {
  localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(db));
}
function saveCart() {
  localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

/* ====== Helpers ====== */
function formatIDR(n) {
  if (typeof n !== "number") n = Number(n) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}
function getLowestPrice(product) {
  if (!product || !product.variasi) return 0;
  return Math.min(...product.variasi.map((v) => Number(v.harga || v.price || 0)));
}
function applyFavoriteDiscount(price) {
  if (!FAVORITE_DISCOUNT) return price;
  return Math.round(price * (100 - FAVORITE_DISCOUNT) / 100);
}

/* ====== Cart badge (works across pages) ====== */
function updateCartBadge() {
  const totalQty = cart.reduce((s, it) => s + (it.qty || 0), 0);
  document
    .querySelectorAll(
      "#cart-count, #cart-count-2, #cart-count-3, #cart-count-pemesanan, .cart-count-float"
    )
    .forEach((el) => {
      if (el) el.textContent = totalQty;
    });
  // also update floating badge if exists
  const floatBadge = document.querySelector(".fc-ultra-badge");
  if (floatBadge) floatBadge.textContent = totalQty;
}
updateCartBadge();

/* ====== Global UI: categories + search ====== */
function renderCategories(containerId = "filter-buttons") {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  const cats = Array.from(new Set(db.flatMap(p => (p.kategori ? [p.kategori] : [])).concat(db.flatMap(p => p.kategori ? [] : (p.tags || [])))));
  // fallback: derive from variasi/produk by simple heuristics (kategori property, or nama)
  // Build categories from product.category / product.kategori / product.tags or from variations names
  const derived = Array.from(new Set(db.map(p => p.kategori || p.category || p.tags?.[0] || (p.nama || p.name).split(" ")[0].toLowerCase())));
  const finalCats = derived.filter(Boolean);
  // render
  wrap.innerHTML = `<button class="btn primary" data-cat="all">Semua</button>` +
    finalCats.map(c => `<button class="btn" data-cat="${c}">${String(c).charAt(0).toUpperCase()}${String(c).slice(1)}</button>`).join("");
  wrap.querySelectorAll("button").forEach(b => {
    b.addEventListener("click", () => {
      wrap.querySelectorAll("button").forEach(x => x.classList.remove("primary"));
      b.classList.add("primary");
      const cat = b.dataset.cat;
      renderKatalog(cat, document.getElementById("global-search")?.value || "");
    });
  });
}

/* ====== Render katalog (cards) ====== */
function renderKatalog(filter = "all", search = "") {
  const container = document.getElementById("katalog-list") || document.getElementById("products-grid");
  if (!container) return;
  const q = (search || "").trim().toLowerCase();
  const list = db.filter(p => {
    if (filter && filter !== "all") {
      const c = (p.kategori || p.category || p.tags?.[0] || "").toString().toLowerCase();
      if (!c.includes(filter.toString().toLowerCase())) return false;
    }
    if (q) {
      if (!((p.nama || p.name || "").toString().toLowerCase().includes(q))) return false;
    }
    return true;
  });

  if (list.length === 0) {
    container.innerHTML = `<div class="kicker">Produk tidak ditemukan.</div>`;
    return;
  }

  container.innerHTML = list.map(p => {
    const lowest = getLowestPrice(p);
    const isFav = !!p.favorit || !!p.favorit === undefined ? !!p.favorit : !!p.favorite;
    // If favorit true AND FAVORITE_DISCOUNT > 0, calculate discounted lowest
    const hasDiscount = (p.favorit || p.favorite) && FAVORITE_DISCOUNT > 0;
    const discPrice = hasDiscount ? applyFavoriteDiscount(lowest) : lowest;
    const outAll = p.variasi.every(v => v.stok <= 0);
    const badge = outAll ? `<span class="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm">HABIS</span>` : (hasDiscount ? `<span class="absolute top-3 left-3 badge">-${FAVORITE_DISCOUNT}%</span>` : "");
    return `
      <div class="relative card" onclick="openProductDetail(${p.id})" style="cursor:pointer">
        ${badge}
        <div class="h-44 overflow-hidden rounded-lg">
          <img src="img/produk/${p.gambar}" class="w-full h-full object-cover" alt="${p.nama}">
        </div>
        <h3 class="font-semibold mt-3">${p.nama}</h3>
        <div class="text-blue-700 font-bold mt-1">
          ${hasDiscount ? `<span class="old">${formatIDR(lowest)}</span> ${formatIDR(discPrice)}` : formatIDR(lowest)}
        </div>
        <div class="mt-3 text-sm kicker">Klik untuk lihat detail</div>
      </div>
    `;
  }).join("");
}

/* ====== Product modal handling ====== */
let currentProduct = null;
function openProductDetail(id) {
  currentProduct = db.find(d => d.id === id);
  if (!currentProduct) return alert("Produk tidak ditemukan.");
  // build modal elements (assume modal skeleton exists with ids used below)
  const modal = document.getElementById("product-modal");
  const body = document.getElementById("product-detail-body");
  if (!modal || !body) {
    // Fallback: create a basic modal and append to body
    createBasicProductModalSkeleton();
  }
  // now assume elements exist
  const ukuranList = Array.from(new Set(currentProduct.variasi.map(v => v.ukuran)));
  const hasDiscount = (currentProduct.favorit || currentProduct.favorite) && FAVORITE_DISCOUNT > 0;
  const lowest = getLowestPrice(currentProduct);
  const displayedPrice = hasDiscount ? applyFavoriteDiscount(lowest) : lowest;
  document.getElementById("product-title").textContent = currentProduct.nama;
  const modalBody = document.getElementById("product-detail-body");
  modalBody.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <img src="img/produk/${currentProduct.gambar}" class="w-full h-64 object-cover rounded-lg" alt="${currentProduct.nama}">
      </div>
      <div>
        <h2 class="text-xl font-bold mb-1">${currentProduct.nama}</h2>
        <div id="modal-price" class="text-blue-700 font-semibold mb-3">
          ${hasDiscount ? `<span class="old">${formatIDR(lowest)}</span> ${formatIDR(displayedPrice)}` : formatIDR(lowest)}
        </div>
        <label class="block text-sm font-medium">Ukuran</label>
        <select id="modal-ukuran" class="w-full p-2 border rounded mb-3" onchange="onModalUkuranChange()">
          <option value="">-- Pilih ukuran --</option>
          ${ukuranList.map(u => `<option value="${u}">${u}</option>`).join("")}
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
  // disable if no stock
  const outAll = currentProduct.variasi.every(v => v.stok <= 0);
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
  document.getElementById("product-modal").classList.remove("hidden");
}

function createBasicProductModalSkeleton() {
  // create minimal modal skeleton appended to body so other functions can fill content
  if (document.getElementById("product-modal")) return;
  const modal = document.createElement("div");
  modal.id = "product-modal";
  modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50";
  modal.innerHTML = `<div class="bg-white text-black max-w-3xl w-full p-4 rounded-lg relative">
    <button onclick="closeProductModal()" style="position:absolute;right:10px;top:10px">✕</button>
    <h3 id="product-title" class="font-bold mb-2"></h3>
    <div id="product-detail-body"></div>
  </div>`;
  document.body.appendChild(modal);
}

function closeProductModal() {
  const m = document.getElementById("product-modal");
  if (m) m.classList.add("hidden");
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
  warnaSelect.innerHTML = `<option value="">-- Pilih warna --</option>` +
    variations.map(v => {
      const disabled = v.stok <= 0 ? "disabled" : "";
      const label = v.stok <= 0 ? `${v.warna} (Habis)` : `${v.warna}`;
      return `<option value="${v.warna}" ${disabled} data-stok="${v.stok}" data-harga="${v.harga}">${label}</option>`;
    }).join("");
  stockInfo.textContent = "";
  document.getElementById("modal-qty").value = 1;
}
function changeModalQty(delta) {
  const qEl = document.getElementById("modal-qty");
  if (!qEl) return;
  let v = parseInt(qEl.value || "1") + delta;
  if (v < 1) v = 1;
  qEl.value = v;
}
function modalAddToCart() {
  const ukuran = document.getElementById("modal-ukuran")?.value;
  const warna = document.getElementById("modal-warna")?.value;
  const qty = parseInt(document.getElementById("modal-qty")?.value || "1");
  if (!ukuran || !warna) return alert("Pilih ukuran dan warna terlebih dahulu.");
  const varObj = currentProduct.variasi.find(v => v.ukuran === ukuran && v.warna === warna);
  if (!varObj) return alert("Variasi tidak ditemukan.");
  if (varObj.stok <= 0) return alert("Stok habis.");
  if (qty > varObj.stok) return alert("Stok tidak cukup.");

  // price: apply favorite discount if product favorit
  const basePrice = Number(varObj.harga);
  const finalPrice = (currentProduct.favorit || currentProduct.favorite) ? applyFavoriteDiscount(basePrice) : basePrice;

  const exist = cart.find(c => c.id === currentProduct.id && c.ukuran === ukuran && c.warna === warna);
  if (exist) exist.qty += qty;
  else cart.push({
    id: currentProduct.id,
    nama: currentProduct.nama,
    gambar: currentProduct.gambar,
    ukuran,
    warna,
    harga: finalPrice,
    baseHarga: basePrice,
    qty
  });

  saveCart();
  alert("Berhasil ditambahkan ke keranjang.");
  closeProductModal();
  renderKatalog(); // update HABIS badges
}

/* ====== Cart modal / floating cart handling ====== */
function openCartModal() {
  // ensure modal exists
  if (!document.getElementById("cart-modal")) createBasicCartModal();
  updateCartModal();
  document.getElementById("cart-modal").classList.remove("hidden");
}
function closeCartModal() {
  const m = document.getElementById("cart-modal");
  if (m) m.classList.add("hidden");
}
function createBasicCartModal() {
  if (document.getElementById("cart-modal")) return;
  const modal = document.createElement("div");
  modal.id = "cart-modal";
  modal.className = "fixed inset-0 z-50 flex items-start justify-end p-4";
  modal.style.pointerEvents = "auto";
  modal.innerHTML = `<div class="bg-white text-black w-full max-w-md rounded-lg shadow-lg p-4">
    <div class="flex justify-between items-center mb-3">
      <h3 class="font-bold">Keranjang</h3>
      <button onclick="closeCartModal()">✕</button>
    </div>
    <div id="cart-modal-body" class="max-h-72 overflow:auto"></div>
    <div class="mt-3 flex justify-between items-center">
      <div><strong>Total</strong></div>
      <div id="cart-total" class="font-bold">Rp 0</div>
    </div>
    <div class="mt-3 flex gap-2">
      <button onclick="checkoutFromModal()" class="flex-1 bg-blue-700 text-white p-2 rounded">Checkout</button>
      <button onclick="clearCart()" class="flex-1 border p-2 rounded">Kosongkan</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}
function updateCartModal() {
  if (!document.getElementById("cart-modal")) return;
  const body = document.getElementById("cart-modal-body");
  if (!body) return;
  if (cart.length === 0) {
    body.innerHTML = `<div class="text-center text-gray-500 py-6">Keranjang kosong</div>`;
    document.querySelectorAll("#cart-total").forEach(t => t.textContent = formatIDR(0));
    updateCartBadge();
    return;
  }
  body.innerHTML = cart.map((it, idx) => `
    <div class="flex items-center justify-between gap-4 border-b py-3">
      <div class="flex items-center gap-3">
        <img src="img/produk/${it.gambar}" class="w-16 h-16 object-cover rounded" alt="${it.nama}">
        <div>
          <div class="font-semibold">${it.nama}</div>
          <div class="text-sm kicker">${it.ukuran} • ${it.warna}</div>
          <div class="text-blue-700 font-bold mt-1">${formatIDR(it.harga)}</div>
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
  `).join("");
  const total = cart.reduce((s,i) => s + i.qty * i.harga, 0);
  document.querySelectorAll("#cart-total").forEach(t => t.textContent = formatIDR(total));
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
  if (!confirm("Kosongkan keranjang?")) return;
  cart = [];
  saveCart();
  updateCartModal();
}
function checkoutFromModal() {
  closeCartModal();
  window.location.href = "pemesanan.html";
}

/* ====== Pemesanan page ====== */
function renderOrderSummary() {
  const el = document.getElementById("order-summary");
  if (!el) return;
  if (cart.length === 0) {
    el.innerHTML = `<div class="text-center kicker py-6">Keranjang kosong — <a href="katalog.html">Kembali ke katalog</a></div>`;
    return;
  }
  el.innerHTML = cart.map(it => `
    <div class="border-b py-3">
      <div class="flex justify-between">
        <div>
          <div class="font-semibold">${it.nama}</div>
          <div class="text-sm kicker">${it.ukuran} • ${it.warna}</div>
          <div class="text-gray-600">Jumlah: ${it.qty}</div>
        </div>
        <div class="font-semibold">${formatIDR(it.qty * it.harga)}</div>
      </div>
    </div>
  `).join("") + `<div class="mt-4 text-right font-bold">${formatIDR(cart.reduce((s,i)=> s + i.harga * i.qty, 0))}</div>`;
}

/* ====== Phone normalization for WA ====== */
function normalizePhoneToWA(no) {
  if (!no) return "";
  no = no.trim().replace(/\s+/g, "");
  if (no.startsWith("0")) no = "62" + no.slice(1);
  if (no.startsWith("+")) no = no.slice(1);
  return no;
}

/* ====== Complete order (reduce stok + open WA) ====== */
function completeOrder(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (cart.length === 0) return alert("Keranjang kosong.");
  const name = document.getElementById("cust-name")?.value?.trim();
  let wa = document.getElementById("cust-wa")?.value?.trim();
  const address = document.getElementById("cust-address")?.value?.trim();
  if (!name || !wa || !address) return alert("Lengkapi data pemesan.");

  // validate stok
  for (const it of cart) {
    const prod = db.find(p => p.id === it.id);
    if (!prod) return alert(`Produk ${it.nama} tidak ditemukan.`);
    const varObj = prod.variasi.find(v => v.ukuran === it.ukuran && v.warna === it.warna);
    if (!varObj) return alert(`Variasi ${it.nama} tidak ditemukan.`);
    if (varObj.stok < it.qty) return alert(`Stok ${it.nama} (${it.ukuran}, ${it.warna}) tidak cukup.`);
  }

  // reduce stok
  cart.forEach(it => {
    const prod = db.find(p => p.id === it.id);
    const varObj = prod.variasi.find(v => v.ukuran === it.ukuran && v.warna === it.warna);
    varObj.stok -= it.qty;
    if (varObj.stok < 0) varObj.stok = 0;
  });
  saveDB();

  // build WA message
  const total = cart.reduce((s,i) => s + i.harga * i.qty, 0);
  let pesan = `Halo, saya ingin memesan:%0A%0A`;
  cart.forEach(it => {
    pesan += `- ${it.nama} (${it.ukuran}, ${it.warna}) x${it.qty} = ${formatIDR(it.harga * it.qty)}%0A`;
  });
  pesan += `%0ATotal: ${formatIDR(total)}%0A%0A`;
  pesan += `Nama: ${encodeURIComponent(name)}%0A`;
  const waNorm = normalizePhoneToWA(wa);
  pesan += `WhatsApp: ${waNorm}%0AAlamat: ${encodeURIComponent(address)}%0A%0ATerima kasih!`;

  // merchant WA number (change if needed)
  const merchantWA = "628976272428";
  // clear cart and persist
  cart = [];
  saveCart();
  saveDB();
  updateCartBadge();
  // open WA
  window.open(`https://wa.me/${merchantWA}?text=${pesan}`, "_blank");
}

/* ====== Reviews (localStorage) ====== */
function getReviews() {
  return JSON.parse(localStorage.getItem(STORAGE_REV_KEY) || "[]");
}
function saveReviews(rev) {
  localStorage.setItem(STORAGE_REV_KEY, JSON.stringify(rev));
}
function renderReviews() {
