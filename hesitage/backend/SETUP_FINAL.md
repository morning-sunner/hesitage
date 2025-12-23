# 🎯 完整后端配置指南

## ✅ 已为你完成的工作

你的后端项目已经创建了以下内容：

### 项目结构
```
backend/
├── .env                      # 数据库配置（已创建）
├── package.json             # 依赖配置（已更新）
├── app.js                   # Express 应用（已更新）
├── config/
│   └── database.js          # 数据库连接模块
├── routes/
│   ├── heritage.js          # 非遗项目数据 API
│   ├── spatial.js           # 空间查询 API
│   └── statistics.js        # 统计分析 API
├── utils/
│   └── initDb.js            # 数据库初始化脚本
├── test-connection.js       # 连接测试脚本
└── BACKEND_SETUP.md         # 后端设置指南
```

### 已创建的 API 端点

**非遗数据：**
- `GET /api/heritage` - 获取所有项目
- `GET /api/heritage/:id` - 获取项目详情
- `POST /api/heritage/search` - 搜索项目

**空间查询：**
- `POST /api/spatial/point-query` - 点查询
- `POST /api/spatial/buffer-query` - 圆形查询
- `POST /api/spatial/within-region` - 区域查询

**统计分析：**
- `GET /api/statistics` - 总体统计
- `GET /api/statistics/by-category` - 按分类统计
- `GET /api/statistics/by-region` - 按地区统计
- `GET /api/statistics/by-province` - 按省份统计

---

## ⚠️ 需要你手动处理的部分：配置 PostgreSQL 远程连接

### 问题原因
数据库不允许远程连接，需要修改 PostgreSQL 配置文件。

### 解决步骤

#### 1️⃣ 打开 pgAdmin，找到配置文件位置

在 pgAdmin 中：
- 连接到 PostgreSQL 14 服务器
- 右键单击服务器 → Properties
- 查看 "Server" 标签中的 "Server Version" 和路径信息

#### 2️⃣ 修改 `pg_hba.conf`

**文件位置（通常）：**
- Windows: `C:\Program Files\PostgreSQL\14\data\pg_hba.conf`

**编辑步骤：**
1. 用文本编辑器（如 Notepad++）打开 `pg_hba.conf`
2. 找到文件末尾，添加以下行：

```conf
# 允许本机连接
host    a1234567890         postgres    127.0.0.1/32            md5

# 允许局域网连接（如果需要）
host    a1234567890         postgres    192.168.0.0/16          md5

# 允许所有远程连接（仅用于开发）
host    a1234567890         postgres    0.0.0.0/0               md5
```

3. 保存文件

#### 3️⃣ 修改 `postgresql.conf`

**文件位置（通常）：**
- Windows: `C:\Program Files\PostgreSQL\14\data\postgresql.conf`

**编辑步骤：**
1. 打开 `postgresql.conf`
2. 找到以下行（约第 60 行）：
```conf
#listen_addresses = 'localhost'
```

3. 改为：
```conf
listen_addresses = '*'
```

4. 保存文件

#### 4️⃣ 重启 PostgreSQL 服务

**选项 A：Windows 服务管理**
- 按 `Win + R`，输入 `services.msc`
- 找到 `postgresql-x64-14` 服务
- 右键 → 重启

**选项 B：PowerShell（管理员）**
```powershell
Restart-Service postgresql-x64-14
```

**选项 C：pgAdmin**
- 在 pgAdmin 中右键服务器
- 选择 "Restart server"

#### 5️⃣ 验证连接

```bash
cd backend
node test-connection.js
```

**成功输出：**
```
正在测试数据库连接...
连接信息: { host: '10.20.33.183', port: '5432', ... }
✅ 数据库连接成功！
服务器时间: { now: '2025-12-22T10:30:45.123Z' }
```

#### 6️⃣ 初始化数据库

```bash
node utils/initDb.js
```

**成功输出：**
```
开始初始化数据库...
✓ PostGIS 已安装或已存在
✓ heritage_items 表已创建
✓ admin_regions 表已创建
✓ heritage_items 空间索引已创建
✓ admin_regions 空间索引已创建
✓ 示例数据已插入
✅ 数据库初始化完成！
```

---

## 🚀 启动后端

### 方式 1：开发模式（推荐）
```bash
cd backend
npm run dev
```

输出：
```
> backend@0.0.0 dev
> nodemon ./bin/www

[nodemon] 2.0.20
[nodemon] to restart at any time, type `rs`
[nodemon] watching dir(s): *.*
[nodemon] watching extensions: js,json

GET / 200 4.132 ms - 42
3000 号端口上已启动服务器...
```

### 方式 2：生产模式
```bash
npm start
```

---

## 🧪 测试 API

### 使用 curl 测试

**获取所有项目：**
```bash
curl http://localhost:3000/api/heritage
```

**搜索项目：**
```bash
curl -X POST http://localhost:3000/api/heritage/search \
  -H "Content-Type: application/json" \
  -d "{\"province\":\"江苏\"}"
```

**点查询：**
```bash
curl -X POST http://localhost:3000/api/spatial/point-query \
  -H "Content-Type: application/json" \
  -d "{\"lng\":120.595,\"lat\":31.299,\"radius\":0.05}"
```

**获取统计数据：**
```bash
curl http://localhost:3000/api/statistics/by-category
```

### 使用 Postman 测试
1. 导入 `backend/POSTMAN_COLLECTION.json`（如果存在）
2. 或手动创建请求：
   - URL: `http://localhost:3000/api/heritage`
   - Method: `GET`
   - 点击 "Send"

---

## 🔗 前端连接

前端已配置 API 调用（在 `src/utils/api.ts`）

### 在 Vue 组件中使用

```typescript
import { heritageApi, spatialApi, statisticsApi } from '@/utils/api'

// 获取所有项目
const items = await heritageApi.getAll()

// 搜索项目
const results = await heritageApi.search({ province: '江苏' })

// 点查询
const nearby = await spatialApi.pointQuery(120.595, 31.299)

// 获取统计
const stats = await statisticsApi.byCategory()
```

---

## 📋 检查清单

- [ ] 修改了 `pg_hba.conf`
- [ ] 修改了 `postgresql.conf`
- [ ] 重启了 PostgreSQL 服务
- [ ] 运行了 `node test-connection.js` 并看到成功消息
- [ ] 运行了 `node utils/initDb.js` 并看到初始化完成
- [ ] 启动了后端：`npm run dev`
- [ ] 测试了 API 端点
- [ ] 启动了前端：`npm run dev`
- [ ] 前端能成功调用后端 API

---

## 🆘 故障排除

### 连接被拒绝
```
Error: ECONNREFUSED 10.20.33.183:5432
```
- **原因**：PostgreSQL 未运行或防火墙阻止
- **解决**：确保 PostgreSQL 服务已启动，检查防火墙规则

### 认证失败
```
Error: password authentication failed for user "postgres"
```
- **原因**：密码错误或 pg_hba.conf 未配置
- **解决**：检查 `.env` 中的密码，修改 `pg_hba.conf`

### 找不到扩展 PostGIS
```
Error: extension "postgis" does not exist
```
- **原因**：PostgreSQL 未安装 PostGIS
- **解决**：在 pgAdmin 中安装 PostGIS 扩展

### CORS 错误
```
Access to XMLHttpRequest blocked by CORS policy
```
- **原因**：前端和后端端口不匹配
- **解决**：检查 `.env.local` 中的 `VITE_API_URL`，确保后端 CORS 配置正确

---

## 📞 需要帮助？

1. 检查所有配置文件是否保存
2. 确认 PostgreSQL 服务状态
3. 查看 PostgreSQL 日志（`C:\Program Files\PostgreSQL\14\data\log\`）
4. 使用 pgAdmin 直接测试数据库连接

---

**完成以上步骤后，你的 WebGIS 系统就可以正常运行了！ 🎉**
