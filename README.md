# Patungan 🧾

**Hari 1 — 30 Days of Code.** Kalkulator patungan (split bill) untuk makan bareng di Indonesia: pajak restoran (PB1) dan service charge ikut kehitung per orang, hasilnya tampil seperti struk kasir dan bisa disalin ke WhatsApp dalam satu ketukan.

🔗 Live: [ISI URL DEPLOY]

## Kenapa dibuat

Aplikasi split bill global (Splitwise, Tricount) tidak paham kebiasaan Indonesia: pajak restoran PB1 10% yang dihitung dari *subtotal + service*, service charge 5–10%, dan tagih-menagih yang ujung-ujungnya lewat grup WhatsApp. Patungan menyelesaikan tiga hal itu tanpa install aplikasi dan tanpa akun.

## Keputusan desain

- **Identitas "struk kasir hangat".** Hasil tampil seperti struk belanja — kertas hangat (`#FFF8EE`), tinta pekat, angka monospace, garis putus-putus, dan ujung struk bergerigi. Struk adalah bahasa visual yang langsung dipahami siapa pun yang pernah makan di luar.
- **Mobile-first, satu kolom → dua kolom.** Di HP semua langkah berurutan ke bawah; di layar ≥900px panel struk menempel (sticky) di kanan supaya hasil selalu terlihat saat input diubah.
- **Nol dependency, nol request eksternal.** HTML + CSS + JS vanilla dalam 3 file. Tidak ada font/CDN/framework — halaman ~20 KB, mulus di HP kentang dan lolos Lighthouse 90+.
- **Data di browser saja.** Semua tersimpan di `localStorage`; tidak ada server, tidak ada pelacakan.
- **Copywriting Indonesia sehari-hari.** "Bagi tagihan makan bareng tanpa drama", "yang nggak ikut, nggak bayar item ini". Bukan terjemahan kaku.

## Cara pakai

1. Tambahkan nama semua yang ikut.
2. Tambahkan menu + harga, lalu ketuk nama siapa yang ikut tiap menu (default: semua).
3. Aktifkan PB1 10% / service charge kalau belum termasuk di nota.
4. Salin rincian → tempel di grup WhatsApp.

## Rumus

- Porsi item = harga ÷ jumlah peserta item itu.
- Service = `%service` × subtotal, dibagi proporsional per porsi.
- PB1 = 10% × (subtotal + service), dibagi proporsional per porsi. (Sesuai praktik umum resto Indonesia.)
- Selisih pembulatan rupiah dibebankan ke tagihan terbesar, jadi total selalu pas.

## Sumber acuan

- PB1 10% dihitung dari (subtotal + service charge); service standar 5–10%: kalkupro.com/kalkulator/pembagian-tagihan
- Ekspor ringkasan format teks WhatsApp + arsip `localStorage`: github.com/hashizumee/fairshare
- Assign tiap item ke peserta spesifik: github.com/hndko/split-bill-vue3

## Struktur

```
index.html   — struktur + copy
styles.css   — identitas struk, responsif 360/390/768/1280px
app.js       — state, hitung, render, localStorage, salin WA
```
