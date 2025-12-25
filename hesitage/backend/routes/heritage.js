const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/heritage
 * 获取所有非遗项目
 */
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, 
        name, 
        category, 
        location, 
        description,
        province,
        city,
        ST_X(coordinates) as lng,
        ST_Y(coordinates) as lat
      FROM shapefile.heritage_items
      ORDER BY id
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
        id, 
        name, 
        category, 
        location, 
        description,
        province,
        city,
        ST_X(coordinates) as lng,
        ST_Y(coordinates) as lat,
        created_at
      FROM shapefile.heritage_items
      WHERE id = $1
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
 * 搜索非遗项目（支持按省份、城市、分类、关键词）
 */
router.post('/search', async (req, res) => {
  try {
    const { province, city, category, keyword } = req.body;
    let query = 'SELECT id, name, category, location, description, province, city, ST_X(coordinates) as lng, ST_Y(coordinates) as lat FROM shapefile.heritage_items WHERE 1=1';
    const params = [];

    if (province && province !== 'all') {
      query += ` AND province = $${params.length + 1}`;
      params.push(province);
    }

    if (city) {
      query += ` AND city = $${params.length + 1}`;
      params.push(city);
    }

    if (category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    if (keyword) {
      query += ` AND (name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
      params.push(`%${keyword}%`);
      params.push(`%${keyword}%`);
    }

    query += ' ORDER BY id';

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
