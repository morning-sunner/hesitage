# 🔧 修复分支快速参考

## 分支信息

```
分支名: fix/api-integration
基于: main
创建时间: 2025-01-10
状态: 活跃开发中
```

## 修复进度

```
Phase 1 (后端 API): 75% ████████░
Phase 2 (前端集成): 0%  ░░░░░░░░░░
Phase 3 (集成测试): 0%  ░░░░░░░░░░
整体进度: 25%       ██░░░░░░░░
```

## 快速命令

### 切换到修复分支
```bash
git checkout fix/api-integration
```

### 查看分支状态
```bash
git status
git log --oneline -5
```

### 查看与 main 的差异
```bash
git diff main
```

## 立即需要做的事

### 1️⃣ 创建数据库视图 (5分钟)
```bash
psql -h localhost -p 5432 -U postgres -d hositage -f hesitage/DATABASE_VIEW_SETUP.sql
```

验证成功:
```bash
psql -h localhost -p 5432 -U postgres -d hositage -c "SELECT COUNT(*) FROM shapefile.heritage_items;"
# 应返回: 3610
```

### 2️⃣ 启动后端服务 (1分钟)
```bash
cd hesitage/backend
npm start
```

### 3️⃣ 测试 API (2分钟)
```bash
# 在新的终端中
curl http://localhost:3000/api/heritage
curl http://localhost:3000/api/statistics
```

### 4️⃣ 后续工作 (Phase 2 & 3)
- 修改 `hesitage/front/src/stores/heritageStore.ts`
- 更新组件连接到真实 API
- 进行集成测试

## 关键文件

| 文件 | 内容 |
|------|------|
| `hesitage/backend/app.js` | 已注册的 API 路由 |
| `hesitage/DATABASE_VIEW_SETUP.sql` | 数据库视图 SQL |
| `DATABASE_VIEW_SETUP_GUIDE.md` | 设置指南 |
| `FIX_API_INTEGRATION_PLAN.md` | 详细计划 |
| `FIX_PROGRESS.md` | 进度跟踪 |
| `BRANCH_INITIALIZATION.md` | 分支初始化说明 |

## 已注册的 API 端点

```
POST   /api/heritage              - 获取所有项目
GET    /api/heritage/:id          - 获取单条项目  
POST   /api/heritage/search       - 搜索项目

POST   /api/spatial/point-query   - 点查询
POST   /api/spatial/buffer-query  - 缓冲区查询
POST   /api/spatial/within-region - 区域查询

GET    /api/statistics            - 总体统计
GET    /api/statistics/by-category - 按分类统计
GET    /api/statistics/by-region  - 按地区统计
```

## 数据库连接

```
主机: localhost
端口: 5432
数据库: hositage
用户: postgres
密码: 0000
```

## 常见问题

**Q: 如何查看修复计划的详细步骤?**
A: 查看 `FIX_API_INTEGRATION_PLAN.md`

**Q: SQL 脚本执行失败怎么办?**
A: 参考 `DATABASE_VIEW_SETUP_GUIDE.md` 的故障排除部分

**Q: 如何监控修复进度?**
A: 查看 `FIX_PROGRESS.md` (实时更新)

**Q: 修复完成后怎样合并到 main?**
A: `git checkout main && git merge fix/api-integration`

## 预计完成时间

- Phase 1: 15 分钟 (进行中)
- Phase 2: 45 分钟
- Phase 3: 35 分钟
- **总计: 95 分钟**

## 成功标志

- ✅ SQL 脚本成功创建视图
- ✅ 后端 API 可以调用且返回数据
- ✅ 前端从 API 获取数据而不是 hardcoded
- ✅ 构建成功，无错误
- ✅ 集成测试通过

---

**当前状态**: Phase 1 进行中 (75% 完成)  
**下一步**: 执行 SQL 脚本

