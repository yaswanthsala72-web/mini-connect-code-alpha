exports.validateCaptionInput = (req, res, next) => {
  const { topic, keywords, mood, imageDescription } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
    return res.status(400).json({ error: 'Topic is required (min 2 characters)' });
  }
  if (topic.length > 200) return res.status(400).json({ error: 'Topic too long' });
  if (keywords && keywords.length > 300) return res.status(400).json({ error: 'Keywords too long' });
  if (mood && mood.length > 50) return res.status(400).json({ error: 'Mood too long' });
  if (imageDescription && imageDescription.length > 500) {
    return res.status(400).json({ error: 'Image description too long' });
  }

  req.body.topic = topic.trim();
  req.body.keywords = (keywords || '').trim();
  req.body.mood = (mood || 'creative').trim();
  req.body.imageDescription = (imageDescription || '').trim();
  next();
};
