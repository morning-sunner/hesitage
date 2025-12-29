const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/ping', (req, res) => res.json({ ok: true }));

// 获取 FAQ（只取启用的，按 sort 升序）
router.get('/faqs', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, q, a, sort
       FROM shapefile.support_faqs
       WHERE is_active = true
       ORDER BY sort ASC, id ASC`
    )

    res.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('读取 support_faqs 失败：', error)
    res.status(500).json({ success: false, message: '读取FAQ失败', error: error.message })
  }
})


router.post('/feedback', async (req, res) => {
  try {
    const {
      user_id,
      email,
      type,
      desc,
      contact,
      page,
      diagnostics_basic,
      diagnostics_full,
      user_agent,
      ip,
      diagnostics, // 兼容你前端现在传的 diagnostics
    } = req.body || {};

    if (!type || !String(desc || '').trim()) {
      return res.status(400).json({ success: false, message: 'type / desc 不能为空' });
    }
    if (String(desc).length > 5000) {
      return res.status(400).json({ success:false, message:'问题描述太长（最多5000字）' });
    }


    const diagBasic = diagnostics_basic ?? diagnostics ?? null;
    const diagFull = diagnostics_full ?? null;

    const ua = user_agent ?? req.headers['user-agent'] ?? null;

    // 取 IP（最常见写法；上线有反代再加 trust proxy）
    const realIp =
      ip ??
      (req.headers['x-forwarded-for']?.toString().split(',')[0].trim()) ??
      req.socket.remoteAddress ??
      null;

    const result = await db.query(
      `INSERT INTO shapefile.support_feedback
        (user_id, email, type, "desc", contact, page, diagnostics_basic, diagnostics_full, user_agent, ip)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, created_at`,
      [
        user_id ?? null,
        email ?? null,
        type,
        desc,
        contact ?? null,
        page ?? null,
        diagBasic,
        diagFull,
        ua,
        realIp,
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('写入 support_feedback 失败：', error);
    res.status(500).json({ success: false, message: '提交失败', error: error.message });
  }
});

module.exports = router;
