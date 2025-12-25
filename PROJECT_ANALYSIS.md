# 长三角非遗项目 - 前后端数据库现状分析

## 📊 项目概览

这是一个关于长三角地区非遗保护的地理信息系统，包含**前端（Vue 3 + TypeScript）**、**后端（Express）** 和 **数据库（PostgreSQL + PostGIS）** 三层架构。

---

## 🗄️ 数据库现状

### 1. **数据库源文件**
- **文件位置**: `mydb_converted.sql`
- **数据量**: 共 3610 条非遗点位记录
- **核心表**: `shapefile."国家级非遗点位GCS_WGS_1984"`
- **空间参考系**: WGS-1984（EPSG:4326）

### 2. **表结构分析**

#### 主表: 国家级非遗点位GCS_WGS_1984
| 字段 | 类型 | 说明 |
|------|------|------|
| Proj_num | text | 项目编号 (如 Ⅰ-1) |
| Name_CN | text | 项目名称（中文） |
| Name_EN | text | 项目名称（英文） |
| CategoryCN | text | 分类（中文） |
| CategoryEN | text | 分类（英文） |
| Time | double precision | 年份（如 2006、2008） |
| Type_CN | text | 类型（新增项目/扩展项目）中文 |
| Type_EN | text | 类型（英文） |
| Place_CN | text | 地点（中文） |
| Place_EN | text | 地点（英文） |
| Unit_CN | text | 保护单位（中文） |
| Unit_EN | text | 保护单位（英文） |
| X | double precision | 经度 |
| Y | double precision | 纬度 |
| ProvinceCN | text | 省份（中文） |
| ProvinceEN | text | 省份（英文） |
| Region4CN | text | 地理区域4等级（中文） |
| Region4EN | text | 地理区域4等级（英文） |
| Region7CN | text | 地理区域7等级（中文） |
| Region7EN | text | 地理区域7等级（英文） |
| geometry | geometry(Point,4326) | 空间几何点 |

### 3. **关键观察**
✅ 包含 3610 条真实数据  
✅ 已启用 PostGIS 空间扩展  
✅ 包含完整的地理位置信息（经纬度+几何）  
✅ 包含中英文双语数据  
✅ 支持区域分层（4级、7级）和分类统计  

---

## 🔧 后端现状

### 1. **技术栈**
- **框架**: Express.js
- **数据库驱动**: pg (PostgreSQL)
- **Node.js**: 14+
- **环境配置**: `.env` 文件

### 2. **数据库连接配置** (`config/database.js`)
```javascript
{
  host: 'localhost',
  port: 5432,
  database: 'hositage',  // ⚠️ 注意数据库名称
  user: 'postgres',
  password: '0000'
}
```

### 3. **已实现的 API 路由**

#### 非遗项目 API (`/api/heritage`)
| 方法 | 路由 | 功能 |
|------|------|------|
| GET | `/api/heritage` | 获取所有项目 |
| GET | `/api/heritage/:id` | 获取单个项目详情 |
| POST | `/api/heritage/search` | 搜索（支持省份、城市、分类、关键词） |

**查询字段**:
```javascript
id, name, category, location, description, 
province, city, ST_X(coordinates) as lng, ST_Y(coordinates) as lat
```

#### 空间查询 API (`/api/spatial`)
| 方法 | 路由 | 功能 |
|------|------|------|
| POST | `/api/spatial/point-query` | 点查询（查询周围项目） |
| POST | `/api/spatial/buffer-query` | 缓冲区查询（圆形查询） |
| POST | `/api/spatial/within-region` | 区域内查询 |

**参数**:
```javascript
{ lng, lat, radius } // 经度、纬度、半径
{ province, city }   // 省份、城市
```

#### 统计 API (`/api/statistics`)
| 方法 | 路由 | 功能 |
|------|------|------|
| GET | `/api/statistics` | 总体统计 |
| GET | `/api/statistics/by-category` | 按分类统计 |
| GET | `/api/statistics/by-region` | 按地区统计 |

### 4. **数据库表对应关系**
后端代码期望的表结构（在 `initDb.js`）:
```javascript
heritage_items {
  id, name, category, location, description,
  coordinates (GEOMETRY Point), province, city, created_at
}

admin_regions {
  id, name, level, parent_id, geometry
}
```

⚠️ **问题**: 后端代码使用的是 `heritage_items` 表，但数据库实际表名是 `"国家级非遗点位GCS_WGS_1984"`

---

## 🎨 前端现状

### 1. **技术栈**
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 库**: Element Plus, Ant Design Vue
- **地图**: Mapbox GL, Leaflet
- **数据可视化**: ECharts
- **状态管理**: Pinia
- **HTTP 客户端**: Axios, Fetch API

### 2. **环境配置** (`.env.local`)
```
VITE_API_URL=http://localhost:3000/api
```

### 3. **API 服务层** (`src/utils/api.ts`)

#### 非遗项目 API
```typescript
heritageApi {
  getAll()                    // 获取所有项目
  getById(id)                 // 获取单个项目
  search(query)               // 搜索项目
}
```

#### 空间查询 API
```typescript
spatialApi {
  pointQuery(lng, lat, radius)        // 点查询
  bufferQuery(lng, lat, radius)       // 缓冲区查询
  withinRegion(province, city)        // 区域查询
}
```

#### 统计分析 API
```typescript
statisticsApi {
  getOverall()        // 总体统计
  byCategory()        // 分类统计
  byRegion()          // 地区统计
}
```

### 4. **状态管理** (`src/stores/`)

#### heritageStore.ts
- 存储各省份的静态数据（项目数量、世界遗产数、描述等）
- **当前包含**: 江苏、浙江、安徽等长三角地区的硬编码数据
- **问题**: 数据是静态的，未与数据库连接

#### heritageData.ts & counter.ts
- 其他辅助存储状态

### 5. **页面视图** (`src/views/`)
- HomeView.vue - 首页
- MapView.vue - 地图展示
- MapboxMapView.vue - Mapbox 地图
- DetailView.vue - 项目详情
- ChatView.vue - AI 聊天功能
- HeritageView.vue - 非遗项目列表

---

## 🔗 前后端数据连接现状

### ✅ 已实现
- 后端 API 框架完整
- 前端 API 调用层已定义
- 环境配置正确指向后端

### ❌ 问题/缺失
1. **表名映射不匹配**
   - 前端期望: `heritage_items`
   - 数据库实际: `"国家级非遗点位GCS_WGS_1984"`

2. **字段映射需要调整**
   - 前端使用: `name, category, location, description`
   - 数据库包含: `Name_CN/Name_EN, CategoryCN/CategoryEN, Place_CN/Place_EN` 等

3. **Pinia 状态管理未与 API 连接**
   - heritageStore 中的省份数据是硬编码的
   - 需要通过 API 动态获取和更新

4. **后端缺少 API 中间件注册**
   - app.js 中没有注册 heritage、spatial、statistics 路由

5. **地理信息字段映射**
   - 前端获取: `lng, lat` (从 ST_X(), ST_Y() 解析)
   - 数据库存储: 点 geometry 和 X、Y 坐标两种方式

---

## 📋 建立数据库连接需要做的工作

### **第一步**: 修复后端
1. 在 `app.js` 中正确注册所有路由
2. 创建数据库适配层（将表名和字段映射）
3. 修改查询以使用正确的表名和字段

### **第二步**: 调整前端
1. 修改 heritageStore 从静态数据改为 API 调用
2. 确保前端界面正确使用后端返回的数据
3. 测试 API 集成

### **第三步**: 数据库初始化
1. 导入 mydb_converted.sql 到 PostgreSQL
2. 或在 heritage_items 表中插入转换后的数据

### **第四步**: 集成测试
1. 测试所有 API 端点
2. 验证空间查询功能
3. 验证统计功能

---

## 📌 关键问题总结

| 问题 | 优先级 | 解决方案 |
|------|--------|--------|
| 后端路由未注册 | 🔴 高 | 在 app.js 中 require 并使用路由 |
| 表名/字段映射错误 | 🔴 高 | 创建适配层或直接修改查询 |
| 前端状态未与 API 连接 | 🟡 中 | 修改 heritageStore，使用 API |
| 数据库初始化脚本 | 🟡 中 | 运行 mydb_converted.sql 或修改 initDb.js |
| 中英文字段处理 | 🟢 低 | 定义明确的字段返回策略 |

---

## 📞 下一步建议

建议按以下顺序进行：
1. ✅ **修复后端路由注册** - 让 API 可以访问
2. ✅ **创建数据库适配层** - 处理表名和字段映射
3. ✅ **导入真实数据** - 运行 SQL 脚本
4. ✅ **测试后端 API** - 验证查询和返回数据
5. ✅ **连接前端** - 修改 Pinia store 使用真实数据
6. ✅ **端到端测试** - 验证整个流程

---

**生成时间**: 2025-12-25  
**项目路径**: `heritage/hesitage/`
