/* js/script.js — FINAL COMPLETE CODE (MERGED) */

/* ================= 1. INIT & DATA HANDLING ================= */
const STORAGE_DB_KEY = "dbProduk_vFinal"; // Key baru agar data fresh
const STORAGE_CART_KEY = "mz_cart";
const STORAGE_REV_KEY = "mz_reviews"; // Key untuk ulasan

// Load Database Produk (Pastikan file data_produk.js sudah diload sebelumnya di HTML)
let db = typeof produk !== "undefined" ? produk : [];

// Force update database di LocalStorage saat reload agar sinkron dengan file data_produk.js
localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(db));

// Load Keranjang & Ulasan dari Storage
let cart = JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || "[]");
let reviews = JSON.parse(localStorage.getItem(STORAGE_REV_KEY) || "[]");

// Fungsi Format Rupiah
function formatIDR(n) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(n);
}

function saveCart() {
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

/* ================= 2. RENDER PRODUCTS (KATALOG & HOME) ================= */

function createCardHTML(p) {
    // Cari harga terendah dari variasi
    const lowestPrice = Math.min(...p.variasi.map(v => v.harga));
    const isHabis = p.variasi.every(v => v.stok <= 0);
    
    // Badge Stok Habis
    const badgeHabis = isHabis 
        ? `<div style="position:absolute; top:10px; right:10px; background:red; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:bold; color:white; z-index:10;">HABIS</div>` 
        : '';

    // Logika Tampilan Harga (Coret jika favorit/diskon)
    let priceHtml = '';
    if (p.favorit) {
        const discount = lowestPrice * 0.8; // Diskon 20%
        priceHtml = `
            <span style="text-decoration:line-through; color:#aaa; font-size:0.8rem;">${formatIDR(lowestPrice)}</span> 
            <span style="color:#FFD700; font-weight:bold; font-size:1.1rem; margin-left:5px;">${formatIDR(discount)}</span>`;
    } else {
        priceHtml = `<span style="color:#FFD700; font-weight:bold; font-size:1.1rem;">${formatIDR(lowestPrice)}</span>`;
    }

    // Return HTML Card (Menggunakan inline style agar aman, atau class utility jika pakai framework)
    return `
    <div class="product-card" onclick="openProductDetail(${p.id})" style="cursor:pointer; position:relative;">
        ${badgeHabis}
        <img src="img/produk/${p.gambar}" class="product-image" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
        <div class="product-info" style="padding:10px;">
            <div class="product-category" style="font-size:0.8rem; color:#aaa;">${p.kategori}</div>
            <h3 class="product-title" style="font-weight:bold; margin:5px 0;">${p.nama}</h3>
            <div class="price-wrapper">${priceHtml}</div>
            <button style="width:100%; margin-top:10px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); color:white; padding:8px; border-radius:8px;">
                ${isHabis ? 'Stok Habis' : 'Lihat Detail'}
            </button>
        </div>
    </div>`;
}

function renderProducts(filter = 'all') {
    const container = document.getElementById("product-container");
    if (!container) return;

    const data = filter === 'all' ? db : db.filter(p => p.kategori === filter);
    
    if (data.length === 0) {
        container.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:20px; color:white;">Produk tidak ditemukan.</p>`;
    } else {
        container.innerHTML = data.map(createCardHTML).join("");
    }
}

function renderFeatured() {
    const container = document.getElementById("featured-container");
    if (!container) return;
    
    // Ambil 4 produk favorit
    const data = db.filter(p => p.favorit).slice(0, 4);
    container.innerHTML = data.map(createCardHTML).join("");
}

function filterProducts(cat) {
    // Update tombol aktif
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        // Logika pencocokan teks tombol dengan kategori
        if (b.innerText === cat || 
           (cat === 'all' && b.innerText === 'Semua') || 
           (cat === 'Accessories' && b.innerText === 'Aksesoris')) {
            b.classList.add('active');
        }
    });
    renderProducts(cat);
}

/* ================= 3. REVIEW SYSTEM (LOCALSTORAGE) ================= */

function renderReviews() {
    const container = document.getElementById("review-list");
    if (!container) return;

    if (reviews.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#aaa; font-style:italic;">Belum ada ulasan. Jadilah yang pertama!</p>`;
        return;
    }

    container.innerHTML = reviews.map(r => `
        <div class="review-item" style="background:rgba(255,255,255,0.05); padding:15px; border-radius:10px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.1);">
            <div style="color:#FFD700; font-size:0.9rem; margin-bottom:5px;">${"★".repeat(r.rating)}</div>
            <p style="color:#eee; font-size:0.9rem; font-style:italic;">"${r.text}"</p>
            <div style="margin-top:10px; font-size:0.8rem; font-weight:bold; color:#ccc;">— ${r.name} <span style="font-weight:normal; font-size:0.7rem;">(${r.date})</span></div>
        </div>
    `).join("");
}

function handleReviewSubmit(e) {
    e.preventDefault(); // Mencegah reload halaman
    
    const nameInput = document.getElementById("ulasan-nama");
    const textInput = document.getElementById("ulasan-text");
    const ratingInput = document.getElementById("ulasan-rating");

    if (!nameInput || !textInput) return;

    const newReview = {
        name: nameInput.value,
        text: textInput.value,
        rating: parseInt(ratingInput.value),
        date: new Date().toLocaleDateString('id-ID')
    };

    // Masukkan ke array (paling atas)
    reviews.unshift(newReview);
    localStorage.setItem(STORAGE_REV_KEY, JSON.stringify(reviews));

    // Reset form dan render ulang
    document.getElementById("form-review").reset();
    renderReviews();
    alert("Terima kasih! Ulasan Anda berhasil dikirim.");
}

/* ================= 4. CART & MODAL SYSTEM ================= */

let currentProduct = null;

function openProductDetail(id) {
    currentProduct = db.find(p => p.id === id);
    if (!currentProduct) return;

    const modal = document.getElementById("product-modal");
    const body = document.getElementById("product-detail-body");
    if (!modal) return;

    const ukuranList = [...new Set(currentProduct.variasi.map(v => v.ukuran))];
    let basePrice = Math.min(...currentProduct.variasi.map(v => v.harga));
    if (currentProduct.favorit) basePrice *= 0.8;

    body.innerHTML = `
        <div style="display:flex; flex-wrap:wrap; gap:20px; color:#333;">
            <div style="flex:1; min-width:250px;">
                <img src="img/produk/${currentProduct.gambar}" style="width:100%; border-radius:10px; object-fit:cover;">
            </div>
            <div style="flex:1; min-width:250px;">
                <h2 style="font-size:1.5rem; font-weight:bold;">${currentProduct.nama}</h2>
                <div style="color:#004d7a; font-weight:bold; font-size:1.2rem; margin:10px 0;">${formatIDR(basePrice)}</div>
                
                <label style="display:block; font-weight:bold; margin-bottom:5px;">Ukuran</label>
                <select id="modal-ukuran" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:5px; margin-bottom:10px;" onchange="updateWarna()">
                    <option value="">-- Pilih --</option>
                    ${ukuranList.map(u => `<option value="${u}">${u}</option>`).join("")}
                </select>

                <label style="display:block; font-weight:bold; margin-bottom:5px;">Warna</label>
                <select id="modal-warna" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:5px; margin-bottom:15px;" disabled>
                    <option>Pilih ukuran dulu</option>
                </select>

                <label style="display:block; font-weight:bold; margin-bottom:5px;">Jumlah</label>
                <div style="display:flex; gap:10px; margin-bottom:20px;">
                     <input id="modal-qty" type="number" value="1" min="1" style="width:60px; text-align:center; padding:8px; border:1px solid #ccc; border-radius:5px;">
                </div>

                <button onclick="addToCart()" style="width:100%; background:#004d7a; color:white; padding:12px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">TAMBAH KERANJANG</button>
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
    sel.innerHTML = `<option value="">-- Pilih --</option>` + 
        vars.map(v => `<option value="${v.warna}" ${v.stok<=0?'disabled':''}>${v.warna} ${v.stok<=0?'(Habis)':''}</option>`).join("");
}

function addToCart() {
    const ukuran = document.getElementById("modal-ukuran").value;
    const warna = document.getElementById("modal-warna").value;
    const qty = parseInt(document.getElementById("modal-qty").value);

    if (!ukuran || !warna) return alert("Mohon lengkapi pilihan ukuran dan warna.");
    
    const v = currentProduct.variasi.find(i => i.ukuran === ukuran && i.warna === warna);
    let price = v.harga; 
    if(currentProduct.favorit) price *= 0.8;

    // Cek apakah produk sama persis sudah ada di cart
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
            harga: price, 
            qty 
        });
    }
    
    saveCart();
    closeProductModal();
    alert("Berhasil masuk keranjang!");
}

function closeProductModal() { document.getElementById("product-modal").classList.add("hidden"); }

/* ================= 5. CART DRAWER & LOGIC ================= */

function toggleCart() {
    const modal = document.getElementById("cart-modal");
    const body = document.getElementById("cart-modal-body");
    if (!modal) return;
    
    modal.classList.remove("hidden");
    
    if (!cart.length) {
        body.innerHTML = `<p style="text-align:center; padding:20px; color:#888;">Keranjang kosong</p>`;
        document.getElementById("cart-total-display").innerText = formatIDR(0);
        return;
    }

    body.innerHTML = cart.map((c, i) => `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:10px 0; color:#333;">
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="img/produk/${c.gambar}" style="width:40px; height:40px; object-fit:cover; border-radius:5px;">
                <div>
                    <div style="font-weight:bold; font-size:0.9rem;">${c.nama}</div>
                    <div style="font-size:0.8rem; color:#666;">${c.ukuran}, ${c.warna} (x${c.qty})</div>
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:bold; color:#004d7a;">${formatIDR(c.harga * c.qty)}</div>
                <button onclick="delItem(${i})" style="color:red; font-size:0.8rem; border:none; background:none; cursor:pointer;">Hapus</button>
            </div>
        </div>
    `).join("");

    document.getElementById("cart-total-display").innerText = formatIDR(cart.reduce((s, c) => s + c.harga * c.qty, 0));
}

function delItem(i) {
    cart.splice(i, 1);
    saveCart();
    toggleCart(); // Refresh tampilan cart modal
    if(document.getElementById("order-summary")) renderOrderSummary(); // Refresh checkout jika sedang dibuka
}

function closeCartModal() { document.getElementById("cart-modal").classList.add("hidden"); }

function updateCartBadge() {
    const total = cart.reduce((s,c) => s + c.qty, 0);
    document.querySelectorAll(".fc-ultra-badge").forEach(e => e.innerText = total);
}

function processCheckoutRedirect() {
    if(!cart.length) return alert("Keranjang kosong!");
    window.location.href = "pemesanan.html";
}

/* ================= 6. CHECKOUT PAGE LOGIC ================= */

function renderOrderSummary() {
    const container = document.getElementById("order-summary");
    if (!container) return;

    if (!cart.length) {
        container.innerHTML = `<p style="text-align:center; color:#ccc;">Keranjang kosong.</p>`;
        return;
    }
    
    const itemsHtml = cart.map(c => `
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding:10px 0;">
            <div>
                <div style="font-weight:bold; color:white;">${c.nama}</div>
                <div style="font-size:0.8rem; color:#aaa;">${c.ukuran}, ${c.warna} x${c.qty}</div>
            </div>
            <div style="font-weight:bold; color:#FFD700;">${formatIDR(c.harga * c.qty)}</div>
        </div>
    `).join("");

    const total = cart.reduce((s,c) => s + c.harga * c.qty, 0);

    container.innerHTML = itemsHtml + `
        <div style="display:flex; justify-content:space-between; padding-top:15px; margin-top:10px; border-top:1px solid rgba(255,255,255,0.3); font-size:1.2rem; font-weight:bold;">
            <span style="color:white;">Total</span>
            <span style="color:#FFD700;">${formatIDR(total)}</span>
        </div>`;
}

function completeOrder(e) {
    e.preventDefault();
    if (!cart.length) return alert("Keranjang kosong.");
    
    const name = document.getElementById("cust-name").value;
    const wa = document.getElementById("cust-wa").value;
    const addr = document.getElementById("cust-address").value;
    
    if(!name || !wa || !addr) return alert("Harap lengkapi data diri Anda.");

    const waNumber = "628976272428"; // Nomor Admin
    
    let msg = `Halo Admin MZ Collection,%0A%0ASaya ingin memesan produk:%0A`;
    cart.forEach(c => {
        msg += `- ${c.nama} (${c.ukuran}, ${c.warna}) x${c.qty} = ${formatIDR(c.harga * c.qty)}%0A`;
    });

    const total = cart.reduce((s,c) => s + c.harga * c.qty, 0);
    msg += `%0A*Total Pembayaran: ${formatIDR(total)}*%0A`;
    msg += `%0A---------------------%0A`;
    msg += `Nama: ${name}%0A`;
    msg += `No WA: ${wa}%0A`;
    msg += `Alamat: ${addr}%0A`;
    msg += `%0AMohon info ongkos kirimnya. Terima kasih!`;
    
    window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
}

/* ================= 7. INITIALIZATION ================= */
window.addEventListener("load", () => {
    // Render Katalog jika ada container
    if(document.getElementById("product-container")) renderProducts('all');
    
    // Render Featured
    if(document.getElementById("featured-container")) renderFeatured();
    
    // Render Reviews
    if(document.getElementById("review-list")) renderReviews();
    
    // Render Summary Checkout
    if(document.getElementById("order-summary")) renderOrderSummary();

    // Update Badge Cart
    updateCartBadge();

    // Event Listener untuk Form Ulasan (Jika ada)
    const formReview = document.getElementById("form-review");
    if(formReview) {
        formReview.addEventListener("submit", handleReviewSubmit);
    }

    // Event Listener untuk Form Checkout (Jika ada)
    const formCheckout = document.getElementById("form-checkout");
    if(formCheckout) {
        formCheckout.addEventListener("submit", completeOrder);
    }
});
      
