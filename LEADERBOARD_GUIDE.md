# 排行榜功能使用指南

## 功能概述

新的排行榜系统支持三个难度级别，每个用户可以多次答题，系统自动记录最佳成绩。

### 难度级别
- **初级 (Beginner)**: 10道题目
- **中级 (Intermediate)**: 20道题目  
- **高级 (Advanced)**: 25道题目

### 排名规则
1. 首先按分数从高到低排序
2. 分数相同时，按答题时间从短到长排序
3. 时间也相同时，按提交时间从新到旧排序

## 数据库设置

### 1. 初始化数据库表

运行以下命令创建排行榜相关的表和视图：

```bash
cd hesitage/backend
node init-leaderboard.js
```

这将创建：
- `shapefile.quiz_records` - 答题记录表
- `shapefile.quiz_best_records` - 最佳成绩视图
- `shapefile.quiz_leaderboard` - 排行榜视图（前50名）

### 2. 数据库表结构

#### quiz_records 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| user_id | INTEGER | 用户ID |
| username | VARCHAR(100) | 用户名 |
| difficulty_level | VARCHAR(20) | 难度级别 (beginner/intermediate/advanced) |
| total_questions | INTEGER | 总题目数 (10/20/25) |
| correct_answers | INTEGER | 答对题数 |
| score | INTEGER | 得分 (0-100) |
| time_spent | INTEGER | 答题用时（秒） |
| created_at | TIMESTAMP | 答题时间 |

## API 接口

### 1. 提交答题结果

**接口**: `POST /api/submit-quiz`

**请求体**:
```json
{
  "userId": 1,
  "username": "张三",
  "difficulty": "beginner",
  "totalQuestions": 10,
  "correctAnswers": 9,
  "score": 90,
  "timeSpent": 180
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "recordId": 123,
    "submittedAt": "2025-12-27T10:30:00Z",
    "rank": 5,
    "message": "答题结果已保存"
  }
}
```

### 2. 获取排行榜

**接口**: `GET /api/leaderboard?difficulty=beginner&limit=50`

**查询参数**:
- `difficulty` (可选): beginner/intermediate/advanced，不传则返回所有难度
- `limit` (可选): 每个难度返回的记录数，默认50

**响应**:
```json
{
  "success": true,
  "data": {
    "beginner": [
      {
        "rank": 1,
        "userId": 1,
        "username": "文化传承者",
        "totalQuestions": 10,
        "correctAnswers": 10,
        "score": 100,
        "timeSpent": 180,
        "submittedAt": "2025-12-27T10:30:00Z"
      }
    ],
    "intermediate": [...],
    "advanced": [...]
  }
}
```

### 3. 获取用户答题历史

**接口**: `GET /api/quiz-history/:userId?difficulty=beginner`

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "difficulty": "beginner",
      "totalQuestions": 10,
      "correctAnswers": 9,
      "score": 90,
      "timeSpent": 180,
      "submittedAt": "2025-12-27T10:30:00Z"
    }
  ]
}
```

### 4. 获取用户最佳成绩

**接口**: `GET /api/quiz-best-scores/:userId`

**响应**:
```json
{
  "success": true,
  "data": {
    "beginner": {
      "totalQuestions": 10,
      "correctAnswers": 10,
      "score": 100,
      "timeSpent": 180,
      "achievedAt": "2025-12-27T10:30:00Z"
    },
    "intermediate": null,
    "advanced": null
  }
}
```

## 前端集成

### 1. 排行榜组件

排行榜已集成在 `CommunityModal.vue` 中，支持三个难度级别的切换。

**特性**:
- 难度选项卡切换
- 前三名特殊显示（金银铜牌）
- 显示分数和答题时间
- 根据分数显示不同徽章

### 2. 答题提交

在 `CommunityView.vue` 的 `finishQuiz` 函数中，答题完成后自动提交成绩到后端。

**注意**: 需要用户登录后才能提交成绩。系统从 `localStorage` 读取用户信息。

## 测试步骤

### 1. 启动后端服务

```bash
cd hesitage/backend
npm start
```

### 2. 启动前端服务

```bash
cd hesitage/front
npm run dev
```

### 3. 测试流程

1. 访问社区页面
2. 选择难度（初级/中级/高级）
3. 开始答题
4. 完成答题后查看结果
5. 点击"排行榜"查看排名
6. 切换不同难度查看各个榜单

## 注意事项

1. **用户认证**: 确保用户已登录，否则成绩不会保存到排行榜
2. **题目数量**: 确保选择的难度与实际题目数量匹配
   - 初级: 10题
   - 中级: 20题
   - 高级: 25题
3. **性能优化**: 排行榜视图已经过索引优化，可快速查询
4. **数据一致性**: 使用视图确保每个用户每个难度只显示最佳成绩

## 数据库维护

### 清空测试数据

```sql
DELETE FROM shapefile.quiz_records;
```

### 查看排行榜

```sql
-- 查看某个难度的排行榜
SELECT * FROM shapefile.quiz_leaderboard 
WHERE difficulty_level = 'beginner' 
ORDER BY rank LIMIT 10;

-- 查看某个用户的最佳成绩
SELECT * FROM shapefile.quiz_best_records 
WHERE user_id = 1;
```

### 性能监控

```sql
-- 查看表大小
SELECT pg_size_pretty(pg_total_relation_size('shapefile.quiz_records'));

-- 查看索引使用情况
SELECT * FROM pg_stat_user_indexes 
WHERE schemaname = 'shapefile' 
AND relname = 'quiz_records';
```

## 未来扩展

可以考虑添加以下功能：
1. 每日/每周/每月排行榜
2. 地区排行榜
3. 好友排行榜
4. 成就系统
5. 积分奖励机制
