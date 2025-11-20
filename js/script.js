/* js/script.js — FINAL + RESET CART + STOCK MANAGEMENT */

/* ================= 1. CUSTOM NOTIFICATION SYSTEM (TIDAK DIUBAH) ================= */
function showNotif(message, type = 'success') {
    const existing = document.getElementById('mz-notif');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.id = 'mz-notif';
    
    let baseClass = "fixed top-5 left-1/2 transform -translate-x-1/2 z-[100000] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 translate-y-[-100px] opacity-0";
    
    if (type === 'success') {
        notif.className = `${baseClass} bg-black/80 border-green-500/50 text-white`;
        notif.innerHTML = `<i class="ph-fill ph-check-circle text-2xl text-green-400"></i> <span class="font-bold text-sm">${message}</span>`;
    } else if (type === 'error') {
        notif.className = `${baseClass} bg-black/80 border-red-500/50 text-white`;
        notif.innerHTML = `<i class="ph-fill ph-warning-circle text-2xl text-red-400"></i> <span class="font-bold text-sm">${message}</span>`;
    } else {
        notif.className = `${baseClass} bg-black/80 border-blue-500/50 text-white`;
        notif.innerHTML = `<i class="ph-fill ph-info text-2xl text-blue-400"></i> <span class="font-bold text-sm">${message}</span>`;
    }

    document.body.appendChild(notif);

    setTimeout(() => {
        notif.classList.remove('translate-y-[-100px]', 'opacity-0');
        notif.classList.add('translate-y-0', 'opacity-100');
    }, 10);

    setTimeout(() => {
        notif.classList.remove('translate-y-0', 'opacity-100');
        notif.classList.add('translate-y-[-100px]', 'opacity-0');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

/* ================= 2. INIT & DATA HANDLING (DITAMBAH LOGIKA DB STOK) ================= */
const STORAGE_DB_KEY = "dbProduk_vStockFinal"; // Key database
const STORAGE_CART_KEY = "mz_cart";
const STORAGE_REV_KEY = "mz_reviews";

// [MODIFIKASI] Load Database agar Stok Tersimpan
let db;
const localData = localStorage.getItem(STORAGE_DB_KEY);

if (localData) {
    // Jika sudah ada data di HP (stok sudah pernah berkurang), pakai itu
    db = JSON.parse(localData);
} else {
    // Jika belum, ambil dari file data awal
    db = typeof produk !== "undefined" ? produk : [];
    localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(db));
}

let cart = JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || "[]");
let reviews = JSON.parse(localStorage.getItem(STORAGE_REV_KEY) || "[]");

function formatIDR(n) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function saveCart() {
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

// Fungsi Simpan Perubahan Stok ke HP
function saveDB() {
    localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(db));
}

/* ================= 3. RENDER PRODUCTS (DITAMBAH VISUAL HABIS) ================= */
function createCardHTML(p) {
    const lowestPrice = Math.min(...p.variasi.map(v => v.harga));
    
    // Cek apakah semua variasi stoknya 0 atau kurang
    const isHabis = p.variasi.every(v => v.stok <= 0);
    
    // [MODIFIKASI] Badge Habis lebih terlihat
    const badgeHabis = isHabis 
        ? `<div class="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
             <div class="bg-red-600 text-white font-bold px-4 py-2 rounded border-2 border-white text-sm tracking-widest shadow-xl transform -rotate-12">
                HABIS TERJUAL
             </div>
           </div>` 
        : '';

    let priceHtml = '';
    if (p.favorit) {
        const discount = lowestPrice * 0.8;
        priceHtml = `
            <div class="flex flex-col">
                <span class="text-xs text-gray-400 line-through">${formatIDR(lowestPrice)}</span> 
                <span class="text-yellow-400 font-bold text-lg">${formatIDR(discount)}</span>
            </div>`;
    } else {
        priceHtml = `<span class="text-yellow-400 font-bold text-lg">${formatIDR(lowestPrice)}</span>`;
    }

    // [MODIFIKASI] Tambahkan grayscale jika habis dan disable klik
    return `
    <div class="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-yellow-500/50 transition group flex flex-col h-full relative">
        ${badgeHabis}
        <div class="aspect-[4/3] overflow-hidden bg-gray-800 cursor-pointer" onclick="${isHabis ? '' : `openProductDetail(${p.id})`}">
            <img src="img/produk/${p.gambar}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500 ${isHabis ? 'grayscale' : ''}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
        </div>
        <div class="p-4 flex flex-col flex-grow">
            <div class="text-xs text-gray-400 mb-1 uppercase tracking-wider">${p.kategori}</div>
            <h3 class="text-white font-bold text-lg leading-tight mb-2 cursor-pointer hover:text-yellow-500" onclick="${isHabis ? '' : `openProductDetail(${p.id})`}">${p.nama}</h3>
            <div class="mt-auto pt-3 border-t border-white/10 flex justify-between items-center">
                ${priceHtml}
                <button onclick="${isHabis ? '' : `openProductDetail(${p.id})`}" class="bg-white/10 ${isHabis ? 'cursor-not-allowed opacity-50' : 'hover:bg-yellow-500 hover:text-black'} text-white p-2 rounded-full transition">
                    <i class="ph-bold ph-arrow-right"></i>
                </button>
            </div>
        </div>
    </div>`;
}

function renderProducts(filter = 'all') {
    const container = document.getElementById("product-container");
    if (!container) return;
    
    const data = filter === 'all' ? db : db.filter(p => p.kategori === filter);
    
    container.innerHTML = data.length 
        ? data.map(createCardHTML).join("") 
        : `<div class="col-span-full flex flex-col items-center justify-center py-20 min-h-[300px] text-gray-400">
            <i class="ph-duotone ph-magnifying-glass text-4xl mb-3"></i>
            <p>Produk tidak ditemukan.</p>
           </div>`;
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
        if (b.innerText === cat || (cat === 'all' && b.innerText === 'Semua') || (cat === 'Accessories' && b.innerText === 'Aksesoris')) {
            b.classList.add('active');
        }
    });
    renderProducts(cat);
}

/* ================= 4. REVIEW SYSTEM (TIDAK DIUBAH) ================= */
function renderReviews() {
    const container = document.getElementById("review-list");
    if (!container) return;

    if (reviews.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-400 italic py-5">Belum ada ulasan. Jadilah yang pertama!</p>`;
        return;
    }

    container.innerHTML = reviews.map(r => `
        <div class="bg-white/5 p-4 rounded-xl border border-white/10 mb-3">
            <div class="flex text-yellow-400 text-sm mb-1">${"★".repeat(r.rating)}</div>
            <p class="text-gray-200 text-sm italic">"${r.text}"</p>
            <div class="mt-2 font-bold text-xs text-white">— ${r.name} <span class="font-normal text-gray-500">(${r.date})</span></div>
        </div>
    `).join("");
}

function handleReviewSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("ulasan-nama").value;
    const text = document.getElementById("ulasan-text").value;
    const rating = document.getElementById("ulasan-rating").value;

    if (!name || !text) return showNotif("Mohon lengkapi data ulasan.", "error");

    reviews.unshift({ 
        name, 
        text, 
        rating: parseInt(rating), 
        date: new Date().toLocaleDateString('id-ID') 
    });
    
    localStorage.setItem(STORAGE_REV_KEY, JSON.stringify(reviews));
    
    document.getElementById("form-review").reset();
    renderReviews();
    showNotif("Ulasan berhasil dikirim!", "success");
}

/* ================= 5. CONTACT FORM (TIDAK DIUBAH) ================= */
async function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    showNotif("Sedang mengirim pesan...", "info");
    try {
        const response = await fetch(form.action, {
            method: form.method,
            body: data,
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            showNotif("Pesan berhasil terkirim!", "success");
            form.reset();
            const oldAlert = document.querySelector('.alert-success');
            if(oldAlert) oldAlert.style.display = 'none';
        } else {
            const result = await response.json();
            if (Object.hasOwn(result, 'errors')) {
                const errorMessage = result["errors"].map(error => error["message"]).join(", ");
                showNotif(errorMessage, "error");
            } else {
                showNotif("Gagal mengirim pesan. Cek data Anda.", "error");
            }
        }
    } catch (error) {
        console.error("Error:", error);
        showNotif("Terjadi kesalahan koneksi.", "error");
    }
}

/* ================= 6. MODAL & CART SYSTEM (DITAMBAH TAMPILAN STOK) ================= */
let currentProduct = null;

function openProductDetail(id) {
    // Cari produk dari database (yang stoknya realtime)
    currentProduct = db.find(p => p.id === id);
    if (!currentProduct) return;
    
    const modal = document.getElementById("product-modal");
    const body = document.getElementById("product-detail-body");
    if (!modal) return;

    const ukuranList = [...new Set(currentProduct.variasi.map(v => v.ukuran))];
    let basePrice = Math.min(...currentProduct.variasi.map(v => v.harga));
    if (currentProduct.favorit) basePrice *= 0.8;

    // [MODIFIKASI] Tambahkan tampilan Sisa Stok di HTML Modal
    body.innerHTML = `
        <div class="flex flex-col md:flex-row gap-6 text-gray-800">
            <div class="w-full md:w-1/2 bg-gray-100 rounded-xl overflow-hidden aspect-square md:aspect-auto relative">
                <img src="img/produk/${currentProduct.gambar}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 flex flex-col justify-center">
                <div class="mb-4">
                    <span class="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded font-bold uppercase">${currentProduct.kategori}</span>
                    <h2 class="text-2xl md:text-3xl font-extrabold mt-2 leading-tight">${currentProduct.nama}</h2>
                    <div class="text-blue-600 font-bold text-2xl mt-2">${formatIDR(basePrice)}</div>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Pilih Ukuran</label>
                        <select id="modal-ukuran" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 outline-none bg-white" onchange="updateWarna()">
                            <option value="">-- Pilih Ukuran --</option>
                            ${ukuranList.map(u => `<option value="${u}">${u}</option>`).join("")}
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Pilih Warna</label>
                        <select id="modal-warna" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 outline-none bg-gray-50 disabled:opacity-50" disabled>
                            <option>Pilih ukuran dulu</option>
                        </select>
                    </div>

                    <div class="flex gap-4 items-center">
                         <div class="flex-1">
                            <label class="block text-sm font-bold text-gray-700 mb-1">Jumlah</label>
                            <input id="modal-qty" type="number" value="1" min="1" class="w-full p-3 text-center border-2 border-gray-200 rounded-lg focus:border-blue-600 outline-none font-bold">
                        </div>
                        <div class="flex-1">
                             <label class="block text-sm font-bold text-gray-700 mb-1">Sisa Stok</label>
                             <div id="stok-display" class="w-full p-3 bg-gray-100 rounded-lg text-gray-500 font-bold text-center">-</div>
                        </div>
                    </div>
                </div>

                <button onclick="addToCart()" class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition transform active:scale-95 flex justify-center items-center gap-2">
                    <i class="ph-fill ph-shopping-cart"></i> Masukkan Keranjang
                </button>
            </div>
        </div>
    `;
    modal.classList.remove("hidden");
}

function updateWarna() {
    const ukuran = document.getElementById("modal-ukuran").value;
    const sel = document.getElementById("modal-warna");
    const stokDisplay = document.getElementById("stok-display");

    if (!ukuran) { 
        sel.disabled=true; 
        sel.innerHTML="<option>Pilih ukuran dulu</option>"; 
        stokDisplay.innerText = "-";
        return; 
    }
    
    const vars = currentProduct.variasi.filter(v => v.ukuran === ukuran);
    sel.disabled = false;
    sel.classList.remove("bg-gray-50"); sel.classList.add("bg-white");
    
    // [MODIFIKASI] Disable opsi warna yang stoknya 0
    sel.innerHTML = `<option value="">-- Pilih Warna --</option>` + 
        vars.map(v => `<option value="${v.warna}" ${v.stok<=0?'disabled':''}>${v.warna} ${v.stok<=0?'(Habis)':''}</option>`).join("");

    // [MODIFIKASI] Update angka stok saat warna dipilih
    sel.onchange = function() {
        const selectedWarna = this.value;
        const variant = currentProduct.variasi.find(v => v.ukuran === ukuran && v.warna === selectedWarna);
        if (variant) {
            stokDisplay.innerText = variant.stok + " pcs";
            document.getElementById("modal-qty").setAttribute("max", variant.stok); // Batasi input max
        } else {
            stokDisplay.innerText = "-";
        }
    };
}

function addToCart() {
    const ukuran = document.getElementById("modal-ukuran").value;
    const warna = document.getElementById("modal-warna").value;
    const qty = parseInt(document.getElementById("modal-qty").value);
    
    if (!ukuran || !warna) return showNotif("Mohon pilih ukuran dan warna.", "error");
    
    const variant = currentProduct.variasi.find(i => i.ukuran === ukuran && i.warna === warna);

    // [MODIFIKASI] Validasi Stok
    if (variant.stok <= 0) return showNotif("Maaf, stok varian ini sudah habis.", "error");
    if (qty > variant.stok) return showNotif(`Stok tidak cukup. Sisa: ${variant.stok}`, "error");

    let price = variant.harga; 
    if(currentProduct.favorit) price *= 0.8;

    const exist = cart.find(c => c.id === currentProduct.id && c.ukuran === ukuran && c.warna === warna);
    if (exist) {
        // Validasi juga untuk barang yang sudah ada di cart
        if (exist.qty + qty > variant.stok) return showNotif(`Melebihi stok! Anda sudah punya ${exist.qty} di keranjang.`, "error");
        exist.qty += qty;
    } else {
        cart.push({ id: currentProduct.id, nama: currentProduct.nama, gambar: currentProduct.gambar, ukuran, warna, harga: price, qty });
    }
    
    saveCart();
    document.getElementById("product-modal").classList.add("hidden");
    showNotif("Berhasil masuk keranjang!", "success");
}

function toggleCart() {
    const modal = document.getElementById("cart-modal");
    const body = document.getElementById("cart-modal-body");
    modal.classList.remove("hidden");
    
    if (!cart.length) {
        body.innerHTML = `<p class="text-center text-gray-500 py-10 italic">Keranjang Anda kosong</p>`;
        document.getElementById("cart-total-display").innerText = formatIDR(0);
        return;
    }
    
    body.innerHTML = cart.map((c, i) => `
        <div class="flex justify-between items-center border-b py-3">
            <div class="flex items-center gap-3">
                 <img src="img/produk/${c.gambar}" class="w-10 h-10 rounded object-cover">
                 <div>
                    <div class="font-bold text-sm text-gray-800">${c.nama}</div>
                    <div class="text-xs text-gray-500">${c.ukuran}, ${c.warna} x${c.qty}</div>
                 </div>
            </div>
            <div class="text-right">
                <div class="text-blue-700 font-bold text-sm">${formatIDR(c.harga * c.qty)}</div>
                <button onclick="delItem(${i})" class="text-red-500 text-xs hover:underline">Hapus</button>
            </div>
        </div>
    `).join("");
    
    document.getElementById("cart-total-display").innerText = formatIDR(cart.reduce((s, c) => s + c.harga * c.qty, 0));
}

function delItem(i) { cart.splice(i, 1); saveCart(); toggleCart(); if(document.getElementById("order-summary")) renderOrderSummary(); }
function closeCartModal() { document.getElementById("cart-modal").classList.add("hidden"); }
function closeProductModal() { document.getElementById("product-modal").classList.add("hidden"); }
function updateCartBadge() { document.querySelectorAll(".fc-ultra-badge").forEach(e => e.innerText = cart.reduce((s,c)=>s+c.qty,0)); }

function processCheckoutRedirect() {
    if(!cart.length) return showNotif("Keranjang Anda kosong!", "error");
    window.location.href = "pemesanan.html";
}

/* ================= 7. CHECKOUT LOGIC (DITAMBAH PENGURANGAN STOK) ================= */
function renderOrderSummary() {
    const container = document.getElementById("order-summary");
    if (!container) return;
    if (!cart.length) { container.innerHTML = `<p class="text-center text-gray-400">Keranjang kosong.</p>`; return; }
    
    container.innerHTML = cart.map(c => `
        <div class="flex justify-between border-b border-white/10 py-3">
            <div>
                <div class="font-bold text-white text-sm">${c.nama}</div>
                <div class="text-xs text-gray-400">${c.ukuran}, ${c.warna} x${c.qty}</div>
            </div>
            <div class="font-bold text-yellow-500 text-sm">${formatIDR(c.harga * c.qty)}</div>
        </div>
    `).join("") + `<div class="flex justify-between pt-4 mt-2 border-t border-white/20 font-bold text-lg"><span class="text-white">Total</span><span class="text-yellow-500">${formatIDR(cart.reduce((s,c)=>s+c.harga*c.qty,0))}</span></div>`;
}

// [MODIFIKASI] Reset Cart + Kurangi Stok
function completeOrder(e) {
    e.preventDefault();
    if (!cart.length) return showNotif("Keranjang kosong!", "error");
    
    const name = document.getElementById("cust-name").value;
    const wa = document.getElementById("cust-wa").value;
    const addr = document.getElementById("cust-address").value;
    
    if(!name || !wa || !addr) return showNotif("Harap lengkapi semua data pengiriman.", "error");

    // --- 1. PROSES PENGURANGAN STOK DI DB ---
    cart.forEach(cartItem => {
        const productInDB = db.find(p => p.id === cartItem.id);
        if (productInDB) {
            const variantInDB = productInDB.variasi.find(v => v.ukuran === cartItem.ukuran && v.warna === cartItem.warna);
            if (variantInDB) {
                // Kurangi stok (minimal 0, jangan minus)
                variantInDB.stok = Math.max(0, variantInDB.stok - cartItem.qty);
            }
        }
    });
    saveDB(); // Simpan perubahan stok ke memori HP
    // ----------------------------------------

    // Format Pesan WhatsApp
    const msg = `Halo Admin MZ Col
