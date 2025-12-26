require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/database');

/**
 * 初始化数据库表
 */
async function initDatabase() {
  let client;
  try {
    console.log('开始初始化数据库...');

    // 获取一个数据库连接客户端
    client = await db.pool.connect();

    // 设置 search_path 以确保表可以创建
    await client.query('SET search_path TO shapefile');

    // 创建 shapefile schema（如果不存在）
    await client.query('CREATE SCHEMA IF NOT EXISTS shapefile');
    console.log('✓ shapefile schema 已创建或已存在');

    // 检查是否已安装 PostGIS
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis');
    console.log('✓ PostGIS 已安装或已存在');

    // 创建用户表
    await client.query(`
      CREATE TABLE IF NOT EXISTS shapefile.users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ users 表已创建');

    // 创建验证码表（用于注册和密码重置）
    await client.query(`
      CREATE TABLE IF NOT EXISTS shapefile.verification_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        type VARCHAR(20) NOT NULL,
        expires_at TIMESTAMP,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ verification_codes 表已创建');

    // 创建记住我Token表
    await client.query(`
      CREATE TABLE IF NOT EXISTS shapefile.remember_tokens (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES shapefile.users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ remember_tokens 表已创建');

    // 创建非遗项目表
    await client.query(`
      CREATE TABLE IF NOT EXISTS shapefile.heritage_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        location VARCHAR(255),
        description TEXT,
        coordinates GEOMETRY(Point, 4326),
        province VARCHAR(50),
        city VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ heritage_items 表已创建');

    // 创建行政区划表
    await client.query(`
      CREATE TABLE IF NOT EXISTS shapefile.admin_regions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        level VARCHAR(50),
        parent_id INT,
        geometry GEOMETRY(MultiPolygon, 4326),
        FOREIGN KEY (parent_id) REFERENCES shapefile.admin_regions(id)
      )
    `);
    console.log('✓ admin_regions 表已创建');

    // 创建空间索引
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_heritage_geom 
      ON shapefile.heritage_items USING GIST(coordinates)
    `);
    console.log('✓ heritage_items 空间索引已创建');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_regions_geom 
      ON shapefile.admin_regions USING GIST(geometry)
    `);
    console.log('✓ admin_regions 空间索引已创建');

    // 插入示例数据
    await client.query(`
      DELETE FROM shapefile.heritage_items WHERE id > 0
    `);

    await client.query(`
      INSERT INTO shapefile.heritage_items (name, category, location, coordinates, province, city, description)
      VALUES
        ('昆曲', '传统戏剧', '苏州', ST_GeomFromText('POINT(120.595 31.299)', 4326), '江苏', '苏州', '苏州传统戏曲艺术'),
        ('苏州园林', '传统建筑', '苏州', ST_GeomFromText('POINT(120.6 31.3)', 4326), '江苏', '苏州', '中国古典园林艺术'),
        ('杭州丝绸', '工艺美术', '杭州', ST_GeomFromText('POINT(120.155 30.274)', 4326), '浙江', '杭州', '丝绸手工技艺'),
        ('宣纸制作', '传统技艺', '宣城', ST_GeomFromText('POINT(118.757 30.945)', 4326), '安徽', '宣城', '中国传统纸张制作'),
        ('越剧', '传统戏剧', '绍兴', ST_GeomFromText('POINT(120.583 30.003)', 4326), '浙江', '绍兴', '浙江地方戏曲'),
        ('徽墨制作', '传统技艺', '黄山', ST_GeomFromText('POINT(118.307 30.137)', 4326), '安徽', '黄山', '中国传统墨料制作'),
        ('龙泉青瓷', '工艺美术', '龙泉', ST_GeomFromText('POINT(119.169 28.031)', 4326), '浙江', '龙泉', '青瓷制作工艺')
    `);
    console.log('✓ 示例数据已插入');

    console.log('✅ 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
  }
}

// 如果直接运行此文件
if (require.main === module) {
  initDatabase().then(() => process.exit(0));
}

module.exports = initDatabase;
