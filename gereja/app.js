/* ============================================================
   Gereja Kristus Cinta Kasih — Script Halaman Publik
   Menggunakan localStorage untuk berbagi data dengan admin.
   ============================================================ */

// ---- Kunci penyimpanan (harus sama dengan admin.js) ----
var KEY_WARTA = "gkkc_warta";
var KEY_JADWAL = "gkkc_jadwal";
var KEY_JEMAAT = "gkkc_jemaat";
var KEY_DOA = "gkkc_doa";

// ---- Tanggal default bila data jadwal belum di-set admin ----
var jadwalDefault = {
  raya: [
    { hari: "Minggu", nama: "Ibadah Raya I", jam: "07:00 — 08:30 WIB" },
    { hari: "Minggu", nama: "Ibadah Raya II", jam: "09:00 — 10:30 WIB" },
    { hari: "Rabu", nama: "Ibadah Doa & Puji", jam: "18:30 — 20:00 WIB" },
    { hari: "Kamis", nama: "Ibadah Persekutuan", jam: "19:00 — 20:30 WIB" }
  ],
  anak: [
    { hari: "Minggu", nama: "Sekolah Minggu Kelompok Batita & Balita", jam: "07:00 — 08:15 WIB" },
    { hari: "Minggu", nama: "Sekolah Minggu Kelompok SD", jam: "09:00 — 10:30 WIB" },
    { hari: "Sabtu", nama: "Kegiatan Kreatif Anak", jam: "15:00 — 16:30 WIB" }
  ],
  kpr: [
    { hari: "Jumat", nama: "Komisi Remaja (SMP & SMA)", jam: "16:30 — 18:00 WIB" },
    { hari: "Sabtu", nama: "Komisi Pemuda (Kuliah & Kerja)", jam: "18:00 — 19:30 WIB" },
    { hari: "Minggu", nama: "Ibadah KPR Gabungan", jam: "17:00 — 18:30 WIB" }
  ],
  // Kategori tambahan: "khusus" untuk Ibadah Khusus lainnya.
  // Admin dapat menambahkan jadwal di sini dan ditampilkan sebagai tab baru.
  khusus: []
};

// ---- Helper baca / tulis localStorage ----
function bacaData(kunci, fallback) {
  try {
    var item = localStorage.getItem(kunci);
    if (item) return JSON.parse(item);
  } catch (e) {}
  return fallback;
}

function tulisData(kunci, data) {
  try {
    localStorage.setItem(kunci, JSON.stringify(data));
  } catch (e) {}
}

// ---- Tampilkan tanggal hari ini di Warta ----
function tampilkanTanggalHariIni() {
  var el = document.getElementById("wartaDate");
  if (!el) return;
  var bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  var hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  var sekarang = new Date();
  var teks = hari[sekarang.getDay()] + ", " + tanggalBulan(sekarang.getDate()) +
             " " + bulan[sekarang.getMonth()] + " " + sekarang.getFullYear();
  el.textContent = teks;
}

function tanggalBulan(d) {
  return d < 10 ? "0" + d : d;
}

// ---- Muat Warta dari localStorage ----
// Warta sekarang bisa berupa beberapa entri (list) yang berisi teks dan/atau
// file (gambar/PDF). Semua warta ditampilkan berurutan di halaman jemaat.
function muatWarta() {
  var data = bacaData(KEY_WARTA, null);
  var body = document.getElementById("wartaBody");
  if (!body) return;

  // Deteksi format data:
  // - Array  => format baru (banyak warta)
  // - Objek dengan .teks => format lama (warta tunggal)
  var daftarWarta = [];
  if (Array.isArray(data)) {
    daftarWarta = data;
  } else if (data && typeof data === "object" && data.teks) {
    daftarWarta = [data];
  }

  // Jika tidak ada warta sama sekali, tampilkan pesan default
  if (daftarWarta.length === 0) {
    body.innerHTML = '<p class="warta-item-teks">Belum ada warta untuk ditampilkan.</p>';
    return;
  }

  // Bangun HTML untuk seluruh warta
  var html = "";
  for (var i = 0; i < daftarWarta.length; i++) {
    var w = daftarWarta[i];
    html += '<div class="warta-item">';

    // Tanggal warta (jika ada)
    if (w.tanggalUpdate) {
      html += '<div class="warta-item-date">' + aman(formatTanggalRingkas(w.tanggalUpdate)) + '</div>';
    }

    // File (gambar/PDF) — ditampilkan langsung tanpa perlu di-download
    var adaFile = w.fileBase64 && w.fileType;
    if (adaFile) {
      html += renderFileWarta(w);
    }

    // Teks warta (jika ada) — hanya tampilkan jika TIDAK ada file PDF
    // (supaya tidak dobel: teks + file pdf)
    var isPdf = adaFile && w.fileType === "application/pdf";
    if (w.teks && w.teks.trim().length > 0 && !isPdf) {
      html += '<div class="warta-item-teks">' + aman(w.teks) + '</div>';
    }

    html += '</div>';
  }
  body.innerHTML = html;
}

// Ubah tanggal ISO jadi format singkat Indonesia, mis. "30 Agu 2026"
function formatTanggalRingkas(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  var bulan = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];
  var tgl = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
  return tgl + " " + bulan[d.getMonth()] + " " + d.getFullYear();
}

// Render file warta (gambar tampil langsung; PDF dibuka lewat iframe/object)
function renderFileWarta(w) {
  // Gambar (png/jpg/jpeg/gif/webp) => <img>
  if (w.fileType === "image/png" || w.fileType === "image/jpeg" ||
      w.fileType === "image/jpg" || w.fileType === "image/gif" ||
      w.fileType === "image/webp") {
    return '<div class="warta-file-image">' +
             '<img src="' + w.fileBase64 + '" alt="' + aman(w.fileName || "Warta") + '" style="max-width:100%;height:auto;border-radius:8px;">' +
           '</div>';
  }
  // PDF => tampilkan nama file + tombol unduh (hanya sekali)
  if (w.fileType === "application/pdf") {
    var namaFile = w.fileName ? aman(w.fileName) : "Warta.pdf";
    return '<div class="warta-file-pdf">' +
             '<p class="warta-file-name">📄 ' + namaFile + '</p>' +
             '<p class="warta-pdf-download"><a href="' + w.fileBase64 + '" download="' + aman(w.fileName || "warta.pdf") + '">📥 Unduh</a></p>' +
           '</div>';
  }
  // Jenis file lain => fallback link
  return '<div class="warta-file-other"><a href="' + w.fileBase64 + '" target="_blank">Buka ' +
           aman(w.fileName || "File") + '</a></div>';
}

// ---- Render Jadwal dari localStorage (atau default) ----
function renderJadwal() {
  var data = bacaData(KEY_JADWAL, null);
  var jadwal = {
    raya: jadwalDefault.raya,
    anak: jadwalDefault.anak,
    kpr: jadwalDefault.kpr,
    khusus: []
  };

  // Bila admin pernah menyimpan jadwal, gunakan data tersebut
  if (data && typeof data === "object") {
    if (Array.isArray(data.raya) && data.raya.length > 0) jadwal.raya = data.raya;
    if (Array.isArray(data.anak) && data.anak.length > 0) jadwal.anak = data.anak;
    if (Array.isArray(data.kpr) && data.kpr.length > 0) jadwal.kpr = data.kpr;
    // Ibadah khusus: data bisa berupa array of {nama, kategori, items}
    if (Array.isArray(data.khusus)) jadwal.khusus = data.khusus;
  }

  // Ibadah Raya
  var rayaEl = document.getElementById("tab-raya");
  if (rayaEl) rayaEl.innerHTML = buatKartuJadwal(jadwal.raya);

  // Anak
  var anakEl = document.getElementById("tab-anak");
  if (anakEl) anakEl.innerHTML = buatKartuJadwal(jadwal.anak);

  // KPR
  var kprEl = document.getElementById("tab-kpr");
  if (kprEl) kprEl.innerHTML = buatKartuJadwal(jadwal.kpr);

  // Ibadah Khusus: hapus tab khusus lama lalu buat ulang sesuai data admin
  renderJadwalKhusus(jadwal.khusus);
}

// ---- Render tab Ibadah Khusus secara dinamis ----
// Setiap kategori khusus admin akan ditampilkan sebagai tombol tab + isi konten.
function renderJadwalKhusus(daftarKhusus) {
  var bungkusTab = document.querySelector(".schedule-tabs");
  var isiKhususLama = document.querySelectorAll(".tab-content[data-khusus]");

  // 1) Buang semua elemen tab & konten khusus versi lama (biar tidak menumpuk)
  document.querySelectorAll(".tab-btn[data-kategori='khusus']").forEach(function(b) { b.remove(); });
  isiKhususLama.forEach(function(el) { if (el) el.parentNode.removeChild(el); });

  // 2) Kalau tidak ada kategori khusus, langsung berhenti
  if (!bungkusTab || !Array.isArray(daftarKhusus) || daftarKhusus.length === 0) return;

  // 3) Buat satu tombol tab untuk setiap kategori khusus
  daftarKhusus.forEach(function(kat) {
    var namaKategori = kat.nama || "Ibadah Khusus";
    var btn = document.createElement("button");
    btn.className = "tab-btn";
    btn.setAttribute("data-tab", "khusus-" + (kat.id || "0"));
    btn.setAttribute("data-kategori", "khusus");
    btn.textContent = namaKategori;
    // klik tab khusus: aktifkan tombol dan kontennya
    btn.addEventListener("click", function() {
      aktifkanTab(btn);
    });
    bungkusTab.appendChild(btn);
  });

  // 4) Buat satu konten (container kartu jadwal) untuk setiap kategori khusus
  daftarKhusus.forEach(function(kat) {
    var id = "khusus-" + (kat.id || "0");
    var div = document.createElement("div");
    div.className = "tab-content";
    div.id = id;
    div.setAttribute("data-khusus", "1");
    div.innerHTML = buatKartuJadwal(kat.items);
    // pasang konten tepat setelah tombol tab khusus (di dalam section jadwal)
    document.getElementById("jadwal").appendChild(div);
  });
}

// ---- Fungsi umum untuk menampilkan satu tab jadwal ----
// Dipakai oleh tab bawaan dan tab khusus agar perilakunya konsisten.
function aktifkanTab(btn) {
  // nonaktifkan semua tombol tab
  document.querySelectorAll(".tab-btn").forEach(function(b) {
    b.classList.remove("active");
  });
  // sembunyikan semua konten tab
  document.querySelectorAll(".tab-content").forEach(function(t) {
    t.classList.remove("active");
  });

  btn.classList.add("active");
  var tabId = "tab-" + btn.getAttribute("data-tab");
  var target = document.getElementById(tabId);
  if (target) target.classList.add("active");
}

function buatKartuJadwal(items) {
  if (!items || items.length === 0) {
    return '<div class="empty-note">Belum ada jadwal.</div>';
  }
  var html = "";
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    html += '<div class="schedule-card">' +
              '<div class="schedule-day">' + aman(it.hari) + '</div>' +
              '<div class="schedule-detail">' +
                '<strong>' + aman(it.nama) + '</strong>' +
                '<span>' + aman(it.jam || "") + '</span>' +
              '</div>' +
            '</div>';
  }
  return html;
}

// ---- Escape HTML agar aman ----
function aman(str) {
  if (!str) return "";
  var p = document.createElement("p");
  p.textContent = str;
  return p.innerHTML;
}

// ---- Tab jadwal (tab bawaan: umum, anak, kpr) ----
function inisialisasiTab() {
  var btns = document.querySelectorAll(".tab-btn:not([data-kategori='khusus'])");
  btns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      aktifkanTab(btn);
    });
  });
}

// ---- Mobile menu ----
function inisialisasiMenu() {
  var btn = document.getElementById("mobileMenuBtn");
  var nav = document.getElementById("mainNav");
  if (!btn || !nav) return;
  btn.addEventListener("click", function() {
    nav.classList.toggle("open");
  });
  // tutup menu saat link menu diklik (mobile)
  var links = nav.querySelectorAll(".nav-link");
  links.forEach(function(link) {
    link.addEventListener("click", function() {
      nav.classList.remove("open");
    });
  });
}

// ---- Highlight menu aktif saat scroll ----
function inisialisasiScrollSpy() {
  var sections = document.querySelectorAll("section[id]");
  var links = document.querySelectorAll(".nav-link");
  window.addEventListener("scroll", function() {
    var pos = window.scrollY + 120;
    var current = "";
    sections.forEach(function(sec) {
      if (pos >= sec.offsetTop) {
        current = sec.getAttribute("id");
      }
    });
    links.forEach(function(link) {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active");
      }
    });
  });
}

// ---- Formulir Jemaat Baru ----
function inisialisasiFormJemaat() {
  var form = document.getElementById("formJemaatBaru");
  if (!form) return;
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    var nama = document.getElementById("namaLengkap").value.trim();
    var tanggalLahir = document.getElementById("tanggalLahir").value;
    var noTelp = document.getElementById("noTelp").value.trim();
    var alamatRumah = document.getElementById("alamatRumah").value.trim();

    if (!nama || !tanggalLahir || !noTelp || !alamatRumah) return;

    var list = bacaData(KEY_JEMAAT, []);
    list.push({
      id: Date.now(),
      nama: nama,
      tanggalLahir: tanggalLahir,
      noTelp: noTelp,
      alamatRumah: alamatRumah,
      tglDaftar: new Date().toISOString()
    });
    tulisData(KEY_JEMAAT, list);

    // tampilkan pesan sukses & reset
    var success = document.getElementById("successJemaat");
    if (success) success.style.display = "block";
    form.reset();
    setTimeout(function() {
      if (success) success.style.display = "none";
    }, 6000);
  });
}

// ---- Formulir Permohonan Doa ----
function inisialisasiFormDoa() {
  var form = document.getElementById("formDoa");
  if (!form) return;
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    var pokok = document.getElementById("pokokDoa").value.trim();
    if (!pokok) return;

    var privasi = "rahasia";
    var radios = document.getElementsByName("privasiDoa");
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
        privasi = radios[i].value;
        break;
      }
    }

    var list = bacaData(KEY_DOA, []);
    list.unshift({
      id: Date.now(),
      pokok: pokok,
      privasi: privasi, // 'rahasia' atau 'publik'
      tanggal: new Date().toISOString()
    });
    tulisData(KEY_DOA, list);

    var success = document.getElementById("successDoa");
    if (success) success.style.display = "block";
    form.reset();
    // reset radio ke default
    var first = document.querySelector('input[name="privasiDoa"][value="rahasia"]');
    if (first) first.checked = true;
    setTimeout(function() {
      if (success) success.style.display = "none";
    }, 6000);
  });
}

// ---- Inisialisasi saat halaman dimuat ----
document.addEventListener("DOMContentLoaded", function() {
  tampilkanTanggalHariIni();
  muatWarta();
  renderJadwal();
  inisialisasiTab();
  inisialisasiMenu();
  inisialisasiScrollSpy();
  inisialisasiFormJemaat();
  inisialisasiFormDoa();
});
