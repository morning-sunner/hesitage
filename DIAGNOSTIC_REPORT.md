# 🔍 长三角非遗地图 - 项目诊断报告

## 📊 发现的问题汇总

### 1. **前端页面显示问题** ✅ 已修复

**症状：** 页面显示很窄，地图容器没有全屏显示

**原因分析：**
- `App.vue` 中的 `#app` 容器有 `max-width: 1600px` 限制
- `MapView.vue` 的 `map-view-container` 使用 `height: 100vh` 但在 `#app` 内部会被限制
- NavBar 使用 `position: sticky` 会在地图页面显示

**修复方案：**
```javascript
// App.vue - 移除宽度限制
#app {
  width: 100%;           // 改为 100%
  height: 100%;          // 添加高度
  padding: 0;            // 移除 padding
  margin: 0;             // 移除 margin
}

// MapView.vue - 使用 fixed 定位全屏
.map-view-container {
  position: fixed;       // 改为 fixed
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

**修复状态：** ✅ 已应用

---

### 2. **后端 API 路由问题** ⚠️ 需要排查

**症状：** GET `/api/spatial/heatmap-data` 返回 404

**问题排查结果：**
```
✓ 后端服务运行中 (localhost:3000)
✓ 路由在 app.js 中注册: app.use('/api/spatial', spatialRouter)
✓ spatial.js 文件存在且包含 heatmap-data 端点
? 数据库连接状态 - 需要验证
? 数据库表名是否正确 - 表名: "长三角-全部_地点唯一_地级市"
```

**可能原因：**
1. 数据库连接失败（最可能）
2. 数据库表不存在或表名不正确
3. 数据库用户权限不足
4. 环境变量配置不正确（.env 文件缺失）

**诊断命令：**
```bash
# 在 backend 目录运行
node scripts/testAPIs.js
```

---

### 3. **数据库连接配置** ⚠️ 需要验证

**配置文件：** `hesitage/backend/config/database.js`

**当前配置：**
```javascript
{
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_NAME || 'hositage',  // 注意：这里是 'hositage' 而不是正确的数据库名
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456'
}
```

**⚠️ 发现问题：** 默认数据库名是 `hositage`，这可能不正确！

**需要检查：**
1. 你的实际数据库名是什么？
2. PostgreSQL 中是否存在表 `"长三角-全部_地点唯一_地级市"`？
3. 数据库用户是否有访问权限？

---

### 4. **环境变量文件** ⚠️ 可能缺失

**文件位置：** `hesitage/backend/.env`

**应该包含：**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=你的数据库名
DB_USER=你的用户名
DB_PASSWORD=你的密码
```

**检查方法：**
```bash
cd hesitage/backend
ls -la .env
```

---

## 🔧 修复步骤

### 第一步：验证后端 API

```bash
# 1. 进入后端目录
cd hesitage/backend

# 2. 运行 API 测试脚本
node scripts/testAPIs.js
```

**预期输出：** 
- ✓ API 调用成功
- 显示热力图数据和省份边界数据

**如果失败：**
- 检查后端错误日志
- 确认数据库连接

### 第二步：检查数据库连接

```bash
# 1. 检查 .env 文件
cat hesitage/backend/.env

# 2. 或查看数据库配置
node -e "console.log(require('./config/database'))"
```

### 第三步：验证数据库表

```bash
# 使用 psql 或 GUI 工具连接到数据库
psql -U postgres -d 你的数据库名

# 查询表是否存在
SELECT * FROM information_schema.tables 
WHERE table_schema = 'shapefile' 
AND table_name = '长三角-全部_地点唯一_地级市';

# 查询记录数
SELECT COUNT(*) FROM shapefile."长三角-全部_地点唯一_地级市";
```

### 第四步：测试前端页面

```bash
# 1. 进入前端目录
cd hesitage/front

# 2. 启动开发服务器
npm run dev

# 3. 打开浏览器访问
# http://localhost:5173/map
```

---

## 📋 代码检查清单

### 前端文件

| 文件 | 状态 | 说明 |
|------|------|------|
| `src/views/MapView.vue` | ✅ 修复 | 全屏容器，隐藏 NavBar |
| `src/App.vue` | ✅ 修复 | 移除宽度限制 |
| `src/router/index.ts` | ✅ 验证 | `/map` 路由正确 |
| `package.json` | ✅ 验证 | echarts 已安装 |

### 后端文件

| 文件 | 状态 | 说明 |
|------|------|------|
| `routes/spatial.js` | ✓ 存在 | 包含两个 API 端点 |
| `config/database.js` | ⚠️ 需检查 | 数据库配置需验证 |
| `.env` | ⚠️ 需检查 | 环境变量配置 |
| `app.js` | ✓ 验证 | 路由注册正确 |

---

## 🎯 快速诊断脚本

创建 `diagnostic.sh`：

```bash
#!/bin/bash

echo "========================================="
echo "  长三角非遗地图 - 诊断脚本"
echo "========================================="
echo ""

# 检查 Node.js
echo "[1] 检查 Node.js..."
node --version && npm --version
echo ""

# 检查后端依赖
echo "[2] 检查后端依赖..."
ls hesitage/backend/node_modules/@types/pg &>/dev/null && echo "✓ pg 库已安装" || echo "✗ 需要安装依赖"
echo ""

# 检查前端依赖
echo "[3] 检查前端依赖..."
ls hesitage/front/node_modules/echarts &>/dev/null && echo "✓ echarts 已安装" || echo "✗ 需要安装依赖"
echo ""

# 检查环境变量
echo "[4] 检查环境变量..."
if [ -f hesitage/backend/.env ]; then
  echo "✓ .env 文件存在"
  grep "DB_" hesitage/backend/.env
else
  echo "✗ .env 文件不存在"
fi
echo ""

# 检查数据库连接
echo "[5] 检查数据库连接..."
if command -v psql &> /dev/null; then
  echo "✓ PostgreSQL 客户端已安装"
else
  echo "✗ 未安装 PostgreSQL 客户端"
fi
echo ""

echo "========================================="
```

---

## 🚨 常见错误和解决方案

### 错误 1: `Cannot find module 'pg'`

**解决：**
```bash
cd hesitage/backend
npm install pg
```

### 错误 2: `Failed to connect to database`

**解决：**
1. 确保 PostgreSQL 服务正在运行
2. 检查 `.env` 中的连接信息
3. 确保数据库存在

### 错误 3: `Table "长三角-全部_地点唯一_地级市" does not exist`

**解决：**
1. 检查表名是否完全正确（包括引号和大小写）
2. 确认表在正确的 schema 中（默认 `shapefile`）
3. 导入正确的数据文件

### 错误 4: `Map container is not defined`

**解决：**
1. 确保 `ref="mapContainer"` 正确绑定
2. 检查容器是否正确渲染
3. 确保 ECharts 正确导入

---

## 📞 下一步行动

1. **立即检查：**
   ```bash
   node hesitage/backend/scripts/testAPIs.js
   ```

2. **如果 API 测试失败：**
   - 检查数据库连接
   - 验证 .env 文件配置
   - 查看后端日志

3. **如果前端页面不显示：**
   - 清除浏览器缓存
   - 检查浏览器开发者工具 Console
   - 确认所有修复已应用

4. **最终验证：**
   - 访问 `/map` 路由
   - 应看到完整的地图容器
   - 悬停城市显示信息面板

---

**诊断完成日期：** 2024年12月29日  
**诊断工具版本：** v1.0
