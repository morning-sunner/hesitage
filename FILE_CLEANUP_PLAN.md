# 文件清理方案

## 📊 项目核心功能分析

### 后端核心功能 (backend/)
1. **API 服务** - Express.js 框架
2. **数据库连接** - PostgreSQL
3. **用户认证** - auth 模块
4. **非遗项目管理** - heritage 路由
5. **地理空间查询** - spatial 路由
6. **统计分析** - statistics 路由
7. **AI 对话** - aiService
8. **图片上传管理** - fileManager

### 前端核心功能 (front/)
1. **页面组件** - 11 个主要视图
2. **状态管理** - Pinia store
3. **路由管理** - Vue Router
4. **API 通信** - axios 封装
5. **地图展示** - Mapbox 集成

---

## ✅ 必需文件清单

### 后端必需文件
```
backend/
├── app.js                      # ✅ 主应用入口
├── package.json                # ✅ 依赖管理
├── .env                        # ✅ 环境配置
├── bin/www                     # ✅ 启动脚本
├── config/database.js          # ✅ 数据库配置
├── routes/
│   ├── api.js                 # ✅ API 总路由
│   ├── heritage.js            # ✅ 非遗项目路由
│   ├── spatial.js             # ✅ 地理空间查询
│   ├── statistics.js          # ✅ 统计分析
│   ├── auth.js                # ✅ 用户认证
│   └── users.js               # ✅ 用户管理
├── services/
│   ├── aiService.js           # ✅ AI 服务
│   └── fileManager.js         # ✅ 文件管理
├── utils/
│   ├── auth.js                # ✅ 认证工具
│   ├── emailService.js        # ✅ 邮件服务
│   └── initDb.js              # ✅ 数据库初始化
└── views/
    ├── index.ejs              # ✅ 默认页面
    └── error.ejs              # ✅ 错误页面
```

### 前端必需文件
```
front/
├── package.json               # ✅ 依赖管理
├── vite.config.ts             # ✅ Vite 配置
├── tsconfig.json              # ✅ TypeScript 配置
├── .env.local                 # ✅ 环境配置
├── index.html                 # ✅ HTML 入口
├── src/
│   ├── main.ts               # ✅ 入口文件
│   ├── App.vue               # ✅ 根组件
│   ├── router/index.ts       # ✅ 路由配置
│   ├── stores/               # ✅ 状态管理
│   ├── views/                # ✅ 页面组件
│   ├── components/           # ✅ 公共组件
│   ├── utils/                # ✅ 工具函数
│   └── assets/               # ✅ 样式资源
├── public/                    # ✅ 静态资源
└── .gitignore               # ✅ Git 忽略配置
```

---

## ❌ 可删除的文件

### 后端调试脚本 (14 个文件)
这些都是开发过程中用于调试和测试的临时脚本，不是功能文件：

```
backend/
├── check-table-schema.js           ❌ 删除
├── check-table-structure.js        ❌ 删除
├── check-users.js                  ❌ 删除
├── check-zcy-rank.js               ❌ 删除
├── compare-files-and-db.js         ❌ 删除
├── create-image-url-column.js      ❌ 删除
├── debug-zcy.js                    ❌ 删除
├── find-table.js                   ❌ 删除
├── fix-test-data.js                ❌ 删除
├── import-heritage-images.js       ❌ 删除
├── import-images.js                ❌ 删除
├── refresh-views.js                ❌ 删除
├── sync-images-from-http.js        ❌ 删除
├── test-ai.js                      ❌ 删除
├── test-db-tables.js               ❌ 删除
├── test-deepseek-api.js            ❌ 删除
├── test-leaderboard-query.js       ❌ 删除
├── test-supabase-connection.js     ❌ 删除
└── verify-image-url-import.js      ❌ 删除
```

**总计**: 19 个临时调试脚本可删除

### 后端文档 (可选保留,用于参考)
```
backend/
├── AI_API_INTEGRATION_GUIDE.md      ⚠️ 可删除（参考文档）
├── AI_QUICK_START.md               ⚠️ 可删除（参考文档）
├── UPLOAD_IMAGES_GUIDE.md          ⚠️ 可删除（参考文档）
└── .env.example                    ⚠️ 可删除（已有 .env）
```

### 根目录文档 (可删除)
```
hesitage/
├── CATEGORY_UPDATE_GUIDE.md        ⚠️ 可删除（参考文档）
├── DATABASE_QUIZ_LEADERBOARD.sql   ⚠️ 可删除（已有 DATABASE_VIEW_SETUP.sql）
├── DATABASE_VIEW_SETUP.sql         ✅ 保留（数据库初始化脚本）
├── UPDATE_CATEGORIES.sql           ⚠️ 可删除（更新脚本）
└── mydb_converted.sql              ✅ 保留（初始数据导入）
```

---

## 📈 清理效果

**删除前**: 19 个临时脚本 + 多个参考文档  
**删除后**: 仅保留核心功能文件，结构清晰

**优点**:
- ✅ 项目结构清晰，易于维护
- ✅ 减少代码库混乱
- ✅ 新开发者快速理解项目
- ✅ CI/CD 构建更快

---

## 🗑️ 执行清理

运行清理脚本：

```bash
# Windows
cd e:\study\大学\大三上\地理信息服务\长三角非遗\heritage

# 删除后端临时脚本
del hesitage\backend\check-table-*.js
del hesitage\backend\test-*.js
del hesitage\backend\*-images.js
del hesitage\backend\compare-files-and-db.js
del hesitage\backend\create-image-url-column.js
del hesitage\backend\debug-*.js
del hesitage\backend\find-table.js
del hesitage\backend\fix-test-data.js
del hesitage\backend\refresh-views.js
del hesitage\backend\sync-images-from-http.js
del hesitage\backend\verify-image-url-import.js

# 删除不必要的文档（可选）
del hesitage\backend\*_GUIDE.md
del hesitage\backend\.env.example
del hesitage\CATEGORY_UPDATE_GUIDE.md
del hesitage\UPDATE_CATEGORIES.sql
del hesitage\DATABASE_QUIZ_LEADERBOARD.sql
```

---

## 📋 最终项目结构（清理后）

```
heritage/
├── hesitage/
│   ├── backend/
│   │   ├── app.js
│   │   ├── package.json
│   │   ├── .env
│   │   ├── bin/www
│   │   ├── config/database.js
│   │   ├── routes/
│   │   │   ├── api.js
│   │   │   ├── heritage.js
│   │   │   ├── spatial.js
│   │   │   ├── statistics.js
│   │   │   ├── auth.js
│   │   │   └── users.js
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   └── fileManager.js
│   │   ├── utils/
│   │   │   ├── auth.js
│   │   │   ├── emailService.js
│   │   │   └── initDb.js
│   │   └── views/
│   │       ├── index.ejs
│   │       └── error.ejs
│   │
│   ├── front/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── .env.local
│   │   ├── index.html
│   │   ├── src/
│   │   ├── public/
│   │   └── [其他配置]
│   │
│   ├── DATABASE_VIEW_SETUP.sql
│   └── mydb_converted.sql
│
├── 非遗题库.csv
├── 中华人民共和国.geojson
├── README.md
├── LEADERBOARD_GUIDE.md
├── start.bat
├── start.sh
└── .gitignore
```

---

## ⚠️ 注意事项

1. **备份**: 删除前建议备份项目
2. **Git**: 使用 Git 管理，可随时恢复
3. **.env**: 保留 `.env` 不要删除
4. **数据库脚本**: 保留 `DATABASE_VIEW_SETUP.sql` 和 `mydb_converted.sql`
5. **文档**: 重要文档可保留在 `README.md` 中

