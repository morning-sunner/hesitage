const db = require('./config/database');

async function refreshViews() {
  try {
    console.log('🔄 刷新排行榜视图...\n');
    
    // 1. 查看原始数据
    console.log('📊 quiz_records 表中的所有数据:');
    const allRecords = await db.query(`
      SELECT id, user_id, username, difficulty_level, score, time_spent
      FROM shapefile.quiz_records 
      ORDER BY created_at DESC
    `);
    
    console.log(`总共 ${allRecords.rows.length} 条记录:`);
    allRecords.rows.forEach(row => {
      console.log(`   ID:${row.id} | ${row.username} | ${row.difficulty_level} | ${row.score}分 | ${row.time_spent}秒`);
    });
    
    console.log('\n');
    
    // 2. 删除并重新创建 quiz_best_records 视图
    console.log('🔨 重建 quiz_best_records 视图...');
    await db.query('DROP VIEW IF EXISTS shapefile.quiz_best_records CASCADE');
    
    await db.query(`
      CREATE VIEW shapefile.quiz_best_records AS
      SELECT DISTINCT ON (user_id, difficulty_level)
          id,
          user_id,
          username,
          difficulty_level,
          total_questions,
          correct_answers,
          score,
          time_spent,
          created_at
      FROM shapefile.quiz_records
      ORDER BY user_id, difficulty_level, score DESC, time_spent ASC, created_at DESC
    `);
    
    console.log('✅ quiz_best_records 视图已重建\n');
    
    // 3. 删除并重新创建 quiz_leaderboard 视图
    console.log('🔨 重建 quiz_leaderboard 视图...');
    await db.query('DROP VIEW IF EXISTS shapefile.quiz_leaderboard CASCADE');
    
    await db.query(`
      CREATE VIEW shapefile.quiz_leaderboard AS
      WITH ranked_records AS (
          SELECT 
              user_id,
              username,
              difficulty_level,
              total_questions,
              correct_answers,
              score,
              time_spent,
              created_at,
              ROW_NUMBER() OVER (
                  PARTITION BY difficulty_level 
                  ORDER BY score DESC, time_spent ASC, created_at DESC
              ) as rank
          FROM shapefile.quiz_best_records
      )
      SELECT * FROM ranked_records WHERE rank <= 50
    `);
    
    console.log('✅ quiz_leaderboard 视图已重建\n');
    
    // 4. 查看最佳成绩视图
    console.log('📊 quiz_best_records 视图中的数据:');
    const bestRecords = await db.query(`
      SELECT user_id, username, difficulty_level, score, time_spent
      FROM shapefile.quiz_best_records
      ORDER BY difficulty_level, score DESC
    `);
    
    console.log(`总共 ${bestRecords.rows.length} 条最佳记录:`);
    bestRecords.rows.forEach(row => {
      console.log(`   ${row.username} | ${row.difficulty_level} | ${row.score}分 | ${row.time_spent}秒`);
    });
    
    console.log('\n');
    
    // 5. 查看排行榜
    console.log('🏆 quiz_leaderboard 视图中的数据:');
    const leaderboard = await db.query(`
      SELECT rank, username, difficulty_level, score, time_spent
      FROM shapefile.quiz_leaderboard
      ORDER BY difficulty_level, rank
    `);
    
    console.log(`总共 ${leaderboard.rows.length} 条排行榜记录:`);
    
    let currentDifficulty = '';
    leaderboard.rows.forEach(row => {
      if (row.difficulty_level !== currentDifficulty) {
        currentDifficulty = row.difficulty_level;
        console.log(`\n   === ${currentDifficulty} ===`);
      }
      console.log(`   ${row.rank}. ${row.username} - ${row.score}分 (${row.time_spent}秒)`);
    });
    
    console.log('\n✅ 视图刷新完成！');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

refreshViews();
