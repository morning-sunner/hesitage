const db = require('./config/database');

async function testDatabase() {
  try {
    console.log('🔍 检查数据库连接和表...\n');
    
    // 测试连接
    const testConn = await db.query('SELECT NOW()');
    console.log('✅ 数据库连接成功');
    console.log('   服务器时间:', testConn.rows[0].now);
    console.log('');
    
    // 检查 quiz_records 表
    const checkTable = await db.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'shapefile' 
        AND tablename = 'quiz_records'
      );
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('✅ quiz_records 表存在');
      
      // 查询表中的数据
      const countResult = await db.query('SELECT COUNT(*) FROM shapefile.quiz_records');
      console.log(`   数据行数: ${countResult.rows[0].count}`);
      
      // 查看最近3条记录
      const recentRecords = await db.query(`
        SELECT id, username, difficulty_level, score, time_spent, created_at 
        FROM shapefile.quiz_records 
        ORDER BY created_at DESC 
        LIMIT 3
      `);
      
      console.log('\n📊 最近的答题记录:');
      recentRecords.rows.forEach(row => {
        console.log(`   ${row.username} | ${row.difficulty_level} | ${row.score}分 | ${row.time_spent}秒 | ${row.created_at}`);
      });
      
    } else {
      console.log('❌ quiz_records 表不存在！');
      console.log('   请执行 DATABASE_QUIZ_LEADERBOARD.sql 文件创建表');
    }
    
    console.log('');
    
    // 检查视图
    const checkView = await db.query(`
      SELECT EXISTS (
        SELECT FROM pg_views 
        WHERE schemaname = 'shapefile' 
        AND viewname = 'quiz_leaderboard'
      );
    `);
    
    if (checkView.rows[0].exists) {
      console.log('✅ quiz_leaderboard 视图存在');
      
      // 查询排行榜数据
      const leaderboard = await db.query(`
        SELECT difficulty_level, COUNT(*) as count
        FROM shapefile.quiz_leaderboard 
        GROUP BY difficulty_level
      `);
      
      console.log('\n🏆 排行榜数据统计:');
      leaderboard.rows.forEach(row => {
        console.log(`   ${row.difficulty_level}: ${row.count} 条记录`);
      });
      
    } else {
      console.log('❌ quiz_leaderboard 视图不存在！');
    }
    
  } catch (error) {
    console.error('❌ 数据库错误:', error.message);
    console.error('   详细信息:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase();
