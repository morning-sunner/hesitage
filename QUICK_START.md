# 快速参考 - 前后端数据库连接

## 🎯 核心问题 & 解决方案

| 问题 | 原因 | 解决方案 | 文件位置 |
|------|------|--------|--------|
| 🔴 API 返回 404 | 路由未注册 | 在 app.js 中添加 3 行代码注册路由 | `backend/app.js` |
| 🔴 查询返回空 | 表名不匹配 | 创建视图映射真实表 | PostgreSQL |
| 🟡 前端数据硬编码 | Store 未连接 API | 改用 API 调用 | `front/src/stores/` |

---

## 📂 项目关键文件速查

### 后端文件结构
```
backend/
├── app.js                    ⚠️ 需要添加路由注册
├── .env                      ✅ 数据库配置
├── config/database.js        ✅ 数据库连接
├── routes/
│   ├── heritage.js          ✅ 已完成，等待路由注册
│   ├── spatial.js           ✅ 已完成，等待路由注册
│   └── statistics.js        ✅ 已完成，等待路由注册
└── utils/initDb.js          ⚠️ 需要修改表名
```

### 前端文件结构
```
front/
├── .env.local               ✅ API 地址配置
├── src/
│   ├── utils/api.ts         ✅ API 调用接口已定义
│   ├── stores/
│   │   └── heritageStore.ts ⚠️ 需要连接 API
│   └── views/
│       ├── HomeView.vue     等待数据
│       ├── MapView.vue      等待数据
│       └── DetailView.vue   等待数据
```

### 数据库文件
```
PostgreSQL
├── Database: hositage
├── Schema: shapefile
└── Table: "国家级非遗点位GCS_WGS_1984"  (3610 条数据)
   └── 需要创建视图: heritage_items
```

---

## 🚀 快速修复清单

### ✅ 立即可做 (今天)

#### 1️⃣ 修复后端路由注册 (5 分钟)
```javascript
// 文件: backend/app.js
// 在第 6 行之后添加:
var heritageRouter = require('./routes/heritage');
var spatialRouter = require('./routes/spatial');
var statisticsRouter = require('./routes/statistics');

// 在第 11 行之后添加:
app.use('/api/heritage', heritageRouter);
app.use('/api/spatial', spatialRouter);
app.use('/api/statistics', statisticsRouter);
```

#### 2️⃣ 创建数据库视图 (10 分钟)
```sql
-- 在 PostgreSQL 中执行此 SQL
DROP VIEW IF EXISTS shapefile.heritage_items;

CREATE VIEW shapefile.heritage_items AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY "Proj_num") as id,
  "Name_CN" as name,
  "CategoryCN" as category,
  "Place_CN" as location,
  "X" as lng,
  "Y" as lat,
  "ProvinceCN" as province,
  geometry
FROM shapefile."国家级非遗点位GCS_WGS_1984";
```

#### 3️⃣ 验证后端 (5 分钟)
```bash
# 终端中执行
cd backend
npm start

# 在另一个终端或浏览器中访问:
# http://localhost:3000/api/heritage
# 应该返回项目列表 JSON
```

---

## 🔄 数据流向说明

### 当前流向 ❌
```
前端 (硬编码数据) 
  ↓
Pinia Store (静态数据)
  ↓
UI 展示
```

### 修复后流向 ✅
```
PostgreSQL 数据库 (3610 条记录)
  ↓
Express API (routes/heritage.js 等)
  ↓
前端 API 调用层 (utils/api.ts)
  ↓
Pinia Store (动态数据)
  ↓
UI 展示
```

---

## 🔌 API 端点快速查询

### 非遗项目 API
```
GET  /api/heritage              - 获取所有项目
GET  /api/heritage/:id          - 获取单个项目
POST /api/heritage/search       - 搜索项目
```

### 空间查询 API
```
POST /api/spatial/point-query   - 点周围查询
POST /api/spatial/buffer-query  - 缓冲区查询
POST /api/spatial/within-region - 区域内查询
```

### 统计分析 API
```
GET  /api/statistics            - 总体统计
GET  /api/statistics/by-category - 分类统计
GET  /api/statistics/by-region   - 地区统计
```

---

## 📊 数据库字段速查

### 真实表字段
```
国家级非遗点位GCS_WGS_1984:
- Name_CN/Name_EN      → 项目名称
- CategoryCN/CategoryEN → 项目分类
- Place_CN/Place_EN    → 地点
- X, Y                 → 经纬度
- ProvinceCN/ProvinceEN → 省份
- Time                 → 申报年份
- geometry             → PostGIS 点
```

### 映射后视图字段
```
heritage_items:
- id               → 项目 ID
- name             → 项目名称
- category         → 分类
- location         → 地点
- lng, lat         → 经纬度
- province         → 省份
- year             → 年份
- geometry         → 空间数据
```

---

## 🧪 快速测试命令

### 测试后端连接
```bash
# 获取所有项目
curl http://localhost:3000/api/heritage

# 获取统计信息
curl http://localhost:3000/api/statistics

# 获取分类统计
curl http://localhost:3000/api/statistics/by-category

# 空间查询 (点查询)
curl -X POST http://localhost:3000/api/spatial/point-query \
  -H "Content-Type: application/json" \
  -d '{"lng": 120.595, "lat": 31.299, "radius": 0.05}'
```

### 测试数据库连接
```bash
# PostgreSQL 命令行
psql -U postgres -d hositage

# 查询数据
SELECT COUNT(*) FROM shapefile."国家级非遗点位GCS_WGS_1984";  -- 应返回 3610
SELECT COUNT(*) FROM shapefile.heritage_items;                -- 需要先创建视图

# 查看视图定义
\d shapefile.heritage_items
```

---

## 🔍 故障排除速查表

| 问题 | 可能原因 | 检查项 |
|------|--------|--------|
| API 404 | 路由未注册 | ✓ app.js 中有路由声明吗? |
| 空数据 | 表名错误 | ✓ 视图是否创建? ✓ 表是否存在? |
| CORS 错误 | 跨域问题 | ✓ 后端是否启用了 CORS? |
| 慢查询 | 缺少索引 | ✓ 是否创建了空间索引? |
| 连接失败 | 配置错误 | ✓ .env 文件配置正确吗? |

---

## 📈 完成度追踪

### 后端 (Backend)
- [x] Express 框架搭建
- [x] 数据库连接配置
- [x] heritage.js 路由编写
- [x] spatial.js 路由编写
- [x] statistics.js 路由编写
- [ ] ⚠️ **在 app.js 中注册路由** (优先级高)
- [ ] ⚠️ **修改查询以支持真实表名** (优先级高)
- [ ] 添加数据验证
- [ ] 添加错误处理优化

### 数据库 (Database)
- [x] PostgreSQL 部署
- [x] PostGIS 扩展启用
- [x] 数据导入 (3610 条)
- [x] 空间索引创建
- [ ] ⚠️ **创建 heritage_items 视图** (优先级高)
- [ ] 添加额外索引优化性能

### 前端 (Frontend)
- [x] Vue 3 + TypeScript 搭建
- [x] API 接口定义
- [x] Pinia Store 创建
- [x] UI 组件编写
- [ ] ⚠️ **连接 Store 与 API** (优先级高)
- [ ] 测试数据流
- [ ] UI 交互优化

---

## 📞 一句话总结

**现状**: 后端 API 已写好但未启用，数据库表已有但命名不符，前端准备好但未连接。  
**目标**: 注册路由 → 创建视图 → 连接前端 → 测试完成。  
**难度**: ⭐⭐ (中等)  
**耗时**: 1-2 小时

---

## 🎓 相关文档

- 📋 [项目分析报告](PROJECT_ANALYSIS.md) - 详细的项目现状分析
- 🏗️ [架构说明](ARCHITECTURE.md) - 系统架构和数据流向
- 📖 [对接指南](INTEGRATION_GUIDE.md) - 详细的修复步骤

---

**最后更新**: 2025-12-25  
**维护者**: GitHub Copilot  
**版本**: 1.0

