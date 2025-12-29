const express = require('express');
const router = express.Router();
const db = require('../config/database');

const YRD_TABLE = 'shapefile."长三角-全部_地点唯一_地级市"';

// GET /api/heritage/yrd?page=1&pageSize=5&keyword=昆曲
router.get('/yrd', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 12);
    const keyword = String(req.query.keyword || '').trim();

    const params = [];
    let whereSql = '';

    if (keyword) {
      params.push(`%${keyword}%`);
      whereSql = `WHERE (name_cn ILIKE $1 OR intro ILIKE $1)`;
    }

    const countSql = `SELECT COUNT(*)::int AS total FROM ${YRD_TABLE} ${whereSql}`;
    const countRet = await db.query(countSql, params);
    const total = countRet.rows[0].total;

    const offset = (page - 1) * pageSize;

    const listSql = `
      SELECT
        proj_num AS id,
        name_cn AS name,
        categorycn AS category,
        place_merged AS region,
        intro AS intro,
        x AS lng,
        y AS lat,
        image_url AS image
      FROM ${YRD_TABLE}
      ${whereSql}
      ORDER BY proj_num
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const listRet = await db.query(listSql, [...params, pageSize, offset]);

    res.json({ success: true, data: listRet.rows, total });
  } catch (error) {
    console.error('获取长三角表列表失败:', error);
    res.status(500).json({ success: false, message: '获取长三角表数据失败', error: error.message });
  }
});

// GET /api/heritage/yrd/:id   （这里的 id 就是 proj_num）
router.get('/yrd/:id', async (req, res) => {
  try {
    const id = String(req.params.id); // proj_num 可能是字符串/数字混合，别强转 Number

    const sql = `
      SELECT
        proj_num AS id,
        name_cn AS name,
        categorycn AS category,
        place_merged AS region,
        intro AS intro,
        x AS lng,
        y AS lat,
        image_url AS image
      FROM ${YRD_TABLE}
      WHERE proj_num = $1
      LIMIT 1
    `;

    const ret = await db.query(sql, [id]);

    if (!ret.rows.length) {
      return res.status(404).json({ success: false, message: '项目不存在' });
    }

    res.json({ success: true, data: ret.rows[0] });
  } catch (error) {
    console.error('获取长三角表详情失败:', error);
    res.status(500).json({ success: false, message: '获取长三角表详情失败', error: error.message });
  }
});


/**
 * GET /api/heritage
 * 获取所有非遗项目
 */
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        proj_num,
        name, 
        name_en,
        category, 
        category_en,
        location, 
        location_en,
        province,
        province_en,
        type,
        type_en,
        unit,
        unit_en,
        time,
        longitude,
        latitude,
        region_4,
        region_4_en,
        region_7,
        region_7_en
      FROM shapefile.heritage_items
      ORDER BY proj_num
      LIMIT 100
    `);
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('获取非遗项目失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败',
      error: error.message
    });
  }
});

/**
 * GET /api/heritage/:id
 * 获取单个非遗项目详情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT 
        proj_num,
        name, 
        name_en,
        category, 
        category_en,
        location, 
        location_en,
        province,
        province_en,
        type,
        type_en,
        unit,
        unit_en,
        time,
        longitude,
        latitude,
        region_4,
        region_4_en,
        region_7,
        region_7_en
      FROM shapefile.heritage_items
      WHERE proj_num = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('获取项目详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败',
      error: error.message
    });
  }
});

/**
 * POST /api/heritage/search
 * 搜索非遗项目（支持按省份、分类、关键词）
 */
router.post('/search', async (req, res) => {
  try {
    const { province, category, keyword } = req.body;
    let query = `SELECT proj_num, name, name_en, category, category_en, location, location_en, 
                 province, province_en, type, type_en, unit, unit_en, time, longitude, latitude,
                 region_4, region_4_en, region_7, region_7_en
                 FROM shapefile.heritage_items WHERE 1=1`;
    const params = [];

    if (province && province !== 'all') {
      query += ` AND province = $${params.length + 1}`;
      params.push(province);
    }

    if (category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    if (keyword) {
      query += ` AND (name ILIKE $${params.length + 1} OR name_en ILIKE $${params.length + 1})`;
      params.push(`%${keyword}%`);
      params.push(`%${keyword}%`);
    }

    query += ' ORDER BY proj_num';

    const result = await db.query(query, params);
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索失败',
      error: error.message
    });
  }
});

module.exports = router;
