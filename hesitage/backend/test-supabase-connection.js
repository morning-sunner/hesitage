/**
 * Supabase 数据库连接测试脚本
 * 用于测试远程数据库是否可连接
 */

const { Pool } = require('pg');

// PostgreSQL 连接配置
const postgresConfig = {
  host: '47.110.134.147',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '123456',
  ssl: false
};

console.log('='.repeat(60));
console.log('PostgreSQL 数据库连接测试');
console.log('='.repeat(60));
console.log('');
console.log('📡 连接信息:');
console.log(`  主机: ${postgresConfig.host}`);
console.log(`  端口: ${postgresConfig.port}`);
console.log(`  数据库: ${postgresConfig.database}`);
console.log(`  用户: ${postgresConfig.user}`);
console.log(`  密码: ${'*'.repeat(10)}`);
console.log('');

const pool = new Pool(postgresConfig);

// 测试连接
(async () => {
  try {
    console.log('🔄 正在连接数据库...');
    const client = await pool.connect();
    console.log('✅ 连接成功!');
    console.log('');

    // 获取数据库版本
    const versionResult = await client.query('SELECT version()');
    console.log('📊 数据库版本:');
    console.log(`  ${versionResult.rows[0].version.split(',')[0]}`);
    console.log('');

    // 列出所有表
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`📋 数据库中的表 (共 ${tablesResult.rows.length} 个):`, '');
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.table_name}`);
      });
    } else {
      console.log('  (没有找到表)');
    }
    console.log('');

    // 检查特定的 shapefile schema
    const schemaResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `);
    
    console.log(`📊 Schema列表 (共 ${schemaResult.rows.length} 个):`, '');
    if (schemaResult.rows.length > 0) {
      schemaResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.schema_name}`);
      });
    }
    console.log('');

    // 尝试查找 shapefile."国家级非遗点位GCS_WGS_1984" 表
    const heritageTableQuery = `
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = 'shapefile' 
      AND table_name = '国家级非遗点位GCS_WGS_1984'
    `;
    
    const heritageResult = await client.query(heritageTableQuery);
    console.log('🗺️  检查非遗数据表:');
    if (heritageResult.rows[0].count > 0) {
      console.log('  ✅ 找到表: shapefile."国家级非遗点位GCS_WGS_1984"');
      
      // 统计记录数
      const countResult = await client.query('SELECT COUNT(*) FROM shapefile."国家级非遗点位GCS_WGS_1984"');
      console.log(`  📈 记录数: ${countResult.rows[0].count}`);
    } else {
      console.log('  ❌ 未找到表: shapefile."国家级非遗点位GCS_WGS_1984"');
    }
    console.log('');

    client.release();

    console.log('='.repeat(60));
    console.log('✅ 所有测试完成 - 连接正常!');
    console.log('='.repeat(60));
    
    process.exit(0);

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ 连接失败');
    console.error('='.repeat(60));
    console.error('');
    console.error('错误信息:', error.message);
    console.error('');
    
    if (error.code === 'ENOTFOUND') {
      console.error('💡 原因: 无法解析主机名');
      console.error('   请检查网络连接和主机地址是否正确');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 原因: 连接被拒绝');
      console.error('   请检查数据库服务是否运行，端口是否正确');
    } else if (error.code === '28P01') {
      console.error('💡 原因: 用户名或密码错误');
      console.error('   请检查凭证是否正确');
    } else if (error.code === '3D000') {
      console.error('💡 原因: 数据库不存在');
      console.error('   请检查数据库名称是否正确');
    } else if (error.message.includes('self signed certificate')) {
      console.error('💡 原因: SSL证书问题');
      console.error('   Supabase使用SSL连接，脚本已配置跳过验证');
    }
    
    console.error('');
    console.error('调试信息:');
    console.error('  主机:', postgresConfig.host);
    console.error('  端口:', postgresConfig.port);
    console.error('  数据库:', postgresConfig.database);
    console.error('  用户:', postgresConfig.user);
    console.error('  错误代码:', error.code || 'N/A');
    console.error('');
    
    process.exit(1);
  }
})();

// 超时保护
setTimeout(() => {
  console.error('⏱️  连接超时（30秒）');
  process.exit(1);
}, 30000);
