# Absensi App (Face Recognition Attendance System)

Sistem absensi berbasis pengenalan wajah yang terdiri dari dua bagian utama:
- **Backend (API AI & Face Recognition):** Menggunakan Python FastAPI, YuNet, dan ArcFace.
- **Frontend (Web App):** Menggunakan Next.js (App Router), Prisma ORM, dan MySQL.

## 🛠 Prasyarat Sistem

Sebelum memulai instalasi, pastikan komputer Anda telah terinstal:
- **Python 3.11.7** (Sangat disarankan untuk kompatibilitas library AI)
- **Node.js** (Minimal versi 18.x)
- **MySQL Server** (Bisa menggunakan XAMPP, Laragon, atau MySQL Standalone)
- **Git**

---

## 🚀 Panduan Setup & Instalasi

### 1. Clone Repository
Buka terminal dan clone repository ini (jika belum):
```bash
git clone <https://github.com/Asenn4/Absent.git>
cd Absent
```

### 2. Setup Database MySQL
1. Buka MySQL Server Anda (misal: jalankan module MySQL di XAMPP).
2. Buat database baru dengan nama `absensi` (atau nama lain sesuai preferensi Anda).
   - Anda dapat membuatnya via phpMyAdmin atau menggunakan command line: `CREATE DATABASE absensi;`

### 3. Setup Frontend (Next.js)
Frontend bertanggung jawab untuk antarmuka pengguna dan manajemen database/logika bisnis umum.

1. Buka terminal baru dan navigasikan ke folder `absensi-fe`:
   ```bash
   cd absensi-fe
   ```
2. Instal semua dependensi Node.js:
   ```bash
   npm install
   ```
3. Konfigurasi Environment Variables:
   - Pastikan file `.env` sudah ada dan konfigurasinya mengarah ke database MySQL Anda.
   - Contoh isi `.env`:
     ```env
     DATABASE_URL="mysql://root:@localhost:3306/absensi"
     ```
     *(Sesuaikan username `root`, password, port `3306`, dan nama database `absensi` dengan setup lokal Anda)*
4. Migrasi Database dengan Prisma:
   - Jalankan perintah berikut untuk mensinkronisasi skema ke dalam tabel database MySQL:
     ```bash
     npx prisma db push
     ```
     *(Sebagai alternatif, Anda juga bisa menggunakan `npx prisma migrate dev` jika Anda ingin menyimpan histori migrasi).*
5. Jalankan Frontend Server:
   ```bash
   npm run dev
   ```
   Aplikasi Next.js akan berjalan di `http://localhost:3000`.

### 4. Setup Backend (Python FastAPI)
Backend digunakan khusus sebagai mesin pemroses untuk deteksi wajah (AI) dan ekstraksi vektor wajah.

1. Buka terminal baru (biarkan terminal frontend tetap berjalan) dan masuk ke folder `absensi-be`:
   ```bash
   cd absensi-be
   ```
2. Buat Virtual Environment (Sangat Direkomendasikan):
   ```bash
   python -m venv .venv
   ```
3. Aktifkan Virtual Environment:
   - **Windows (PowerShell):**
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt):**
     ```cmd
     .\.venv\Scripts\activate.bat
     ```
4. Instal Dependensi Python:
   Pastikan terminal Anda sudah menunjukkan awalan `(.venv)`, lalu jalankan:
   ```bash
   pip install -r requirements.txt
   ```
5. Persiapan Model AI (Sangat Penting):
   Folder model AI diabaikan oleh Git karena ukurannya yang besar. Anda perlu membuat folder `model` di dalam `absensi-be` dan menaruh file model `.onnx` yang dibutuhkan dengan struktur hierarki seperti ini:
   ```text
   absensi-be/
   │
   ├── model/
   │   ├── face_detection_yunet_2026may.onnx
   │   └── buffalo_l/
   │       └── w600k_r50.onnx
   ```
   *(Minta file model ini kepada developer utama atau unduh dari sumber referensi ArcFace/YuNet).*
6. Jalankan Backend API Server:
   ```bash
   uvicorn main:app --reload
   ```
   API FastAPI akan berjalan di `http://localhost:8000`.

---

## ▶️ Cara Penggunaan Aplikasi
Untuk mulai menggunakan sistem absensi, pastikan urutan berikut berjalan:
1. Pastikan **MySQL Server** sedang menyala.
2. Pastikan **Backend FastAPI** (`uvicorn main:app --reload`) sedang berjalan (di terminal pertama).
3. Pastikan **Frontend Next.js** (`npm run dev`) sedang berjalan (di terminal kedua).
4. Buka browser dan akses `http://localhost:3000`.
5. Aplikasi absensi siap digunakan!

---

## 📝 Catatan Penting Tambahan
- **CORS Setup:** API Backend pada `main.py` sudah diatur untuk menerima request (`allow_origins=["*"]`). Saat production, pastikan Anda menggantinya dengan domain Frontend spesifik demi keamanan.
- **Izin Kamera:** Browser akan meminta izin akses kamera Webcam. Pastikan mengizinkan (Allow) agar fitur live camera absensi bisa berjalan, dan pastikan Webcam tidak sedang dipakai oleh aplikasi lain.
