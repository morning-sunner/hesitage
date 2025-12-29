const db = require('../config/database');

/**
 * 检查表的字段结构和统计非遗数量
 */
async function checkTableSchema() {
  try {
    console.log('=== 检查表字段结构 ===\n');
    
    // 1. 获取表的所有字段
    const fieldsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema='shapefile' 
      AND table_name='长三角-全部_地点唯一_地级市'
      ORDER BY ordinal_position
    `;
    
    const fieldsResult = await db.query(fieldsQuery);
    console.log('表字段列表：');
    fieldsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    // 2. 查询示例数据
    console.log('\n=== 示例数据（前5条） ===\n');
    const sampleQuery = `
      SELECT * FROM shapefile."长三角-全部_地点唯一_地级市" 
      LIMIT 5
    `;
    
    const sampleResult = await db.query(sampleQuery);
    console.log(JSON.stringify(sampleResult.rows[0], null, 2));
    
    // 3. 统计各地级市的非遗数量
    console.log('\n=== 各地级市非遗数量统计 ===\n');
    const statsQuery = `
      SELECT 
        place_merged,
        provincecn,
        COUNT(*) as heritage_count,
        COUNT(DISTINCT categorycn) as category_count,
        AVG(CAST(x AS FLOAT)) as center_x,
        AVG(CAST(y AS FLOAT)) as center_y
      FROM shapefile."长三角-全部_地点唯一_地级市"
      WHERE place_merged IS NOT NULL 
      AND x IS NOT NULL 
      AND y IS NOT NULL
      GROUP BY place_merged, provincecn
      ORDER BY heritage_count DESC
      LIMIT 20
    `;
    
    const statsResult = await db.query(statsQuery);
    console.log('前20个地级市的统计数据：');
    statsResult.rows.forEach(row => {
      console.log(
        `${row.place_merged} (${row.provincecn}): ` +
        `非遗数量=${row.heritage_count}, ` +
        `分类数=${row.category_count}, ` +
        `中心坐标=[${row.center_x}, ${row.center_y}]`
      );
    });
    
    // 4. 获取各省份的总体统计
    console.log('\n=== 各省份总体统计 ===\n');
    const provinceStatsQuery = `
      SELECT 
        provincecn,
        COUNT(*) as heritage_count,
        COUNT(DISTINCT place_merged) as city_count,
        MIN(CAST(x AS FLOAT)) as min_x,
        MAX(CAST(x AS FLOAT)) as max_x,
        MIN(CAST(y AS FLOAT)) as min_y,
        MAX(CAST(y AS FLOAT)) as max_y,
        AVG(CAST(x AS FLOAT)) as center_x,
        AVG(CAST(y AS FLOAT)) as center_y
      FROM shapefile."长三角-全部_地点唯一_地级市"
      WHERE provincecn IS NOT NULL
      AND x IS NOT NULL 
      AND y IS NOT NULL
      GROUP BY provincecn
      ORDER BY heritage_count DESC
    `;
    
    const provinceStatsResult = await db.query(provinceStatsQuery);
    console.log('各省份统计数据（用于地图缩放）：');
    provinceStatsResult.rows.forEach(row => {
      console.log(
        `${row.provincecn}: ` +
        `非遗数量=${row.heritage_count}, ` +
        `城市数=${row.city_count}, ` +
        `边界=[${row.min_x}, ${row.min_y}] 到 [${row.max_x}, ${row.max_y}], ` +
        `中心=[${row.center_x}, ${row.center_y}]`
      );
    });
    
    db.end();
    
  } catch (error) {
    console.error('错误:', error.message);
    db.end();
    process.exit(1);
  }
}

checkTableSchema();
