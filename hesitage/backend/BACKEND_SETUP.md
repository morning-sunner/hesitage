# 🚀 后端快速启动指南

## 📦 已完成的设置

✅ 后端项目结构已创建
✅ 依赖包已安装
✅ 数据库连接配置已创建
✅ API 路由已生成

## ⚙️ 数据库连接问题处理

### 问题分析
当前错误提示数据库认证失败，需要在 PostgreSQL 的 `pg_hba.conf` 文件中添加远程连接规则。

### 解决方案

#### 步骤 1: 修改 PostgreSQL 配置

1. **找到 `pg_hba.conf` 文件位置**
   - Windows: 通常在 `C:\Program Files\PostgreSQL\14\data\pg_hba.conf`
   - 可以在 pgAdmin 中查看：右键数据库 → Properties

2. **编辑 `pg_hba.conf`**
   - 在文件末尾添加:
   ```
   # IPv4 local connections for remote access
   host    a1234567890         postgres    223.2.35.158/32         md5
   host    a1234567890         postgres    0.0.0.0/0               md5
   ```

3. **编辑 `postgresql.conf`**
   - 找到 `listen_addresses` 参数
   - 改为: `listen_addresses = '*'`

4. **重启 PostgreSQL 服务**
   ```bash
   # Windows (使用管理员 PowerShell)
   Restart-Service postgresql-x64-14
   
   # 或者直接在 pgAdmin 中重启
   ```

#### 步骤 2: 验证连接

```bash
cd backend
node test-connection.js
# 应该看到: ✅ 数据库连接成功！
```

#### 步骤 3: 初始化数据库

```bash
node utils/initDb.js
# 应该看到:
# ✓ PostGIS 已安装或已存在
# ✓ heritage_items 表已创建
# ✓ admin_regions 表已创建
# ✅ 数据库初始化完成！
```

## 🏃 启动后端服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start

# 服务将运行在 http://localhost:3000
```

## 📡 API 端点列表

### 非遗项目数据
- `GET /api/heritage` - 获取所有项目
- `GET /api/heritage/:id` - 获取单个项目详情
- `POST /api/heritage/search` - 搜索项目

### 空间查询
- `POST /api/spatial/point-query` - 点查询
- `POST /api/spatial/buffer-query` - 缓冲区（圆形）查询
- `POST /api/spatial/within-region` - 区域内查询

### 统计分析
- `GET /api/statistics` - 总体统计
- `GET /api/statistics/by-category` - 按分类统计
- `GET /api/statistics/by-region` - 按地区统计
- `GET /api/statistics/by-province` - 按省份统计

## 📝 示例请求

### 搜索非遗项目
```bash
curl -X POST http://localhost:3000/api/heritage/search \
  -H "Content-Type: application/json" \
  -d '{"province":"江苏","category":"传统戏剧"}'
```

### 点查询
```bash
curl -X POST http://localhost:3000/api/spatial/point-query \
  -H "Content-Type: application/json" \
  -d '{"lng":120.595,"lat":31.299,"radius":0.05}'
```

### 获取统计数据
```bash
curl http://localhost:3000/api/statistics/by-category
```

## 🔗 前端配置

在 `front/.env.local` 添加：
```
VITE_API_URL=http://localhost:3000/api
```

在前端代码中使用：
```typescript
const API_BASE = import.meta.env.VITE_API_URL

// 获取所有项目
const items = await fetch(`${API_BASE}/heritage`).then(r => r.json())
```

## ❓ 常见问题

**Q: 连接被拒绝？**
A: 检查 PostgreSQL 是否运行，以及 pg_hba.conf 是否配置正确

**Q: 表已存在错误？**
A: 这是正常的，`CREATE TABLE IF NOT EXISTS` 会跳过已存在的表

**Q: 数据没有插入？**
A: 检查 PostGIS 是否已安装，以及 `ST_GeomFromText` 函数是否可用

## 📞 需要帮助？

如果遇到问题，请检查：
1. PostgreSQL 服务是否启动
2. .env 文件中的数据库凭证是否正确
3. pg_hba.conf 是否允许连接
4. PostGIS 扩展是否已安装
