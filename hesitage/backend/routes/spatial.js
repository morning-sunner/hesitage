const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * POST /api/spatial/point-query
 * 点查询 - 查询点击位置的项目
 */
router.post('/point-query', async (req, res) => {
  try {
    const { lng, lat, radius = 0.05 } = req.body;

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：lng, lat'
      });
    }

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
        unit,
        time,
        longitude,
        latitude,
        region_4,
        region_7,
        ST_Distance(geometry, ST_SetSRID(ST_Point($1, $2), 4326)) as distance
      FROM shapefile.heritage_items
      WHERE ST_DWithin(geometry, ST_SetSRID(ST_Point($1, $2), 4326), $3)
      ORDER BY distance
      LIMIT 10
    `, [lng, lat, radius]);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      queryPoint: { lng, lat }
    });
  } catch (error) {
    console.error('点查询失败:', error);
    res.status(500).json({
      success: false,
      message: '点查询失败',
      error: error.message
    });
  }
});

/**
 * POST /api/spatial/buffer-query
 * 缓冲区查询 - 圆形查询
 */
router.post('/buffer-query', async (req, res) => {
  try {
    const { lng, lat, radius = 0.1 } = req.body; // radius in degrees

    if (!lng || !lat || !radius) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：lng, lat, radius'
      });
    }

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
        unit,
        time,
        longitude,
        latitude,
        region_4,
        region_7,
        ST_Distance(geometry, ST_SetSRID(ST_Point($1, $2), 4326)) as distance
      FROM shapefile.heritage_items
      WHERE ST_DWithin(geometry, ST_SetSRID(ST_Point($1, $2), 4326), $3)
      ORDER BY distance
    `, [lng, lat, radius]);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      queryArea: { lng, lat, radius }
    });
  } catch (error) {
    console.error('缓冲区查询失败:', error);
    res.status(500).json({
      success: false,
      message: '缓冲区查询失败',
      error: error.message
    });
  }
});

/**
 * POST /api/spatial/within-region
 * 区域内查询 - 查询某个地区内的项目
 */
router.post('/within-region', async (req, res) => {
  try {
    const { province } = req.body;

    if (!province) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：province'
      });
    }

    let query = `
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
        unit,
        time,
        longitude,
        latitude,
        region_4,
        region_7
      FROM shapefile.heritage_items
      WHERE 1=1
    `;
    const params = [];

    if (province) {
      query += ` AND province = $${params.length + 1}`;
      params.push(province);
    }

    query += ' ORDER BY proj_num';

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      filter: { province }
    });
  } catch (error) {
    console.error('区域查询失败:', error);
    res.status(500).json({
      success: false,
      message: '区域查询失败',
      error: error.message
    });
  }
});

module.exports = router;
