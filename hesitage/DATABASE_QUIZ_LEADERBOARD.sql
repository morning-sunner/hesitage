-- 创建答题记录表
CREATE TABLE IF NOT EXISTS shapefile.quiz_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,  -- 用户ID，关联 shapefile.users 表
    username VARCHAR(100) NOT NULL,  -- 用户名（冗余字段，方便查询）
    difficulty_level VARCHAR(20) NOT NULL,  -- 难度级别：beginner(初级)、intermediate(中级)、advanced(高级)
    total_questions INTEGER NOT NULL,  -- 总题目数：10、20、25
    correct_answers INTEGER NOT NULL,  -- 答对的题目数
    score INTEGER NOT NULL,  -- 得分（满分100分）
    time_spent INTEGER NOT NULL,  -- 答题用时（秒）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 答题时间
    
    CONSTRAINT check_difficulty CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    CONSTRAINT check_questions CHECK (total_questions IN (10, 20, 25)),
    CONSTRAINT check_score CHECK (score >= 0 AND score <= 100),
    CONSTRAINT check_time CHECK (time_spent > 0)
);

-- 创建索引以提高查询性能
CREATE INDEX idx_quiz_records_user_difficulty ON shapefile.quiz_records(user_id, difficulty_level);
CREATE INDEX idx_quiz_records_difficulty_score ON shapefile.quiz_records(difficulty_level, score DESC, time_spent ASC);
CREATE INDEX idx_quiz_records_created_at ON shapefile.quiz_records(created_at DESC);

-- 添加外键约束（如果 users 表存在）
-- ALTER TABLE shapefile.quiz_records 
-- ADD CONSTRAINT fk_quiz_records_user 
-- FOREIGN KEY (user_id) REFERENCES shapefile.users(id) ON DELETE CASCADE;

-- 创建视图：每个用户每个难度的最佳成绩
CREATE OR REPLACE VIEW shapefile.quiz_best_records AS
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
ORDER BY user_id, difficulty_level, score DESC, time_spent ASC, created_at DESC;

-- 创建视图：排行榜（每个难度前50名）
CREATE OR REPLACE VIEW shapefile.quiz_leaderboard AS
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
SELECT * FROM ranked_records WHERE rank <= 50;

-- 插入测试数据（可选）
INSERT INTO shapefile.quiz_records (user_id, username, difficulty_level, total_questions, correct_answers, score, time_spent)
VALUES 
    (1, '文化传承者', 'beginner', 10, 10, 100, 180),
    (2, '诗词达人', 'beginner', 10, 9, 90, 200),
    (3, '古韵青年', 'beginner', 10, 9, 90, 220),
    (4, '江南雅士', 'intermediate', 20, 18, 90, 420),
    (5, '匠心独运', 'intermediate', 20, 17, 85, 380),
    (1, '文化传承者', 'intermediate', 20, 19, 95, 400),
    (2, '诗词达人', 'advanced', 25, 23, 92, 650),
    (1, '文化传承者', 'advanced', 25, 24, 96, 600);

COMMENT ON TABLE shapefile.quiz_records IS '答题记录表，记录所有用户的答题历史';
COMMENT ON COLUMN shapefile.quiz_records.difficulty_level IS '难度级别：beginner(初级-10题)、intermediate(中级-20题)、advanced(高级-25题)';
COMMENT ON COLUMN shapefile.quiz_records.score IS '得分，0-100分';
COMMENT ON COLUMN shapefile.quiz_records.time_spent IS '答题用时，单位：秒';

COMMENT ON VIEW shapefile.quiz_best_records IS '每个用户在每个难度级别的最佳成绩';
COMMENT ON VIEW shapefile.quiz_leaderboard IS '排行榜视图，显示每个难度级别的前50名';
