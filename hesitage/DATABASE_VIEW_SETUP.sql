-- PostgreSQL 数据库视图创建脚本
-- 用途: 为后端 API 创建统一的视图接口，映射实际表名到期望的字段名

-- 数据库: hositage
-- 用户: postgres

-- 原表信息:
-- 表名: shapefile."国家级非遗点位GCS_WGS_1984"
-- 记录数: 3,610 条
-- 字段数: 21 个

-- 创建视图: heritage_items
-- 此视图映射原表的字段到 API 期望的字段名，便于后端查询

CREATE OR REPLACE VIEW shapefile.heritage_items AS
SELECT 
    OBJECTID as id,                          -- 唯一ID
    Name_CN as name,                         -- 名称 (中文)
    Name_EN as name_en,                      -- 名称 (英文)
    CategoryCN as category,                  -- 类别 (中文)
    CategoryEN as category_en,               -- 类别 (英文)
    Place_CN as location,                    -- 地点 (中文)
    Place_EN as location_en,                 -- 地点 (英文)
    X as longitude,                          -- 经度
    Y as latitude,                           -- 纬度
    ProvinceCN as province,                  -- 省份 (中文)
    ProvinceEN as province_en,               -- 省份 (英文)
    "一级分类代码" as category_level_1,
    "一级分类名称CN" as category_level_1_name,
    "二级分类代码" as category_level_2,
    "二级分类名称CN" as category_level_2_name,
    "三级分类代码" as category_level_3,
    "三级分类名称CN" as category_level_3_name,
    "四级分类代码" as category_level_4,
    "四级分类名称CN" as category_level_4_name,
    geometry as geometry                     -- PostGIS 几何列
FROM shapefile."国家级非遗点位GCS_WGS_1984";

-- 为视图创建索引以提高查询性能
-- 注意: 对视图的索引需要在原表上创建

-- 验证视图是否成功创建
-- SELECT COUNT(*) FROM shapefile.heritage_items;  -- 应返回 3,610

-- 验证字段映射
-- SELECT * FROM shapefile.heritage_items LIMIT 1;

-- 后端查询示例:
-- SELECT * FROM shapefile.heritage_items;                 -- 获取全部数据
-- SELECT * FROM shapefile.heritage_items WHERE id = 1;   -- 获取单条
-- SELECT * FROM shapefile.heritage_items WHERE province = '江苏省';  -- 按省份查询

-- 空间查询示例 (使用 PostGIS):
-- SELECT * FROM shapefile.heritage_items 
-- WHERE ST_DWithin(geometry, ST_SetSRID(ST_Point(120.5, 31.2), 4326), 0.01);
-- 查找距离 (120.5, 31.2) 0.01 度范围内的所有记录

