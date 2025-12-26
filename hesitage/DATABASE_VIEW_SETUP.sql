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
-- 字段总数: 21 个（全部映射）

CREATE OR REPLACE VIEW shapefile.heritage_items AS
SELECT 
    "Proj_num" as proj_num,                  -- 项目号
    "Name_CN" as name,                       -- 名称 (中文)
    "Name_EN" as name_en,                    -- 名称 (英文)
    "CategoryCN" as category,                -- 类别 (中文)
    "CategoryEN" as category_en,             -- 类别 (英文)
    "Time" as time,                          -- 时间
    "Type_CN" as type,                       -- 类型 (中文)
    "Type_EN" as type_en,                    -- 类型 (英文)
    "Place_CN" as location,                  -- 地点 (中文)
    "Place_EN" as location_en,               -- 地点 (英文)
    "Unit_CN" as unit,                       -- 单位 (中文)
    "Unit_EN" as unit_en,                    -- 单位 (英文)
    "X" as longitude,                        -- 经度
    "Y" as latitude,                         -- 纬度
    "ProvinceCN" as province,                -- 省份 (中文)
    "ProvinceEN" as province_en,             -- 省份 (英文)
    "Region4CN" as region_4,                 -- 4级区域 (中文)
    "Region4EN" as region_4_en,              -- 4级区域 (英文)
    "Region7CN" as region_7,                 -- 7级区域 (中文)
    "Region7EN" as region_7_en,              -- 7级区域 (英文)
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

