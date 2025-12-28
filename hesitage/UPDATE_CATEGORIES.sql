-- ==========================================
-- 非遗数据重新分类SQL脚本
-- 基于新的10大类分类标准
-- ==========================================
-- 创建时间: 2025-12-27
-- 说明: 将原有分类映射到新的10大分类
-- ==========================================

-- 开始事务
BEGIN;

-- 1. 曲艺 → 说唱艺曲
UPDATE shapefile."国家级非遗点位GCS_WGS_1984"
SET "CategoryCN" = '说唱艺曲',
    "CategoryEN" = 'Ballad Singing'
WHERE "CategoryCN" = '曲艺';

-- 2. 传统体育、游艺与杂技 → 体育游艺
UPDATE shapefile."国家级非遗点位GCS_WGS_1984"
SET "CategoryCN" = '体育游艺',
    "CategoryEN" = 'Sports and Recreation'
WHERE "CategoryCN" = '传统体育、游艺与杂技';

-- 3. 传统美术 → 工艺美术
UPDATE shapefile."国家级非遗点位GCS_WGS_1984"
SET "CategoryCN" = '工艺美术',
    "CategoryEN" = 'Arts and Crafts'
WHERE "CategoryCN" = '传统美术';

-- 4. 传统舞蹈 和 传统音乐 → 音乐舞蹈
UPDATE shapefile."国家级非遗点位GCS_WGS_1984"
SET "CategoryCN" = '音乐舞蹈',
    "CategoryEN" = 'Music and Dance'
WHERE "CategoryCN" IN ('传统舞蹈', '传统音乐');

-- 5. 民俗中的节日类 → 风俗节庆
-- 注意:这需要根据具体项目名称判断,以下是示例
-- 您可能需要根据实际数据调整WHERE条件
UPDATE shapefile."国家级非遗点位GCS_WGS_1984"
SET "CategoryCN" = '风俗节庆',
    "CategoryEN" = 'Festivals and Customs'
WHERE "CategoryCN" = '民俗' 
  AND ("Name_CN" LIKE '%节%' 
       OR "Name_CN" LIKE '%庙会%' 
       OR "Name_CN" LIKE '%灯会%'
       OR "Name_CN" LIKE '%年%'
       OR "Name_CN" LIKE '%祭%');

-- ==========================================
-- 验证更新结果
-- ==========================================

-- 查看更新后的分类统计
SELECT "CategoryCN" as "分类名称", 
       COUNT(*) as "项目数量"
FROM shapefile."国家级非遗点位GCS_WGS_1984"
GROUP BY "CategoryCN"
ORDER BY "CategoryCN";

-- 提交事务
COMMIT;

-- ==========================================
-- 如果需要回滚,运行: ROLLBACK;
-- ==========================================

-- 导出更新后的数据(可选)
-- COPY shapefile."国家级非遗点位GCS_WGS_1984" TO 'E:\study\大学\大三上\地理信息服务\长三角非遗\heritage\hesitage\updated_heritage_data.csv' WITH CSV HEADER ENCODING 'UTF8';
