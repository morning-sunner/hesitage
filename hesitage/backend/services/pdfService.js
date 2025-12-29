// backend/services/pdfService.js
const db = require('../config/database');

class PdfService {
  constructor() {
    this.schema = 'shapefile';
  }

  // 获取所有PDF文件（不需要file_path了）
  async getAllPdfFiles(limit = 100, offset = 0) {
    try {
      const queryText = `
        SELECT 
          id, 
          file_name,
          upload_time,
          LENGTH(file_data) as file_size,
          created_at, 
          updated_at
        FROM pdf_files 
        ORDER BY id 
        LIMIT $1 OFFSET $2
      `;
      
      const result = await db.queryWithSchema(queryText, [limit, offset], this.schema);
      
      // 从文件名中提取书籍名称
      const files = result.rows.map(row => {
        const bookName = this.extractBookNameFromFileName(row.file_name);
        return {
          ...row,
          book_name: bookName,
          download_count: 0 // 因为没有这个字段，设为0
        };
      });
      
      return { ...result, rows: files };
    } catch (error) {
      console.error('Error getting PDF files:', error);
      throw new Error(`获取PDF文件失败: ${error.message}`);
    }
  }

  // 根据ID获取PDF文件（包含二进制数据）
  async getPdfFileById(id) {
    try {
      const queryText = `
        SELECT 
          id, 
          file_name,
          file_data,  -- 二进制数据
          upload_time,
          LENGTH(file_data) as file_size
        FROM pdf_files 
        WHERE id = $1
      `;
      
      const result = await db.queryWithSchema(queryText, [id], this.schema);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      const bookName = this.extractBookNameFromFileName(row.file_name);
      
      return {
        ...row,
        book_name: bookName,
        download_count: 0
      };
    } catch (error) {
      console.error('Error getting PDF file by ID:', error);
      throw new Error(`获取PDF文件失败: ${error.message}`);
    }
  }

  // 根据文件名搜索PDF文件
  async searchPdfFilesByName(fileName, limit = 50) {
    try {
      const queryText = `
        SELECT 
          id, 
          file_name,
          upload_time,
          LENGTH(file_data) as file_size
        FROM pdf_files 
        WHERE file_name ILIKE $1
        ORDER BY file_name
        LIMIT $2
      `;
      
      const result = await db.queryWithSchema(queryText, [`%${fileName}%`, limit], this.schema);
      
      // 从文件名中提取书籍名称
      const files = result.rows.map(row => {
        const bookName = this.extractBookNameFromFileName(row.file_name);
        return {
          ...row,
          book_name: bookName,
          download_count: 0
        };
      });
      
      return { ...result, rows: files };
    } catch (error) {
      console.error('Error searching PDF files:', error);
      throw new Error(`搜索PDF文件失败: ${error.message}`);
    }
  }

  // 从文件名中提取书籍名称
  extractBookNameFromFileName(fileName) {
    if (!fileName) return '未知书籍';
    
    // 去除文件扩展名
    let name = fileName.replace(/\.pdf$/i, '');
    
    // 去除Z-Library标记
    name = name.replace(/\(Z-Library\)/g, '');
    
    // 去除括号内容（但保留书名）
    name = name.replace(/\([^)]*\)/g, '').trim();
    
    // 清理多余空格
    name = name.replace(/\s+/g, ' ').trim();
    
    // 如果处理后为空，返回原始文件名
    if (!name) {
      return fileName.replace(/\.pdf$/i, '');
    }
    
    return name;
  }

  // 统计PDF文件数量
  async countPdfFiles() {
    try {
      const queryText = 'SELECT COUNT(*) as total FROM pdf_files';
      const result = await db.queryWithSchema(queryText, [], this.schema);
      return parseInt(result.rows[0].total, 10);
    } catch (error) {
      console.error('Error counting PDF files:', error);
      throw new Error(`统计PDF文件数量失败: ${error.message}`);
    }
  }
}

module.exports = new PdfService();