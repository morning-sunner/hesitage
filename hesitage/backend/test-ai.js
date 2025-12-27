// 测试DeepSeek AI API
require('dotenv').config();
const { callDeepSeekAPI } = require('./services/aiService');

async function test() {
  console.log('🧪 开始测试DeepSeek AI API...\n');
  
  console.log('📝 API Key:', process.env.DEEPSEEK_API_KEY ? '已配置 ✅' : '未配置 ❌');
  console.log('🌐 API URL:', process.env.DEEPSEEK_API_URL || '默认地址');
  console.log('');
  
  const testQuestions = [
    '什么是非遗文化？',
    '长三角有哪些著名的非遗项目？',
    '昆曲有什么特点？'
  ];
  
  for (const question of testQuestions) {
    console.log(`\n❓ 问题: ${question}`);
    console.log('⏳ 请求中...');
    
    try {
      const answer = await callDeepSeekAPI(question);
      console.log(`✅ 回答: \n${answer}\n`);
      console.log('-'.repeat(80));
    } catch (error) {
      console.error(`❌ 错误: ${error.message}`);
    }
  }
  
  console.log('\n✨ 测试完成！');
}

test();
