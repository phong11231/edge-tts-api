const { EdgeTTS } = require('@andresaya/edge-tts');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const text = req.query.text;
  const voice = req.query.voice || 'en-US-JennyNeural';
  const rate = req.query.rate || '0%';
  const pitch = req.query.pitch || '+0Hz';

  if (!text) {
    return res.status(400).json({ error: 'Missing text parameter' });
  }

  try {
    const tts = new EdgeTTS();
    await tts.synthesize(text.substring(0, 2000), voice, { rate, pitch });
    const buffer = await tts.toBuffer();

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(buffer);
  } catch (e) {
    return res.status(500).json({ error: 'TTS failed', message: e.message });
  }
};
