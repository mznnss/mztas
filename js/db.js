// js/db.js
// Database produk MZ Collection (format A — variasi sebagai objek)
// Pastikan gambar produk ada di folder: img/produk/<gambar>

const produk = [
  {
    id: 1,
    nama: 'Ransel Laptop "CityRoam" Anti Air',
    gambar: "tas1.png",
    favorit: true,
    variasi: [
      { ukuran: "Medium (15 inch)", warna: "Hitam", stok: 35, harga: 189900 },
      { ukuran: "Medium (15 inch)", warna: "Navy", stok: 25, harga: 189900 },
      { ukuran: "Medium (15 inch)", warna: "Abu-Abu", stok: 15, harga: 189900 },
    ],
  },
  {
    id: 2,
    nama: 'Tas Selempang Pria "Urban Explorer"',
    gambar: "tas2.png",
    favorit: true,
    variasi: [
      { ukuran: "Compact", warna: "Hitam", stok: 70, harga: 89900 },
      { ukuran: "Compact", warna: "Army Green", stok: 50, harga: 89900 },
    ],
  },
  {
    id: 3,
    nama: 'Tote Bag Kanvas "Daily Chic"',
    gambar: "tas3.png",
    favorit: false,
    variasi: [
      { ukuran: "Besar", warna: "Broken White", stok: 70, harga: 75000 },
      { ukuran: "Besar", warna: "Hitam", stok: 80, harga: 75000 },
    ],
  },
  {
    id: 4,
    nama: 'Sling Bag Wanita "Seoul Vibe" Mini',
    gambar: "tas4.png",
    favorit: true,
    variasi: [
      { ukuran: "Mini", warna: "Lylac", stok: 35, harga: 99000 },
      { ukuran: "Mini", warna: "Mint", stok: 25, harga: 99000 },
      { ukuran: "Mini", warna: "Hitam", stok: 30, harga: 99000 },
    ],
  },
  {
    id: 5,
    nama: 'Waist Bag Sporty "ActiveGo" Unisex',
    gambar: "tas5.png",
    favorit: false,
    variasi: [
      { ukuran: "Standar", warna: "Hitam", stok: 50, harga: 69900 },
      { ukuran: "Standar", warna: "Merah", stok: 30, harga: 69900 },
    ],
  },
  {
    id: 6,
    nama: 'Ransel Kuliah "CampusLite"',
    gambar: "tas6.png",
    favorit: true,
    variasi: [
      { ukuran: "Besar", warna: "Abu-Abu", stok: 35, harga: 155000 },
      { ukuran: "Besar", warna: "Maroon", stok: 25, harga: 155000 },
    ],
  },
  {
    id: 7,
    nama: 'Handbag Wanita Elegan "Femme Luxe"',
    gambar: "tas7.png",
    favorit: false,
    variasi: [
      { ukuran: "Medium", warna: "Cream", stok: 15, harga: 225000 },
      { ukuran: "Medium", warna: "Mocca", stok: 20, harga: 225000 },
      { ukuran: "Medium", warna: "Hitam", stok: 15, harga: 225000 },
    ],
  },
  {
    id: 8,
    nama: 'Tas Laptop Jinjing "ProSleeve" 14 inch',
    gambar: "tas8.png",
    favorit: false,
    variasi: [
      { ukuran: "14 inch", warna: "Dark Grey", stok: 70, harga: 110000 },
    ],
  },
  {
    id: 9,
    nama: 'Pouch Kulit Sintetis "Classic Pouch"',
    gambar: "tas9.png",
    favorit: true,
    variasi: [
      { ukuran: "Kecil", warna: "Coklat Tua", stok: 50, harga: 49000 },
      { ukuran: "Kecil", warna: "Hitam", stok: 90, harga: 49000 },
    ],
  },
  {
    id: 10,
    nama: 'Tas Selempang Kanvas "Retro Messenger"',
    gambar: "tas10.png",
    favorit: false,
    variasi: [
      { ukuran: "Medium", warna: "Khaky", stok: 45, harga: 115000 },
      { ukuran: "Medium", warna: "Hijau Army", stok: 40, harga: 115000 },
    ],
  },
  {
    id: 11,
    nama: 'Ransel Mini Fashion Korea "CutiePie"',
    gambar: "tas11.png",
    favorit: true,
    variasi: [
      { ukuran: "Mini", warna: "Pink", stok: 40, harga: 95000 },
      { ukuran: "Mini", warna: "Kuning", stok: 30, harga: 95000 },
      { ukuran: "Mini", warna: "Putih", stok: 40, harga: 95000 },
    ],
  },
  {
    id: 12,
    nama: 'Clutch Pesta "Glamour Night"',
    gambar: "tas12.png",
    favorit: false,
    variasi: [
      { ukuran: "Kecil", warna: "Silver", stok: 10, harga: 135000 },
      { ukuran: "Kecil", warna: "Gold", stok: 0, harga: 135000 },
      { ukuran: "Kecil", warna: "Hitam", stok: 20, harga: 135000 },
    ],
  },
  {
    id: 13,
    nama: 'Tas Serut "Drawstring Fun"',
    gambar: "tas13.png",
    favorit: false,
    variasi: [
      { ukuran: "Standar", warna: "Motif Abstrak", stok: 130, harga: 39900 },
    ],
  },
  {
    id: 14,
    nama: 'Tas Pinggang Pria Kulit "Gentry"',
    gambar: "tas14.png",
    favorit: false,
    variasi: [
      { ukuran: "Standar", warna: "Coklat Gelap", stok: 65, harga: 149000 },
    ],
  },
  {
    id: 15,
    nama: 'Shoulder Bag Wanita "90s Vibe"',
    gambar: "tas15.png",
    favorit: true,
    variasi: [
      { ukuran: "Kecil", warna: "Hitam", stok: 45, harga: 85000 },
      { ukuran: "Kecil", warna: "Putih", stok: 30, harga: 85000 },
      { ukuran: "Kecil", warna: "Ungu", stok: 20, harga: 85000 },
    ],
  },
  {
    id: 16,
    nama: 'Ransel Travel "Adventure Pro" 40L',
    gambar: "tas16.png",
    favorit: true,
    variasi: [
      { ukuran: "Extra Besar", warna: "Hitam", stok: 20, harga: 299000 },
      { ukuran: "Extra Besar", warna: "Biru Dongker", stok: 10, harga: 299000 },
    ],
  },
  {
    id: 17,
    nama: "Tas Selempang Tablet 10 inch",
    gambar: "tas17.png",
    favorit: false,
    variasi: [
      { ukuran: "Medium", warna: "Abu-Abu Gelap", stok: 70, harga: 120000 },
    ],
  },
  {
    id: 18,
    nama: 'Tote Bag Transparan "ClearStyle"',
    gambar: "tas18.png",
    favorit: false,
    variasi: [
      { ukuran: "Medium", warna: "Bening-Hitam", stok: 55, harga: 65000 },
    ],
  },
  {
    id: 19,
    nama: 'Tas Ransel Anak "KidoFun"',
    gambar: "tas19.png",
    favorit: false,
    variasi: [
      { ukuran: "Kecil", warna: "Motif Dinosaurus", stok: 100, harga: 89000 },
    ],
  },
  {
    id: 20,
    nama: 'Sling Bag HP "Phone Pouch"',
    gambar: "tas20.png",
    favorit: true,
    variasi: [
      { ukuran: "Sangat Kecil", warna: "Hitam", stok: 80, harga: 55000 },
      { ukuran: "Sangat Kecil", warna: "Cream", stok: 50, harga: 55000 },
      { ukuran: "Sangat Kecil", warna: "Sage", stok: 50, harga: 55000 },
    ],
  },
  {
    id: 21,
    nama: "Tas Selempang Pria Anti Maling",
    gambar: "tas21.png",
    favorit: false,
    variasi: [
      { ukuran: "Medium", warna: "Hitam", stok: 40, harga: 175000 },
      { ukuran: "Medium", warna: "Abu-Abu", stok: 20, harga: 175000 },
    ],
  },
  {
    id: 22,
    nama: 'Bucket Bag Serut "Boho Chic"',
    gambar: "tas22.png",
    favorit: false,
    variasi: [
      { ukuran: "Medium", warna: "Coklat", stok: 25, harga: 145000 },
      { ukuran: "Medium", warna: "Cream", stok: 25, harga: 145000 },
    ],
  },
  {
    id: 23,
    nama: 'Gym Bag "FitPack" Unisex',
    gambar: "tas23.png",
    favorit: false,
    variasi: [
      { ukuran: "Besar", warna: "Hitam", stok: 45, harga: 130000 },
      { ukuran: "Besar", warna: "Merah", stok: 45, harga: 130000 },
    ],
  },
  {
    id: 24,
    nama: 'Dompet Tangan Pria "Gentleman\'s"',
    gambar: "tas24.png",
    favorit: false,
    variasi: [{ ukuran: "Kecil", warna: "Hitam", stok: 90, harga: 99000 }],
  },
  {
    id: 25,
    nama: 'Crossbody Bag Wanita "Quilted Love"',
    gambar: "tas25.png",
    favorit: true,
    variasi: [
      { ukuran: "Medium", warna: "Hitam", stok: 45, harga: 159000 },
      { ukuran: "Medium", warna: "Dusty Pink", stok: 30, harga: 159000 },
    ],
  },
  {
    id: 26,
    nama: 'Ransel Lipat "Fold n\' Go" Parasut',
    gambar: "tas26.png",
    favorit: false,
    variasi: [
      { ukuran: "All Size", warna: "Biru", stok: 60, harga: 59000 },
      { ukuran: "All Size", warna: "Abu-Abu", stok: 60, harga: 59000 },
      { ukuran: "All Size", warna: "Orange", stok: 30, harga: 59000 },
    ],
  },
  {
    id: 27,
    nama: 'Tas Kamera "ShutterBug" Selempang',
    gambar: "tas27.png",
    favorit: false,
    variasi: [{ ukuran: "Medium", warna: "Hitam", stok: 35, harga: 210000 }],
  },
  {
    id: 28,
    nama: 'Tas Belanja Lipat "Eco Shopper"',
    gambar: "tas28.png",
    favorit: false,
    variasi: [
      { ukuran: "Besar", warna: "Motif Buah", stok: 250, harga: 25000 },
    ],
  },
  {
    id: 29,
    nama: 'Pouch Organizer Gadget "TechPouch"',
    gambar: "tas29.png",
    favorit: true,
    variasi: [{ ukuran: "Medium", warna: "Abu-Abu", stok: 80, harga: 79000 }],
  },
  {
    id: 30,
    nama: 'Briefcase Kerja Pria "The Executive"',
    gambar: "tas30.png",
    favorit: true,
    variasi: [
      { ukuran: "15 inch", warna: "Hitam", stok: 25, harga: 275000 },
      { ukuran: "15 inch", warna: "Coklat", stok: 15, harga: 275000 },
    ],
  },
];
