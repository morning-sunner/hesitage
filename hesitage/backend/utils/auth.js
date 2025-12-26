const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

/**
 * 生成 6 位验证码
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 生成 JWT Token
 */
function generateJWT(userId, expiresIn = process.env.JWT_EXPIRE || '7d') {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET,
    { expiresIn }
  );
}

/**
 * 验证 JWT Token
 */
function verifyJWT(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, userId: decoded.userId };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * 加密密码
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * 验证密码
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * 生成记住我 Token
 */
function generateRememberToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 计算过期时间
 */
function getExpiresAt(daysOrMinutes, isMinutes = false) {
  const now = new Date();
  if (isMinutes) {
    now.setMinutes(now.getMinutes() + daysOrMinutes);
  } else {
    now.setDate(now.getDate() + daysOrMinutes);
  }
  return now;
}

module.exports = {
  generateVerificationCode,
  generateJWT,
  verifyJWT,
  hashPassword,
  comparePassword,
  generateRememberToken,
  getExpiresAt,
};
