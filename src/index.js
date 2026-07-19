// Worker "internal" — Basic Auth gate + serve halaman statis Portal Internal.
// Tidak butuh Cloudflare Zero Trust, tidak butuh kartu kredit, gratis penuh.
//
// SETUP SEKALI SAJA (setelah deploy pertama lewat Wrangler):
// 1. Buka project ini di dashboard Cloudflare → tab Settings → Variables and secrets
//    (sekarang sudah muncul karena Worker punya kode, bukan cuma static assets)
// 2. Tambahkan:
//    - INTERNAL_USER  = username bebas (misal: mindset)
//    - INTERNAL_PASS  = password yang mudah diingat owner (klik "Encrypt")
// 3. Simpan — tidak perlu redeploy, secrets langsung aktif

export default {
  async fetch(request, env) {
    const expectedUser = env.INTERNAL_USER || "";
    const expectedPass = env.INTERNAL_PASS || "";

    // Kalau secrets belum diisi, biarkan lewat dulu (supaya tidak mengunci diri sendiri saat setup awal)
    if (!expectedUser || !expectedPass) {
      return env.ASSETS.fetch(request);
    }

    const authHeader = request.headers.get("Authorization");

    if (authHeader) {
      const [scheme, encoded] = authHeader.split(" ");
      if (scheme === "Basic" && encoded) {
        const decoded = atob(encoded);
        const separatorIndex = decoded.indexOf(":");
        const user = decoded.substring(0, separatorIndex);
        const pass = decoded.substring(separatorIndex + 1);

        if (user === expectedUser && pass === expectedPass) {
          return env.ASSETS.fetch(request);
        }
      }
    }

    return new Response("Akses ditolak. Silakan masukkan username & password internal.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Portal Internal Biro Mindset"',
      },
    });
  },
};
