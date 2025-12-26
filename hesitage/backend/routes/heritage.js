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
