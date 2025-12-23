const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 5000,
});

async function testConnection() {
  try {
    console.log('正在测试数据库连接...');
    console.log('连接信息:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: '***'
    });

    const result = await pool.query('SELECT NOW()');
    console.log('✅ 数据库连接成功！');
    console.log('服务器时间:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.error('错误代码:', error.code);
    process.exit(1);
  }
}

testConnection();
