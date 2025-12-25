# 前后端数据库对接 - 详细技术指南

## 📋 目录
1. [当前状态检查清单](#当前状态检查清单)
2. [数据库字段映射表](#数据库字段映射表)
3. [API 端点规范](#api-端点规范)
4. [需要修复的代码位置](#需要修复的代码位置)
5. [修复步骤详解](#修复步骤详解)

---

## 当前状态检查清单

### 数据库层 ✅
- [x] PostgreSQL 已安装并运行
- [x] PostGIS 扩展已启用
- [x] 数据表已创建: `国家级非遗点位GCS_WGS_1984`
- [x] 数据已导入: 3610 条记录
- [x] 空间索引已创建

### 后端层 ⚠️
- [x] Express 框架已初始化
- [x] 数据库连接配置已定义
- [x] API 路由文件已编写 (heritage.js, spatial.js, statistics.js)
- [ ] ❌ **路由未在 app.js 中注册** - 需要修复
- [ ] ❌ **表名映射错误** - 需要适配

### 前端层 ⚠️
- [x] Vue 3 + TypeScript 项目已初始化
- [x] API 调用接口已定义 (api.ts)
- [x] Pinia 状态管理已建立
- [ ] ❌ **Store 中的数据是硬编码的** - 需要修改为 API 动态获取
- [ ] ❌ **未实际调用 API** - 需要添加实现

---

## 数据库字段映射表

### 源表结构 (PostgreSQL)
```
表名: shapefile."国家级非遗点位GCS_WGS_1984"
```

| 原字段名 | 数据类型 | 说明 | 前端需求 |
|---------|---------|------|---------|
| Proj_num | text | 项目编号 (如 Ⅰ-1, Ⅰ-2) | id (可选) |
| Name_CN | text | 项目名称(中文) | **name** ✅ |
| Name_EN | text | 项目名称(英文) | name_en (可选) |
| CategoryCN | text | 分类(中文) | **category** ✅ |
| CategoryEN | text | 分类(英文) | category_en (可选) |
| Time | double | 申报年份 | year |
| Type_CN | text | 项目类型(中文) | type |
| Type_EN | text | 项目类型(英文) | type_en (可选) |
| Place_CN | text | 地点(中文) | **location** ✅ |
| Place_EN | text | 地点(英文) | location_en (可选) |
| Unit_CN | text | 保护单位(中文) | organization |
| Unit_EN | text | 保护单位(英文) | organization_en (可选) |
| X | double | 经度 | **lng** ✅ |
| Y | double | 纬度 | **lat** ✅ |
| ProvinceCN | text | 省份(中文) | **province** ✅ |
| ProvinceEN | text | 省份(英文) | province_en (可选) |
| Region4CN | text | 区域4级(中文) | region4 |
| Region4EN | text | 区域4级(英文) | region4_en (可选) |
| Region7CN | text | 区域7级(中文) | region7 |
| Region7EN | text | 区域7级(英文) | region7_en (可选) |
| geometry | geometry | PostGIS 点对象 | (用于空间查询) |

### 前端期望的标准格式

```typescript
interface HeritageItem {
  id: number;              // 项目唯一ID
  name: string;            // 项目名称(中文)
  name_en?: string;        // 项目名称(英文)
  category: string;        // 分类(中文)
  category_en?: string;    // 分类(英文)
  location: string;        // 地点
  description?: string;    // 描述
  lng: number;             // 经度
  lat: number;             // 纬度
  province: string;        // 省份
  city?: string;           // 城市
  year?: number;           // 申报年份
  type?: string;           // 项目类型
  organization?: string;   // 保护单位
}
```

---

## API 端点规范

### 1. 非遗项目 API

#### GET /api/heritage
获取所有项目

**查询参数**: 
- `limit` (可选): 数量限制, 默认 100
- `offset` (可选): 偏移量, 默认 0

**返回格式**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "苗族古歌",
      "name_en": "Miao ancient songs",
      "category": "民间文学",
      "category_en": "Folk Literature",
      "location": "贵州省台江县",
      "province": "贵州",
      "lng": 108.317039,
      "lat": 26.670931,
      "year": 2006,
      "type": "新增项目"
    },
    ...
  ],
  "total": 3610
}
```

#### GET /api/heritage/:id
获取单个项目详情

**参数**: 
- `id` (路径参数): 项目ID

**返回格式**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "苗族古歌",
    ...
  }
}
```

#### POST /api/heritage/search
搜索项目

**请求体**:
```json
{
  "province": "江苏",      // 可选
  "city": "苏州",          // 可选
  "category": "民间文学",  // 可选
  "keyword": "昆曲"        // 可选
}
```

**返回格式**: 同 GET /api/heritage

### 2. 空间查询 API

#### POST /api/spatial/point-query
点查询 - 查询某点周围的项目

**请求体**:
```json
{
  "lng": 120.595,      // 经度 (必需)
  "lat": 31.299,       // 纬度 (必需)
  "radius": 0.05       // 查询半径(度) 可选, 默认 0.05
}
```

**返回格式**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "昆曲",
      ...
      "distance": 0.002    // 距离查询点的距离
    }
  ],
  "total": 5,
  "queryPoint": { "lng": 120.595, "lat": 31.299 }
}
```

#### POST /api/spatial/buffer-query
缓冲区查询 - 圆形查询

**请求体**:
```json
{
  "lng": 120.595,
  "lat": 31.299,
  "radius": 0.1   // 缓冲区半径(度)
}
```

**返回格式**: 同上

#### POST /api/spatial/within-region
区域内查询

**请求体**:
```json
{
  "province": "江苏",  // 可选
  "city": "苏州"       // 可选
}
```

**返回格式**: 同上

### 3. 统计分析 API

#### GET /api/statistics
总体统计

**返回格式**:
```json
{
  "success": true,
  "data": {
    "total": 3610,           // 总项目数
    "categoriesCount": 10,   // 分类数
    "provincesCount": 31,    // 省份数
    "citiesCount": 100       // 城市数
  }
}
```

#### GET /api/statistics/by-category
按分类统计

**返回格式**:
```json
{
  "success": true,
  "data": [
    {
      "category": "民间文学",
      "category_en": "Folk Literature",
      "count": 320
    },
    {
      "category": "传统戏剧",
      "category_en": "Traditional Drama",
      "count": 280
    },
    ...
  ]
}
```

#### GET /api/statistics/by-region
按地区统计

**返回格式**:
```json
{
  "success": true,
  "data": [
    {
      "province": "江苏",
      "province_en": "Jiangsu",
      "count": 146,
      "cities": {
        "南京": 25,
        "苏州": 42,
        ...
      }
    },
    ...
  ]
}
```

---

## 需要修复的代码位置

### 🔴 Priority 1: 后端路由注册

**文件**: `backend/app.js`

**当前状态**:
```javascript
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

app.use('/', indexRouter);
app.use('/users', usersRouter);
```

**需要添加** (在 usersRouter 之后):
```javascript
var heritageRouter = require('./routes/heritage');
var spatialRouter = require('./routes/spatial');
var statisticsRouter = require('./routes/statistics');

// ... 在中间件配置之后添加这些
app.use('/api/heritage', heritageRouter);
app.use('/api/spatial', spatialRouter);
app.use('/api/statistics', statisticsRouter);
```

### 🔴 Priority 2: 表名映射

**文件**: `backend/routes/heritage.js` 等所有查询文件

**当前问题**:
```javascript
// 查询代码中使用的表名
FROM shapefile.heritage_items

// 但实际表名是
FROM shapefile."国家级非遗点位GCS_WGS_1984"
```

**解决方案**: 创建视图 (在数据库中执行)

```sql
-- 在 PostgreSQL 中创建视图
CREATE OR REPLACE VIEW shapefile.heritage_items AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY "Proj_num") as id,
  "Name_CN" as name,
  "Name_EN" as name_en,
  "CategoryCN" as category,
  "CategoryEN" as category_en,
  "Place_CN" as location,
  "Place_EN" as location_en,
  "X" as lng,
  "Y" as lat,
  "ProvinceCN" as province,
  "ProvinceEN" as province_en,
  "Time"::integer as year,
  "Type_CN" as type,
  "Unit_CN" as organization,
  geometry
FROM shapefile."国家级非遗点位GCS_WGS_1984";

-- 为了支持城市字段，需要从 Place_CN 中提取
-- 或在应用层处理
```

或者**直接修改查询** (在 routes/*.js 中):

```javascript
// 旧方式
const result = await db.query(`
  SELECT ... FROM shapefile.heritage_items WHERE ...
`);

// 新方式 - 直接使用真实表名
const result = await db.query(`
  SELECT 
    ROW_NUMBER() OVER () as id,
    "Name_CN" as name,
    "CategoryCN" as category,
    "Place_CN" as location,
    "X" as lng,
    "Y" as lat,
    "ProvinceCN" as province,
    geometry
  FROM shapefile."国家级非遗点位GCS_WGS_1984"
  WHERE ...
`);
```

### 🟡 Priority 3: 前端状态管理

**文件**: `front/src/stores/heritageStore.ts`

**当前问题**: 数据是硬编码的

```typescript
// 当前代码中
export const useHeritageStore = defineStore('heritage', () => {
  const currentProvince = ref('jiangsu')
  
  const provinceData: Record<string, ProvinceData> = {
    jiangsu: {
      projectCount: 146,  // ❌ 硬编码
      // ...
    }
  }
})
```

**需要修改为**:

```typescript
import { heritageApi, statisticsApi } from '@/utils/api'

export const useHeritageStore = defineStore('heritage', () => {
  const currentProvince = ref('jiangsu')
  const statistics = ref({
    total: 0,
    categoriesCount: 0,
    provincesCount: 0,
    citiesCount: 0
  })
  
  // 从 API 获取统计数据
  const loadStatistics = async () => {
    const result = await statisticsApi.getOverall()
    if (result.success) {
      statistics.value = result.data
    }
  }
  
  return { currentProvince, statistics, loadStatistics }
})
```

---

## 修复步骤详解

### 步骤 1: 注册后端路由 (5分钟)

编辑 `backend/app.js`:

```javascript
// 在 var usersRouter = require('./routes/users'); 之后添加
var heritageRouter = require('./routes/heritage');
var spatialRouter = require('./routes/spatial');
var statisticsRouter = require('./routes/statistics');

// 在 app.use('/users', usersRouter); 之后添加
app.use('/api/heritage', heritageRouter);
app.use('/api/spatial', spatialRouter);
app.use('/api/statistics', statisticsRouter);
```

### 步骤 2: 创建数据库视图 (10分钟)

连接到 PostgreSQL，执行:

```sql
-- 先检查是否已有视图
DROP VIEW IF EXISTS shapefile.heritage_items;

-- 创建视图
CREATE VIEW shapefile.heritage_items AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY "Proj_num") as id,
  "Name_CN" as name,
  "Name_EN" as name_en,
  "CategoryCN" as category,
  "CategoryEN" as category_en,
  "Place_CN" as location,
  "Place_EN" as location_en,
  "X" as lng,
  "Y" as lat,
  "ProvinceCN" as province,
  "ProvinceEN" as province_en,
  "Region4CN" as region4,
  "Region7CN" as region7,
  CAST("Time" AS INTEGER) as year,
  "Type_CN" as type,
  "Unit_CN" as organization,
  geometry
FROM shapefile."国家级非遗点位GCS_WGS_1984";

-- 验证视图
SELECT COUNT(*) FROM shapefile.heritage_items;
-- 应该返回 3610
```

### 步骤 3: 测试后端 API (10分钟)

启动后端:
```bash
cd backend
npm install  # 如果没装过依赖
npm start
```

测试 API (使用 curl 或 Postman):
```bash
# 测试 /api/heritage
curl http://localhost:3000/api/heritage

# 测试 /api/statistics
curl http://localhost:3000/api/statistics

# 测试 /api/statistics/by-category
curl http://localhost:3000/api/statistics/by-category

# 测试空间查询
curl -X POST http://localhost:3000/api/spatial/point-query \
  -H "Content-Type: application/json" \
  -d '{"lng": 120.595, "lat": 31.299, "radius": 0.05}'
```

### 步骤 4: 修改前端 Store (15分钟)

编辑 `front/src/stores/heritageStore.ts`，将硬编码数据改为 API 调用。

### 步骤 5: 测试前端集成 (10分钟)

启动前端:
```bash
cd front
npm install  # 如果没装过依赖
npm run dev
```

在浏览器中检查:
1. Network 标签中是否有 API 请求
2. 数据是否正确显示
3. 地图是否正确加载项目

---

## 常见问题

### Q: 数据库连接出错怎么办？
A: 检查 `.env` 文件中的数据库配置是否正确
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hositage  # 注意拼写
DB_USER=postgres
DB_PASSWORD=0000
```

### Q: API 返回 404 怎么办？
A: 确保 app.js 中已注册路由，并检查路由前缀是否正确
```javascript
app.use('/api/heritage', heritageRouter);  // 注意 /api 前缀
```

### Q: 查询返回空数据怎么办？
A: 
1. 检查视图是否成功创建: `SELECT COUNT(*) FROM shapefile.heritage_items;`
2. 检查表名是否正确: `SELECT * FROM shapefile."国家级非遗点位GCS_WGS_1984" LIMIT 1;`
3. 检查 SQL 查询日志

### Q: 前端 CORS 错误怎么办？
A: 在后端 app.js 中添加 CORS 中间件
```javascript
const cors = require('cors');
app.use(cors());
```

---

**最后更新**: 2025-12-25
**难度等级**: ⭐⭐ (中等)
**预计耗时**: 1-2 小时 (包括测试)

