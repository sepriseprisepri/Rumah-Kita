// Fungsi serverless Vercel — menjaga API key tetap di server, tidak bocor ke browser.
// Aktif kalau Environment Variable ANTHROPIC_API_KEY sudah diisi di dashboard Vercel.
// Kalau belum diisi, aplikasi otomatis memakai analisis lokal.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Gunakan metode POST' });
  }

  const kunci = process.env.ANTHROPIC_API_KEY;
  if (!kunci) {
    return res.status(501).json({ error: 'ANTHROPIC_API_KEY belum diatur' });
  }

  const minta = req.body && req.body.minta;
  if (!minta || typeof minta !== 'string' || minta.length > 8000) {
    return res.status(400).json({ error: 'Isi permintaan tidak valid' });
  }

  try {
    const balasan = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': kunci,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: minta }]
      })
    });

    if (!balasan.ok) {
      const rinci = await balasan.text();
      return res.status(502).json({ error: 'Gagal memanggil Claude', rinci: rinci.slice(0, 300) });
    }

    const data = await balasan.json();
    const teks = (data.content || []).map(c => c.text || '').join('');
    return res.status(200).json({ teks });
  } catch (e) {
    return res.status(500).json({ error: 'Kesalahan server' });
  }
}
