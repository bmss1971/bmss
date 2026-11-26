const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'সার্ভারে একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।'
  });
};

module.exports = errorHandler;
