const jwt  = require('jsonwebtoken');
const {query} = require('../../db/pool');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({success:false, message:'Missing authorization header.'});
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const {rows}  = await query('SELECT id, email, name FROM users WHERE id=$1', [decoded.userId]);
    if (!rows.length) return res.status(401).json({success:false, message:'User not found.'});
    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({success:false, message:'Token expired. Please login again.'});
    }
    return res.status(401).json({success:false, message:'Invalid token.'});
  }
};

module.exports = {authenticate};
