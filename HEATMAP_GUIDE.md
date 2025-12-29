# 地图热力图功能实现指南

## 功能说明

本文档说明如何在地图页面实现以下功能：

1. **热力图展示** - 根据各城市非遗项目数量，用颜色深度表示非遗集中度
2. **悬停信息展示** - 鼠标悬停在城市上显示该城市的非遗统计信息
3. **省份缩放** - 点击省份按钮，地图缩放到该省份中心并完整显示整个省份

## 后端API接口

### 1. 获取热力图数据

**请求地址**：`GET /api/spatial/heatmap-data`

**响应示例**：
```json
{
  "success": true,
  "data": [
    {
      "city_name": "杭州市",
      "province": "浙江省",
      "heritage_count": 44,
      "category_count": 12,
      "center_lng": "120.15",
      "center_lat": "30.28",
      "categories": "传统戏剧|传统美术|传统技艺|民俗|传统音乐"
    },
    // ... 更多城市数据
  ]
}
```

**字段说明**：
- `city_name` - 城市名称
- `province` - 省份名称
- `heritage_count` - 该城市非遗项目数量
- `category_count` - 该城市涉及的非遗分类数量
- `center_lng` - 城市中心经度
- `center_lat` - 城市中心纬度
- `categories` - 该城市的所有非遗分类（用 | 分隔）

### 2. 获取省份边界数据

**请求地址**：`GET /api/spatial/province-bounds`

**响应示例**：
```json
{
  "success": true,
  "data": [
    {
      "province": "浙江省",
      "heritage_count": 232,
      "city_count": 11,
      "bounds": [
        [118.41, 27.52],  // 西南角 [lng, lat]
        [122.45, 31.03]   // 东北角 [lng, lat]
      ],
      "center": [120.388, 29.400],  // 省份中心
      "zoom": 7  // 推荐缩放级别
    },
    // ... 其他省份
  ]
}
```

**字段说明**：
- `province` - 省份名称
- `heritage_count` - 该省总非遗项目数量
- `city_count` - 该省覆盖的城市数量
- `bounds` - 省份的地理边界 [西南角, 东北角]
- `center` - 省份中心坐标 [lng, lat]
- `zoom` - 推荐的地图缩放级别

## 前端实现

### 安装依赖

```bash
cd hesitage/front

# 添加 mapbox-gl 依赖
npm install mapbox-gl

# 安装所有依赖
npm install
```

### 更新路由

在 `hesitage/front/src/router/index.ts` 中引入新的 MapView 组件：

```typescript
import MapViewNew from '../views/MapViewNew.vue'

const routes = [
  // ... 其他路由
  {
    path: '/map',
    name: 'MapNew',
    component: MapViewNew
  }
]
```

### 运行应用

```bash
# 开发环境
npm run dev

# 生产环境构建
npm run build
```

## 功能特性详解

### 热力图可视化

- **圆形标记**：每个城市用圆形表示，圆的大小根据非遗项目数量动态调整
- **颜色映射**：从黄色（少数非遗项目）到深红色（大量非遗项目）的渐变
- **数字标签**：圆形中心显示该城市的非遗项目总数
- **交互悬停**：鼠标悬停显示城市详细信息

### 省份缩放功能

- **智能缩放**：根据省份地理面积自动计算最优缩放级别
- **平滑动画**：使用 `flyTo` 动画使缩放过程流畅
- **自动定位**：地图中心自动移动到省份中心
- **完整显示**：确保整个省份边界完全显示在视图内

### 统计信息面板

左侧工具栏显示：
- **地图工具**：热力图切换、视图重置
- **省份选择**：可点击的省份列表，显示非遗数量
- **统计信息**：全局或选中省份的统计数据
- **热力说明**：颜色含义和强度说明

右侧信息面板显示（悬停时）：
- **城市名称和省份**
- **非遗项目总数**
- **涉及分类数量**
- **主要分类列表**
- **地理坐标**

## 数据库查询说明

### 获取表的所有字段

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema='shapefile' 
AND table_name='长三角-全部_地点唯一_地级市'
ORDER BY ordinal_position;
```

### 统计各城市的非遗项目数

```sql
SELECT 
  place_merged as city_name,
  provincecn as province,
  COUNT(*) as heritage_count,
  COUNT(DISTINCT categorycn) as category_count,
  ROUND(AVG(x::numeric)::numeric, 2) as center_lng,
  ROUND(AVG(y::numeric)::numeric, 2) as center_lat,
  STRING_AGG(DISTINCT categorycn, '|') as categories
FROM shapefile."长三角-全部_地点唯一_地级市"
WHERE place_merged IS NOT NULL
  AND x::text ~ '^-?[0-9.]+$'
  AND y::text ~ '^-?[0-9.]+$'
GROUP BY place_merged, provincecn
ORDER BY heritage_count DESC;
```

### 获取省份边界和统计信息

```sql
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
WHERE x::text ~ '^-?[0-9.]+$'
  AND y::text ~ '^-?[0-9.]+$'
GROUP BY provincecn
ORDER BY heritage_count DESC;
```

## 故障排除

### 问题1：热力图不显示

**可能原因**：
- API 端点未正确响应
- Mapbox token 无效或过期
- 浏览器 console 有错误

**解决方案**：
1. 检查浏览器网络标签页，确认 API 请求成功
2. 在浏览器 console 查看错误信息
3. 更新有效的 Mapbox access token

### 问题2：热力图无法交互

**可能原因**：
- Mapbox 图层名称与事件监听器不匹配
- 事件处理函数未正确绑定

**解决方案**：
确保图层 ID 与事件监听器中使用的名称一致（默认为 `heatmap-layer`）

### 问题3：省份缩放不工作

**可能原因**：
- `/api/spatial/province-bounds` 端点错误
- 数据库连接失败

**解决方案**：
1. 在终端测试 API：`curl http://localhost:3000/api/spatial/province-bounds`
2. 检查后端错误日志
3. 确认数据库连接正常

## 性能优化建议

1. **数据缓存**：在前端 Store 中缓存热力图数据，减少重复请求
2. **图层优化**：大量数据点时考虑使用 `clustering` 功能
3. **异步加载**：使用 `Suspense` 和骨架屏改善用户体验
4. **地理编码**：预计算常用查询以加快响应速度

## 扩展功能建议

1. **时间维度**：添加时间范围选择，查看不同时期的非遗分布
2. **分类过滤**：按非遗分类筛选显示
3. **搜索功能**：按城市或非遗项目名称搜索
4. **详情弹窗**：点击城市显示该城市的所有非遗项目列表
5. **导出功能**：导出当前视图的统计报告

## 参考资源

- [Mapbox GL JS 官方文档](https://docs.mapbox.com/mapbox-gl-js/)
- [Vue 3 官方文档](https://v3.vuejs.org/)
- [PostgreSQL 地理数据查询](https://www.postgresql.org/docs/current/functions-geometry.html)
