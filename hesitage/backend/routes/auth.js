const express = require('express');
const router = express.Router();
const db = require('../config/database');
const emailService = require('../utils/emailService');
const {
  generateVerificationCode,
  generateJWT,
  verifyJWT,
  hashPassword,
  comparePassword,
  generateRememberToken,
  getExpiresAt,
} = require('../utils/auth');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

/**
 * 生成验证码并发送邮件
 * POST /auth/send-code
 */
router.post('/send-code', async (req, res) => {
  try {
    const { email, type } = req.body; // type: 'register' 或 'reset_password'

    if (!email || !type) {
      return res.status(400).json({
        success: false,
        message: '邮箱和类型不能为空',
      });
    }

    if (!['register', 'reset_password'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: '验证码类型无效',
      });
    }

    // 检查邮箱是否已注册（仅注册时）
    if (type === 'register') {
      const result = await db.query('SELECT id FROM shapefile.users WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已被注册',
        });
      }
    } else if (type === 'reset_password') {
      // 检查邮箱是否存在（仅密码重置时）
      const result = await db.query('SELECT id FROM shapefile.users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: '该邮箱未注册',
        });
      }
    }

    // 清除旧的未使用验证码
    await db.query(
      'DELETE FROM shapefile.verification_codes WHERE email = $1 AND type = $2 AND used = false',
      [email, type]
    );

    // 生成新的验证码
    const code = generateVerificationCode();
    const expiresAt = getExpiresAt(parseInt(process.env.CODE_EXPIRE_MINUTES || 10), true);

    // 保存到数据库
    await db.query(
      'INSERT INTO shapefile.verification_codes (email, code, type, expires_at) VALUES ($1, $2, $3, $4)',
      [email, code, type, expiresAt]
    );

    // 发送邮件
    let emailResult;
    if (type === 'register') {
      emailResult = await emailService.sendRegisterCode(email, code);
    } else {
      emailResult = await emailService.sendResetCode(email, code);
    }

    if (!emailResult.success) {
      // 如果邮件发送失败，删除刚才保存的验证码
      await db.query(
        'DELETE FROM shapefile.verification_codes WHERE email = $1 AND code = $2',
        [email, code]
      );
      return res.status(500).json({
        success: false,
        message: '邮件发送失败，请稍后重试',
        error: emailResult.error,
      });
    }

    res.json({
      success: true,
      message: '验证码已发送到你的邮箱',
      expiresAt: Math.floor(expiresAt.getTime() / 1000),
    });
  } catch (error) {
    console.error('发送验证码错误:', error);
    res.status(500).json({
      success: false,
      message: '发送验证码失败',
      error: error.message,
    });
  }
});

/**
 * 用户注册
 * POST /auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword, code } = req.body;

    // 验证输入
    if (!username || !email || !password || !confirmPassword || !code) {
      return res.status(400).json({
        success: false,
        message: '所有字段都不能为空',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: '两次输入的密码不一致',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: '密码长度不能少于 8 位',
      });
    }

    // 验证邮箱验证码
    const codeResult = await db.query(
      'SELECT id, expires_at FROM shapefile.verification_codes WHERE email = $1 AND code = $2 AND type = $3 AND used = false',
      [email, code, 'register']
    );

    if (codeResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: '验证码无效或已过期',
      });
    }

    const codeRecord = codeResult.rows[0];
    if (new Date() > new Date(codeRecord.expires_at)) {
      return res.status(400).json({
        success: false,
        message: '验证码已过期，请重新获取',
      });
    }

    // 检查用户名和邮箱是否已存在
    const existsResult = await db.query(
      'SELECT id FROM shapefile.users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existsResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已被使用',
      });
    }

    // 加密密码
    const passwordHash = await hashPassword(password);

    // 创建用户
    const result = await db.query(
      'INSERT INTO shapefile.users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, passwordHash]
    );

    const user = result.rows[0];

    // 标记验证码为已使用
    await db.query(
      'UPDATE shapefile.verification_codes SET used = true WHERE id = $1',
      [codeRecord.id]
    );

    // 生成 JWT Token
    const token = generateJWT(user.id);

    res.json({
      success: true,
      message: '注册成功',
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败',
      error: error.message,
    });
  }
});

/**
 * 用户登录
 * POST /auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { account, password, rememberMe } = req.body;

    if (!account || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名/邮箱和密码不能为空',
      });
    }

    // 查找用户（用户名或邮箱）
    const result = await db.query(
      'SELECT id, username, email, password_hash FROM shapefile.users WHERE username = $1 OR email = $1',
      [account]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户不存在',
      });
    }

    const user = result.rows[0];

    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '密码错误',
      });
    }

    // 生成 JWT Token
    const token = generateJWT(user.id);

    // 如果勾选了记住我，生成记住我 Token
    let rememberToken = null;
    if (rememberMe) {
      rememberToken = generateRememberToken();
      const expiresAt = getExpiresAt(
        parseInt(process.env.REMEMBER_TOKEN_EXPIRE?.match(/\d+/)?.[0] || 30)
      );

      await db.query(
        'INSERT INTO shapefile.remember_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, rememberToken, expiresAt]
      );
    }

    res.json({
      success: true,
      message: '登录成功',
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
        token,
        rememberToken,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message,
    });
  }
});

/**
 * 用记住我Token进行自动登录
 * POST /auth/auto-login
 */
router.post('/auto-login', async (req, res) => {
  try {
    const { rememberToken } = req.body;

    if (!rememberToken) {
      return res.status(400).json({
        success: false,
        message: '记住我token不能为空',
      });
    }

    // 查找记住我 Token
    const result = await db.query(
      'SELECT user_id, expires_at FROM shapefile.remember_tokens WHERE token = $1',
      [rememberToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: '记住我token无效',
      });
    }

    const tokenRecord = result.rows[0];

    // 检查是否过期
    if (new Date() > new Date(tokenRecord.expires_at)) {
      // 删除过期的 Token
      await db.query('DELETE FROM shapefile.remember_tokens WHERE token = $1', [rememberToken]);
      return res.status(401).json({
        success: false,
        message: '登录已过期，请重新登录',
      });
    }

    // 获取用户信息
    const userResult = await db.query(
      'SELECT id, username, email FROM shapefile.users WHERE id = $1',
      [tokenRecord.user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户不存在',
      });
    }

    const user = userResult.rows[0];

    // 生成新的 JWT Token
    const token = generateJWT(user.id);

    res.json({
      success: true,
      message: '自动登录成功',
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    console.error('自动登录错误:', error);
    res.status(500).json({
      success: false,
      message: '自动登录失败',
      error: error.message,
    });
  }
});

/**
 * 请求重置密码
 * POST /auth/request-reset-password
 */
router.post('/request-reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: '邮箱不能为空',
      });
    }

    // 检查邮箱是否存在
    const userResult = await db.query(
      'SELECT id FROM shapefile.users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: '该邮箱未注册',
      });
    }

    // 调用发送验证码端点的逻辑
    // 清除旧的未使用验证码
    await db.query(
      'DELETE FROM shapefile.verification_codes WHERE email = $1 AND type = $2 AND used = false',
      [email, 'reset_password']
    );

    // 生成新的验证码
    const code = generateVerificationCode();
    const expiresAt = getExpiresAt(parseInt(process.env.CODE_EXPIRE_MINUTES || 10), true);

    // 保存到数据库
    await db.query(
      'INSERT INTO shapefile.verification_codes (email, code, type, expires_at) VALUES ($1, $2, $3, $4)',
      [email, code, 'reset_password', expiresAt]
    );

    // 发送邮件
    const emailResult = await emailService.sendResetCode(email, code);

    if (!emailResult.success) {
      await db.query(
        'DELETE FROM shapefile.verification_codes WHERE email = $1 AND code = $2',
        [email, code]
      );
      return res.status(500).json({
        success: false,
        message: '邮件发送失败',
        error: emailResult.error,
      });
    }

    res.json({
      success: true,
      message: '密码重置邮件已发送',
      expiresAt: Math.floor(expiresAt.getTime() / 1000),
    });
  } catch (error) {
    console.error('请求重置密码错误:', error);
    res.status(500).json({
      success: false,
      message: '请求失败',
      error: error.message,
    });
  }
});

/**
 * 重置密码
 * POST /auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (!email || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: '所有字段都不能为空',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: '两次输入的密码不一致',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: '新密码长度不能少于 8 位',
      });
    }

    // 验证验证码
    const codeResult = await db.query(
      'SELECT id, expires_at FROM shapefile.verification_codes WHERE email = $1 AND code = $2 AND type = $3 AND used = false',
      [email, code, 'reset_password']
    );

    if (codeResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: '验证码无效或已过期',
      });
    }

    const codeRecord = codeResult.rows[0];
    if (new Date() > new Date(codeRecord.expires_at)) {
      return res.status(400).json({
        success: false,
        message: '验证码已过期',
      });
    }

    // 获取用户
    const userResult = await db.query(
      'SELECT id FROM shapefile.users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: '用户不存在',
      });
    }

    const user = userResult.rows[0];

    // 加密新密码
    const passwordHash = await hashPassword(newPassword);

    // 更新密码
    await db.query(
      'UPDATE shapefile.users SET password_hash = $1 WHERE id = $2',
      [passwordHash, user.id]
    );

    // 标记验证码为已使用
    await db.query(
      'UPDATE shapefile.verification_codes SET used = true WHERE id = $1',
      [codeRecord.id]
    );

    res.json({
      success: true,
      message: '密码已重置，请使用新密码登录',
    });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({
      success: false,
      message: '密码重置失败',
      error: error.message,
    });
  }
});

/**
 * 验证 JWT Token
 * POST /auth/verify-token
 */
router.post('/verify-token', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token 不能为空',
      });
    }

    const result = verifyJWT(token);

    if (!result.valid) {
      return res.status(401).json({
        success: false,
        message: 'Token 无效或已过期',
        error: result.error,
      });
    }

    res.json({
      success: true,
      message: 'Token 有效',
      userId: result.userId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Token 验证失败',
      error: error.message,
    });
  }
});

module.exports = router;
