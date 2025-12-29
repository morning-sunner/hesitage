/**
 * 长三角非遗数据库查询示例
 * 这些是用于生成热力图和省份统计数据的 SQL 查询
 */

-- ============================================
-- 1. 获取表的字段结构
-- ============================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'shapefile'
  AND table_name = '长三角-全部_地点唯一_地级市'
ORDER BY ordinal_position;

-- 输出：表的所有字段及其数据类型
-- 示例输出：
-- proj_num | character varying | NO | null
-- name_cn | character varying | YES | null
-- place_merged | character varying | YES | null
-- x | character varying | YES | null
-- y | character varying | YES | null
-- categorycn | character varying | YES | null
-- ...


-- ============================================
-- 2. 获取表的基本统计信息
-- ============================================

SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT place_merged) as total_cities,
  COUNT(DISTINCT provincecn) as total_provinces,
  COUNT(DISTINCT categorycn) as total_categories
FROM shapefile."长三角-全部_地点唯一_地级市";

-- 输出：
-- total_records | total_cities | total_provinces | total_categories
--    513        |      54      |        4        |        12


-- ============================================
-- 3. 热力图数据 - 各城市非遗统计（核心查询）
-- ============================================

SELECT 
  place_merged as city_name,
  provincecn as province,
  COUNT(*) as heritage_count,
  COUNT(DISTINCT categorycn) as category_count,
  ROUND(AVG(x::numeric)::numeric, 4) as center_lng,
  ROUND(AVG(y::numeric)::numeric, 4) as center_lat,
  STRING_AGG(DISTINCT categorycn, '|' ORDER BY categorycn) as categories
FROM shapefile."长三角-全部_地点唯一_地级市"
WHERE place_merged IS NOT NULL
  AND x::text ~ '^-?[0-9.]+$'
  AND y::text ~ '^-?[0-9.]+$'
GROUP BY place_merged, provincecn
ORDER BY heritage_count DESC;

-- 输出示例：
-- city_name | province | heritage_count | category_count | center_lng | center_lat | categories
-- 杭州市    | 浙江省   | 44             | 12             | 120.1513   | 30.2875    | 传统戏剧|传统美术|...
-- 金华市    | 浙江省   | 33             | 8              | 119.6521   | 29.1191    | 传统戏剧|民俗|...
-- 苏州市    | 江苏省   | 31             | 9              | 120.5954   | 31.2989    | 传统美术|传统技艺|...
-- ...


-- ============================================
-- 4. 省份边界数据 - 用于地图缩放（核心查询）
-- ============================================

SELECT 
  provincecn as province,
  COUNT(*) as heritage_count,
  COUNT(DISTINCT place_merged) as city_count,
  ARRAY[
    [MIN(x::numeric), MIN(y::numeric)],
    [MAX(x::numeric), MAX(y::numeric)]
  ] as bounds,
  ARRAY[
    ROUND(AVG(x::numeric)::numeric, 3),
    ROUND(AVG(y::numeric)::numeric, 3)
  ] as center
FROM shapefile."长三角-全部_地点唯一_地级市"
WHERE provincecn IS NOT NULL
  AND x::text ~ '^-?[0-9.]+$'
  AND y::text ~ '^-?[0-9.]+$'
GROUP BY provincecn
ORDER BY heritage_count DESC;

-- 输出示例：
-- province | heritage_count | city_count | bounds                          | center
-- 浙江省   | 232            | 11         | [[118.41, 27.52],[122.45,31.03]] | [120.388, 29.400]
-- 江苏省   | 132            | 13         | [[116.59, 31.27],[121.18,34.84]] | [119.709, 32.281]
-- 上海市   | 65             | 16         | [[121.27, 30.79],[121.78,31.87]] | [121.441, 31.209]
-- 安徽省   | 84             | 14         | [[115.39, 29.63],[117.92,34.83]] | [117.331, 31.521]


-- ============================================
-- 5. 各城市按非遗数量排名（Top 20）
-- ============================================

SELECT 
  ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank,
  place_merged as city_name,
  provincecn as province,
  COUNT(*) as heritage_count,
  COUNT(DISTINCT categorycn) as category_count,
  STRING_AGG(DISTINCT categorycn, ', ' ORDER BY categorycn) as categories
FROM shapefile."长三角-全部_地点唯一_地级市"
WHERE place_merged IS NOT NULL
GROUP BY place_merged, provincecn
ORDER BY heritage_count DESC
LIMIT 20;

-- 输出示例：
-- rank | city_name | province | heritage_count | category_count | categories
--  1   | 杭州市    | 浙江省   | 44             | 12             | 民俗,传统美术,传统戏剧,...
--  2   | 金华市    | 浙江省   | 33             | 8              | 传统戏剧,民俗,...
--  3   | 苏州市    | 江苏省   | 31             | 9              | 传统美术,传统技艺,...
-- ...


-- ============================================
-- 6. 各省份城市数量分布
-- ============================================

SELECT 
  provincecn as province,
  COUNT(DISTINCT place_merged) as city_count,
  COUNT(*) as heritage_count,
  ROUND(COUNT(*)::numeric / COUNT(DISTINCT place_merged), 2) as avg_per_city
FROM shapefile."长三角-全部_地点唯一_地级市"
WHERE place_merged IS NOT NULL
GROUP BY provincecn
ORDER BY heritage_count DESC;

-- 输出示例：
-- province | city_count | heritage_count | avg_per_city
-- 浙江省   | 11         | 232            | 21.09
-- 江苏省   | 13         | 132            | 10.15
-- 安徽省   | 14         | 84             | 6.00
-- 上海市   | 16         | 65             | 4.06


-- ============================================
-- 7. 非遗分类分布统计
-- ============================================

SELECT 
  categorycn as category,
  COUNT(*) as count,
  COUNT(DISTINCT place_merged) as city_count,
  COUNT(DISTINCT provincecn) as province_count,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM shapefile."长三角-全部_地点唯一_地级市") * 100, 2) as percentage
FROM shapefile."长三角-全部_地点唯一_地级市"
WHERE categorycn IS NOT NULL
GROUP BY categorycn
ORDER BY count DESC;

-- 输出示例：
-- category    | count | city_count | province_count | percentage
-- 传统戏剧    | 115   | 42         | 4              | 22.42%
-- 传统美术    | 98    | 38         | 4              | 19.10%
-- 传统技艺    | 87    | 35         | 4              | 16.96%
-- 民俗        | 76    | 31         | 4              | 14.81%
-- ...


-- ============================================
-- 8. 数据质量检查
-- ============================================

SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN place_merged IS NULL THEN 1 END) as null_city,
  COUNT(CASE WHEN provincecn IS NULL THEN 1 END) as null_province,
  COUNT(CASE WHEN x IS NULL THEN 1 END) as null_lng,
  COUNT(CASE WHEN y IS NULL THEN 1 END) as null_lat,
  COUNT(CASE WHEN x::text ~ '^-?[0-9.]+$' THEN 1 END) as valid_lng,
  COUNT(CASE WHEN y::text ~ '^-?[0-9.]+$' THEN 1 END) as valid_lat,
  COUNT(CASE WHEN categorycn IS NULL THEN 1 END) as null_category
FROM shapefile."长三角-全部_地点唯一_地级市";

-- 输出示例：
-- total_records | null_city | null_province | null_lng | null_lat | valid_lng | valid_lat | null_category
--    513        |     0     |       0       |    3     |    3     |    510    |    510    |      1


-- ============================================
-- 9. 单个省份的详细城市列表
-- ============================================

SELECT 
  place_merged as city_name,
  COUNT(*) as heritage_count,
  COUNT(DISTINCT categorycn) as category_count,
  ROUND(AVG(x::numeric)::numeric, 4) as center_lng,
  ROUND(AVG(y::numeric)::numeric, 4) as center_lat,
  MIN(x::numeric) as lng_min,
  MAX(x::numeric) as lng_max,
  MIN(y::numeric) as lat_min,
  MAX(y::numeric) as lat_max
FROM shapefile."长三角-全部_地点唯一_地级市"
WHERE provincecn = '浙江省'
  AND place_merged IS NOT NULL
  AND x::text ~ '^-?[0-9.]+$'
  AND y::text ~ '^-?[0-9.]+$'
GROUP BY place_merged
ORDER BY heritage_count DESC;

-- 输出：浙江省所有城市的详细统计信息


-- ============================================
-- 10. 按分类查看各城市的非遗分布
-- ============================================

SELECT 
  categorycn as category,
  place_merged as city_name,
  provincecn as province,
  COUNT(*) as count
FROM shapefile."长三角-全部_地点唯一_地级市"
WHERE categorycn = '传统戏剧'  -- 可替换为其他分类
  AND place_merged IS NOT NULL
GROUP BY categorycn, place_merged, provincecn
ORDER BY count DESC;

-- 输出：特定分类在各城市的分布情况


-- ============================================
-- 性能优化建议
-- ============================================

-- 创建索引以加快查询
CREATE INDEX IF NOT EXISTS idx_place_merged ON shapefile."长三角-全部_地点唯一_地级市"(place_merged);
CREATE INDEX IF NOT EXISTS idx_provincecn ON shapefile."长三角-全部_地点唯一_地级市"(provincecn);
CREATE INDEX IF NOT EXISTS idx_categorycn ON shapefile."长三角-全部_地点唯一_地级市"(categorycn);

-- 验证索引
SELECT * FROM pg_indexes 
WHERE tablename = '长三角-全部_地点唯一_地级市';


-- ============================================
-- 导出数据到 CSV（用于外部分析）
-- ============================================

-- 导出热力图数据
COPY (
  SELECT 
    place_merged as city_name,
    provincecn as province,
    COUNT(*) as heritage_count,
    ROUND(AVG(x::numeric)::numeric, 4) as center_lng,
    ROUND(AVG(y::numeric)::numeric, 4) as center_lat
  FROM shapefile."长三角-全部_地点唯一_地级市"
  WHERE place_merged IS NOT NULL
  GROUP BY place_merged, provincecn
  ORDER BY heritage_count DESC
) TO '/tmp/heatmap_data.csv' WITH CSV HEADER;

-- 导出省份统计数据
COPY (
  SELECT 
    provincecn as province,
    COUNT(*) as heritage_count,
    COUNT(DISTINCT place_merged) as city_count,
    MIN(x::numeric) as lng_min,
    MAX(x::numeric) as lng_max,
    MIN(y::numeric) as lat_min,
    MAX(y::numeric) as lat_max
  FROM shapefile."长三角-全部_地点唯一_地级市"
  WHERE provincecn IS NOT NULL
  GROUP BY provincecn
  ORDER BY heritage_count DESC
) TO '/tmp/province_data.csv' WITH CSV HEADER;
