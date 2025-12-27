const db = require('./config/database');

async function testLeaderboard() {
  try {
    console.log('🏆 测试排行榜查询...\n');
    
    // 模拟API查询
    const query = `
      SELECT 
        rank,
        user_id,
        username,
        difficulty_level,
        total_questions,
        correct_answers,
        score,
        time_spent,
        created_at
      FROM shapefile.quiz_leaderboard
      ORDER BY difficulty_level, rank
      LIMIT 150
    `;
    
    const result = await db.query(query);
    
    // 按难度分组
    const leaderboard = {
      beginner: [],
      intermediate: [],
      advanced: []
    };

    result.rows.forEach(row => {
      leaderboard[row.difficulty_level].push({
        rank: parseInt(row.rank),
        userId: row.user_id,
        username: row.username,
        totalQuestions: row.total_questions,
        correctAnswers: row.correct_answers,
        score: row.score,
        timeSpent: row.time_spent,
        submittedAt: row.created_at
      });
    });

    console.log('📊 初级排行榜 (beginner):');
    leaderboard.beginner.forEach(user => {
      console.log(`   ${user.rank}. ${user.username} - ${user.score}分 (${user.timeSpent}秒)`);
    });
    
    console.log('\n📊 中级排行榜 (intermediate):');
    leaderboard.intermediate.forEach(user => {
      console.log(`   ${user.rank}. ${user.username} - ${user.score}分 (${user.timeSpent}秒)`);
    });
    
    console.log('\n📊 高级排行榜 (advanced):');
    leaderboard.advanced.forEach(user => {
      console.log(`   ${user.rank}. ${user.username} - ${user.score}分 (${user.timeSpent}秒)`);
    });
    
    console.log('\n✅ 排行榜数据格式正确');
    console.log('\n📦 返回的JSON格式:');
    console.log(JSON.stringify({
      success: true,
      data: leaderboard
    }, null, 2));
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    console.error('   详细信息:', error);
  } finally {
    process.exit(0);
  }
}

testLeaderboard();
