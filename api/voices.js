const { EdgeTTS } = require('@andresaya/edge-tts');

let cachedVoices = null;
let cacheTime = 0;
const CACHE_TTL = 3600000;

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const now = Date.now();
    if (!cachedVoices || now - cacheTime > CACHE_TTL) {
      const tts = new EdgeTTS();
      cachedVoices = await tts.getVoices();
      cacheTime = now;
    }

    const lang = req.query.lang || '';
    let voices = cachedVoices;
    if (lang) {
      voices = voices.filter(v => v.Locale && v.Locale.startsWith(lang));
    }

    const result = voices.map(v => ({
      id: v.ShortName,
      name: v.FriendlyName || v.ShortName,
      gender: v.Gender,
      locale: v.Locale,
    }));

    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load voices', message: e.message });
  }
};
