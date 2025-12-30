// backend/config/database.js
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// 数据库配置
const config = {
  host: '47.110.134.147',    // 远程服务器地址
  port: 5432,                // PostgreSQL默认端口
  database: 'heritage',      // 数据库名
  user: 'postgres',          // 用户名
  password: '123456',        // 密码（确认是否正确）
  // 连接池配置
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  ssl: false,
};

console.log('📊 Database config:', {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user,
  password: '***',
  max: config.max,
  timeout: config.connectionTimeoutMillis + 'ms'
});

const pool = new Pool(config);

// 监听连接池错误
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // 不要立即退出，尝试重连
  // process.exit(-1);
});

pool.on('connect', (client) => {
  console.log('🟢 New database client connected');
});

pool.on('remove', (client) => {
  console.log('🔴 Database client removed from pool');
});

/**
 * 带schema的查询函数
 */
const queryWithSchema = async (text, params, schema = 'shapefile') => {
  let client;
  let retries = 3;
  
  while (retries > 0) {
    try {
      client = await pool.connect();
      
      // 首先设置search_path，确保schema正确
      await client.query(`SET search_path TO ${schema}, public`);
      
      console.log('Executing query:', {
        text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
        params: params || [],
        schema: schema
      });
      
      const start = Date.now();
      const result = await client.query(text, params);
      const duration = Date.now() - start;
      
      console.log(`✅ Query executed in ${duration}ms, rows: ${result.rowCount}`);
      
      return result;
    } catch (error) {
      retries--;
      console.error(`❌ Query error (${retries} retries left):`, {
        text: text.substring(0, 200),
        error: error.message
      });
      
      if (retries === 0) {
        throw error;
      }
      
      // 等待1秒后重试
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      if (client) {
        client.release();
      }
    }
  }
};

/**
 * 简单查询函数（不带schema）
 */
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

/**
 * 测试数据库连接和schema访问
 */
const testConnection = async () => {
  let client;
  try {
    console.log('🔗 正在测试数据库连接...');
    console.log(`   目标: ${config.host}:${config.port}/${config.database}`);
    console.log(`   用户: ${config.user}`);
    
    client = await pool.connect();
    
    // 测试基本连接
    const basicTest = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log('✅ Database connected successfully:', {
      database: basicTest.rows[0].db_name,
      time: basicTest.rows[0].current_time
    });
    
    // 测试schema访问
    const schemaTest = await client.query(`
      SELECT 
        nspname as schema_name,
        obj_description(oid) as description
      FROM pg_catalog.pg_namespace 
      WHERE nspname = 'shapefile'
    `);
    
    if (schemaTest.rows.length > 0) {
      console.log('✅ Schema found:', schemaTest.rows[0]);
      
      // 测试pdf_files表是否存在
      try {
        const tableTest = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'shapefile' 
            AND table_name = 'pdf_files'
          ) as table_exists
        `);
        
        if (tableTest.rows[0].table_exists) {
          console.log('✅ Table "pdf_files" exists in schema "shapefile"');
          
          // 查看数据数量
          const countTest = await client.query('SELECT COUNT(*) as count FROM shapefile.pdf_files');
          console.log(`📊 PDF文件数量: ${countTest.rows[0].count}`);
          
          // 查看前几条数据
          const sampleData = await client.query(`
            SELECT id, file_name 
            FROM shapefile.pdf_files 
            ORDER BY id 
            LIMIT 3
          `);
          
          console.log('📋 前3条数据示例:');
          sampleData.rows.forEach(row => {
            console.log(`   ID ${row.id}: ${row.file_name}`);
          });
          
          console.log('🎉 Database connection test completed successfully');
          console.log('🚀 Ready to serve PDF downloads!');
        } else {
          console.log('❌ Table "pdf_files" does not exist in schema "shapefile"');
        }
      } catch (tableError) {
        console.log('⚠️ Cannot check table existence:', tableError.message);
      }
    } else {
      console.log('⚠️ Schema "shapefile" not found');
    }
    
    // 成功连接，不立即调用 testConnection()
    return true;
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔧 诊断信息:');
    console.log('   主机:', config.host);
    console.log('   端口:', config.port);
    console.log('   数据库:', config.database);
    console.log('   用户名:', config.user);
    console.log('   错误代码:', error.code);
    
    return false;
  } finally {
    // 确保客户端被释放
    if (client) {
      client.release();
    }
  }
};

module.exports = {
  query,
  queryWithSchema,
  getClient: () => pool.connect(),
  pool,
  testConnection,
};