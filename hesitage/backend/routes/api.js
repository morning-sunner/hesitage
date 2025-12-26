var express = require('express');
var router = express.Router();

// 模拟 AI 对话数据库
const aiResponses = {
  '什么是非遗文化？': '非物质文化遗产（非遗）是指各族人民世代相承、与群众生活密切相关的各种传统文化表现形式。长三角地区作为中国文化发达地区，拥有丰富的非遗资源，包括昆曲、苏州评弹、浙江剪纸等多个项目。',
  '长三角地区有哪些著名的非遗项目？': '长三角地区的非遗项目丰富多彩，主要包括：\n1. 昆曲 - 苏州传统戏曲艺术，已被列为联合国非遗代表作\n2. 苏州评弹 - 用吴语表演的说唱艺术\n3. 浙江剪纸 - 以剪刀为工具的民间艺术\n4. 龙井茶制作工艺 - 杭州西湖地区的传统工艺\n5. 宣纸制作 - 安徽宣城的古老工艺\n6. 徽州木雕 - 安徽的传统木雕工艺',
  '如何学习和传承非遗文化？': '学习和传承非遗文化有多种方式：\n1. 参加非遗传承人的课程和培训班\n2. 参观非遗展览和博物馆\n3. 观看非遗表演和展示\n4. 购买和使用非遗产品\n5. 通过互动社区学习和交流\n6. 支持非遗传承人的工作',
  '非遗传承人的故事': '非遗传承人是非遗文化的守护者，他们通过多年甚至几十年的学习和实践，掌握了传统工艺和技艺。他们不仅在从事这些工作，更致力于将这些宝贵的文化遗产传承给下一代。许多传承人已经老年，急需新人继承这些技艺。'
};

/* AI 对话 API */
router.post('/ai-dialog', (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: '问题不能为空' });
  }

  // 查找匹配的答案
  let answer = aiResponses[question];

  if (!answer) {
    // 如果没有完全匹配，进行模糊匹配
    const questionLower = question.toLowerCase();
    const keys = Object.keys(aiResponses);
    
    for (const key of keys) {
      if (key.includes(question) || question.includes(key.split('？')[0])) {
        answer = aiResponses[key];
        break;
      }
    }
  }

  // 如果还是没有找到，返回默认回复
  if (!answer) {
    answer = '感谢您的提问！这是一个有趣的问题。长三角地区的非遗文化确实有很多值得了解的内容。我们建议您：\n1. 浏览我们的文化展示页面了解更多项目\n2. 参加互动社区的知识竞赛\n3. 查看匠人书影了解传承人的故事';
  }

  res.json({
    question: question,
    answer: answer,
    timestamp: new Date().toISOString()
  });
});

/* 获取竞赛问题 API */
router.get('/quiz-questions', (req, res) => {
  const questions = [
    {
      id: 1,
      question: '昆曲是哪个地区的传统艺术？',
      description: '请选择昆曲的主要传承地',
      options: ['北京', '苏州', '杭州', '宁波'],
      correct: 1,
      explanation: '昆曲是苏州地区的传统戏曲艺术，也是联合国非物质文化遗产代表作。'
    },
    {
      id: 2,
      question: '西湖龙井茶的制作工艺属于哪个省份？',
      options: ['安徽', '浙江', '江苏', '江西'],
      correct: 1,
      explanation: '西湖龙井茶产于杭州西湖地区，是浙江省的著名茶叶，其制作工艺已被列为国家非遗项目。'
    },
    {
      id: 3,
      question: '苏州评弹的主要语言是什么？',
      options: ['普通话', '粤语', '吴语', '闽南语'],
      correct: 2,
      explanation: '苏州评弹使用吴语进行表演，是长三角地区非常重要的说唱艺术。'
    },
    {
      id: 4,
      question: '下列哪个不是长三角地区的非遗项目？',
      options: ['宣纸制作', '徽州木雕', '景德镇瓷器', '京剧'],
      correct: 3,
      explanation: '京剧是北京的传统艺术，不属于长三角地区。宣纸、徽州木雕、景德镇瓷器都是长三角地区的重要非遗项目。'
    },
    {
      id: 5,
      question: '浙江剪纸通常用什么工具进行创作？',
      options: ['笔和墨', '剪刀和纸', '刀具和木板', '笔和颜料'],
      correct: 1,
      explanation: '浙江剪纸是用剪刀在纸张上进行创作的传统艺术，具有独特的视觉效果。'
    }
  ];

  res.json(questions);
});

/* 提交答题结果 API */
router.post('/submit-quiz', (req, res) => {
  const { answers, timeSpent, userId } = req.body;

  if (!answers || answers.length === 0) {
    return res.status(400).json({ error: '答题数据不能为空' });
  }

  // 这里可以将结果保存到数据库
  const result = {
    userId: userId || 'anonymous',
    submittedAt: new Date().toISOString(),
    timeSpent: timeSpent,
    answers: answers,
    score: calculateScore(answers)
  };

  // TODO: 保存到数据库
  console.log('Quiz result:', result);

  res.json({
    success: true,
    result: result,
    message: '答题结果已保存'
  });
});

// 计算得分函数
function calculateScore(answers) {
  const correctAnswers = [1, 1, 2, 3, 1]; // 正确答案索引
  let score = 0;

  answers.forEach((answer, index) => {
    if (answer === correctAnswers[index]) {
      score += 10;
    }
  });

  return score;
}

module.exports = router;
