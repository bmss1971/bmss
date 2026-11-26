const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'অ্যাক্সেস টোকেন পাওয়া যায়নি।' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'bmss_raptor_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'টোকেনটি সঠিক নয় বা মেয়াদ শেষ হয়েছে।' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
