const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// 确保密码是字符串
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'hositage',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || '123456'),
};

console.log('Database config:', {
  ...config,
  password: '***' // 隐藏密码在日志中
});

const pool = new Pool(config);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};
