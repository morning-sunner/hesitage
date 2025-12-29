/**
 * 获取表字段结构和统计信息的诊断脚本
 * 用法: node scripts/getTableInfo.js
 */

const db = require('../config/database');

async function getTableInfo() {
  try {
    console.log('\n========================================');
    console.log('  表结构与统计信息查询');
    console.log('========================================\n');

    // 1. 获取所有字段信息
    console.log('[1] 查询表字段信息...\n');
    const columnsResult = await db.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'shapefile'
        AND table_name = '长三角-全部_地点唯一_地级市'
      ORDER BY ordinal_position
    `);

    console.log('📋 表字段列表 (共 ' + columnsResult.rows.length + ' 个字段):\n');
    columnsResult.rows.forEach((col, idx) => {
      console.log(`${String(idx + 1).padStart(2)}. ${col.column_name.padEnd(20)} | ${col.data_type.padEnd(15)} | ${col.is_nullable === 'YES' ? '可空' : '不空'}`);
    });

    // 2. 获取表的统计数据
    console.log('\n[2] 查询表统计信息...\n');
    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT place_merged) as total_cities,
        COUNT(DISTINCT provincecn) as total_provinces,
        COUNT(DISTINCT categorycn) as total_categories
      FROM shapefile."长三角-全部_地点唯一_地级市"
    `);

    const stats = statsResult.rows[0];
    console.log(`📊 基本统计:\n`);
    console.log(`  • 总非遗项目数: ${stats.total_records}`);
    console.log(`  • 覆盖城市数: ${stats.total_cities}`);
    console.log(`  • 覆盖省份数: ${stats.total_provinces}`);
    console.log(`  • 非遗分类数: ${stats.total_categories}`);

    // 3. 获取各城市的非遗数量统计
    console.log('\n[3] 查询各城市的非遗统计...\n');
    const cityStatsResult = await db.query(`
      SELECT 
        place_merged as city_name,
        provincecn as province,
        COUNT(*) as heritage_count,
        COUNT(DISTINCT categorycn) as category_count,
        ROUND(AVG(x::numeric)::numeric, 4) as center_lng,
        ROUND(AVG(y::numeric)::numeric, 4) as center_lat,
        STRING_AGG(DISTINCT categorycn, ' | ' ORDER BY categorycn) as categories
      FROM shapefile."长三角-全部_地点唯一_地级市"
      WHERE place_merged IS NOT NULL
        AND x::text ~ '^-?[0-9.]+$'
        AND y::text ~ '^-?[0-9.]+$'
      GROUP BY place_merged, provincecn
      ORDER BY heritage_count DESC
      LIMIT 20
    `);

    console.log('🏙️  城市非遗统计 (Top 20):\n');
    console.log('排名 | 城市名          | 省份名      | 项目数 | 分类数 | 经度      | 纬度      | 主要分类');
    console.log('-----|-----------------|------------|--------|--------|----------|---------|------------------------');
    
    cityStatsResult.rows.forEach((city, idx) => {
      const categories = city.categories.split(' | ').slice(0, 3).join(', ');
      console.log(
        `${String(idx + 1).padStart(4)} | ${city.city_name.padEnd(15)} | ${city.province.padEnd(10)} | ${String(city.heritage_count).padStart(6)} | ${String(city.category_count).padStart(6)} | ${city.center_lng.toString().padEnd(10)} | ${city.center_lat.toString().padEnd(10)} | ${categories}`
      );
    });

    // 4. 获取各省份的统计信息
    console.log('\n[4] 查询各省份的统计信息...\n');
    const provinceStatsResult = await db.query(`
      SELECT 
        provincecn as province,
        COUNT(*) as heritage_count,
        COUNT(DISTINCT place_merged) as city_count,
        MIN(x::numeric) as lng_min,
        MAX(x::numeric) as lng_max,
        MIN(y::numeric) as lat_min,
        MAX(y::numeric) as lat_max,
        ROUND(AVG(x::numeric)::numeric, 3) as center_lng,
        ROUND(AVG(y::numeric)::numeric, 3) as center_lat
      FROM shapefile."长三角-全部_地点唯一_地级市"
      WHERE provincecn IS NOT NULL
        AND x::text ~ '^-?[0-9.]+$'
        AND y::text ~ '^-?[0-9.]+$'
      GROUP BY provincecn
      ORDER BY heritage_count DESC
    `);

    console.log('🗺️  省份统计信息:\n');
    console.log('省份名   | 项目数 | 城市数 | 经度范围       | 纬度范围       | 中心坐标');
    console.log('---------|--------|--------|-----|-----|');
    
    provinceStatsResult.rows.forEach(prov => {
      const lngRange = `[${prov.lng_min.toFixed(2)}, ${prov.lng_max.toFixed(2)}]`;
      const latRange = `[${prov.lat_min.toFixed(2)}, ${prov.lat_max.toFixed(2)}]`;
      const center = `(${prov.center_lng}, ${prov.center_lat})`;
      console.log(
        `${prov.province.padEnd(8)} | ${String(prov.heritage_count).padStart(6)} | ${String(prov.city_count).padStart(6)} | ${lngRange.padEnd(14)} | ${latRange.padEnd(14)} | ${center}`
      );
    });

    // 5. 获取非遗分类统计
    console.log('\n[5] 查询非遗分类统计...\n');
    const categoryStatsResult = await db.query(`
      SELECT 
        categorycn as category,
        COUNT(*) as count,
        COUNT(DISTINCT place_merged) as city_count,
        COUNT(DISTINCT provincecn) as province_count
      FROM shapefile."长三角-全部_地点唯一_地级市"
      WHERE categorycn IS NOT NULL
      GROUP BY categorycn
      ORDER BY count DESC
    `);

    console.log('📚 非遗分类统计:\n');
    console.log('分类名        | 项目数 | 覆盖城市 | 覆盖省份');
    console.log('--------------|--------|----------|--------');
    
    categoryStatsResult.rows.forEach(cat => {
      console.log(
        `${cat.category.padEnd(13)} | ${String(cat.count).padStart(6)} | ${String(cat.city_count).padStart(8)} | ${String(cat.province_count).padStart(8)}`
      );
    });

    // 6. 数据质量检查
    console.log('\n[6] 数据质量检查...\n');
    const qualityResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN place_merged IS NULL THEN 1 END) as null_city,
        COUNT(CASE WHEN provincecn IS NULL THEN 1 END) as null_province,
        COUNT(CASE WHEN x IS NULL THEN 1 END) as null_lng,
        COUNT(CASE WHEN y IS NULL THEN 1 END) as null_lat,
        COUNT(CASE WHEN x::text ~ '^-?[0-9.]+$' THEN 1 END) as valid_lng,
        COUNT(CASE WHEN y::text ~ '^-?[0-9.]+$' THEN 1 END) as valid_lat
      FROM shapefile."长三角-全部_地点唯一_地级市"
    `);

    const quality = qualityResult.rows[0];
    console.log('✅ 数据质量统计:\n');
    console.log(`  • 总记录数: ${quality.total}`);
    console.log(`  • 缺失城市名: ${quality.null_city} 条`);
    console.log(`  • 缺失省份名: ${quality.null_province} 条`);
    console.log(`  • 有效经度数据: ${quality.valid_lng} 条 (${((quality.valid_lng / quality.total) * 100).toFixed(1)}%)`);
    console.log(`  • 有效纬度数据: ${quality.valid_lat} 条 (${((quality.valid_lat / quality.total) * 100).toFixed(1)}%)`);

    console.log('\n========================================');
    console.log('  查询完成！');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ 查询出错:', error.message);
  } finally {
    // 关闭数据库连接
    process.exit(0);
  }
}

// 执行查询
getTableInfo();
