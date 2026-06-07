const CaptionLog = require('../models/CaptionLog');
const { generateCaptions } = require('../utils/gemini');

exports.generateCaption = async (req, res) => {
  try {
    const { topic, keywords, mood, imageDescription } = req.body;
    const result = await generateCaptions({ topic, keywords, mood, imageDescription });

    await CaptionLog.create({
      user: req.session.user.id,
      topic,
      keywords,
      mood,
      imageDescription,
      creative: result.creative,
      professional: result.professional,
      short: result.short,
      hashtags: result.hashtags,
      source: result.source
    });

    res.json({
      creative: result.creative,
      professional: result.professional,
      short: result.short,
      hashtags: result.hashtags,
      source: result.source
    });
  } catch (err) {
    console.error('Caption generation error:', err);
    res.status(500).json({ error: 'Failed to generate caption' });
  }
};
