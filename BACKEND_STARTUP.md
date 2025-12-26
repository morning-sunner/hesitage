# 后端 API 启动指南

## ✅ 当前状态

- 后端代码：✅ 修复完成
- npm 依赖：✅ 已安装 (pg, dotenv)
- 数据库连接：✅ 已配置
- 路由注册：✅ 已完成
- 数据库视图：✅ 已创建

## 🚀 启动后端

### 第一次启动

```powershell
# 进入后端目录
cd e:\study\大学\大三上\地理信息服务\长三角非遗\heritage\hesitage\backend

# 安装依赖 (包含 pg 驱动和 dotenv)
npm install

# 启动服务
npm start
```

**预期输出**:
```
> backend@0.0.0 start
> node ./bin/www

Database config: {
  host: 'localhost',
  port: 5432,
  database: 'hositage',
  user: 'postgres',
  password: '***'
}
✅ Express server listening on port 3000
```

服务启动后保持该终端开启。

### 第二个终端：测试 API

新打开一个 PowerShell 终端，运行以下命令：

```powershell
# 测试总体统计
Invoke-WebRequest -Uri "http://localhost:3000/api/statistics" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json

# 测试获取所有项目
Invoke-WebRequest -Uri "http://localhost:3000/api/heritage" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json

# 测试点查询 (需要 POST)
$body = @{lng=120; lat=31; radius=0.1} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/spatial/point-query" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

## 📝 配置检查清单

### 数据库配置 (.env)

```
✅ DB_HOST=localhost
✅ DB_PORT=5432
✅ DB_NAME=hositage
✅ DB_USER=postgres
✅ DB_PASSWORD=123456        ← 确保与你的实际密码匹配
✅ NODE_ENV=development
✅ PORT=3000
```

**如果密码不对**:
1. 编辑 `hesitage/backend/.env`
2. 修改 `DB_PASSWORD=你的实际密码`
3. 重启后端服务

### 数据库检查

确保视图存在：

```sql
SELECT COUNT(*) FROM shapefile.heritage_items;
-- 应返回: 3610
```

## 🔍 常见问题

### 问题 1: "ECONNREFUSED: connect ECONNREFUSED 127.0.0.1:5432"

**原因**: PostgreSQL 没有运行或密码错误

**解决**:
1. 启动 PostgreSQL 服务
2. 检查 `.env` 中的密码是否正确
3. 在 pgAdmin 中验证连接

### 问题 2: "relation shapefile.heritage_items does not exist"

**原因**: 数据库视图未创建

**解决**:
```bash
# 在 hesitage 目录下运行
psql -h localhost -p 5432 -U postgres -d hositage -f DATABASE_VIEW_SETUP.sql
```

### 问题 3: API 返回 404

**原因**: 路由未正确注册

**检查**: `hesitage/backend/app.js` 第 27-29 行:
```javascript
app.use('/api/heritage', heritageRouter);
app.use('/api/spatial', spatialRouter);
app.use('/api/statistics', statisticsRouter);
```

应该都存在。

## 📊 API 响应示例

### GET /api/statistics

```json
{
  "success": true,
  "data": {
    "total": 3610,
    "categoriesCount": 10,
    "provincesCount": 8,
    "typesCount": 15
  }
}
```

### GET /api/heritage

```json
{
  "success": true,
  "data": [
    {
      "proj_num": "001",
      "name": "昆曲",
      "name_en": "Kunqu Opera",
      "category": "传统戏剧",
      "province": "江苏",
      "longitude": 120.595,
      "latitude": 31.299,
      ...
    }
  ],
  "total": 100
}
```

### POST /api/spatial/point-query

```json
{
  "success": true,
  "data": [
    {
      "proj_num": "001",
      "name": "项目名称",
      "distance": 0.02345,
      ...
    }
  ],
  "total": 5,
  "queryPoint": {"lng": 120, "lat": 31}
}
```

## 📋 关键修复项目

| 项 | 状态 | 说明 |
|----|------|------|
| 后端依赖 | ✅ | 已添加 pg 和 dotenv |
| 数据库配置 | ✅ | 已加载 .env 文件 |
| 路由字段 | ✅ | 已修复所有 SQL 查询 |
| 错误处理 | ✅ | 已添加日志输出 |
| 后端启动 | ✅ | 已验证正常运行 |

## 🎯 后续步骤

后端验证通过后，进入 Phase 2:

1. 修改前端 Store (`heritageStore.ts`) 使用真实 API
2. 更新组件绑定到 API 数据
3. 运行 `npm run build` 测试构建
4. 进行集成测试

