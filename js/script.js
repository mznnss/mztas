/* js/script.js — FINAL COMPLETE CODE */

/* 1. INIT STORAGE & DATA */
const STORAGE_DB_KEY = "dbProduk_vFinal"; // Reset key
const STORAGE_CART_KEY = "mz_cart";
const STORAGE_REV_KEY = "mz_reviews";

let db = typeof produk !== "undefined" ? produk : [];
// Force reset DB di localStorage
localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(db));

let cart = JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || "[]");

function saveCart() {
  localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function formatIDR(n) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

/* 2. RENDER PRODUCTS */
function createCardHTML(p) {
    const lowestPrice = Math.min(...p.variasi.map(v => v.harga));
    const isHabis = p.variasi.every(v => v.stok <= 0);
    const badgeHabis = isHabis ? `<div style="position:absolute; top:10px; right:10px; background:red; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:bold; color:white;">HABIS</div>` : '';

    let priceHtml = '';
    if (p.favorit) {
        const discount = lowestPrice * 0.8;
        priceHtml = `<span style="text-decoration:line-through; color:#aaa; font-size:0.8rem;">${formatIDR(lowestPrice)}</span> 
                     <span style="color:var(--gold-accent); font-weight:bold; font-size:1.1rem;">${formatIDR(discount)}</span>`;
    } else {
        priceHtml = `<span style="color:var(--gold-accent); font-weight:bold; font-size:1.1rem;">${formatIDR(lowestPrice)}</span>`;
    }

    return `
    <div class="product-card" onclick="openProductDetail(${p.id})">
        ${badgeHabis}
        <img src="img/produk/${p.gambar}" class="product-image" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
        <div class="product-category">${p.kategori}</div>
        <h3 class="product-title">${p.nama}</h3>
        <div class="price-wrapper">${priceHtml}</div>
        <button style="width:100%; margin-top:15px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); color:white; padding:8px; border-radius:10px; cursor:pointer;">Lihat Detail</button>
    </div>`;
}

function renderProducts(filter = 'all') {
    const container = document.getElementById("product-container");
    if (!container) return;
    const data = filter === 'all' ? db : db.filter(p => p.kategori === filter);
    container.innerHTML = data.length ? data.map(createCardHTML).join("") : `<p class="text-center col-span-full">Produk tidak ditemukan.</p>`;
}

function renderFeatured() {
    const container = document.getElementById("featured-container");
    if (!container) return;
    const data = db.filter(p => p.favorit).slice(0, 4);
    container.innerHTML = data.map(createCardHTML).join("");
}

function filterProducts(cat) {
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        if (b.innerText === cat || (cat === 'all' && b.innerText === 'Semua') || b.innerText === cat.replace('Accessories', 'Aksesoris')) b.classList.add('active');
    });
    renderProducts(cat);
}

/* 3. REVIEW SYSTEM (LOCALSTORAGE) */
function getReviews() { return JSON.parse(localStorage.getItem(STORAGE_REV_KEY) || "[]"); }
function renderReviews() {
    const container = document.getElementById("review-list");
    if (!container) return;
    const reviews = getReviews();
    if (reviews.length === 0) {
        container.innerHTML = `<p class="text-gray-400 italic">Belum ada ulasan. Jadilah yang pertama!</p>`;
        return;
    }
    container.innerHTML = reviews.map(r => `
        <div class="bg-white/5 p-4 rounded-xl border border-white/10 mb-3">
            <div class="flex text-yellow-400 text-sm mb-1">${"★".repeat(r.rating)}</div>
            <p class="text-gray-200 text-sm italic">"${r.text}"</p>
            <div class="mt-2 font-bold text-xs text-white">— ${r.name}</div>
        </div>
    `).join("");
}
function sendReview(e) {
    e.preventDefault();
    const name = document.getElementById("ulasan-nama").value;
    const text = document.getElementById("ulasan-text").value;
    const rating = document.getElementById("ulasan-rating").value;
    if (!name || !text) return alert("Lengkapi data ulasan.");

    const reviews = getReviews();
    reviews.unshift({ name, text, rating, date: new Date().toLocaleDateString() });
    localStorage.setItem(STORAGE_REV_KEY, JSON.stringify(reviews));
    
    document.getElementById("form-review").reset();
    renderReviews();
    alert("Ulasan berhasil dikirim!");
}

/* 4. CART & MODAL & CHECKOUT */
let currentProduct = null;
function openProductDetail(id) {
    currentProduct = db.find(p => p.id === id);
    if (!currentProduct) return;
    const modal = document.getElementById("product-modal");
    const body = document.getElementById("product-detail-body");
    
    const ukuranList = [...new Set(currentProduct.variasi.map(v => v.ukuran))];
    let basePrice = Math.min(...currentProduct.variasi.map(v => v.harga));
    if (currentProduct.favorit) basePrice *= 0.8;

    body.innerHTML = `
        <div class="flex flex-col md:flex-row gap-5 text-gray-800">
            <img src="img/produk/${currentProduct.gambar}" class="w-full md:w-1/2 rounded-lg object-cover shadow-md">
            <div class="flex-1">
                <h2 class="text-xl font-bold mb-1">${currentProduct.nama}</h2>
                <div class="text-blue-700 font-bold text-lg mb-3">${formatIDR(basePrice)}</div>
                
                <label class="block text-sm font-bold mb-1">Ukuran</label>
                <select id="modal-ukuran" class="w-full border p-2 rounded mb-3" onchange="updateWarna()">
                    <option value="">-- Pilih --</option>
                    ${ukuranList.map(u => `<option value="${u}">${u}</option>`).join("")}
                </select>

                <label class="block text-sm font-bold mb-1">Warna</label>
                <select id="modal-warna" class="w-full border p-2 rounded mb-4" disabled><option>Pilih ukuran dulu</option></select>

                <label class="block text-sm font-bold mb-1">Jumlah</label>
                <input id="modal-qty" type="number" value="1" min="1" class="w-20 border p-2 rounded mb-4 text-center">

                <button onclick="addToCart()" class="w-full bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition">TAMBAH KERANJANG</button>
            </div>
        </div>
    `;
    modal.classList.remove("hidden");
}

function updateWarna() {
    const ukuran = document.getElementById("modal-ukuran").value;
    const sel = document.getElementById("modal-warna");
    if (!ukuran) { sel.disabled=true; return; }
    const vars = currentProduct.variasi.filter(v => v.ukuran === ukuran);
    sel.disabled = false;
    sel.innerHTML = `<option value="">-- Pilih --</option>` + vars.map(v => `<option value="${v.warna}" ${v.stok<=0?'disabled':''}>${v.warna} ${v.stok<=0?'(Habis)':''}</option>`).join("");
}

function addToCart() {
    const ukuran = document.getElementById("modal-ukuran").value;
    const warna = document.getElementById("modal-warna").value;
    const qty = parseInt(document.getElementById("modal-qty").value);
    if (!ukuran || !warna) return alert("Pilih variasi lengkap.");
    
    const v = currentProduct.variasi.find(i => i.ukuran === ukuran && i.warna === warna);
    let price = v.harga; 
    if(currentProduct.favorit) price *= 0.8;

    const exist = cart.find(c => c.id === currentProduct.id && c.ukuran === ukuran && c.warna === warna);
    if (exist) exist.qty += qty;
    else cart.push({ id: currentProduct.id, nama: currentProduct.nama, gambar: currentProduct.gambar, ukuran, warna, harga: price, qty });
    
    saveCart();
    document.getElementById("product-modal").classList.add("hidden");
    alert("Berhasil masuk keranjang!");
}

function toggleCart() {
    const modal = document.getElementById("cart-modal");
    const body = document.getElementById("cart-modal-body");
    modal.classList.remove("hidden");
    if (!cart.length) {
        body.innerHTML = `<p class="text-center py-5 text-gray-500">Keranjang kosong</p>`;
        document.getElementById("cart-total-display").innerText = formatIDR(0);
        return;
    }
    body.innerHTML = cart.map((c, i) => `
        <div class="flex justify-between items-center border-b py-2">
            <div>
                <div class="font-bold text-sm">${c.nama}</div>
                <div class="text-xs text-gray-500">${c.ukuran}, ${c.warna} x${c.qty}</div>
            </div>
            <div class="text-right">
                <div class="text-blue-700 font-bold text-sm">${formatIDR(c.harga * c.qty)}</div>
                <button onclick="delItem(${i})" class="text-red-500 text-xs">Hapus</button>
            </div>
        </div>
    `).join("");
    document.getElementById("cart-total-display").innerText = formatIDR(cart.reduce((s, c) => s + c.harga * c.qty, 0));
}

function delItem(i) { cart.splice(i, 1); saveCart(); toggleCart(); if(document.getElementById("order-summary")) renderOrderSummary(); }
function updateCartBadge() { document.querySelectorAll(".fc-ultra-badge").forEach(e => e.innerText = cart.reduce((s,c)=>s+c.qty,0)); }
function closeProductModal() { document.getElementById("product-modal").classList.add("hidden"); }
function closeCartModal() { document.getElementById("cart-modal").classList.add("hidden"); }
function processCheckoutRedirect() { if(!cart.length)return alert("Kosong!"); window.location.href = "pemesanan.html"; }

/* 5. CHECKOUT PAGE LOGIC */
function renderOrderSummary() {
    const container = document.getElementById("order-summary");
    if (!container) return;
    if (!cart.length) return container.innerHTML = `<p class="text-center py-4 text-gray-300">Keranjang kosong.</p>`;
    
    container.innerHTML = cart.map(c => `
        <div class="flex justify-between border-b border-white/10 py-2">
            <div><div class="font-bold text-sm text-white">${c.nama}</div><div class="text-xs text-gray-400">${c.ukuran}, ${c.warna} x${c.qty}</div></div>
            <div class="font-bold text-yellow-500">${formatIDR(c.harga * c.qty)}</div>
        </div>
    `).join("") + `<div class="flex justify-between pt-3 mt-2 border-t border-white/20 font-bold text-lg"><span class="text-white">Total</span><span class="text-yellow-500">${formatIDR(cart.reduce((s,c)=>s+c.harga*c.qty,0))}</span></div>`;
}

function completeOrder(e) {
    e.preventDefault();
    if (!cart.length) return alert("Keranjang kosong.");
    const name = document.getElementById("cust-name").value;
    const wa = document.getElementById("cust-wa").value;
    const addr = document.getElementById("cust-address").value;
    
    const msg = `Halo Admin, pesanan baru:%0A%0A` + 
        cart.map(c => `- ${c.nama} (${c.ukuran}, ${c.warna}) x${c.qty}`).join("%0A") + 
        `%0A%0ATotal: ${formatIDR(cart.reduce((s,c)=>s+c.harga*c.qty,0))}%0A%0ANama: ${name}%0AWA: ${wa}%0AAlamat: ${addr}`;
    
    window.open(`https://wa.me/628976272428?text=${msg}`, "_blank");
}

/* INIT */
window.addEventListener("load", () => {
    if(document.getElementById("product-container")) renderProducts('all');
    if(document.getElementById("featured-container")) renderFeatured();
    if(document.getElementById("review-list")) renderReviews();
    if(document.getElementById("order-summary")) renderOrderSummary();
    updateCartBadge();
});
        
