const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function buildPrompt({ topic, keywords, mood, imageDescription }) {
  return `You are a social media caption expert for MiniConnect.
Generate captions for a post with:
- Topic: ${topic}
- Keywords: ${keywords || 'none'}
- Mood: ${mood || 'creative'}
- Image description: ${imageDescription || 'none'}

Respond ONLY with valid JSON (no markdown):
{
  "creative": "engaging caption with 1 emoji",
  "professional": "professional tone caption",
  "short": "under 80 chars caption",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;
}

function fallbackCaptions({ topic, keywords, mood }) {
  const kw = keywords ? ` ${keywords}` : '';
  const moodText = mood ? ` Feeling ${mood}.` : '';
  return {
    creative: `Turning ideas into reality with ${topic}!${moodText} 🚀`,
    professional: `Sharing progress on ${topic}${kw}. Built with dedication and precision.`,
    short: `${topic} update — stay tuned! ✨`,
    hashtags: ['#MiniConnect', '#WebDev', '#Creator', `#${topic.replace(/\s+/g, '')}`, '#Tech']
  };
}

function parseGeminiJson(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid Gemini response');
  const parsed = JSON.parse(match[0]);
  return {
    creative: String(parsed.creative || '').slice(0, 500),
    professional: String(parsed.professional || '').slice(0, 500),
    short: String(parsed.short || '').slice(0, 200),
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.slice(0, 10).map(String) : []
  };
}

exports.generateCaptions = async (input) => {
  if (!GEMINI_API_KEY) {
    return { ...fallbackCaptions(input), source: 'fallback' };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(input) }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 1024 }
      })
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty Gemini response');
    return { ...parseGeminiJson(text), source: 'gemini' };
  } catch (err) {
    console.warn('Gemini fallback:', err.message);
    return { ...fallbackCaptions(input), source: 'fallback' };
  }
};
