const jwt = require('jsonwebtoken');

// JWT配置
const JWT_SECRET = 'railway_inspection_system_secret_key';
const JWT_EXPIRES_IN = '24h';

/**
 * 生成JWT token
 * @param {Object} payload - token负载信息
 * @returns {string} token字符串
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证JWT token
 * @param {string} token - token字符串
 * @returns {Object|null} 验证成功返回解码后的payload，失败返回null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token验证失败:', error);
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken
};
