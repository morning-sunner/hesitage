// 加载环境变量配置
require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors'); // 引入 cors 包

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var heritageRouter = require('./routes/heritage');
var spatialRouter = require('./routes/spatial');
var statisticsRouter = require('./routes/statistics');
var apiRouter = require('./routes/api');

var app = express();

// 数据库连接测试 (予以保留)
const db = require('./config/database');

// --- 冲突区域 1 已解决：使用 cors 包 ---
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition', 'Content-Length'],
  credentials: true
}));
// ------------------------------------

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// --- 冲突区域 2 已解决：合并所有功能 ---
// 保留原来的上传目录映射
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'public', 'uploads')));

// 添加新的，将 backend/图片 目录映射到 /uploads/images
app.use('/uploads/images', express.static(path.join(__dirname, '图片')));

// 保留健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 保留PDF测试接口
app.get('/api/pdf/test', (req, res) => {
  res.json({
    success: true,
    message: 'PDF API is working',
    timestamp: new Date().toISOString()
  });
});
// ------------------------------------


// 注册所有路由
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/heritage', heritageRouter);
app.use('/api/spatial', spatialRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api', apiRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// --- 冲突区域 3 已解决：仅导出 app ---
module.exports = app;
// ------------------------------------