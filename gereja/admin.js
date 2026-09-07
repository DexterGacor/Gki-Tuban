/* ============================================================
   Gereja Kristus Cinta Kasih — Script Halaman Admin
   Akses via admin.html di bawah kunci admin yang sama kuncinya.
   ============================================================ */

// ===== KONFIGURASI ADMIN =====
// PIN 4 angka. Ganti sesuai keinginan pengurus.
var PIN_ADMIN = "1234";

// ===== Kunci penyimpanan (sama dengan app.js) =====
var KEY_WARTA = "gkkc_warta";
var KEY_JADWAL = "gkkc_jadwal";
var KEY_JEMAAT = "gkkc_jemaat";
var KEY_DOA = "gkkc_doa";

// ===== Helper baca / tulis localStorage =====
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

// ===== Inisialisasi data awal =====
function inisialisasiDataAwal() {
  // Warta: sekarang berupa daftar (array) beberapa warta.
  // Setiap entri: {id, teks, tanggalUpdate, fileBase64, fileType, fileName}
  if (!localStorage.getItem(KEY_WARTA)) {
    tulisData(KEY_WARTA, [
      {
        id: Date.now(),
        teks: "Selamat datang di website resmi Gereja Kristus Cinta Kasih. Silakan hubungi pengurus untuk informasi warta terbaru.",
        tanggalUpdate: new Date().toISOString()
      }
    ]);
  }
  // Jadwal default
  if (!localStorage.getItem(KEY_JADWAL)) {
    tulisData(KEY_JADWAL, {
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
      ]
    });
  }
}

// ===== Utilitas tanggal =====
function formatTanggalIndonesia(iso) {
  if (!iso) return "-";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  var bulan = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];
  var tgl = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
  var bln = bulan[d.getMonth()];
  var thn = d.getFullYear();
  return tgl + " " + bln + " " + thn;
}

function formatTanggalLahir(tanggal) {
  // input date format "YYYY-MM-DD"
  if (!tanggal) return "-";
  var parts = tanggal.split("-");
  if (parts.length !== 3) return tanggal;
  var bulan = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];
  var tgl = parts[2];
  var bln = bulan[parseInt(parts[1], 10) - 1] || parts[1];
  return tgl + " " + bln + " " + parts[0];
}

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

function hitungUmur(tanggalLahir) {
  // input "YYYY-MM-DD"
  if (!tanggalLahir) return null;
  var parts = tanggalLahir.split("-");
  var lahir = new Date(parts[0], parts[1] - 1, parts[2]);
  if (isNaN(lahir.getTime())) return null;
  var sekarang = new Date();
  var umur = sekarang.getFullYear() - lahir.getFullYear();
  var m = sekarang.getMonth() - lahir.getMonth();
  if (m < 0 || (m === 0 && sekarang.getDate() < lahir.getDate())) {
    umur--;
  }
  // Jangan tampilkan "0 tahun" (bayi) atau umur negatif (data salah) —
  // kembalikan null supaya teks tahun tidak muncul.
  if (umur <= 0) return null;
  return umur;
}

// ===== PIN LOGIN =====
function inisialisasiPin() {
  var pinInput = document.getElementById("pinInput");
  var pinBtn = document.getElementById("pinBtn");
  var pinError = document.getElementById("pinError");
  var pinScreen = document.getElementById("pinScreen");
  var adminWrap = document.getElementById("adminWrap");

  // Bila sudah pernah login di sesi ini (sessionStorage), lewati PIN
  if (sessionStorage.getItem("gkkc_admin_ok") === "1") {
    pinScreen.style.display = "none";
    adminWrap.style.display = "block";
    return;
  }

  function cobaMasuk() {
    var nilai = pinInput.value.trim();
    if (nilai === PIN_ADMIN) {
      sessionStorage.setItem("gkkc_admin_ok", "1");
      pinScreen.style.display = "none";
      adminWrap.style.display = "block";
      pinError.style.display = "none";
      loadSemuaData();
    } else {
      pinError.style.display = "block";
      pinInput.value = "";
      pinInput.focus();
    }
  }

  pinBtn.addEventListener("click", cobaMasuk);
  pinInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") cobaMasuk();
  });
  pinInput.focus();
}

// ===== Dashboard: Ulang Tahun =====
function tampilkanUlangTahun() {
  var list = bacaData(KEY_JEMAAT, []);
  var sekarang = new Date();
  var bulanIni = sekarang.getMonth();
  var tanggalIni = sekarang.getDate();

  // jemaat yang bulan & tanggal lahirnya sama dengan hari ini
  var ulang = list.filter(function(j) {
    if (!j.tanggalLahir) return false;
    var parts = j.tanggalLahir.split("-");
    if (parts.length !== 3) return false;
    var bulanLahir = parseInt(parts[1], 10) - 1;
    var tanggalLahir = parseInt(parts[2], 10);
    return bulanLahir === bulanIni && tanggalLahir === tanggalIni;
  });

  // perbarui statistik
  var statUlang = document.getElementById("statUlang");
  if (statUlang) statUlang.textContent = ulang.length;

  var listEl = document.getElementById("birthdayList");
  if (!listEl) return;

  if (ulang.length === 0) {
    listEl.innerHTML = '<p class="empty-note">Tidak ada jemaat yang berulang tahun hari ini.</p>';
    return;
  }

  var html = "";
  for (var i = 0; i < ulang.length; i++) {
    var j = ulang[i];
    var umur = hitungUmur(j.tanggalLahir);
    var umurTeks = umur !== null ? " &mdash; " + umur + " tahun" : "";
    html += '<div class="birthday-item">' +
              '<span class="birthday-cake">🎂</span>' +
              '<div>' +
                '<strong>' + escapeHtml(j.nama) + '</strong>' +
                '<span class="birthday-age">' + umurTeks + '</span>' +
                '<div style="font-size:15px;color:var(--warna-teks-muda);">' +
                  'No. HP: ' + escapeHtml(j.noTelp || "-") +
                '</div>' +
              '</div>' +
            '</div>';
  }
  listEl.innerHTML = html;
}

// ===== Tabel Jemaat =====
function tampilkanTabelJemaat() {
  var list = bacaData(KEY_JEMAAT, []);
  var statJemaat = document.getElementById("statJemaat");
  if (statJemaat) statJemaat.textContent = list.length;

  var tbody = document.getElementById("jemaatTableBody");
  var empty = document.getElementById("emptyJemaat");
  if (!tbody || !empty) return;

  if (list.length === 0) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  var html = "";
  for (var i = 0; i < list.length; i++) {
    var j = list[i];
    var no = i + 1;
    html += '<tr>' +
              '<td>' + no + '</td>' +
              '<td>' + escapeHtml(j.nama) + '</td>' +
              '<td>' + formatTanggalLahir(j.tanggalLahir) + '</td>' +
              '<td>' + escapeHtml(j.noTelp || "-") + '</td>' +
              '<td>' + escapeHtml(j.alamatRumah || "-") + '</td>' +
            '</tr>';
  }
  tbody.innerHTML = html;
}

// ===== Tabel Doa =====
function tampilkanTabelDoa() {
  var list = bacaData(KEY_DOA, []);
  var statDoa = document.getElementById("statDoa");
  if (statDoa) statDoa.textContent = list.length;

  var tbody = document.getElementById("doaTableBody");
  var empty = document.getElementById("emptyDoa");
  if (!tbody || !empty) return;

  if (list.length === 0) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  var html = "";
  for (var i = 0; i < list.length; i++) {
    var d = list[i];
    var no = i + 1;
    var badge = d.privasi === "publik"
      ? '<span class="badge-privasi badge-publik">Publik</span>'
      : '<span class="badge-privasi badge-rahasia">Rahasia</span>';
    html += '<tr>' +
              '<td>' + no + '</td>' +
              '<td>' + escapeHtml(d.pokok) + '</td>' +
              '<td>' + badge + '</td>' +
              '<td>' + formatTanggalIndonesia(d.tanggal) + '</td>' +
            '</tr>';
  }
  tbody.innerHTML = html;
}

// ===== Muat data Warta & Jadwal ke form =====
function muatWartaKeForm() {
  var data = bacaData(KEY_WARTA, null);
  var textarea = document.getElementById("wartaText");
  if (!textarea) return;

  // Deteksi format: array (baru) atau objek tunggal (lama)
  var wartaTerbaru = null;
  if (Array.isArray(data) && data.length > 0) {
    wartaTerbaru = data[0];
  } else if (data && typeof data === "object" && data.teks) {
    wartaTerbaru = data;
  }

  if (wartaTerbaru && wartaTerbaru.teks) {
    textarea.value = wartaTerbaru.teks;
  }
}

// ============================================================
// KELOLA JADWAL — bentuk baru: setiap kategori dibuka dari
// localStorage, bisa ditambah & dihapus baris per baris.
// ============================================================

// Ambil objek jadwal lengkap dari localStorage; kalau belum ada buat default.
function ambilJadwal() {
  var data = bacaData(KEY_JADWAL, null);
  var jadwal = {
    raya: [],
    anak: [],
    kpr: [],
    khusus: [] // array berisi {id, nama, items:[{hari,nama,jam}]}
  };
  if (data && typeof data === "object") {
    if (Array.isArray(data.raya)) jadwal.raya = data.raya;
    if (Array.isArray(data.anak)) jadwal.anak = data.anak;
    if (Array.isArray(data.kpr)) jadwal.kpr = data.kpr;
    if (Array.isArray(data.khusus)) jadwal.khusus = data.khusus;
  }
  return jadwal;
}

// Tampilkan/sembunyikan kolom "Nama Ibadah Khusus"
// ketika admin memilih/mengganti kategori di dropdown.
function aturKolomNamaKhusus() {
  var select = document.getElementById("kategoriJadwal");
  var grup = document.getElementById("grupNamaKhusus");
  if (!select || !grup) return;
  select.addEventListener("change", function() {
    // Tunjukkan kolom nama khusus hanya saat pilihan = "khusus"
    grup.style.display = (select.value === "khusus") ? "block" : "none";
    if (select.value !== "khusus") {
      // biarkan jika tidak diperlukan, tetap bisa diisi
    }
  });
}

// Inisialisasi tombol "Tambah Jadwal"
function inisialisasiTambahJadwal() {
  var btn = document.getElementById("tambahJadwalBtn");
  var msg = document.getElementById("msgTambah");
  if (!btn) return;

  btn.addEventListener("click", function() {
    var kategori = document.getElementById("kategoriJadwal").value;
    var hari = document.getElementById("hariJadwal").value.trim();
    var namaKegiatan = document.getElementById("namaKegiatan").value.trim();
    var jam = document.getElementById("jamJadwal").value.trim();
    var namaKhusus = document.getElementById("namaKhusus").value.trim();

    // Validasi: hari & nama kegiatan wajib diisi
    if (!hari || !namaKegiatan) {
      alert("Mohon isi Hari dan Nama Kegiatan terlebih dahulu.");
      return;
    }

    var jadwal = ambilJadwal();

    // ---- Jika sedang dalam mode EDIT ----
    if (dataSedangEdit) {
      var kEdit = dataSedangEdit.kategori;
      if (kEdit === "khusus") {
        // cari lokasi item asli pada kategori khusus
        var pos = hitungPosisiAsli(kEdit, dataSedangEdit.index);
        if (pos) {
          for (var x = 0; x < jadwal.khusus.length; x++) {
            if (jadwal.khusus[x].id === pos.katId) {
              jadwal.khusus[x].items[pos.katIdx] = { hari: hari, nama: namaKegiatan, jam: jam };
              // bila admin juga mengubah nama ibadah khusus, perbarui nama kategorinya
              if (namaKhusus) jadwal.khusus[x].nama = namaKhusus;
              break;
            }
          }
        }
      } else {
        // kategori biasa: perbarui item pada index yang sama
        if (Array.isArray(jadwal[kEdit]) && jadwal[kEdit][dataSedangEdit.index]) {
          jadwal[kEdit][dataSedangEdit.index] = { hari: hari, nama: namaKegiatan, jam: jam };
        }
      }

      simpanJadwal(jadwal);
      // kembalikan tombol ke mode tambah
      akhiriModeEdit();
      // pesan singkat bahwa edit berhasil
      if (msg) {
        msg.textContent = "Perubahan jadwal berhasil disimpan ✓";
        msg.style.display = "block";
        setTimeout(function() { msg.style.display = "none"; }, 2500);
      }
      // kosongkan kolom isian
      document.getElementById("hariJadwal").value = "";
      document.getElementById("namaKegiatan").value = "";
      document.getElementById("jamJadwal").value = "";
      document.getElementById("namaKhusus").value = "";
      document.getElementById("grupNamaKhusus").style.display = "none";
      muatDaerahKelola();
      renderDaftarKhususRingkas();
      return;
    }

    // ---- Mode TAMBAH biasa ----
    if (kategori === "khusus") {
      // Untuk ibadah khusus, admin bisa memakai nama khusus yang baru
      // atau menambah ke kategori khusus pertama yang ada.
      if (!namaKhusus) {
        // Bila nama khusus tidak diisi, beri nama default
        namaKhusus = "Ibadah Khusus";
      }
      // Cari kategori khusus yang namanya sama (agar jadwal masuk ke situ)
      var ketemu = null;
      for (var i = 0; i < jadwal.khusus.length; i++) {
        if (jadwal.khusus[i].nama === namaKhusus) {
          ketemu = jadwal.khusus[i];
          break;
        }
      }
      // Kalau belum ada, buat kategori khusus baru
      if (!ketemu) {
        ketemu = { id: Date.now(), nama: namaKhusus, items: [] };
        jadwal.khusus.push(ketemu);
      }
      ketemu.items.push({ hari: hari, nama: namaKegiatan, jam: jam });
    } else {
      // Kategori bawaan (raya / anak / kpr): cukup tambahkan ke array
      jadwal[kategori].push({ hari: hari, nama: namaKegiatan, jam: jam });
    }

    simpanJadwal(jadwal);
    // tampilkan pesan sukses sementara
    msg.style.display = "block";
    setTimeout(function() { msg.style.display = "none"; }, 2500);

    // Bersihkan kolom isian agar siap menambah lagi
    document.getElementById("hariJadwal").value = "";
    document.getElementById("namaKegiatan").value = "";
    document.getElementById("jamJadwal").value = "";

    // Perbarui tampilan tabel kelola di bawah
    muatDaerahKelola();
    renderDaftarKhususRingkas();
  });
}

// Simpan objek jadwal ke localStorage
function simpanJadwal(jadwal) {
  tulisData(KEY_JADWAL, jadwal);
}

// Tampilkan daftar kategori khusus yang sudah ada
// (memudahkan admin melihat ibadah khusus yang sudah dibuat).
function renderDaftarKhususRingkas() {
  var kontainer = document.getElementById("jadwalKhususList");
  if (!kontainer) return;
  var jadwal = ambilJadwal();
  if (jadwal.khusus.length === 0) {
    kontainer.innerHTML = '<p class="empty-note">Belum ada ibadah khusus yang ditambahkan.</p>';
    return;
  }
  var html = "";
  for (var i = 0; i < jadwal.khusus.length; i++) {
    var k = jadwal.khusus[i];
    html += '<div class="khusus-chip">' +
              '<strong>' + escapeHtml(k.nama) + '</strong>' +
              ' <span>(' + k.items.length + ' jadwal)</span>' +
            '</div>';
  }
  kontainer.innerHTML = html;
}

// ===== Variabel global untuk mode "Edit Jadwal" =====
// Dipakai agar fungsi tambah tahu sedang menambah atau mengedit.
// null = mode tambah; berisi objek = mode edit.
var dataSedangEdit = null;

// ===== Variabel global untuk mode "Edit Warta" =====
var wartaSedangEdit = null;

// Ambil index baris sebenarnya di dalam array asli berdasarkan kategori.
// Untuk ibadah khusus, jadwal antar kategori digabung, jadi perlu hitung
// ulang posisi item pada kategori khusus yang tepat.
function hitungPosisiAsli(kategori, index) {
  if (kategori !== "khusus") {
    return null; // kategori biasa: index tabel = index array
  }
  var jadwal = ambilJadwal();
  var akumulasi = 0;
  for (var i = 0; i < jadwal.khusus.length; i++) {
    var k = jadwal.khusus[i];
    if (index < akumulasi + k.items.length) {
      // kembalikan lokasi: id kategori + index item di dalamnya
      return { katId: k.id, katIdx: index - akumulasi, katIndeksKategori: i };
    }
    akumulasi += k.items.length;
  }
  return null;
}

// Isi semua kolom form dengan nilai jadwal yang mau diedit.
// Sekaligus menampilkan kolom nama khusus bila perlu.
function isiFormUntukEdit(kategori, index) {
  var jadwal = ambilJadwal();
  var item = null;

  if (kategori === "khusus") {
    var pos = hitungPosisiAsli(kategori, index);
    if (!pos) return;
    // cari kategori khusus berdasarkan id
    var katObj = null;
    for (var a = 0; a < jadwal.khusus.length; a++) {
      if (jadwal.khusus[a].id === pos.katId) { katObj = jadwal.khusus[a]; break; }
    }
    if (katObj) {
      item = katObj.items[pos.katIdx];
      // isikan nama ibadah khusus agar admin tahu ini milik kategori apa
      document.getElementById("namaKhusus").value = katObj.nama;
      document.getElementById("grupNamaKhusus").style.display = "block";
    }
  } else {
    item = jadwal[kategori][index];
  }

  if (!item) return;

  // isi kolom form sesuai data
  document.getElementById("hariJadwal").value = item.hari || "";
  document.getElementById("namaKegiatan").value = item.nama || "";
  document.getElementById("jamJadwal").value = item.jam || "";
  // set dropdown kategori mengikuti baris yang diedit
  document.getElementById("kategoriJadwal").value = kategori;
}

// Muat tabel "Kelola Jadwal" untuk kategori yang dipilih
function muatDaerahKelola() {
  var select = document.getElementById("kelolaKategori");
  var tbody = document.getElementById("kelolaTableBody");
  var empty = document.getElementById("emptyKelola");
  if (!select || !tbody || !empty) return;

  var jadwal = ambilJadwal();
  var kategori = select.value;

  // Kumpulkan baris jadwal untuk kategori yang dipilih
  var daftarBaris = [];
  if (kategori === "khusus") {
    // gabungkan semua jadwal dari semua kategori khusus jadi satu daftar
    jadwal.khusus.forEach(function(k) {
      k.items.forEach(function(it) {
        daftarBaris.push({ hari: it.hari, nama: it.nama, jam: it.jam, grup: k.nama });
      });
    });
  } else {
    (jadwal[kategori] || []).forEach(function(it) {
      daftarBaris.push({ hari: it.hari, nama: it.nama, jam: it.jam, grup: kategori });
    });
  }

  if (daftarBaris.length === 0) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  var html = "";
  for (var i = 0; i < daftarBaris.length; i++) {
    var b = daftarBaris[i];
    var no = i + 1;
    var infoKhusus = kategori === "khusus"
      ? ' <span class="kelola-grup">(' + escapeHtml(b.grup) + ')</span>'
      : "";
    html += '<tr>' +
              '<td>' + no + '</td>' +
              '<td>' + escapeHtml(b.hari) + '</td>' +
              '<td>' + escapeHtml(b.nama) + infoKhusus + '</td>' +
              '<td>' + escapeHtml(b.jam || "-") + '</td>' +
              '<td>' +
                '<button class="btn-edit" data-i="' + i + '" data-kat="' + kategori + '">Edit</button> ' +
                '<button class="btn-hapus" data-i="' + i + '" data-kat="' + kategori + '">Hapus</button>' +
              '</td>' +
            '</tr>';
  }
  tbody.innerHTML = html;

  // Pasang aksi hapus pada setiap tombol "Hapus"
  tbody.querySelectorAll(".btn-hapus").forEach(function(tombol) {
    tombol.addEventListener("click", function() {
      var idx = parseInt(tombol.getAttribute("data-i"), 10);
      var kat = tombol.getAttribute("data-kat");
      hapusJadwal(kat, idx);
    });
  });

  // Pasang aksi edit pada setiap tombol "Edit"
  tbody.querySelectorAll(".btn-edit").forEach(function(tombol) {
    tombol.addEventListener("click", function() {
      var idx = parseInt(tombol.getAttribute("data-i"), 10);
      var kat = tombol.getAttribute("data-kat");
      mulaiEdit(kat, idx);
    });
  });
}

// Mulai mode edit: isi form dengan data baris yang diklik,
// lalu ubah tombol "Tambah Jadwal" menjadi "Simpan Perubahan".
function mulaiEdit(kategori, index) {
  // simpannya konteks yang sedang diedit agar saat simpan tahu posisi aslinya
  dataSedangEdit = { kategori: kategori, index: index };

  // isi form dengan nilai data tersebut
  isiFormUntukEdit(kategori, index);

  // kembalikan dropdown kategori pada form ke kategori yang diedit
  var btn = document.getElementById("tambahJadwalBtn");
  if (btn) btn.textContent = "Simpan Perubahan";

  // tampilkan tombol "Batalkan Edit" agar admin bisa membatalkan mode edit
  var batal = document.getElementById("batalEditBtn");
  if (batal) batal.style.display = "inline-block";

  // arahkan pandangan pengguna ke form di atas (berguna di HP)
  var formAtas = document.querySelector(".admin-form");
  if (formAtas && formAtas.scrollIntoView) {
    formAtas.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Akhiri mode edit (kembalikan tombol jadi "Tambah Jadwal")
function akhiriModeEdit() {
  dataSedangEdit = null;
  var btn = document.getElementById("tambahJadwalBtn");
  if (btn) btn.textContent = "Tambah Jadwal";
  // sembunyikan tombol "Batalkan Edit"
  var batal = document.getElementById("batalEditBtn");
  if (batal) batal.style.display = "none";
}

// Hapus satu baris jadwal berdasarkan kategori & index
function hapusJadwal(kategori, index) {
  var jadwal = ambilJadwal();

  if (kategori === "khusus") {
    // Untuk ibadah khusus, kita telusuri semua kategori khusus
    // dan hapus baris ke-`index` dari daftar gabungan.
    var akumulasi = 0;
    for (var i = 0; i < jadwal.khusus.length; i++) {
      var k = jadwal.khusus[i];
      if (index < akumulasi + k.items.length) {
        k.items.splice(index - akumulasi, 1);
        // hapus kategori khusus bila sudah tidak punya jadwal alias kosong
        if (k.items.length === 0) {
          jadwal.khusus.splice(i, 1);
        }
        break;
      }
      akumulasi += k.items.length;
    }
  } else {
    if (Array.isArray(jadwal[kategori])) {
      jadwal[kategori].splice(index, 1);
    }
  }

  simpanJadwal(jadwal);
  // perbarui tampilan setelah hapus
  muatDaerahKelola();
  renderDaftarKhususRingkas();
}

// Inisialisasi seluruh bagian kelola jadwal
function inisialisasiKelolaJadwal() {
  aturKolomNamaKhusus();
  inisialisasiTambahJadwal();

  var btnTampilkan = document.getElementById("tampilkanKelolaBtn");
  if (btnTampilkan) {
    btnTampilkan.addEventListener("click", muatDaerahKelola);
  }
  // saat dropdown kategori berubah, muat ulang daftar
  var select = document.getElementById("kelolaKategori");
  if (select) {
    select.addEventListener("change", muatDaerahKelola);
  }

  // tombol "Batalkan Edit": keluar dari mode edit tanpa menyimpan
  var batal = document.getElementById("batalEditBtn");
  if (batal) {
    batal.addEventListener("click", function() {
      akhiriModeEdit();
      // kosongkan kembali kolom isian
      document.getElementById("hariJadwal").value = "";
      document.getElementById("namaKegiatan").value = "";
      document.getElementById("jamJadwal").value = "";
      document.getElementById("namaKhusus").value = "";
      document.getElementById("grupNamaKhusus").style.display = "none";
      document.getElementById("kategoriJadwal").value = "raya";
    });
  }

  renderDaftarKhususRingkas();
  muatDaerahKelola();
}

// ===== Simpan Warta =====
function inisialisasiSimpanWarta() {
  var btn = document.getElementById("saveWartaBtn");
  var msg = document.getElementById("msgWarta");
  var textarea = document.getElementById("wartaText");
  var fileInput = document.getElementById("wartaFile");
  var filePreview = document.getElementById("filePreview");
  var fileNameEl = document.getElementById("fileName");
  var removeFileBtn = document.getElementById("removeFileBtn");
  var batalBtn = document.getElementById("batalEditWartaBtn");
  if (!btn || !textarea) return;

  var selectedFile = null;

  // Handle file selection
  if (fileInput) {
    fileInput.addEventListener("change", function() {
      var file = fileInput.files[0];
      if (file) {
        // Validasi ukuran file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert("Ukuran file melebihi 5 MB. Silakan pilih file yang lebih kecil.");
          fileInput.value = "";
          return;
        }
        selectedFile = file;
        fileNameEl.textContent = file.name;
        filePreview.style.display = "block";
      }
    });
  }

  // Handle remove file (hanya hapus preview, file lama tetap dipakai saat edit)
  if (removeFileBtn) {
    removeFileBtn.addEventListener("click", function() {
      selectedFile = null;
      fileInput.value = "";
      filePreview.style.display = "none";
    });
  }

  // Handle batal edit
  if (batalBtn) {
    batalBtn.addEventListener("click", function() {
      akhiriModeEditWarta();
    });
  }

  btn.addEventListener("click", function() {
    var teks = textarea.value.trim();

    // Validasi: jika mode tambah, harus ada teks atau file baru
    // Jika mode edit, boleh kosong (menggunakan data lama)
    if (!wartaSedangEdit && !teks && !selectedFile) {
      alert("Mohon isi teks warta atau pilih file terlebih dahulu.");
      return;
    }

    function simpanWarta(fileBase64, fileType, fileName) {
      var dataLama = bacaData(KEY_WARTA, []);
      var daftarWarta = Array.isArray(dataLama) ? dataLama : (dataLama ? [dataLama] : []);

      if (wartaSedangEdit) {
        // MODE EDIT: update item yang ada
        var idx = wartaSedangEdit.index;
        var wartaLama = daftarWarta[idx];
        if (wartaLama) {
          // Pertahankan file lama jika tidak pilih file baru
          var finalFileBase64 = fileBase64 || wartaLama.fileBase64 || null;
          var finalFileType = fileType || wartaLama.fileType || null;
          var finalFileName = fileName || wartaLama.fileName || null;

          // Jika user klik "hapus file" di mode edit (selectedFile = null tapi filePreview disembunyikan)
          // Maka fileBase64 akan null -> kita set finalFileBase64 = null untuk menghapus file
          if (!selectedFile && filePreview.style.display === "none" && wartaLama.fileBase64) {
            // User memilih menghapus file lama
            finalFileBase64 = null;
            finalFileType = null;
            finalFileName = null;
          }

          daftarWarta[idx] = {
            id: wartaLama.id, // pertahankan ID asli
            teks: teks,
            tanggalUpdate: new Date().toISOString(),
            fileBase64: finalFileBase64,
            fileType: finalFileType,
            fileName: finalFileName
          };
        }
      } else {
        // MODE TAMBAH: tambah di awal
        var wartaBaru = {
          id: Date.now(),
          teks: teks,
          tanggalUpdate: new Date().toISOString()
        };
        if (fileBase64) {
          wartaBaru.fileBase64 = fileBase64;
          wartaBaru.fileType = fileType;
          wartaBaru.fileName = fileName;
        }
        daftarWarta.unshift(wartaBaru);
      }

      tulisData(KEY_WARTA, daftarWarta);

      msg.style.display = "block";
      msg.textContent = wartaSedangEdit ? "Perubahan warta berhasil disimpan ✓" : "Warta berhasil disimpan ✓";
      setTimeout(function() { msg.style.display = "none"; }, 3000);

      // Reset form & keluar mode edit
      akhiriModeEditWarta();
      textarea.value = "";
      selectedFile = null;

      // Refresh daftar
      renderDaftarWarta();
      muatWartaKeForm();
    }

    if (selectedFile) {
      var reader = new FileReader();
      reader.onload = function(e) {
        simpanWarta(e.target.result, selectedFile.type, selectedFile.name);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      simpanWarta(null, null, null);
    }
  });
}

// ===== Render Daftar Warta (Edit/Hapus) =====
function renderDaftarWarta() {
  var tbody = document.getElementById("wartaTableBody");
  var empty = document.getElementById("emptyWartaList");
  if (!tbody || !empty) return;

  var data = bacaData(KEY_WARTA, []);
  var daftarWarta = Array.isArray(data) ? data : (data ? [data] : []);

  if (daftarWarta.length === 0) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  var html = "";
  for (var i = 0; i < daftarWarta.length; i++) {
    var w = daftarWarta[i];
    var no = i + 1;
    var tanggal = w.tanggalUpdate ? formatTanggalRingkas(w.tanggalUpdate) : "-";
    var teksPreview = w.teks ? escapeHtml(w.teks.substring(0, 80)) + (w.teks.length > 80 ? "..." : "") : "-";
    var fileInfo = "-";
    if (w.fileBase64 && w.fileType) {
      if (w.fileType === "application/pdf") {
        fileInfo = '<span class="badge-file pdf">📄 PDF</span>';
      } else if (w.fileType.startsWith("image/")) {
        fileInfo = '<span class="badge-file img">🖼️ Gambar</span>';
      } else {
        fileInfo = '<span class="badge-file">📎 ' + escapeHtml(w.fileName || "File") + '</span>';
      }
    }
    html += '<tr>' +
              '<td>' + no + '</td>' +
              '<td>' + tanggal + '</td>' +
              '<td>' + teksPreview + '</td>' +
              '<td>' + fileInfo + '</td>' +
              '<td>' +
                '<button class="btn-edit" data-warta-index="' + i + '">Edit</button> ' +
                '<button class="btn-hapus" data-warta-index="' + i + '">Hapus</button>' +
              '</td>' +
            '</tr>';
  }
  tbody.innerHTML = html;

  // Event listeners untuk tombol edit
  tbody.querySelectorAll(".btn-edit").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var idx = parseInt(btn.getAttribute("data-warta-index"), 10);
      mulaiEditWarta(idx);
    });
  });

  // Event listeners untuk tombol hapus
  tbody.querySelectorAll(".btn-hapus").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var idx = parseInt(btn.getAttribute("data-warta-index"), 10);
      hapusWarta(idx);
    });
  });
}

// Mulai mode edit warta
function mulaiEditWarta(index) {
  var data = bacaData(KEY_WARTA, []);
  var daftarWarta = Array.isArray(data) ? data : (data ? [data] : []);
  var w = daftarWarta[index];
  if (!w) return;

  wartaSedangEdit = { index: index, data: w };

  // Isi form
  document.getElementById("wartaText").value = w.teks || "";

  // Handle file preview jika ada file lama
  var filePreview = document.getElementById("filePreview");
  var fileNameEl = document.getElementById("fileName");
  var fileInput = document.getElementById("wartaFile");
  if (w.fileBase64 && w.fileName) {
    fileNameEl.textContent = w.fileName + " (file lama, biarkan kosong untuk mempertahankan)";
    filePreview.style.display = "block";
  } else {
    filePreview.style.display = "none";
  }
  if (fileInput) fileInput.value = "";

  // Ubah tombol simpan & tampilkan batalkan
  var saveBtn = document.getElementById("saveWartaBtn");
  var batalBtn = document.getElementById("batalEditWartaBtn");
  if (saveBtn) saveBtn.textContent = "Simpan Perubahan";
  if (batalBtn) batalBtn.style.display = "inline-block";

  // Scroll ke form
  var formAtas = document.querySelector(".admin-form");
  if (formAtas && formAtas.scrollIntoView) {
    formAtas.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Akhiri mode edit warta
function akhiriModeEditWarta() {
  wartaSedangEdit = null;
  var saveBtn = document.getElementById("saveWartaBtn");
  var batalBtn = document.getElementById("batalEditWartaBtn");
  var filePreview = document.getElementById("filePreview");
  var fileInput = document.getElementById("wartaFile");
  if (saveBtn) saveBtn.textContent = "Simpan Warta";
  if (batalBtn) batalBtn.style.display = "none";
  if (filePreview) filePreview.style.display = "none";
  if (fileInput) fileInput.value = "";
  document.getElementById("wartaText").value = "";
}

// Hapus warta
function hapusWarta(index) {
  if (!confirm("Yakin ingin menghapus warta ini?")) return;

  var data = bacaData(KEY_WARTA, []);
  var daftarWarta = Array.isArray(data) ? data : (data ? [data] : []);
  daftarWarta.splice(index, 1);
  tulisData(KEY_WARTA, daftarWarta);

  renderDaftarWarta();
  muatWartaKeForm(); // refresh form jika warta terbaru dihapus
}

// ===== Logout =====
function inisialisasiLogout() {
  var btn = document.getElementById("logoutBtn");
  if (!btn) return;
  btn.addEventListener("click", function() {
    sessionStorage.removeItem("gkkc_admin_ok");
    location.reload();
  });
}

// ===== Escape HTML =====
function escapeHtml(str) {
  if (!str) return "";
  var p = document.createElement("p");
  p.textContent = str;
  return p.innerHTML;
}

// ===== Navigasi Menu Admin =====
// Menampilkan satu halaman menu saja agar dashboard tidak menumpuk.
function inisialisasiMenuAdmin() {
  var menuBtns = document.querySelectorAll(".admin-menu-btn");
  if (!menuBtns.length) return;

  menuBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      // aktifkan tombol menu yang diklik
      menuBtns.forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");

      // tampilkan hanya halaman menu yang bersangkutan
      var page = btn.getAttribute("data-page");
      document.querySelectorAll(".admin-menu-page").forEach(function(el) {
        el.style.display = (el.id === "halaman-" + page) ? "block" : "none";
      });

      // muat ulang data untuk halaman yang dipilih (agar selalu segar)
      if (page === "jemaat") muatTabelJemaatJuga();
      if (page === "doa") muatTabelDoaJuga();
      if (page === "jadwal") { renderDaftarKhususRingkas(); muatDaerahKelola(); }
      if (page === "warta") renderDaftarWarta();
    });
  });
}

// bungkus kecil agar pemanggilan menu tetap sederhana
function muatTabelJemaatJuga() { tampilkanTabelJemaat(); }
function muatTabelDoaJuga() { tampilkanTabelDoa(); }

// ===== Muat semua data dashboard =====
function loadSemuaData() {
  muatWartaKeForm();
  renderDaftarWarta();
  inisialisasiKelolaJadwal();
  tampilkanUlangTahun();
  tampilkanTabelJemaat();
  tampilkanTabelDoa();
}

// ===== Inisialisasi saat halaman dimuat =====
document.addEventListener("DOMContentLoaded", function() {
  inisialisasiDataAwal();
  inisialisasiPin();
  inisialisasiSimpanWarta();
  inisialisasiLogout();
  inisialisasiMenuAdmin();

  // bila sudah login (mis. reload), muat data juga
  if (sessionStorage.getItem("gkkc_admin_ok") === "1") {
    loadSemuaData();
  }
});
