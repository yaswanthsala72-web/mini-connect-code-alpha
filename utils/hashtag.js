exports.extractHashtags = (text = '') => {
  const matches = text.match(/#[\w]+/g);
  if (!matches) return [];
  return [...new Set(matches.map((tag) => tag.toLowerCase()))];
};

exports.contentMatchesHashtag = (content = '', tag = '') => {
  const normalized = tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
  return content.toLowerCase().includes(normalized);
};
