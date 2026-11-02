# 🚀 MEMORY ALBUM — REVISION BUILD SPECIFICATION FOR AI CODING CLI
### Ultra Prompt v2.1 (Antigravity Edition) | Minimalist UI × Taste UI

> **Dokumen Panduan Eksekusi AI Coding CLI**  
> Dibuat khusus untuk dieksekusi secara otonom oleh AI Coding Assistant (Antigravity CLI, Cursor, Claude Code, Aider, Codex).  
> Dokumen ini mengintegrasikan standar **Minimalist UI** dan **Taste UI (Anti-Slop)** untuk merevisi interface Memory Album menjadi lebih tenang, mewah, minim teks, dan memiliki micro-interaction kelas dunia.

---

## ⚡ 1. EXECUTIVE SUMMARY & VISION
- **Nama Proyek:** Memory Album — Interactive 3D Digital Keepsake
- **Fokus Revisi:** Elevasi UI/UX dari fungsional standar menjadi *editorial minimalism* bercita rasa tinggi (*taste-driven UI*).
- **Inti Perubahan:**
  1. **Simplifikasi Amplop Pembuka (Unboxing Envelope):** Menghilangkan kebisingan teks dan ornamen generik, memfokuskan atensi pada gestur taktil segel lilin (*wax seal*).
  2. **Floating Morphing Action Pill:** Menggantikan tombol kustomisasi album kaku di bawah buku dengan floating button elegan bergaya Framer motion toggle (`language-icon-toggle.framer.website`) yang mengekspansi menjadi tab segmented `Setting` dan `Share`.
  3. **Diet Teks Studio Kustomisasi (Anti-Slop Copy):** Merampingkan seluruh copy dan subketerangan pada 4 tab (Sampul, Halaman, Musik, Prolog) tanpa mengurangi fungsionalitas teknis.
  4. **Dynamic Expandable CTA "Bikin Sendiri":** Mengganti banner penerima hadiah dengan tombol hover-expand mikrointeraktif berbasis CSS/Tailwind (adaptasi Uiverse) dengan ikon pensil presisi.
- **Prinsip Estetika:** *Restraint over decoration*. Tidak ada gradien ungu generik, tidak ada emoji dekoratif pada label kontrol, tipografi tenang, transisi berbobot fisik nyata (*spring physics*).

---

## 🏗️ 2. TECHNICAL ARCHITECTURE & STACK
- **Framework:** React 18.3.1 + Vite 6.0.7
- **Language:** TypeScript 5.6.3
- **Styling:** Tailwind CSS 3.4.17 + Pure CSS Transitions / Keyframes
- **State Architecture:** React Context API (`AlbumContext.tsx`)
- **Animation Strategy:** Zero additional heavy dependencies — implementasi menggunakan Tailwind utility classes, CSS custom properties, dan transform GPU hardware-accelerated (`transform`, `opacity`, `translate3d`).

---

## 📁 3. AFFECTED FILE ARCHITECTURE

```
album framer/
├── src/
│   ├── App.tsx                          # Update layout floating controls & recipient CTA bar
│   ├── components/
│   │   ├── GiftEnvelope.tsx             # Revisi 1: Minimalist unboxing modal
│   │   ├── FloatingActionToggle.tsx     # Revisi 2: [NEW COMPONENT] Framer-style toggle
│   │   ├── CreateOwnButton.tsx          # Revisi 4: [NEW COMPONENT] Uiverse-style hover expander
│   │   └── editor/
│   │       ├── StudioEditor.tsx         # Revisi 3: Streamlined drawer header & tab bar
│   │       ├── CoverTab.tsx             # Revisi 3: Minimalist label & swatches
│   │       ├── PagesTab.tsx             # Revisi 3: High-density minimalist page manager
│   │       ├── AtmosphereTab.tsx        # Revisi 3: Concise audio & background controls
│   │       └── NarrativeTab.tsx         # Revisi 3: Clean prologue inputs
└── revision.md                          # Master build specification (file ini)
```

---

## 🎨 4. DESIGN SYSTEM & VISUAL IDENTITY (MINIMALIST × TASTE UI)

### Palet Warna Terkurasi (No Slop Gradients)
- **Background Kanvas:** Warm Beige (`#E7E3DA`) / Linen (`#DFDBD3`)
- **Card Background:** Soft Warm Ivory (`#F7F5EF` / `#FFFFFF`)
- **Primary Text:** Deep Charcoal (`#18181B`)
- **Secondary / Subtle Text:** Muted Smoke (`#71717A` / `rgba(0,0,0,0.45)`)
- **Borders & Dividers:** Whispering Stroke (`rgba(0,0,0,0.08)`)
- **Wax Seal Crimson:** Heritage Bordeaux (`#8B263E`) dengan aksen kilau emas redup
- **Interactive Hover Dark:** `#18181B` hover ke `#27272A`

### Tipografi
- **Headings & Judul Buku:** Font Serif Klasik / Editorial
- **Antarmuka & Tab:** `font-sans` (Inter), ukuran `text-xs` (11-12px), bobot `medium` hingga `semibold`
- **Data & Micro-counters:** `font-mono` (JetBrains Mono) `text-[10px]`

---

## 📱 5. SPESIFIKASI DETAIL IMPLEMENTASI REVISI

### REVISI 1: Simplifikasi Modal Amplop Pembuka (`GiftEnvelope.tsx`)
*Referensi visual: `1.png`*

- **Masalah Saat Ini:**
  - Terdapat pill badge redundant `"BINGKISAN VIRTUAL"`.
  - Teks instruksi kaku `"KETUK SEGEL UNTUK MEMBUKA"`.
  - Terlalu banyak baris teks yang membuat amplop terasa seperti formulir web daripada bingkisan fisik.
- **Spesifikasi Perubahan:**
  1. **Hapus:** Label eyebrow `"BINGKISAN VIRTUAL"`.
  2. **Hapus:** Tulisan kapital `"KETUK SEGEL UNTUK MEMBUKA"`.
  3. **Judul Utama:** Gunakan judul sederhana nan intim:
     - Jika ada `recipientName`: `"Untuk [Nama]"`
     - Jika default: `"Sebuah Hadiah"`
     - Tipografi: Serif elegan, `text-xl tracking-tight text-neutral-900`.
  4. **Subjudul:** Tampilkan `albumTitle` dalam italic halus `text-xs text-neutral-500`.
  5. **Segel Lilin (Wax Seal):**
     - Ganti emoji `✨` dengan monogram stempel lilin minimalis atau emblem lilin timbul bertekstur.
     - Tambahkan efek hover lembut `scale-105` dengan bayangan hangat organik.
     - Hilangkan animasi pinging neon yang berlebihan; gantikan dengan *pulse* opacity yang sangat subtle pada ring luar.
  6. **Kredit Pengirim:**
     - Cukup letakkan teks tenang di bagian paling bawah: `"Dari [Nama Pengirim]"` dalam `text-[11px] text-neutral-400 font-sans`.
  7. **Card Container:**
     - Pertahankan batas jahitan halus (*dashed border*) namun buat opasitasnya sangat redup (`border-black/5`) agar menyatu alami.

---

### REVISI 2: Floating Action Morphing Toggle (`FloatingActionToggle.tsx`)
*Referensi visual: `2.png` & Framer Inspiration (`https://language-icon-toggle.framer.website/`)*

- **Masalah Saat Ini:**
  - Di sudut kiri bawah viewport (di samping buku), tombol `[ ✏️ KUSTOMISASI ALBUM ]` dan tombol `[ 🎁 ]` memakan ruang visual, statis, dan mengganggu estetika album 3D.
- **Spesifikasi Perubahan:**
  1. **Hapus:** Kedua tombol lama dari `App.tsx`.
  2. **Komponen Baru:** Buat `FloatingActionToggle.tsx` dan letakkan di `fixed bottom-6 left-6 z-40`.
  3. **State 1: Collapsed (Default)**
     - Bentuk: Lingkaran sempurna (`h-10 w-10` atau `42px x 42px`).
     - Tampilan: Background putih (`bg-white/90 backdrop-blur-md`), border halus (`border border-black/10`), shadow melayang lembut (`shadow-lg`).
     - Ikon: Ikon pensil minimalis garis hitam presisi (`h-4 w-4 text-neutral-900`).
     - Micro-interaction: Hover sedikit membesar (`scale-105`), active menekan (`scale-95`).
  4. **State 2: Expanded (Hover / Click)**
     - Ketika di-hover atau di-klik, tombol lingkaran bermutasi secara mulus (*fluid pill expansion*) menjadi segmented pill horizontal:
       - Lebar otomatis menyesuaikan isi (~`170px`).
       - Terdapat 2 tab bersebelahan:
         - **Tab Kiri: "Setting"** (dengan ikon slider/gear kecil atau pensil minimalis).
           - Aksi: Membuka drawer Studio Kustomisasi (`onOpenSettings()`).
         - **Tab Kanan: "Share"** (dengan ikon share/gift minimalis).
           - Aksi: Membuka modal Share Your Memory (`onOpenShare()`).
     - Transisi: Menggunakan `transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`.
     - Slider Highlight: Background hover aktif abu-abu terang / hitam kontras yang berpindah mulus saat kursor berpindah antar tab.

---

### REVISI 3: Reduksi & Perampingan Teks Studio Kustomisasi (`StudioEditor.tsx` & Tabs)
*Referensi visual: `3.png`*

- **Masalah Saat Ini:**
  - Drawer kustomisasi dipenuhi kalimat penjelas panjang yang membuat panel terasa padat (misal: *"Alunan musik otomatis saat membuka album"*, *"Katalog Preset Instrumen Bebas Hak Cipta"*, *"Atau Masukkan URL File MP3 Sendiri"*).
- **Spesifikasi Perubahan:**
  1. **Header Drawer (`StudioEditor.tsx`):**
     - Hapus lampu status hijau berkedip (*no generic pulsing dot*).
     - Ganti judul menjadi `"KUSTOMISASI"` atau `"STUDIO"` (clean font-mono / sans uppercase, `text-xs tracking-wider`).
     - Tombol Reset dan Tutup (✕) dibuat lebih bersih dan minimal.
  2. **Tab Bar:**
     - Singkat label tab:
       - `Sampul` (tetap)
       - `Halaman` (tetap)
       - `Musik` (sebelumnya `"Musik & BG"`)
       - `Prolog` (tetap)
  3. **Tab Musik & BG (`AtmosphereTab.tsx`):**
     - `"Warna Latar Kanvas"` ➔ Ubah menjadi `"Warna Latar"`.
     - Hilangkan subjudul *"Alunan musik otomatis saat membuka album"*.
     - Label switch: `"Musik Latar"` dengan toggle switch modern sederhana.
     - `"Katalog Preset Instrumen Bebas Hak Cipta"` ➔ Ubah menjadi `"Pilihan Instrumen"`.
     - `"Atau Masukkan URL File MP3 Sendiri"` ➔ Ubah menjadi `"URL Audio Custom"`.
     - `"Volume Suara"` ➔ Ubah menjadi `"Volume"`.
  4. **Tab Sampul (`CoverTab.tsx`):**
     - `"Judul Album / Sampul Depan"` ➔ Ubah menjadi `"Judul Album"`.
     - `"Warna Sampul Buku"` ➔ Ubah menjadi `"Warna Sampul"`.
     - `"Warna Tulisan Judul"` ➔ Ubah menjadi `"Warna Tipografi"`.
     - Hilangkan deskripsi panjang di bawah media uploader.
  5. **Tab Halaman (`PagesTab.tsx`):**
     - Hilangkan instruksi teks berulang mengenai format dan rasio foto.
     - Tampilkan daftar thumbnail halaman yang rapi dengan nomor halaman `01`, `02`, dsb.
     - Tombol aksi dibuat berbasis ikon minimalis dengan tooltip hover bersih.
  6. **Tab Prolog (`NarrativeTab.tsx`):**
     - Hilangkan paragraf panjang penjelasan fungsi cerita intro.
     - Gunakan label ringkas: `"Teks Pembuka"`, `"Penulis / Pengirim"`, `"Kecepatan Putar"`.
  7. **Footer CTA:**
     - Dari: `"🎁 Publikasikan & Bagikan Hadiah"`
     - Menjadi: `"Bagikan Album"` (dengan ikon share/gift minimalis dan styling tombol hitam pekat modern).

---

### REVISI 4: Dynamic Expandable CTA "Bikin Sendiri" (`CreateOwnButton.tsx`)
*Referensi visual: `4.png` & Uiverse Code snippet*

- **Masalah Saat Ini:**
  - Pada mode penerima / preview link (`isRecipientMode`), terdapat banner panjang di bagian bawah buku bertuliskan `"🎁 Hadiah Virtual untuk Anda | Buat Album Sendiri →"`.
  - Terlihat memotong pandangan buku dan kurang interaktif.
- **Spesifikasi Perubahan:**
  1. **Hapus:** Seluruh container banner lama di `App.tsx` (baris 112–128).
  2. **Komponen Baru:** Buat `CreateOwnButton.tsx` di `fixed bottom-6 inset-x-0 flex justify-center z-40 pointer-events-none`.
  3. **Arsitektur Tombol (Adaptasi Uiverse + Taste UI):**
     - Pointer events diaktifkan pada tombol: `pointer-events-auto`.
     - **Default State (Bulat):**
       - Ukuran: Lingkaran kompak `44px x 44px`.
       - Styling: Latar hitam arang mewah (`#18181B` atau `bg-neutral-900`), bayangan lembut `shadow-lg shadow-black/20`, border sangat tipis `border border-white/10`.
       - Ikon: Ikon pensil / kuas SVG warna putih presisi di tengah (`h-4 w-4 text-white`).
     - **Hover State (Expanded Pill):**
       - Melebar mulus menjadi `w-[145px] rounded-full`.
       - Ikon bergeser ke kiri dengan lembut.
       - Teks `"Bikin Sendiri"` muncul di sebelah kanan dengan fade-in opacity (`opacity-100 transition-opacity duration-300 delay-75 text-xs font-medium text-white tracking-wide`).
     - **Active / Click:**
       - `scale-95` tactile click feedback.
       - Memicu fungsi `handleCreateOwnAlbum` (reload ke mode pembuat).

---

## 🗄️ 6. DATA MODEL & CONTEXT CONTRACT
Semua perubahan UI di atas tidak merusak struktur state `AlbumContext`:
- `isRecipientMode`: Mengontrol visibilitas tombol pembuat vs tombol penerima.
- `isEditorOpen`: Dikontrol oleh tombol "Setting" pada `FloatingActionToggle`.
- `isShareModalOpen`: Dikontrol oleh tombol "Share" pada `FloatingActionToggle`.
- Integritas link share (LZ-string & Supabase) tetap 100% terjaga.

---

## 🔐 7. SECURITY & INTEGRITY
- Seluruh URL kustom audio tervalidasi skema protokol aman (`http://`, `https://`, atau path lokal `/audio/*`).
- Tidak ada evaluasi script berbahaya dalam input teks judul maupun prolog.

---

## ♿ 8. ACCESSIBILITY (WCAG 2.2 AA)
- Setiap tombol interaktif memiliki `aria-label` deskriptif (misal: `aria-label="Pengaturan Album"`, `aria-label="Bagikan Album"`).
- Kontras warna teks pada tombol gelap (`#FFFFFF` di atas `#18181B`) mencapai rasio 12:1 (jauh melampaui batas minimal 4.5:1).
- Dukungan keyboard: `Enter` dan `Space` dapat mengaktifkan seluruh aksi ekspansi dan modal.

---

## ⚡ 9. PERFORMANCE REQUIREMENTS
- **FPS Stability:** 60fps / 120fps terjamin saat tombol melakukan expand/collapse dengan mengandalkan transisi GPU (`transform`, `opacity`, `width`).
- **Zero Layout Shift (CLS 0):** Tombol melayang berposisi `fixed`, sehingga tidak mengganggu reflow elemen buku 3D di tengah layar.

---

## 🧪 10. QA & VERIFICATION CHECKLIST UNTUK AI CODING CLI

Setelah AI Coding CLI mengaplikasikan kode, jalankan pengujian berikut:

1. **Uji Coba Amplop (`GiftEnvelope`):**
   - Buka URL mode penerima (`/#/view/...`).
   - Pastikan teks eyebrow `"BINGKISAN VIRTUAL"` dan instruksi kapital sudah hilang.
   - Klik segel lilin; pastikan transisi membuka album berjalan mulus.
2. **Uji Coba Floating Action Toggle:**
   - Masuk mode pembuat (URL utama `/`).
   - Pastikan tombol kustomisasi album lama di bawah buku sudah bersih.
   - Amati tombol lingkaran di kiri bawah dengan ikon pensil.
   - Hover pada tombol: pastikan bermutasi menjadi dua tab `Setting` dan `Share`.
   - Klik `Setting`: drawer Studio Kustomisasi terbuka.
   - Klik `Share`: modal Share Your Memory terbuka.
3. **Uji Coba Studio Kustomisasi:**
   - Periksa 4 tab (Sampul, Halaman, Musik, Prolog).
   - Pastikan semua kalimat panjang dan subketerangan redundant telah diringkas sesuai panduan.
   - Pastikan seluruh kontrol (ganti warna, upload media, ganti lagu, slider volume) tetap berfungsi normal.
4. **Uji Coba Tombol "Bikin Sendiri":**
   - Buka URL mode penerima.
   - Pastikan banner lama `"Hadiah Virtual untuk Anda"` sudah hilang.
   - Di bawah buku, terlihat tombol bulat hitam dengan ikon pensil.
   - Hover kursor: tombol melebar dan menampilkan teks `"Bikin Sendiri"`.
   - Klik tombol: aplikasi me-reload ke halaman pembuat album baru.

---

## ❌ 20. STRICT ANTI-PATTERNS (FORBIDDEN)
- **DILARANG** menambahkan dependensi baru yang tidak perlu ke `package.json` jika bisa diselesaikan dengan Tailwind dan React hooks.
- **DILARANG** menggunakan emoji acak warna-warni sebagai pengganti ikon SVG elegan.
- **DILARANG** menyisakan teks panduan panjang seperti petunjuk pengoperasian di dalam UI utama.
- **DILARANG** merusak logika flip buku 3D pada `MemoryAlbum.tsx`.

---

## ✅ 21. DEFINITION OF DONE (DoD)
1. Tampilan antarmuka bersih, tenang, dan menerapkan kaidah Minimalist UI × Taste UI.
2. Tidak ada error build (`npm run build` sukses tanpa peringatan TypeScript).
3. Kode rapi, terdokumentasi, dan mematuhi aturan anti-slop.

---

## 📝 [ORIGINAL INSTRUKSI]
```text
nah sekarng rencana revisi lagi nih untuk popup modal bagian cek dulu saat pertamkali dibuka kan ada popup modal ini ya (gambar 1 ). nah di revisi jadi lebih minim text dan tombol . lalu ikuti aturanminin text seperti rules yg tadi awal sayaberikan . oke ini revisi 1 . dan revisi kedua pada (gambar 2 )coba lihat bagian kiri dari perspefkti saya paling bawah kiri untuk tampilan customisasi album ini seharunya jangan di tempel di area bawah buku nya . seharunya di beri tombol bulat kecil aja bentuk icon tambah dengan warna hitam dan shape tombolnya putih lalu hapus tombol kustomisasi album sebagau gantinya . adpatasi dari ini  (https://language-icon-toggle.framer.website/) untuk bentuk tombl dan motion buttonya  . untuk iconnya ganti aja dari bentuk pensil kecil , jadi saat user klik atau hover muncul tombol baru dengan tab kiri dengah text tombol 'settng' dari peersefkti saya ketika di klik muncul card customnya lihat gambar 3 . untuk tab kanan tombol dengan text 'share' yg memunculkan popup card share your memori . lalu revisi juga pada tampilan preview cek dulunya beserta nnti link hasiljadi yg sudahdikirim ke oragn targetnya . lihat gambar 4 lihat bagian palign bawha buku ada tombol hadih virtual untuk anda hapus aja seluruh texnya ganti jadi tombol  'bikin sendiri' dengan referensi code ini sebagai tombolnya (html;<!-- From Uiverse.io by JaydipPrajapati1910 --> 
<button class="Btn">
  
  <div class="sign"><svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg></div>
  
  <div class="text">Logout</div>
</button>
css: /* From Uiverse.io by JaydipPrajapati1910 */ 
.Btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 45px;
  height: 45px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition-duration: .3s;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
  background-color: rgb(5, 65, 65);
}

/* plus sign */
.sign {
  width: 100%;
  transition-duration: .3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sign svg {
  width: 17px;
}

.sign svg path {
  fill: white;
}
/* text */
.text {
  position: absolute;
  right: 0%;
  width: 0%;
  opacity: 0;
  color: white;
  font-size: 1.2em;
  font-weight: 600;
  transition-duration: .3s;
}
/* hover effect on button width */
.Btn:hover {
  width: 125px;
  border-radius: 40px;
  transition-duration: .3s;
}

.Btn:hover .sign {
  width: 30%;
  transition-duration: .3s;
  padding-left: 20px;
}
/* hover effect button's text */
.Btn:hover .text {
  opacity: 1;
  width: 70%;
  transition-duration: .3s;
  padding-right: 10px;
}
/* button click effect*/
.Btn:active {
  transform: translate(2px ,2px);
}) tapi tinggal ganti iconnya jadi pensil dan tetxnya jadi bikin sendiri . lalu lihat bagian gamba 5 itu ada section kiri mengenai studi kustomisasi . nah dari sini sleuruh aturan yg tadi sayabuat minim text minim subketerangan dll di terapkan . tapipetahnakan sturktru utama hanay reduce bagian2 tetxnya . redcude tetx ini berlaku ditab halaman, music , dan prolog dan sampul ya . pastikan itu di deskrisikan ke ai codingnya , . sekarng buat iontruksinya dalam formta canva siap copy oleh saya nnti di akir output sertakan juga [original intruksi ] disini kaliamt yg saya buat tadi masukan ke dalam kurung origianl intruksi . sekarng tugas kamu analisi dlu secara mendalam . masing2 gambar . sleuruh gambar bisa kamu cek di folder ini (C:\Users\Hilmi\Documents\DRIVE_PRIBADI\AI\ANTIGRAVITY\REA\album framer\assets\revision)
```
