/**
 * 简单的 API 测试脚本
 * 用于验证热力图和省份边界 API 是否正常工作
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPIs() {
  console.log('\n========================================');
  console.log('  热力图 API 测试');
  console.log('========================================\n');

  try {
    // 测试 1: 热力图数据
    console.log('[1] 测试 GET /api/spatial/heatmap-data\n');
    const heatmapRes = await axios.get(`${BASE_URL}/api/spatial/heatmap-data`, {
      timeout: 5000
    });

    if (heatmapRes.data.success) {
      console.log('✓ API 调用成功\n');
      console.log(`  • 返回城市数: ${heatmapRes.data.data.length}`);
      console.log(`  • 总项目数: ${heatmapRes.data.data.reduce((sum, c) => sum + c.heritage_count, 0)}`);
      
      if (heatmapRes.data.data.length > 0) {
        const sample = heatmapRes.data.data[0];
        console.log(`\n  示例数据 (第一个城市):`);
        console.log(`  {`);
        console.log(`    city_name: "${sample.city_name}",`);
        console.log(`    province: "${sample.province}",`);
        console.log(`    heritage_count: ${sample.heritage_count},`);
        console.log(`    category_count: ${sample.category_count},`);
        console.log(`    center_lng: "${sample.center_lng}",`);
        console.log(`    center_lat: "${sample.center_lat}"`);
        console.log(`  }`);
      }
    } else {
      console.log('✗ API 返回错误:', heatmapRes.data.message);
    }

  } catch (error) {
    console.log('✗ 热力图 API 测试失败:');
    console.log(`  ${error.message}`);
    if (error.response) {
      console.log(`  状态码: ${error.response.status}`);
      console.log(`  响应: ${JSON.stringify(error.response.data)}`);
    }
  }

  try {
    // 测试 2: 省份边界数据
    console.log('\n[2] 测试 GET /api/spatial/province-bounds\n');
    const boundsRes = await axios.get(`${BASE_URL}/api/spatial/province-bounds`, {
      timeout: 5000
    });

    if (boundsRes.data.success) {
      console.log('✓ API 调用成功\n');
      console.log(`  • 返回省份数: ${boundsRes.data.data.length}`);
      
      boundsRes.data.data.forEach(prov => {
        console.log(`\n  ${prov.province}:`);
        console.log(`    - 项目数: ${prov.heritage_count}`);
        console.log(`    - 城市数: ${prov.city_count}`);
        console.log(`    - 缩放级别: ${prov.zoom}`);
      });
    } else {
      console.log('✗ API 返回错误:', boundsRes.data.message);
    }

  } catch (error) {
    console.log('✗ 省份边界 API 测试失败:');
    console.log(`  ${error.message}`);
    if (error.response) {
      console.log(`  状态码: ${error.response.status}`);
      console.log(`  响应: ${JSON.stringify(error.response.data)}`);
    }
  }

  console.log('\n========================================');
  console.log('  测试完成');
  console.log('========================================\n');
}

// 运行测试
testAPIs();
