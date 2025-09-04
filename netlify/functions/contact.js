/**
 * Ini adalah "perantara aman" yang berjalan di server Netlify.
 * Tugasnya adalah menerima data dari formulir di website,
 * lalu meneruskannya ke Google Apps Script secara rahasia.
 */

exports.handler = async function (event, context) {
  // 1. Cek apakah metode request adalah POST. Tolak jika bukan.
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405, // Method Not Allowed
      body: JSON.stringify({ status: "error", message: "Hanya metode POST yang diizinkan." }),
    };
  }

  // 2. Ambil URL Google Apps Script dari Environment Variable di Netlify.
  // Ini adalah bagian paling penting untuk keamanan.
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  // 3. Jika URL tidak ditemukan di pengaturan Netlify, kembalikan error.
  if (!GOOGLE_SCRIPT_URL) {
    console.error("Environment variable GOOGLE_SCRIPT_URL tidak diatur!");
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({ status: "error", message: "Konfigurasi server error. URL backend tidak ditemukan." }),
    };
  }

  try {
    // 4. Ambil data dari body request yang dikirim oleh formulir.
    const data = JSON.parse(event.body);

    // 5. Kirim data tersebut ke Google Apps Script menggunakan fetch.
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // 6. Jika Google Apps Script merespon dengan error, teruskan error tersebut.
    if (!response.ok) {
      throw new Error(`Request ke Google Script gagal: ${response.statusText}`);
    }

    // 7. Ambil respon dari Google Apps Script.
    const result = await response.json();

    // 8. Kembalikan respon sukses ke browser.
    console.log("Sukses: Data berhasil diteruskan ke Google Script.");
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };

  } catch (error) {
    // 9. Jika terjadi error di mana pun dalam proses, log error dan kembalikan pesan error.
    console.error("Error di dalam Netlify Function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: "error", message: error.message || "Terjadi kesalahan internal." }),
    };
  }
};

