// 测试DeepSeek API是否可用
require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

console.log('========================================');
console.log('🧪 DeepSeek API 测试');
console.log('========================================');
console.log(`API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : '未配置'}`);
console.log(`API URL: ${API_URL}`);
console.log('========================================\n');

async function testAPI() {
  try {
    console.log('📤 发送测试请求...\n');
    
    const response = await axios.post(
      API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个AI助手' },
          { role: 'user', content: '你好，请用一句话介绍你自己' }
        ],
        max_tokens: 50,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        timeout: 30000
      }
    );

    console.log('✅ API调用成功！\n');
    console.log('📨 响应内容:');
    console.log('─────────────────────────────────────');
    console.log(response.data.choices[0].message.content);
    console.log('─────────────────────────────────────\n');
    
    console.log('📊 使用统计:');
    console.log(`   输入tokens: ${response.data.usage.prompt_tokens}`);
    console.log(`   输出tokens: ${response.data.usage.completion_tokens}`);
    console.log(`   总计tokens: ${response.data.usage.total_tokens}`);
    console.log('\n✨ API工作正常，可以使用！\n');
    
  } catch (error) {
    console.log('❌ API调用失败！\n');
    
    if (error.response) {
      console.log('📋 错误详情:');
      console.log(`   状态码: ${error.response.status}`);
      console.log(`   错误信息: ${JSON.stringify(error.response.data, null, 2)}`);
      
      if (error.response.status === 401) {
        console.log('\n💡 解决方案: API Key无效或已过期，请检查配置');
      } else if (error.response.status === 402) {
        console.log('\n💡 解决方案: API余额不足，需要充值');
        console.log('   充值地址: https://platform.deepseek.com/');
      } else if (error.response.status === 429) {
        console.log('\n💡 解决方案: 请求过于频繁，请稍后再试');
      }
    } else if (error.request) {
      console.log('📋 网络错误: 无法连接到API服务器');
      console.log('   请检查网络连接');
    } else {
      console.log('📋 错误:', error.message);
    }
    
    console.log('\n⚠️  将使用降级方案（预设回复）\n');
  }
}

// 执行测试
testAPI();
