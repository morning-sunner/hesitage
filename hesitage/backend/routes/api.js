var express = require('express');
var router = express.Router();
var db = require('../config/database');
const { callDeepSeekAPI } = require('../services/aiService');

// 模拟 AI 对话数据库（作为降级方案）
const aiResponses = {
  '什么是非遗文化？': '非物质文化遗产（非遗）是指各族人民世代相承、与群众生活密切相关的各种传统文化表现形式。长三角地区作为中国文化发达地区，拥有丰富的非遗资源，包括昆曲、苏州评弹、浙江剪纸等多个项目。',
  '长三角地区有哪些著名的非遗项目？': '长三角地区的非遗项目丰富多彩，主要包括：\n1. 昆曲 - 苏州传统戏曲艺术，已被列为联合国非遗代表作\n2. 苏州评弹 - 用吴语表演的说唱艺术\n3. 浙江剪纸 - 以剪刀为工具的民间艺术\n4. 龙井茶制作工艺 - 杭州西湖地区的传统工艺\n5. 宣纸制作 - 安徽宣城的古老工艺\n6. 徽州木雕 - 安徽的传统木雕工艺',
  '如何学习和传承非遗文化？': '学习和传承非遗文化有多种方式：\n1. 参加非遗传承人的课程和培训班\n2. 参观非遗展览和博物馆\n3. 观看非遗表演和展示\n4. 购买和使用非遗产品\n5. 通过互动社区学习和交流\n6. 支持非遗传承人的工作',
  '非遗传承人的故事': '非遗传承人是非遗文化的守护者，他们通过多年甚至几十年的学习和实践，掌握了传统工艺和技艺。他们不仅在从事这些工作，更致力于将这些宝贵的文化遗产传承给下一代。许多传承人已经老年，急需新人继承这些技艺。'
};

/* AI 对话 API - 使用DeepSeek API */
router.post('/ai-dialog', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: '问题不能为空' });
    }

    console.log(`📩 收到AI对话请求: ${question}`);

    // 调用AI服务
    const answer = await callDeepSeekAPI(question);

    console.log(`✅ AI回复完成`);

    res.json({
      question: question,
      answer: answer,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI对话处理失败:', error);
    res.status(500).json({ 
      error: '抱歉，AI助手暂时无法回答，请稍后再试。',
      question: req.body.question
    });
  }
});

/* 获取竞赛问题 API - 从数据库获取 */
router.get('/quiz-questions', async (req, res) => {
  try {
    const { difficulty, region, count = 10, type } = req.query;
    
    // 构建查询条件
    let whereClause = [];
    let params = [];
    let paramIndex = 1;
    
    // 按难度筛选
    if (difficulty) {
      const difficultyMap = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
      };
      whereClause.push(`difficulty = $${paramIndex++}`);
      params.push(difficultyMap[difficulty] || difficulty);
    }
    
    // 按地区筛选
    if (region && region !== '全部') {
      whereClause.push(`region = $${paramIndex++}`);
      params.push(region);
    }
    
    // 按题型筛选（单选、多选、判断）
    if (type) {
      whereClause.push(`question_type = $${paramIndex++}`);
      params.push(type);
    }
    
    const whereSQL = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';
    
    // 随机获取指定数量的题目
    const query = `
      SELECT 
        question_id as id,
        question_type as type,
        region,
        question_text as question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        explanation,
        difficulty
      FROM shapefile.heritage_questions
      ${whereSQL}
      ORDER BY RANDOM()
      LIMIT $${paramIndex}
    `;
    params.push(parseInt(count));
    
    const result = await db.query(query, params);
    
    // 转换为前端需要的格式
    const questions = result.rows.map(row => {
      // 构建选项数组（过滤掉空选项，判断题可能没有选项）
      const options = [];
      if (row.option_a && row.option_a !== '无') options.push(row.option_a);
      if (row.option_b && row.option_b !== '无') options.push(row.option_b);
      if (row.option_c && row.option_c !== '无') options.push(row.option_c);
      if (row.option_d && row.option_d !== '无') options.push(row.option_d);
      
      // 根据题型确定正确答案索引
      let correctIndex = 0;
      if (row.type === '判断') {
        // 判断题：正确答案是"正确"或"错误"
        correctIndex = row.correct_answer === '正确' ? 0 : 1;
        // 判断题选项固定
        options.length = 0;
        options.push('正确', '错误');
      } else if (row.type === '单选') {
        // 单选题：A=0, B=1, C=2, D=3
        const answerMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        correctIndex = answerMap[row.correct_answer] ?? 0;
      } else if (row.type === '多选') {
        // 多选题：返回正确答案字符串（如 "ABCD"）
        correctIndex = row.correct_answer; // 前端需要特殊处理多选
      }
      
      return {
        id: row.id,
        type: row.type,
        region: row.region,
        question: row.question,
        options: options,
        correct: correctIndex,
        explanation: row.explanation,
        difficulty: row.difficulty
      };
    });
    
    res.json({
      success: true,
      count: questions.length,
      questions: questions
    });
    
  } catch (error) {
    console.error('获取题目失败:', error);
    res.status(500).json({
      success: false,
      error: '获取题目失败',
      message: error.message
    });
  }
});

/* 获取题目统计信息 */
router.get('/quiz-stats', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN difficulty = '简单' THEN 1 END) as easy,
        COUNT(CASE WHEN difficulty = '中等' THEN 1 END) as medium,
        COUNT(CASE WHEN difficulty = '困难' THEN 1 END) as hard,
        COUNT(CASE WHEN question_type = '单选' THEN 1 END) as single,
        COUNT(CASE WHEN question_type = '多选' THEN 1 END) as multiple,
        COUNT(CASE WHEN question_type = '判断' THEN 1 END) as truefalse
      FROM shapefile.heritage_questions
    `);
    
    const stats = result.rows[0];
    
    // 获取地区分布
    const regionResult = await db.query(`
      SELECT region, COUNT(*) as count 
      FROM shapefile.heritage_questions 
      GROUP BY region 
      ORDER BY count DESC
    `);
    
    res.json({
      success: true,
      stats: {
        total: parseInt(stats.total),
        byDifficulty: {
          easy: parseInt(stats.easy),
          medium: parseInt(stats.medium),
          hard: parseInt(stats.hard)
        },
        byType: {
          single: parseInt(stats.single),
          multiple: parseInt(stats.multiple),
          truefalse: parseInt(stats.truefalse)
        },
        byRegion: regionResult.rows
      }
    });
  } catch (error) {
    console.error('获取统计失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* 提交答题结果 API */
router.post('/submit-quiz', async (req, res) => {
  try {
    const { 
      userId, 
      username, 
      difficulty, 
      totalQuestions, 
      correctAnswers, 
      score, 
      timeSpent 
    } = req.body;

    // 验证必填字段
    if (!userId || !username || !difficulty || !totalQuestions || score === undefined || !timeSpent) {
      return res.status(400).json({ 
        success: false,
        error: '缺少必填字段' 
      });
    }

    // 验证难度级别与题目数量的对应关系
    const validCombinations = {
      'beginner': 10,
      'intermediate': 20,
      'advanced': 25
    };

    if (validCombinations[difficulty] !== totalQuestions) {
      return res.status(400).json({
        success: false,
        error: '难度级别与题目数量不匹配'
      });
    }

    // 保存答题记录到数据库
    const result = await db.query(
      `INSERT INTO shapefile.quiz_records 
      (user_id, username, difficulty_level, total_questions, correct_answers, score, time_spent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at`,
      [userId, username, difficulty, totalQuestions, correctAnswers, score, timeSpent]
    );

    const record = result.rows[0];

    // 获取该用户在此难度下的排名
    const rankResult = await db.query(
      `SELECT rank FROM (
        SELECT 
          user_id,
          ROW_NUMBER() OVER (ORDER BY score DESC, time_spent ASC, created_at DESC) as rank
        FROM shapefile.quiz_best_records
        WHERE difficulty_level = $1
      ) ranked
      WHERE user_id = $2`,
      [difficulty, userId]
    );

    const rank = rankResult.rows[0]?.rank || null;

    res.json({
      success: true,
      data: {
        recordId: record.id,
        submittedAt: record.created_at,
        rank: rank,
        message: '答题结果已保存'
      }
    });

  } catch (error) {
    console.error('提交答题结果失败:', error);
    res.status(500).json({
      success: false,
      error: '提交答题结果失败',
      message: error.message
    });
  }
});

/* 获取排行榜 API */
router.get('/leaderboard', async (req, res) => {
  try {
    const { difficulty, limit = 50 } = req.query;

    // 如果指定了难度，只返回该难度的排行榜
    let query;
    let params;

    if (difficulty && ['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      query = `
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
        WHERE difficulty_level = $1
        ORDER BY rank
        LIMIT $2
      `;
      params = [difficulty, parseInt(limit)];
    } else {
      // 返回所有难度的排行榜
      query = `
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
        LIMIT $1
      `;
      params = [parseInt(limit) * 3]; // 每个难度各取limit条
    }

    const result = await db.query(query, params);

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

    res.json({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    console.error('获取排行榜失败:', error);
    res.status(500).json({
      success: false,
      error: '获取排行榜失败',
      message: error.message
    });
  }
});

/* 获取用户答题历史 API */
router.get('/quiz-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { difficulty } = req.query;

    let query = `
      SELECT 
        id,
        difficulty_level,
        total_questions,
        correct_answers,
        score,
        time_spent,
        created_at
      FROM shapefile.quiz_records
      WHERE user_id = $1
    `;
    
    const params = [userId];

    if (difficulty && ['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      query += ` AND difficulty_level = $2`;
      params.push(difficulty);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        difficulty: row.difficulty_level,
        totalQuestions: row.total_questions,
        correctAnswers: row.correct_answers,
        score: row.score,
        timeSpent: row.time_spent,
        submittedAt: row.created_at
      }))
    });

  } catch (error) {
    console.error('获取答题历史失败:', error);
    res.status(500).json({
      success: false,
      error: '获取答题历史失败',
      message: error.message
    });
  }
});

/* 获取用户最佳成绩 API */
router.get('/quiz-best-scores/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      `SELECT 
        difficulty_level,
        total_questions,
        correct_answers,
        score,
        time_spent,
        created_at
      FROM shapefile.quiz_best_records
      WHERE user_id = $1
      ORDER BY difficulty_level`,
      [userId]
    );

    const bestScores = {
      beginner: null,
      intermediate: null,
      advanced: null
    };

    result.rows.forEach(row => {
      bestScores[row.difficulty_level] = {
        totalQuestions: row.total_questions,
        correctAnswers: row.correct_answers,
        score: row.score,
        timeSpent: row.time_spent,
        achievedAt: row.created_at
      };
    });

    res.json({
      success: true,
      data: bestScores
    });

  } catch (error) {
    console.error('获取最佳成绩失败:', error);
    res.status(500).json({
      success: false,
      error: '获取最佳成绩失败',
      message: error.message
    });
  }
});

module.exports = router;
