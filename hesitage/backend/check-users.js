const db = require('./config/database');

async function checkUsers() {
  try {
    console.log('👥 检查 users 表...\n');
    
    // 查询所有用户
    const users = await db.query(`
      SELECT id, username, email
      FROM shapefile.users
      ORDER BY id
    `);
    
    console.log(`总共 ${users.rows.length} 个用户:`);
    users.rows.forEach(row => {
      console.log(`   ID:${row.id} | ${row.username} | ${row.email}`);
    });
    
    // 查找zcy用户
    console.log('\n🔍 查找 zcy 或 2842891106 用户:');
    const zcyUser = await db.query(`
      SELECT id, username, email
      FROM shapefile.users
      WHERE username LIKE '%zcy%' OR email LIKE '%2842891106%'
    `);
    
    if (zcyUser.rows.length > 0) {
      console.log('✅ 找到了:');
      zcyUser.rows.forEach(row => {
        console.log(`   ID:${row.id} | ${row.username} | ${row.email}`);
      });
      
      const correctUserId = zcyUser.rows[0].id;
      console.log(`\n💡 正确的 user_id 应该是: ${correctUserId}`);
      console.log(`\n🔧 需要更新 quiz_records 表中 zcy 的记录:`);
      console.log(`   UPDATE shapefile.quiz_records`);
      console.log(`   SET user_id = ${correctUserId}`);
      console.log(`   WHERE username = 'zcy' AND user_id = 1;`);
    } else {
      console.log('❌ 没找到 zcy 用户');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUsers();
