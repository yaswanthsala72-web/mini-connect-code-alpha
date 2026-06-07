module.exports = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(err.status || 500).json({
      error: err.message || 'Internal server error'
    });
  }

  res.status(err.status || 500).render('500', {
    title: 'Internal Server Error - MiniConnect'
  });
};
