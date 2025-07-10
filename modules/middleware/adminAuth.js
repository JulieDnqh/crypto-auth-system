const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // KIỂM TRA VAI TRÒ (ROLE)
    if (decodedToken.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Access is denied.' });
    }

    req.user = { userId: decodedToken.userId, email: decodedToken.email, role: decodedToken.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed!' });
  }
};