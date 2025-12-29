// backend/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfService = require('../services/pdfService');
const fs = require('fs');
const path = require('path');

/**
 * 获取PDF文件列表
 * GET /api/pdf/files
 */
router.get('/pdf/files', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    console.log('Fetching PDF files:', { page, limit, offset });

    const [pdfFilesResult, totalCount] = await Promise.all([
      pdfService.getAllPdfFiles(limit, offset),
      pdfService.countPdfFiles()
    ]);

    res.json({
      success: true,
      data: pdfFilesResult.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/pdf/files:', error);
    res.status(500).json({
      success: false,
      message: '获取PDF文件列表失败',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 下载PDF文件
 * GET /api/pdf/download/:id
 */
/**
 * 下载PDF文件（从bytea二进制数据）
 * GET /api/pdf/download/:id
 */
router.get('/pdf/download/:id', async (req, res) => {
  const startTime = Date.now();
  const pdfId = parseInt(req.params.id);
  
  console.log(`Starting download for PDF ID: ${pdfId}`);
  
  try {
    if (isNaN(pdfId)) {
      return res.status(400).json({
        success: false,
        message: '无效的PDF文件ID'
      });
    }

    // 获取PDF文件信息（包含二进制数据）
    const pdfFile = await pdfService.getPdfFileById(pdfId);
    
    if (!pdfFile) {
      return res.status(404).json({
        success: false,
        message: '未找到指定的PDF文件'
      });
    }

    console.log('PDF file found:', {
      id: pdfFile.id,
      file_name: pdfFile.file_name,
      file_size: pdfFile.file_size
    });

    // 检查是否有二进制数据
    if (!pdfFile.file_data) {
      return res.status(500).json({
        success: false,
        message: 'PDF文件数据为空'
      });
    }

    // 设置响应头
    const fileName = encodeURIComponent(pdfFile.file_name);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfFile.file_size);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-File-Name', fileName);
    res.setHeader('X-File-Size', pdfFile.file_size);
    res.setHeader('X-Download-ID', pdfId);

    // 直接将二进制数据发送给客户端
    res.send(pdfFile.file_data);
    
    const duration = Date.now() - startTime;
    console.log(`PDF download completed in ${duration}ms:`, {
      id: pdfId,
      name: pdfFile.file_name,
      size: pdfFile.file_size,
      duration: duration
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`PDF download failed in ${duration}ms:`, error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: '下载PDF文件失败',
        error: error.message,
        duration: duration
      });
    }
  }
});

/**
 * 获取PDF文件信息
 * GET /api/pdf/info/:id
 */
router.get('/pdf/info/:id', async (req, res) => {
  try {
    const pdfId = parseInt(req.params.id);
    
    if (isNaN(pdfId)) {
      return res.status(400).json({
        success: false,
        message: '无效的PDF文件ID'
      });
    }

    const pdfFile = await pdfService.getPdfFileWithStatus(pdfId);
    
    if (!pdfFile.exists) {
      return res.status(404).json({
        success: false,
        message: pdfFile.message
      });
    }

    res.json({
      success: true,
      data: pdfFile
    });
  } catch (error) {
    console.error('Error getting PDF info:', error);
    res.status(500).json({
      success: false,
      message: '获取PDF文件信息失败',
      error: error.message
    });
  }
});

/**
 * 搜索PDF文件
 * GET /api/pdf/search
 */
router.get('/pdf/search', async (req, res) => {
  try {
    const bookName = req.query.name || '';
    const limit = parseInt(req.query.limit) || 20;

    const result = await pdfService.searchPdfFilesByName(bookName, limit);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error searching PDF files:', error);
    res.status(500).json({
      success: false,
      message: '搜索PDF文件失败',
      error: error.message
    });
  }
});

/**
 * 获取热门PDF文件
 * GET /api/pdf/hot
 */
router.get('/pdf/hot', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await pdfService.getHotPdfFiles(limit);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting hot PDF files:', error);
    res.status(500).json({
      success: false,
      message: '获取热门PDF文件失败',
      error: error.message
    });
  }
});

/**
 * 健康检查接口
 * GET /api/pdf/health
 */
router.get('/pdf/health', async (req, res) => {
  try {
    const count = await pdfService.countPdfFiles();
    
    res.json({
      success: true,
      status: 'healthy',
      pdf_count: count,
      timestamp: new Date().toISOString(),
      database: 'hositage',
      schema: 'shapefile'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;