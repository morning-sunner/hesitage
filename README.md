# 长三角非遗地理信息系统

## 📋 项目结构

```
heritage/
├── hesitage/
│   ├── backend/              # Express.js 后端 API
│   │   ├── routes/           # 3 个主要 API 路由
│   │   ├── config/           # 数据库配置
│   │   ├── .env              # 环境变量
│   │   └── package.json      # 已更新：pg, dotenv 依赖
│   │
│   ├── front/                # Vue 3 + TypeScript 前端
│   │   ├── src/views/        # 11 个页面组件
│   │   ├── src/stores/       # Pinia 状态管理
│   │   ├── src/utils/api.ts  # API 服务层
│   │   └── package.json
│   │
│   ├── mydb_converted.sql    # 原始数据导入脚本 (3,610 条记录)
│   └── DATABASE_VIEW_SETUP.sql # 数据库视图定义
│
└── [其他文档已整理]
```

## 🔧 快速启动

### 前置条件
- ✅ PostgreSQL 11.2+ (localhost:5432)
- ✅ Node.js 14+
- ✅ 原始数据已导入到 `hositage` 数据库
- ✅ 数据库视图已创建：`shapefile.heritage_items`

### 1️⃣ 后端启动

```bash
cd hesitage/backend

# 安装依赖（已包含 pg, dotenv）
npm install

# 启动服务 (端口 3000)
npm start
```

**环境变量** (`.env`):
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hositage
DB_USER=postgres
DB_PASSWORD=123456
PORT=3000
```

**测试 API**:
```bash
curl http://localhost:3000/api/statistics
curl http://localhost:3000/api/heritage
curl http://localhost:3000/api/spatial/point-query -X POST \
  -H "Content-Type: application/json" \
  -d '{"lng": 120, "lat": 31, "radius": 0.1}'
```

### 2️⃣ 前端启动

```bash
cd hesitage/front

# 安装依赖
npm install

# 开发服务 (端口 5173)
npm run dev

# 生产构建
npm run build
```

## 📊 数据库结构

**原始表** (3,610 条记录):
```
shapefile."国家级非遗点位GCS_WGS_1984"
├── Proj_num (项目号)
├── Name_CN / Name_EN (名称)
├── CategoryCN / CategoryEN (类别)
├── X, Y (经度、纬度)
├── ProvinceCN / ProvinceEN (省份)
├── Type_CN, Unit_CN (类型、单位)
├── Time (时间)
├── Region4CN, Region7CN (区域分类)
└── geometry (PostGIS 几何)
```

**视图** (简化接口):
```
shapefile.heritage_items
└── 字段重映射到 API 期望的名称
    └── proj_num, name, name_en, category, longitude, latitude, ...
```

## 🔌 API 端点

### /api/heritage
- `GET /` - 获取全部项目 (分页 limit 100)
- `GET /:id` - 获取单个项目 (按 proj_num)
- `POST /search` - 搜索项目 (province, category, keyword)

### /api/spatial
- `POST /point-query` - 点查询 (lng, lat, radius)
- `POST /buffer-query` - 缓冲区查询 (使用相同参数)
- `POST /within-region` - 区域查询 (province)

### /api/statistics
- `GET /` - 总体统计
- `GET /by-category` - 按分类统计
- `GET /by-region` - 按省份统计

## ⚙️ 配置项

**后端** (`hesitage/backend/.env`):
```env
DB_HOST=localhost              # PostgreSQL 主机
DB_PORT=5432                   # PostgreSQL 端口
DB_NAME=hositage               # 数据库名
DB_USER=postgres               # 数据库用户
DB_PASSWORD=123456             # 数据库密码
NODE_ENV=development           # 环境
PORT=3000                      # API 端口
```

**前端** (`hesitage/front/.env.local`):
```env
VITE_API_URL=http://localhost:3000/api
```

## 🎯 当前进度

**Phase 1 (后端) - ✅ 完成**
- [x] API 路由注册
- [x] 数据库视图创建
- [x] npm 依赖修复 (pg, dotenv)
- [x] 后端服务启动成功
- [x] API 端点测试通过

**Phase 2 (前端) - ⏳ 待完成**
- [ ] 修改 `heritageStore.ts` 使用真实 API
- [ ] 更新组件 (HeritageView, DetailView, MapboxMapView)
- [ ] 前端数据绑定

**Phase 3 (集成测试) - ⏳ 待完成**
- [ ] 端到端测试
- [ ] 性能验证
- [ ] 合并到 main

## 🐛 故障排除

**后端无法连接数据库**
- 检查 `.env` 密码是否正确
- 验证 PostgreSQL 服务是否运行
- 确认数据库和用户存在

**API 返回 404**
- 确保视图 `shapefile.heritage_items` 已创建
- 检查 app.js 是否正确注册路由

**前端 API 连接失败**
- 后端是否在 localhost:3000 运行?
- 检查 `.env.local` 中的 `VITE_API_URL`
- 浏览器控制台查看具体错误

## 📝 重要文件

| 文件 | 用途 |
|------|------|
| `hesitage/DATABASE_VIEW_SETUP.sql` | 创建数据库视图 |
| `hesitage/backend/.env` | 后端配置 |
| `hesitage/backend/package.json` | 后端依赖 (已修复) |
| `hesitage/front/.env.local` | 前端 API 配置 |
| `hesitage/front/src/stores/heritageStore.ts` | 需要修改为 API 调用 |

## 🔗 相关文档

- `FIX_API_INTEGRATION_PLAN.md` - 详细修复计划
- `DATABASE_VIEW_SETUP_GUIDE.md` - 数据库设置
- `INTEGRATION_GUIDE.md` - 集成指南

