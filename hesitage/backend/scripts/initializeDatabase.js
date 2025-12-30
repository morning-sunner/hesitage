/**
 * 初始化数据库 - 执行SQL文件
 * 用法: node scripts/initializeDatabase.js
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// 数据库配置（仅连接基础数据库来创建heritage数据库）
const config = {
  host: '47.110.134.147',
  port: 5432,
  database: 'postgres',  // 首先连接到默认postgres数据库
  user: 'postgres',
  password: '123456',
  connectionTimeoutMillis: 15000,
};

async function initializeDatabase() {
  let client;
  try {
    console.log('📦 开始初始化数据库...\n');
    
    // 第一步：连接到postgres数据库以创建heritage数据库
    const pool = new Pool(config);
    client = await pool.connect();
    
    console.log('✅ 已连接到PostgreSQL服务器');
    
    // 检查heritage数据库是否存在
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'heritage'"
    );
    
    if (checkDb.rows.length === 0) {
      console.log('❌ heritage数据库不存在，正在创建...');
      await client.query('CREATE DATABASE heritage');
      console.log('✅ heritage数据库已创建');
    } else {
      console.log('✅ heritage数据库已存在');
    }
    
    client.release();
    await pool.end();
    
    // 第二步：连接到heritage数据库并执行SQL文件
    console.log('\n📄 正在执行初始化SQL...');
    
    const heritageConfig = {
      host: '47.110.134.147',
      port: 5432,
      database: 'heritage',
      user: 'postgres',
      password: '123456',
      connectionTimeoutMillis: 15000,
    };
    
    const heritagePool = new Pool(heritageConfig);
    const heritageClient = await heritagePool.connect();
    
    // 读取SQL文件
    const sqlFile = path.join(__dirname, '..', '..', 'mydb_converted.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // 分割SQL语句并执行
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 共有 ${statements.length} 条SQL语句要执行`);
    
    let executed = 0;
    for (const stmt of statements) {
      try {
        await heritageClient.query(stmt);
        executed++;
        if (executed % 50 === 0) {
          console.log(`  ✓ 已执行 ${executed}/${statements.length} 条语句`);
        }
      } catch (err) {
        // 跳过某些错误（如重复创建）
        if (!err.message.includes('already exists')) {
          console.warn(`  ⚠️ 语句执行失败: ${err.message.substring(0, 100)}`);
        }
      }
    }
    
    console.log(`✅ 已执行 ${executed}/${statements.length} 条语句\n`);
    
    // 验证
    const tableCheck = await heritageClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'shapefile'
    `);
    
    console.log(`🎉 shapefile schema中有 ${tableCheck.rows.length} 个表`);
    console.log('📋 表列表:');
    tableCheck.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    heritageClient.release();
    await heritagePool.end();
    
    console.log('\n✨ 数据库初始化完成！');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ 初始化失败:');
    console.error(error.message);
    process.exit(1);
  }
}

initializeDatabase();
