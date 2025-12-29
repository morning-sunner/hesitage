// 加载环境变量配置
require('dotenv').config();


var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var heritageRouter = require('./routes/heritage');
var spatialRouter = require('./routes/spatial');
var statisticsRouter = require('./routes/statistics');
var apiRouter = require('./routes/api');
var pdfRoutes = require('./routes/pdfRoutes');

var app = express();

const cors = require('cors');

// 替换你的自定义CORS中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition', 'Content-Length'],
  credentials: true
}));


// 数据库连接测试
const db = require('./config/database');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// PDF测试接口
app.get('/api/pdf/test', (req, res) => {
  res.json({
    success: true,
    message: 'PDF API is working',
    timestamp: new Date().toISOString()
  });
});

// 注册所有路由
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/heritage', heritageRouter);
app.use('/api/spatial', spatialRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api', apiRouter);
app.use('/api', pdfRoutes); // 注册PDF路由

// 简单的PDF下载接口（直接实现，不依赖pdfRoutes）
app.get('/api/pdf/files', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const offset = parseInt(req.query.offset) || 0;
    
    const queryText = `
      SELECT 
        id, 
        file_name,
        upload_time
        -- 不再查询 file_data 或计算大小
      FROM shapefile.pdf_files 
      ORDER BY id 
      LIMIT $1 OFFSET $2
    `;
    
    const result = await db.queryWithSchema(queryText, [limit, offset]);
    
    // 格式化数据
    const files = result.rows.map(row => {
      // 从文件名提取书籍名
      let bookName = row.file_name
        .replace(/\.pdf$/i, '')
        .replace(/\(Z-Library\)/gi, '')
        .replace(/\([^)]*\)/g, '')
        .trim();
      
      if (!bookName) {
        bookName = row.file_name.replace(/\.pdf$/i, '');
      }
      
      return {
        id: row.id,
        book_name: bookName,
        file_name: row.file_name,
        // 不再包含 file_size 字段
        download_count: 0,
        upload_time: row.upload_time
      };
    });
    
    res.json({
      success: true,
      data: files,
      count: files.length
    });
    
  } catch (error) {
    console.error('Error getting PDF files:', error);
    res.status(500).json({
      success: false,
      message: '获取PDF文件列表失败',
      error: error.message
    });
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 如果是API请求，返回JSON错误
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      error: req.app.get('env') === 'development' ? err.stack : undefined
    });
  }
  
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// 获取端口
const PORT = process.env.PORT || 3000;

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`📚 PDF files API: http://localhost:${PORT}/api/pdf/files?limit=6`);
  console.log(`📥 PDF download: http://localhost:${PORT}/api/pdf/download/1`);
  console.log(`🔧 PDF test API: http://localhost:${PORT}/api/pdf/test`);
  
  // 异步测试数据库连接
  setTimeout(async () => {
    try {
      const connected = await db.testConnection();
      if (connected) {
        console.log('🎉 Database connection test successful');
      } else {
        console.log('⚠️ Database connection may have issues');
      }
    } catch (err) {
      console.log('⚠️ Database connection test error:', err.message);
    }
  }, 1000);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT signal, shutting down server...');
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM signal, shutting down server...');
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});

module.exports = app;