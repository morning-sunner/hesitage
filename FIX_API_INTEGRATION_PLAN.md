# 🔧 API 集成修复计划

**分支**: `fix/api-integration`  
**目标**: 连接前后端，实现真实数据流  
**优先级**: 🔴 关键

---

## 📋 修复任务清单

### 第 1 阶段：后端 API 注册（关键）

#### Task 1.1：在 app.js 中注册路由 ⭐ 优先
- [ ] 打开 `hesitage/backend/app.js`
- [ ] 添加三个路由导入
- [ ] 注册到 app 实例
- [ ] 预期改动：3 行 import + 3 行 use

**代码示例**:
```javascript
// 在现有 const indexRouter = ... 之后添加
const heritageRouter = require('./routes/heritage');
const spatialRouter = require('./routes/spatial');
const statisticsRouter = require('./routes/statistics');

// 在现有 app.use('/api/', ...) 之后添加
app.use('/api/heritage', heritageRouter);
app.use('/api/spatial', spatialRouter);
app.use('/api/statistics', statisticsRouter);
```

#### Task 1.2：创建数据库视图处理表名映射
- [ ] 连接 PostgreSQL 数据库
- [ ] 创建视图 `shapefile.heritage_items`
- [ ] 映射实际表 `国家级非遗点位GCS_WGS_1984` 的字段
- [ ] 测试视图是否可访问

**SQL 示例**:
```sql
CREATE OR REPLACE VIEW shapefile.heritage_items AS
SELECT 
    OBJECTID as id,
    Name_CN as name_cn,
    Name_EN as name_en,
    CategoryCN as category_cn,
    CategoryEN as category_en,
    Place_CN as location_cn,
    Place_EN as location_en,
    X as longitude,
    Y as latitude,
    ProvinceCN as province_cn,
    ProvinceEN as province_en,
    geometry
FROM shapefile."国家级非遗点位GCS_WGS_1984";
```

#### Task 1.3：测试后端 API 端点
- [ ] 启动后端服务 (`npm start`)
- [ ] 测试 GET /api/heritage
- [ ] 测试 GET /api/heritage/:id
- [ ] 测试 POST /api/spatial/point-query
- [ ] 测试 GET /api/statistics

---

### 第 2 阶段：前端 API 集成（高优先级）

#### Task 2.1：修改 heritageStore.ts 连接到 API
- [ ] 打开 `hesitage/front/src/stores/heritageStore.ts`
- [ ] 删除 hardcoded 的省份数据
- [ ] 添加 API 调用替代
- [ ] 使用 `statisticsApi.byRegion()` 获取实际数据
- [ ] 更新 state 为响应式数据

**代码示例**:
```typescript
import { statisticsApi } from '@/utils/api'

export const useHeritageStore = defineStore('heritage', () => {
  const regions = ref<Record<string, number>>({})
  
  const fetchRegionStats = async () => {
    try {
      const data = await statisticsApi.byRegion()
      regions.value = data
    } catch (error) {
      console.error('Failed to fetch region stats:', error)
    }
  }
  
  onMounted(fetchRegionStats)
  
  return { regions, fetchRegionStats }
})
```

#### Task 2.2：更新使用 hardcoded 数据的组件
- [ ] 检查 HeritageView 是否使用动态数据
- [ ] 检查 DetailView 是否使用 API 获取单条数据
- [ ] 检查 MapboxMapView 是否使用 API 加载图层数据
- [ ] 确保所有位置都使用真实 API 数据而不是 hardcoded

#### Task 2.3：前端构建和测试
- [ ] 运行 `npm run build` 验证编译
- [ ] 测试页面加载是否有 API 错误
- [ ] 验证数据是否正确显示

---

### 第 3 阶段：端到端测试

#### Task 3.1：集成测试
- [ ] 后端服务正常运行
- [ ] 前端能正确调用 API
- [ ] 数据流完整（DB → Backend → Frontend）
- [ ] 无控制台错误
- [ ] 页面性能正常

#### Task 3.2：边界情况测试
- [ ] 测试网络错误处理
- [ ] 测试 API 超时
- [ ] 测试无数据的情况
- [ ] 测试大数据量的情况

---

## 🎯 修复优先级

| 优先级 | 任务 | 耗时 |
|------|------|------|
| 🔴 关键 | Task 1.1 - 注册 API 路由 | 5 分钟 |
| 🔴 关键 | Task 1.2 - 创建数据库视图 | 10 分钟 |
| 🔴 关键 | Task 1.3 - 测试后端 API | 10 分钟 |
| 🟡 高 | Task 2.1 - 更新 Store | 15 分钟 |
| 🟡 高 | Task 2.2 - 更新组件 | 20 分钟 |
| 🟡 高 | Task 2.3 - 前端测试 | 10 分钟 |
| 🟢 中 | Task 3.1 - 集成测试 | 20 分钟 |
| 🟢 中 | Task 3.2 - 边界测试 | 15 分钟 |

**总计**: ~105 分钟 (1.75 小时)

---

## 📝 预期成果

### 修复后的功能
- ✅ 后端 API 完全可用
- ✅ 前端从真实数据库获取数据
- ✅ 数据流完整（无 hardcoded 数据）
- ✅ 完整的 3 层架构：Vue 3 → Express → PostgreSQL
- ✅ 空间查询功能可用
- ✅ 统计功能可用

### 文件变更
```
修改文件:
├── hesitage/backend/app.js (添加 6 行)
├── hesitage/front/src/stores/heritageStore.ts (更新 30 行)
├── hesitage/front/src/views/HeritageView.vue (可能需要更新)
└── hesitage/front/src/views/DetailView.vue (可能需要更新)

新建文件:
└── 数据库视图创建脚本 (SQL 文件或说明文档)
```

---

## 🔄 执行步骤

1. **检查分支** ✅ 已创建 `fix/api-integration`
2. **开始第 1 阶段** → 注册后端路由
3. **创建数据库视图** → 处理表名映射
4. **测试后端** → 验证 API 可用
5. **更新前端** → 连接到真实 API
6. **集成测试** → 验证完整数据流
7. **提交 PR** → 准备合并到 main

---

## ⚠️ 注意事项

- 确保数据库连接配置正确（localhost:5432）
- 数据库名称：hositage
- 用户：postgres，密码：0000
- 表名：`shapefile."国家级非遗点位GCS_WGS_1984"`
- 后端 API 基础 URL：http://localhost:3000/api

---

**分支创建时间**: 2025-01-10  
**计划开始**: 立即  
**预计完成**: 1.75 小时内

