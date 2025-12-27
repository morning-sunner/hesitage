const axios = require('axios');

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

// 系统提示词 - 定义AI的角色和行为
const SYSTEM_PROMPT = `你是长三角非物质文化遗产展示平台的AI助手，名叫"非遗小助手"。

你的职责：
1. 回答关于长三角地区非遗文化的问题
2. 介绍非遗项目、传承人、相关书籍和影视作品
3. 引导用户探索平台功能（文化展示、互动社区、匠人书影、AI对话等）
4. 保持友好、专业、热情的语气

长三角主要非遗项目包括：
- 江苏：昆曲、苏州评弹、南京云锦、苏州园林、紫砂陶制作
- 浙江：龙井茶制作、越剧、西湖龙井、浙江剪纸、东阳木雕
- 上海：沪剧、本帮菜制作技艺、海派文化
- 安徽：宣纸制作、徽墨制作、徽州木雕、黄梅戏

回答要求：
- 简洁明了，分点说明
- 中文回答，字数控制在200字以内
- 适当使用emoji让回答更生动
- 遇到不确定的问题，引导用户浏览平台其他功能`;

/**
 * 调用DeepSeek AI API
 * @param {string} userMessage - 用户消息
 * @param {Array} conversationHistory - 对话历史（可选）
 * @returns {Promise<string>} AI回复
 */
async function callDeepSeekAPI(userMessage, conversationHistory = []) {
  try {
    // 检查API Key
    if (!DEEPSEEK_API_KEY) {
      console.warn('⚠️  DeepSeek API Key 未配置，使用模拟回复');
      return getFallbackResponse(userMessage);
    }

    // 构建消息数组
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    // 调用API
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat', // 使用DeepSeek Chat模型
        messages: messages,
        temperature: 0.7, // 控制创造性：0-2，越高越有创造性
        max_tokens: 500, // 最大生成token数
        top_p: 0.9,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        timeout: 30000 // 30秒超时
      }
    );

    // 提取回复内容
    const aiReply = response.data.choices[0].message.content;
    
    // 记录使用情况
    const usage = response.data.usage;
    console.log(`✅ AI回复成功 | 输入:${usage.prompt_tokens} 输出:${usage.completion_tokens} 总计:${usage.total_tokens} tokens`);

    return aiReply;

  } catch (error) {
    console.error('❌ DeepSeek API 调用失败:', error.message);
    
    // 如果API调用失败，返回友好的错误提示
    if (error.response) {
      console.error('API响应错误:', error.response.data);
      if (error.response.status === 401) {
        return '抱歉，AI服务配置有误，请联系管理员。';
      } else if (error.response.status === 429) {
        return '当前访问人数较多，请稍后再试。';
      }
    }
    
    // 返回降级回复
    return getFallbackResponse(userMessage);
  }
}

/**
 * 降级回复 - 当AI服务不可用时使用
 */
function getFallbackResponse(question) {
  const fallbackResponses = {
    '什么是非遗': '非物质文化遗产（非遗）是指各族人民世代相承、与群众生活密切相关的各种传统文化表现形式。长三角地区拥有丰富的非遗资源，包括昆曲、苏州评弹、南京云锦等多个项目。',
    '长三角': '长三角地区的非遗项目丰富多彩，主要包括：\n🎭 昆曲 - 苏州传统戏曲\n🎵 苏州评弹 - 吴语说唱艺术\n✂️ 浙江剪纸 - 民间艺术\n🍵 龙井茶制作 - 杭州传统工艺\n📜 宣纸制作 - 安徽古老工艺',
    '如何学习': '学习和传承非遗文化的方式：\n1️⃣ 参加传承人的课程\n2️⃣ 参观非遗展览\n3️⃣ 观看非遗表演\n4️⃣ 使用我们平台的互动社区功能\n5️⃣ 浏览匠人书影了解传承人故事',
    '传承人': '非遗传承人是文化守护者，他们通过多年学习掌握传统技艺，并致力于传承给下一代。您可以在我们的"匠人书影"页面了解更多传承人的故事！ 📚'
  };

  // 模糊匹配
  for (const [key, value] of Object.entries(fallbackResponses)) {
    if (question.includes(key)) {
      return value;
    }
  }

  // 默认回复
  return `感谢您的提问！😊 关于"${question}"，我建议您：\n\n1️⃣ 浏览【文化展示】页面了解非遗项目\n2️⃣ 参加【互动社区】的知识竞赛\n3️⃣ 查看【匠人书影】了解传承人故事\n\n如需更多帮助，欢迎继续提问！`;
}

module.exports = {
  callDeepSeekAPI,
  getFallbackResponse
};
