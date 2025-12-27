const db = require('./config/database');

async function debugZcy() {
  try {
    console.log('🔍 调试 zcy 用户数据...\n');
    
    // 1. 查看 zcy 的所有记录
    console.log('1️⃣ zcy 在 quiz_records 表中的所有记录:');
    const zcyRecords = await db.query(`
      SELECT id, user_id, username, difficulty_level, score, time_spent, created_at
      FROM shapefile.quiz_records
      WHERE username = 'zcy'
      ORDER BY difficulty_level, score DESC
    `);
    
    zcyRecords.rows.forEach(row => {
      console.log(`   ID:${row.id} | UserID:${row.user_id} | ${row.difficulty_level} | ${row.score}分 | ${row.time_spent}秒`);
    });
    
    console.log('\n2️⃣ zcy 在 quiz_best_records 视图中的记录:');
    const zcyBest = await db.query(`
      SELECT user_id, username, difficulty_level, score, time_spent
      FROM shapefile.quiz_best_records
      WHERE username = 'zcy'
    `);
    
    if (zcyBest.rows.length > 0) {
      zcyBest.rows.forEach(row => {
        console.log(`   UserID:${row.user_id} | ${row.difficulty_level} | ${row.score}分 | ${row.time_spent}秒`);
      });
    } else {
      console.log('   ❌ 没有找到 zcy 的最佳记录！');
      console.log('\n   可能的原因:');
      console.log('   - user_id 字段可能不一致');
      console.log('   - 视图的 DISTINCT ON 逻辑有问题');
    }
    
    console.log('\n3️⃣ 手动查询 zcy 的最佳成绩:');
    const manual = await db.query(`
      SELECT DISTINCT ON (user_id, difficulty_level)
          id,
          user_id,
          username,
          difficulty_level,
          score,
          time_spent
      FROM shapefile.quiz_records
      WHERE username = 'zcy'
      ORDER BY user_id, difficulty_level, score DESC, time_spent ASC, created_at DESC
    `);
    
    if (manual.rows.length > 0) {
      manual.rows.forEach(row => {
        console.log(`   ID:${row.id} | UserID:${row.user_id} | ${row.difficulty_level} | ${row.score}分 | ${row.time_spent}秒`);
      });
    } else {
      console.log('   ❌ 手动查询也没找到！');
    }
    
    console.log('\n4️⃣ 检查所有 beginner 用户的 user_id:');
    const allBeginner = await db.query(`
      SELECT DISTINCT user_id, username
      FROM shapefile.quiz_records
      WHERE difficulty_level = 'beginner'
      ORDER BY user_id
    `);
    
    allBeginner.rows.forEach(row => {
      console.log(`   UserID:${row.user_id} | ${row.username}`);
    });
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    process.exit(0);
  }
}

debugZcy();
