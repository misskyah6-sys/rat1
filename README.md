# ALFA WEB — Netlify Edition

Browser-only, consent-based location sharing starter. Tidak memakai APK, VPS, Linux, Termux, atau Node.js lokal. Netlify menjalankan fungsi API di cloud.

## Deploy dari HP Android
1. Ekstrak ZIP ini di HP.
2. Upload seluruh isi folder project ke repository GitHub baru (bukan file ZIP sebagai satu file).
3. Login ke https://app.netlify.com/ dan pilih **Add new site → Import an existing project**.
4. Hubungkan GitHub dan pilih repository.
5. Build command: kosongkan. Publish directory: `public`. Functions directory: `netlify/functions`.
6. Deploy. Netlify akan memberi subdomain `https://nama-situs.netlify.app`.
7. Buka `/` untuk dashboard pemilik dan `/join` pada browser perangkat peserta.

Netlify membaca `netlify.toml` untuk direktori publish dan functions. Dependensi `@netlify/blobs` ada di package.json.

## Cara pakai
- Pemilik buka `/`, tekan CREATE SESSION, lalu bagikan kode 6 angka.
- Pemilik perangkat peserta membuka `/join`, memasukkan kode, lalu tekan JOIN SESSION.
- Peserta menekan START LOCATION SHARING dan menyetujui prompt lokasi browser.
- Dashboard pemilik memperbarui lokasi terakhir setiap 5 detik.
- Peserta dapat menekan STOP kapan saja. Sesi berakhir setelah 6 jam atau saat pemilik mengakhirinya.

## Batasan dan keamanan
- Lokasi hanya dibagikan saat halaman peserta aktif/terbuka, perangkat online, dan izin lokasi diberikan. Browser dapat membatasi update di background.
- Ini bukan RAT dan tidak memberi akses tersembunyi.
- Tidak membaca SMS/chat, tidak mengunci Android, tidak mengubah wallpaper, tidak mengaktifkan kamera/mikrofon/flash secara diam-diam, dan tidak mengambil alih perangkat.
- Data lokasi disimpan pada Netlify Blobs sampai sesi dihapus/kedaluwarsa. Jangan gunakan untuk memantau orang tanpa persetujuan.
- Ini starter untuk uji coba, bukan sistem keamanan anti-pencurian yang terjamin. Untuk perangkat Android hilang, aktifkan Google Find Hub / Find My Device.
- Sebelum penggunaan luas, tambahkan rate limiting, audit log, verifikasi identitas, dan kebijakan privasi yang sesuai.

## Troubleshooting
- Pastikan repository berisi `netlify.toml`, `package.json`, `public/`, dan `netlify/functions/`.
- Jika fungsi gagal, cek Deploys → Functions/Logs di Netlify.
- Pastikan Netlify Functions dan Blobs tersedia untuk site/plan yang digunakan.
