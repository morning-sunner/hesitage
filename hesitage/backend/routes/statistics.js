const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/statistics
 * 获取总体统计信息
 */
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT category) as categories_count,
        COUNT(DISTINCT province) as provinces_count,
        COUNT(DISTINCT type) as types_count
      FROM shapefile.heritage_items
    `);

    res.json({
      success: true,
      data: {
        total: parseInt(result.rows[0].total),
        categoriesCount: parseInt(result.rows[0].categories_count),
        provincesCount: parseInt(result.rows[0].provinces_count),
        typesCount: parseInt(result.rows[0].types_count)
      }
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
      error: error.message
    });
  }
});

/**
 * GET /api/statistics/by-category
 * 按分类统计
 */
router.get('/by-category', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        category,
        COUNT(*) as count
      FROM shapefile.heritage_items
      GROUP BY category
      ORDER BY count DESC
    `);

    const data = result.rows.map(row => ({
      category: row.category,
      count: parseInt(row.count)
    }));

    res.json({
      success: true,
      data: data,
      total: data.reduce((sum, item) => sum + item.count, 0)
    });
  } catch (error) {
    console.error('按分类统计失败:', error);
    res.status(500).json({
      success: false,
      message: '按分类统计失败',
      error: error.message
    });
  }
});

/**
 * GET /api/statistics/by-region
 * 按地区统计
 */
router.get('/by-region', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        province,
        COUNT(*) as count
      FROM shapefile.heritage_items
      GROUP BY province
      ORDER BY province
    `);

    const data = result.rows.map(row => ({
      province: row.province,
      count: parseInt(row.count)
    }));

    res.json({
      success: true,
      data: data,
      total: data.reduce((sum, item) => sum + item.count, 0)
    });
  } catch (error) {
    console.error('按地区统计失败:', error);
    res.status(500).json({
      success: false,
      message: '按地区统计失败',
      error: error.message
    });
  }
});

/**
 * GET /api/statistics/by-province
 * 按省份统计
 */
router.get('/by-province', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        province,
        COUNT(*) as count
      FROM heritage_items
      GROUP BY province
      ORDER BY count DESC
    `);

    const data = result.rows.map(row => ({
      province: row.province,
      count: parseInt(row.count)
    }));

    res.json({
      success: true,
      data: data,
      total: data.reduce((sum, item) => sum + item.count, 0)
    });
  } catch (error) {
    console.error('按省份统计失败:', error);
    res.status(500).json({
      success: false,
      message: '按省份统计失败',
      error: error.message
    });
  }
});

module.exports = router;
