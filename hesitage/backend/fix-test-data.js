const db = require('./config/database');

async function fixTestData() {
  try {
    console.log('🔧 修复测试数据的 user_id 冲突...\n');
    
    // 更新测试数据的 user_id，避免与真实用户冲突
    // 文化传承者: 1 -> 101
    // 诗词达人: 2 -> 102  
    // 古韵青年: 3 -> 103
    // 江南雅士: 4 -> 104
    // 匠心独运: 5 -> 105
    
    const updates = [
      { oldId: 1, newId: 101, name: '文化传承者' },
      { oldId: 2, newId: 102, name: '诗词达人' },
      { oldId: 3, newId: 103, name: '古韵青年' },
      { oldId: 4, newId: 104, name: '江南雅士' },
      { oldId: 5, newId: 105, name: '匠心独运' }
    ];
    
    for (const update of updates) {
      const result = await db.query(
        `UPDATE shapefile.quiz_records 
         SET user_id = $1 
         WHERE user_id = $2 AND username = $3`,
        [update.newId, update.oldId, update.name]
      );
      
      console.log(`✅ ${update.name}: user_id ${update.oldId} -> ${update.newId} (${result.rowCount} 条记录)`);
    }
    
    console.log('\n🔄 刷新视图...');
    
    // 刷新视图
    await db.query('REFRESH MATERIALIZED VIEW IF EXISTS shapefile.quiz_best_records');
    await db.query('REFRESH MATERIALIZED VIEW IF EXISTS shapefile.quiz_leaderboard');
    
    console.log('✅ 视图已刷新\n');
    
    // 验证修复结果
    console.log('📊 验证修复后的数据:\n');
    
    const leaderboard = await db.query(`
      SELECT rank, user_id, username, difficulty_level, score, time_spent
      FROM shapefile.quiz_leaderboard
      WHERE difficulty_level = 'beginner'
      ORDER BY rank
    `);
    
    console.log('Beginner 排行榜:');
    leaderboard.rows.forEach(row => {
      const highlight = row.username === 'zcy' ? ' ⬅️ zcy现在在榜上了！' : '';
      console.log(`   ${row.rank}. ${row.username} (ID:${row.user_id}) - ${row.score}分${highlight}`);
    });
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

fixTestData();
