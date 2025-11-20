/* js/script.js — LUXURY EDITION (FINAL REVISION) */

/* ================= 1. INIT & STORAGE ================= */
const STORAGE_DB_KEY = "dbProduk";
const STORAGE_CART_KEY = "mz_cart";

let db = JSON.parse(localStorage.getItem(STORAGE_DB_KEY) || "null");
if (!db) {
  db = typeof produk !== "undefined" ? produk : [];
  localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(db));
}

let cart = JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || "[]");

function saveDB() { localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(db)); }
function saveCart() {
  localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function formatIDR(n) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

/* ================= 2. RENDER LOGIC ================= */

// A. Render Katalog Lengkap (Untuk Halaman Katalog)
function renderProducts(filter = 'all') {
    const container = document.getElementById("product-container");
    if (!container) return; // Stop jika elemen tidak ada (misal di halaman Home)

    container.innerHTML = '';
    const filteredData = filter === 'all' ? db : db.filter(p => p.kategori === filter);

    if (filteredData.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:40px;">Produk tidak ditemukan.</div>`;
        return;
    }
    container.innerHTML = filteredData.map(p => createCardHTML(p)).join("");
}

// B. Render Featured / Favorit Saja (Untuk Halaman Home/Index)
function renderFeatured() {
    const container = document.getElementById("featured-container");
    if (!container) return; // Stop jika elemen tidak ada

    // Ambil hanya yang favorit, dan batasi cuma 4 item
    const featuredData = db.filter(p => p.favorit).slice(0, 4);

    container.innerHTML = featuredData.map(p => createCardHTML(p)).join("");
}

// Helper: Membuat HTML Card agar konsisten
function createCardHTML(p) {
    const lowestPrice = Math.min(...p.variasi.map(v => v.harga));
    const isHabis = p.variasi.every(v => v.stok <= 0);
    const badgeHabis = isHabis ? `<div style="position:absolute; top:10px; right:10px; background:red; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:bold; z-index:10;">HABIS</div>` : '';

    let priceHtml = '';
    let displayPrice = lowestPrice;
    
    if (p.favorit) {
        const discountPrice = lowestPrice * 0.8; 
        priceHtml = `
            <span class="price-original">${formatIDR(lowestPrice)}</span>
            <span class="discount-tag">20% OFF</span>
            <div class="price-final">${formatIDR(discountPrice)}</div>
        `;
    } else {
        priceHtml = `<div class="price-final">${formatIDR(lowestPrice)}</div>`;
    }

    return `
    <div class="product-card" onclick="openProductDetail(${p.id})">
        ${badgeHabis}
        <img src="img/produk/${p.gambar}" class="product-image" alt="${p.nama}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
        <div class="product-category">${p.kategori || 'General'}</div>
        <h3 class="product-title">${p.nama}</h3>
        <div class="price-wrapper">${priceHtml}</div>
        <button style="width:100%; margin-top:15px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); color:white; padding:8px; border-radius:10px; cursor:pointer; transition:0.3s;" 
                onmouseover="this.style.background='var(--gold-accent)'; this.style.color='black'" 
                onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.color='white'">
            ${isHabis ? 'Stok Habis' : 'Lihat Detail'}
        </button>
    </div>
    `;
}

function filterProducts(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText === category || (category === 'all' && btn.innerText === 'Semua')) btn.classList.add('active');
        if(category === 'Backpack' && btn.innerText === 'Backpack') btn.classList.add('active');
        if(category === 'Slingbag' && btn.innerText === 'Slingbag') btn.classList.add('active');
        if(category === 'Handbag' && btn.innerText === 'Handbag') btn.classList.add('active');
        if(category === 'Travel' && btn.innerText === 'Travel') btn.classList.add('active');
    });
    renderProducts(category);
}

/* ================= 3. CART & MODAL LOGIC ================= */
// ... (SAMA SEPERTI SEBELUMNYA, TIDAK ADA PERUBAHAN LOGIKA DI BAWAH INI) ...

function updateCartBadge() {
    const totalQty = cart.reduce((s, it) => s + it.qty, 0);
    const badge = document.querySelector(".fc-ultra-badge");
    if (badge) {
        badge.textContent = totalQty;
        badge.style.transform = "scale(1.5)";
        setTimeout(() => badge.style.transform = "scale(1)", 200);
    }
}

function toggleCart() { openCartModal(); }

let currentProduct = null;
function openProductDetail(id) {
    currentProduct = db.find((d) => d.id === id);
    if (!currentProduct) return;

    const modal = document.getElementById("product-modal");
    const body = document.getElementById("product-detail-body");
    if (!modal || !body) return;

    const ukuranList = [...new Set(currentProduct.variasi.map((v) => v.ukuran))];
    let basePrice = Math.min(...currentProduct.variasi.map(v => v.harga));
    if(currentProduct.favorit) basePrice = basePrice * 0.8;

    body.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; gap:20px; color: #333;">
      <div style="flex:1; min-width:250px;">
        <img src="img/produk/${currentProduct.gambar}" style="width:100%; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
      </div>
      <div style="flex:1; min-width:250px;">
        <h2 style="font-size:1.5rem; font-weight:bold; margin-bottom:5px;">${currentProduct.nama}</h2>
        <div style="color:#004d7a; font-weight:bold; font-size:1.2rem; margin-bottom:15px;">
            ${formatIDR(basePrice)} ${currentProduct.favorit ? '<span style="font-size:0.8rem; color:red; background:#ffcccc; padding:2px 5px; border-radius:4px;">Promo</span>' : ''}
        </div>
        <div style="margin-bottom:10px;">
            <label style="display:block; font-size:0.9rem; font-weight:600; margin-bottom:5px;">Pilih Ukuran:</label>
            <select id="modal-ukuran" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:5px;" onchange="onModalUkuranChange()">
            <option value="">-- Pilih --</option>
            ${ukuranList.map((u) => `<option value="${u}">${u}</option>`).join("")}
            </select>
        </div>
        <div style="margin-bottom:15px;">
            <label style="display:block; font-size:0.9rem; font-weight:600; margin-bottom:5px;">Pilih Warna:</label>
            <select id="modal-warna" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:5px;" disabled>
            <option value="">Pilih ukuran dulu</option>
            </select>
        </div>
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:20px;">
            <button onclick="changeModalQty(-1)" style="padding:5px 10px; border:1px solid #ccc; background:#eee;">-</button>
            <input id="modal-qty" type="number" value="1" min="1" style="width:50px; text-align:center; padding:5px; border:1px solid #ccc;">
            <button onclick="changeModalQty(1)" style="padding:5px 10px; border:1px solid #ccc; background:#eee;">+</button>
        </div>
        <div style="display:flex; gap:10px;">
            <button onclick="modalAddToCart()" style="flex:1; background:#004d7a; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;">+ Keranjang</button>
        </div>
      </div>
    </div>`;
    modal.classList.remove("hidden");
}

function closeProductModal() { document.getElementById("product-modal").classList.add("hidden"); }

function onModalUkuranChange() {
    const ukuran = document.getElementById("modal-ukuran").value;
    const warnaSelect = document.getElementById("modal-warna");
    if (!ukuran) {
        warnaSelect.disabled = true;
        warnaSelect.innerHTML = `<option value="">Pilih ukuran dulu</option>`;
        return;
    }
    const variations = currentProduct.variasi.filter((v) => v.ukuran === ukuran);
    warnaSelect.disabled = false;
    warnaSelect.innerHTML = `<option value="">-- Pilih Warna --</option>` +
        variations.map((v) => {
            const disabled = v.stok <= 0 ? "disabled" : "";
            return `<option value="${v.warna}" ${disabled}>${v.warna} ${v.stok<=0?'(Habis)':''}</option>`;
        }).join("");
}

function changeModalQty(delta) {
    const qEl = document.getElementById("modal-qty");
    let v = parseInt(qEl.value || "1") + delta;
    if (v < 1) v = 1;
    qEl.value = v;
}

function modalAddToCart() {
    const ukuran = document.getElementById("modal-ukuran").value;
    const warna = document.getElementById("modal-warna").value;
    const qty = parseInt(document.getElementById("modal-qty").value);
    if (!ukuran || !warna) return alert("Mohon pilih ukuran dan warna.");
    
    const varObj = currentProduct.variasi.find(v => v.ukuran === ukuran && v.warna === warna);
    let finalPrice = varObj.harga;
    if (currentProduct.favorit) finalPrice = finalPrice * 0.8;

    const exist = cart.find(c => c.id === currentProduct.id && c.ukuran === ukuran && c.warna === warna);
    if (exist) exist.qty += qty;
    else cart.push({ id: currentProduct.id, nama: currentProduct.nama, gambar: currentProduct.gambar, ukuran, warna, harga: finalPrice, qty });

    saveCart();
    alert("Masuk keranjang!");
    closeProductModal();
}

function openCartModal() {
    const modal = document.getElementById("cart-modal");
    const body = document.getElementById("cart-modal-body");
    if(!modal) return;
    modal.classList.remove("hidden");
    if (cart.length === 0) {
        body.innerHTML = `<p style="text-align:center; padding:20px;">Keranjang Kosong</p>`;
        document.getElementById("cart-total-display").innerText = formatIDR(0);
        return;
    }
    body.innerHTML = cart.map((item, idx) => `
        <div style="display:flex; gap:10px; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px; color:#333;">
            <img src="img/produk/${item.gambar}" style="width:40px; height:40px; object-fit:cover;">
            <div style="flex:1;">
                <div style="font-size:0.9rem; font-weight:bold;">${item.nama}</div>
                <div style="font-size:0.8rem;">${item.ukuran}, ${item.warna} (x${item.qty})</div>
            </div>
            <div style="font-weight:bold;">${formatIDR(item.harga * item.qty)}</div>
            <button onclick="removeCartItem(${idx})" style="color:red; border:none; background:none; cursor:pointer;">x</button>
        </div>
    `).join("");
    const total = cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);
    document.getElementById("cart-total-display").innerText = formatIDR(total);
}

function removeCartItem(idx) {
    cart.splice(idx, 1);
    saveCart();
    openCartModal();
}
function closeCartModal() { document.getElementById("cart-modal").classList.add("hidden"); }

function processCheckout() {
    if(cart.length === 0) return alert("Keranjang kosong!");
    const waNumber = "628976272428";
    let message = `Halo, saya mau pesan:%0A%0A`;
    let total = 0;
    cart.forEach(item => {
        const subtotal = item.harga * item.qty;
        total += subtotal;
        message += `- ${item.nama} (${item.ukuran}, ${item.warna}) x${item.qty} = ${formatIDR(subtotal)}%0A`;
    });
    message += `%0A*Total: ${formatIDR(total)}*`;
    window.open(`https://wa.me/${waNumber}?text=${message}`, "_blank");
}

/* ================= INIT ================= */
window.addEventListener("load", () => {
    // Cek halaman mana yang sedang aktif
    if(document.getElementById("product-container")) renderProducts('all');
    if(document.getElementById("featured-container")) renderFeatured();
    updateCartBadge();
});
function formatIDR(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

/* ==========================================================================
   2. CORE UI: RENDER PRODUK (MODERN CARD)
   ========================================================================== */

// Fungsi Utama Render dengan Filter
function renderProducts(filter = 'all') {
    const container = document.getElementById("product-container"); // Pastikan ID ini ada di HTML
    if (!container) return;

    container.innerHTML = ''; // Reset isi

    // 1. Filter Logic
    const filteredData = filter === 'all' 
        ? db 
        : db.filter(p => p.kategori === filter);

    // 2. Generate HTML
    if (filteredData.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:40px;">Produk tidak ditemukan di kategori ini.</div>`;
        return;
    }

    container.innerHTML = filteredData.map(p => {
        // Cari harga terendah dari variasi
        const lowestPrice = Math.min(...p.variasi.map(v => v.harga));
        
        // Cek Stok Habis Total
        const isHabis = p.variasi.every(v => v.stok <= 0);
        const badgeHabis = isHabis ? `<div style="position:absolute; top:10px; right:10px; background:red; padding:5px 10px; border-radius:5px; font-size:12px; font-weight:bold; z-index:10;">HABIS</div>` : '';

        // Logika Diskon (Jika Favorit = True)
        let priceHtml = '';
        let displayPrice = lowestPrice;
        
        if (p.favorit) {
            const discountPrice = lowestPrice * 0.8; // Diskon 20%
            displayPrice = discountPrice;
            priceHtml = `
                <span class="price-original">${formatIDR(lowestPrice)}</span>
                <span class="discount-tag">20% OFF</span>
                <div class="price-final">${formatIDR(discountPrice)}</div>
            `;
        } else {
            priceHtml = `<div class="price-final">${formatIDR(lowestPrice)}</div>`;
        }

        // HTML Card Modern
        return `
        <div class="product-card" onclick="openProductDetail(${p.id})">
            ${badgeHabis}
            <img src="img/produk/${p.gambar}" class="product-image" alt="${p.nama}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
            
            <div class="product-category">${p.kategori || 'General'}</div>
            <h3 class="product-title">${p.nama}</h3>
            
            <div class="price-wrapper">
                ${priceHtml}
            </div>
            
            <button style="width:100%; margin-top:15px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); color:white; padding:8px; border-radius:10px; cursor:pointer; transition:0.3s;" 
                    onmouseover="this.style.background='var(--gold-accent)'; this.style.color='black'" 
                    onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.color='white'">
                ${isHabis ? 'Stok Habis' : 'Lihat Detail'}
            </button>
        </div>
        `;
    }).join("");
}

// Fungsi Handle Klik Tombol Filter
function filterProducts(category) {
    // Update UI Tombol Active
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        // Logika sederhana untuk mencocokkan teks tombol dengan kategori
        const btnText = btn.innerText;
        if (btnText === category || (category === 'all' && btnText === 'Semua')) {
            btn.classList.add('active');
        }
        // Mapping manual jika teks tombol beda dengan value kategori
        if(category === 'Backpack' && btnText === 'Backpack') btn.classList.add('active');
        if(category === 'Slingbag' && btnText === 'Slingbag') btn.classList.add('active');
        if(category === 'Handbag' && btnText === 'Handbag') btn.classList.add('active');
    });

    renderProducts(category);
}

/* ==========================================================================
   3. FLOATING CART LOGIC
   ========================================================================== */

// Update Angka di Floating Cart Badge
function updateCartBadge() {
    const totalQty = cart.reduce((s, it) => s + it.qty, 0);
    
    // Update badge di Floating Cart (.fc-ultra-badge)
    const badge = document.querySelector(".fc-ultra-badge");
    if (badge) {
        badge.textContent = totalQty;
        // Efek 'pop' saat angka berubah
        badge.style.transform = "scale(1.5)";
        setTimeout(() => badge.style.transform = "scale(1)", 200);
    }
}

// Fungsi yang dipanggil saat tombol keranjang diklik
function toggleCart() {
    openCartModal();
}

/* ==========================================================================
   4. MODAL DETAIL PRODUK & ADD TO CART
   ========================================================================== */
let currentProduct = null;

function openProductDetail(id) {
    currentProduct = db.find((d) => d.id === id);
    if (!currentProduct) return;

    // Pastikan HTML punya elemen modal (lihat bagian bawah jawaban ini untuk struktur HTML Modal)
    const modal = document.getElementById("product-modal");
    const body = document.getElementById("product-detail-body");
    if (!modal || !body) return alert("Modal HTML belum dipasang!");

    // Ambil list ukuran unik
    const ukuranList = [...new Set(currentProduct.variasi.map((v) => v.ukuran))];
    
    // Cek harga dasar (untuk display awal)
    let basePrice = Math.min(...currentProduct.variasi.map(v => v.harga));
    if(currentProduct.favorit) basePrice = basePrice * 0.8; // Terapkan diskon tampilan

    // Render Isi Modal (Desain disesuaikan agar bersih)
    body.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; gap:20px; color: #333;">
      <div style="flex:1; min-width:250px;">
        <img src="img/produk/${currentProduct.gambar}" style="width:100%; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
      </div>
      <div style="flex:1; min-width:250px;">
        <h2 style="font-size:1.5rem; font-weight:bold; margin-bottom:5px;">${currentProduct.nama}</h2>
        <div style="color:#004d7a; font-weight:bold; font-size:1.2rem; margin-bottom:15px;">
            ${formatIDR(basePrice)} ${currentProduct.favorit ? '<span style="font-size:0.8rem; color:red; background:#ffcccc; padding:2px 5px; border-radius:4px;">Promo</span>' : ''}
        </div>

        <div style="margin-bottom:10px;">
            <label style="display:block; font-size:0.9rem; font-weight:600; margin-bottom:5px;">Pilih Ukuran:</label>
            <select id="modal-ukuran" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:5px;" onchange="onModalUkuranChange()">
            <option value="">-- Pilih --</option>
            ${ukuranList.map((u) => `<option value="${u}">${u}</option>`).join("")}
            </select>
        </div>

        <div style="margin-bottom:15px;">
            <label style="display:block; font-size:0.9rem; font-weight:600; margin-bottom:5px;">Pilih Warna:</label>
            <select id="modal-warna" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:5px;" disabled>
            <option value="">Pilih ukuran dulu</option>
            </select>
        </div>

        <div id="modal-stock" style="font-size:0.85rem; color:#666; margin-bottom:15px;"></div>

        <div style="display:flex; gap:10px; align-items:center; margin-bottom:20px;">
            <button onclick="changeModalQty(-1)" style="padding:5px 10px; border:1px solid #ccc; background:#eee;">-</button>
            <input id="modal-qty" type="number" value="1" min="1" style="width:50px; text-align:center; padding:5px; border:1px solid #ccc;">
            <button onclick="changeModalQty(1)" style="padding:5px 10px; border:1px solid #ccc; background:#eee;">+</button>
        </div>

        <div style="display:flex; gap:10px;">
            <button id="btn-modal-add" onclick="modalAddToCart()" style="flex:1; background:#004d7a; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;">+ Keranjang</button>
            <button onclick="closeProductModal()" style="background:white; border:1px solid #ccc; padding:12px; border-radius:8px; cursor:pointer;">Batal</button>
        </div>
      </div>
    </div>
    `;

    modal.classList.remove("hidden"); // Munculkan modal
}

function closeProductModal() {
    document.getElementById("product-modal").classList.add("hidden");
}

function onModalUkuranChange() {
    const ukuran = document.getElementById("modal-ukuran").value;
    const warnaSelect = document.getElementById("modal-warna");
    
    if (!ukuran) {
        warnaSelect.disabled = true;
        warnaSelect.innerHTML = `<option value="">Pilih ukuran dulu</option>`;
        return;
    }

    // Filter variasi berdasarkan ukuran
    const variations = currentProduct.variasi.filter((v) => v.ukuran === ukuran);
    
    warnaSelect.disabled = false;
    warnaSelect.innerHTML = `<option value="">-- Pilih Warna --</option>` +
        variations.map((v) => {
            const disabled = v.stok <= 0 ? "disabled" : "";
            const label = v.stok <= 0 ? `${v.warna} (Habis)` : v.warna;
            return `<option value="${v.warna}" ${disabled}>${label}</option>`;
        }).join("");
    
    document.getElementById("modal-stock").innerText = "";
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

    if (!ukuran || !warna) return alert("Mohon pilih ukuran dan warna.");

    const varObj = currentProduct.variasi.find(v => v.ukuran === ukuran && v.warna === warna);
    
    if (!varObj) return alert("Variasi error.");
    if (varObj.stok < qty) return alert(`Stok hanya tersisa ${varObj.stok}`);

    // Hitung harga (termasuk diskon jika favorit)
    let finalPrice = varObj.harga;
    if (currentProduct.favorit) finalPrice = finalPrice * 0.8;

    // Cek item kembar di cart
    const exist = cart.find(c => c.id === currentProduct.id && c.ukuran === ukuran && c.warna === warna);
    if (exist) {
        exist.qty += qty;
    } else {
        cart.push({
            id: currentProduct.id,
            nama: currentProduct.nama,
            gambar: currentProduct.gambar,
            ukuran,
            warna,
            harga: finalPrice, // Simpan harga yang sudah didiskon
            qty
        });
    }

    saveCart();
    alert("Berhasil masuk keranjang!");
    closeProductModal();
}

/* ==========================================================================
   5. CHECKOUT & CART MODAL 
   ========================================================================== */

function openCartModal() {
    const modal = document.getElementById("cart-modal");
    const body = document.getElementById("cart-modal-body");
    if(!modal) return;

    modal.classList.remove("hidden");
    
    if (cart.length === 0) {
        body.innerHTML = `<p style="text-align:center; padding:20px; color:#666;">Keranjang Kosong</p>`;
        document.getElementById("cart-total-display").innerText = formatIDR(0);
        return;
    }

    body.innerHTML = cart.map((item, idx) => `
        <div style="display:flex; gap:10px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px; color:#333;">
            <img src="img/produk/${item.gambar}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">
            <div style="flex:1;">
                <div style="font-weight:bold; font-size:0.9rem;">${item.nama}</div>
                <div style="font-size:0.8rem; color:#666;">${item.ukuran} - ${item.warna}</div>
                <div style="color:#004d7a; font-weight:bold;">${formatIDR(item.harga)} x ${item.qty}</div>
            </div>
            <button onclick="removeCartItem(${idx})" style="color:red; background:none; border:none; cursor:pointer;">Hapus</button>
        </div>
    `).join("");

    const total = cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);
    document.getElementById("cart-total-display").innerText = formatIDR(total);
}

function removeCartItem(idx) {
    cart.splice(idx, 1);
    saveCart();
    openCartModal(); // Refresh render
}

function closeCartModal() {
    document.getElementById("cart-modal").classList.add("hidden");
}

function processCheckout() {
    if(cart.length === 0) return alert("Keranjang kosong!");
    
    const waNumber = "628976272428"; // Ganti dengan nomor WA kamu
    
    let message = `Halo Admin, saya mau pesan tas:%0A%0A`;
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.harga * item.qty;
        total += subtotal;
        message += `- ${item.nama} (${item.ukuran}, ${item.warna}) x${item.qty} = ${formatIDR(subtotal)}%0A`;
    });

    message += `%0A*Total: ${formatIDR(total)}*`;
    message += `%0A%0AMohon info ongkirnya, terima kasih.`;

    // Buka WhatsApp
    window.open(`https://wa.me/${waNumber}?text=${message}`, "_blank");
    
    // Opsional: Kosongkan keranjang setelah checkout
    // cart = []; saveCart(); closeCartModal();
}


/* ==========================================================================
   6. INIT ON LOAD
   ========================================================================== */
window.addEventListener("load", () => {
    renderProducts('all'); // Render semua produk awal
    updateCartBadge();
});
