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

/**
 * GET /api/heritage/export/csv
 * 导出非遗项目为CSV格式
 */
router.get('/export/csv', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        "Proj_num",
        "Name_CN",
        "Name_EN",
        "CategoryCN",
        "CategoryEN",
        "Time",
        "ProvinceCN",
        "Place_CN",
        "Unit_CN",
        "X" as longitude,
        "Y" as latitude
      FROM shapefile."国家级非遗点位GCS_WGS_1984"
      ORDER BY "CategoryCN", "Proj_num"
    `);

    // 生成CSV内容
    const headers = ['项目号', '项目名称', '英文名称', '分类', '英文分类', '登记年份', '省份', '地点', '保护单位', '经度', '纬度'];
    const csvContent = [
      headers.join(','),
      ...result.rows.map(row => [
        row.Proj_num || '',
        `"${(row.Name_CN || '').replace(/"/g, '""')}"`,
        `"${(row.Name_EN || '').replace(/"/g, '""')}"`,
        row.CategoryCN || '',
        row.CategoryEN || '',
        row.Time || '',
        row.ProvinceCN || '',
        `"${(row.Place_CN || '').replace(/"/g, '""')}"`,
        `"${(row.Unit_CN || '').replace(/"/g, '""')}"`,
        row.longitude || '',
        row.latitude || ''
      ].join(','))
    ].join('\n');

    // 设置响应头
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="heritage_export.csv"');
    res.send('\ufeff' + csvContent); // BOM for Excel UTF-8
  } catch (error) {
    console.error('导出CSV失败:', error);
    res.status(500).json({
      success: false,
      message: '导出失败',
      error: error.message
    });
  }
});

/**
 * GET /api/heritage/export/json
 * 导出非遗项目为JSON格式
 */
router.get('/export/json', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        "Proj_num" as projNum,
        "Name_CN" as nameCN,
        "Name_EN" as nameEN,
        "CategoryCN" as categoryCN,
        "CategoryEN" as categoryEN,
        "Time" as year,
        "ProvinceCN" as province,
        "Place_CN" as place,
        "Unit_CN" as unit,
        "X" as longitude,
        "Y" as latitude
      FROM shapefile."国家级非遗点位GCS_WGS_1984"
      ORDER BY "CategoryCN", "Proj_num"
    `);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="heritage_export.json"');
    res.json({
      success: true,
      exportTime: new Date().toISOString(),
      totalRecords: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('导出JSON失败:', error);
    res.status(500).json({
      success: false,
      message: '导出失败',
      error: error.message
    });
  }
});

/**
 * GET /api/heritage/export/statistics
 * 导出非遗统计数据
 */
router.get('/export/statistics', async (req, res) => {
  try {
    const categoryStats = await db.query(`
      SELECT 
        "CategoryCN" as category,
        COUNT(*) as count
      FROM shapefile."国家级非遗点位GCS_WGS_1984"
      GROUP BY "CategoryCN"
      ORDER BY count DESC
    `);

    const provinceStats = await db.query(`
      SELECT 
        "ProvinceCN" as province,
        COUNT(*) as count
      FROM shapefile."国家级非遗点位GCS_WGS_1984"
      GROUP BY "ProvinceCN"
      ORDER BY count DESC
    `);

    const yearStats = await db.query(`
      SELECT 
        "Time" as year,
        COUNT(*) as count
      FROM shapefile."国家级非遗点位GCS_WGS_1984"
      GROUP BY "Time"
      ORDER BY "Time"
    `);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({
      success: true,
      exportTime: new Date().toISOString(),
      statistics: {
        byCategory: categoryStats.rows,
        byProvince: provinceStats.rows,
        byYear: yearStats.rows,
        total: categoryStats.rows.reduce((sum, row) => sum + parseInt(row.count), 0)
      }
    });
  } catch (error) {
    console.error('导出统计失败:', error);
    res.status(500).json({
      success: false,
      message: '导出失败',
      error: error.message
    });
  }
});

module.exports = router;
