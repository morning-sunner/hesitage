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

var supportRouter = require('./routes/support');


var app = express();


// CORS 中间件
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 配置上传目录的静态文件服务
// 用户上传的图片可以通过 /uploads/images/xxx.jpg 访问
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'public', 'uploads')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/heritage', heritageRouter);
app.use('/api/spatial', spatialRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api', apiRouter);

app.use('/api/support', supportRouter);


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


module.exports = app;
