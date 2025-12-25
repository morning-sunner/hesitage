# 📊 数据库视图设置指南

## 目的

为后端 API 创建统一的数据库视图 (`shapefile.heritage_items`)，将实际表名 (`"国家级非遗点位GCS_WGS_1984"`) 映射到后端期望的字段名。

---

## 前提条件

- PostgreSQL 11.2+ 已安装
- 数据库 `hositage` 已创建
- 表 `shapefile."国家级非遗点位GCS_WGS_1984"` 已存在 (3,610 条记录)
- PostGIS 扩展已启用
- 数据库用户：postgres，密码：0000

---

## 执行步骤

### 方法 1：使用 psql 命令行（推荐）

#### 步骤 1：连接到数据库
```bash
psql -h localhost -p 5432 -U postgres -d hositage
```

提示输入密码时，输入：`0000`

#### 步骤 2：执行 SQL 脚本
```sql
-- 复制 DATABASE_VIEW_SETUP.sql 中的全部 SQL 语句
-- 粘贴到 psql 命令行中执行

-- 或者使用 \i 命令直接加载文件:
\i 'hesitage/DATABASE_VIEW_SETUP.sql'
```

#### 步骤 3：验证视图创建成功
```sql
-- 检查视图是否存在
SELECT COUNT(*) FROM shapefile.heritage_items;
-- 应返回: 3610

-- 检查前 5 条记录
SELECT id, name, category, location, province FROM shapefile.heritage_items LIMIT 5;

-- 验证几何字段
SELECT id, name, ST_X(geometry) as longitude, ST_Y(geometry) as latitude 
FROM shapefile.heritage_items LIMIT 5;
```

### 方法 2：使用 pgAdmin 图形界面

#### 步骤 1：打开 pgAdmin
- 启动 pgAdmin（通常在 http://localhost:5050）
- 使用你的 pgAdmin 凭证登录

#### 步骤 2：导航到数据库
1. 展开 "Servers" → "PostgreSQL 11"
2. 展开 "Databases" → "hositage"
3. 展开 "Schemas" → "shapefile"

#### 步骤 3：创建视图
1. 右键点击 "Views"
2. 选择 "Create" → "View"
3. 在 SQL 编辑器中粘贴 `DATABASE_VIEW_SETUP.sql` 中的 CREATE VIEW 语句
4. 点击 "Save"

#### 步骤 4：验证
1. 右键点击新创建的 `heritage_items` 视图
2. 选择 "View/Edit Data" → "All Rows"
3. 确认能看到 3,610 条记录

### 方法 3：从命令行直接执行 SQL 文件

```bash
# Windows PowerShell
psql -h localhost -p 5432 -U postgres -d hositage -f "hesitage/DATABASE_VIEW_SETUP.sql"

# Linux/Mac Terminal
psql -h localhost -p 5432 -U postgres -d hositage -f hesitage/DATABASE_VIEW_SETUP.sql
```

---

## 视图说明

### 视图名称
- **完整名称**: `shapefile.heritage_items`
- **Schema**: shapefile
- **基于表**: `shapefile."国家级非遗点位GCS_WGS_1984"`

### 字段映射

| 原表字段 | 视图字段 | 说明 | 数据类型 |
|---------|---------|------|---------|
| OBJECTID | id | 唯一 ID | bigint |
| Name_CN | name | 名称 (中文) | text |
| Name_EN | name_en | 名称 (英文) | text |
| CategoryCN | category | 类别 (中文) | text |
| CategoryEN | category_en | 类别 (英文) | text |
| Place_CN | location | 地点 (中文) | text |
| Place_EN | location_en | 地点 (英文) | text |
| X | longitude | 经度 | double |
| Y | latitude | 纬度 | double |
| ProvinceCN | province | 省份 (中文) | text |
| ProvinceEN | province_en | 省份 (英文) | text |
| 一级分类代码 | category_level_1 | 一级分类代码 | text |
| 一级分类名称CN | category_level_1_name | 一级分类名称 | text |
| 二级分类代码 | category_level_2 | 二级分类代码 | text |
| 二级分类名称CN | category_level_2_name | 二级分类名称 | text |
| 三级分类代码 | category_level_3 | 三级分类代码 | text |
| 三级分类名称CN | category_level_3_name | 三级分类名称 | text |
| 四级分类代码 | category_level_4 | 四级分类代码 | text |
| 四级分类名称CN | category_level_4_name | 四级分类名称 | text |
| geometry | geometry | PostGIS 几何列 | geometry |

### 好处

1. **向后兼容性**: 后端代码期望的字段名直接通过视图获得
2. **易于维护**: 如果原表结构变化，只需更新视图
3. **简化查询**: 后端代码无需复杂的字段映射逻辑
4. **性能**: PostGIS 索引仍然有效

---

## 后端代码使用示例

### 查询全部
```javascript
const query = 'SELECT * FROM shapefile.heritage_items';
const result = await pool.query(query);
```

### 查询单条
```javascript
const query = 'SELECT * FROM shapefile.heritage_items WHERE id = $1';
const result = await pool.query(query, [id]);
```

### 空间查询
```javascript
const query = `
  SELECT * FROM shapefile.heritage_items 
  WHERE ST_DWithin(geometry, ST_SetSRID(ST_Point($1, $2), 4326), $3)
`;
const result = await pool.query(query, [longitude, latitude, radius]);
```

### 按省份查询
```javascript
const query = 'SELECT * FROM shapefile.heritage_items WHERE province = $1';
const result = await pool.query(query, [province]);
```

---

## 验证清单

- [ ] 视图 `shapefile.heritage_items` 已创建
- [ ] `SELECT COUNT(*) FROM shapefile.heritage_items;` 返回 3,610
- [ ] 可以查询单条记录：`SELECT * FROM shapefile.heritage_items LIMIT 1;`
- [ ] 几何列完整：`SELECT ST_X(geometry), ST_Y(geometry) FROM shapefile.heritage_items LIMIT 1;`
- [ ] 空间查询可用：`SELECT COUNT(*) FROM shapefile.heritage_items WHERE ST_DWithin(geometry, ...);`

---

## 故障排除

### 错误：`"国家级非遗点位GCS_WGS_1984" does not exist`

**原因**: 原表不存在  
**解决**: 确认表名拼写正确，表已导入到数据库中

### 错误：`column "Name_CN" does not exist`

**原因**: 字段名称不匹配  
**解决**: 检查原表的实际字段名，可能需要调整 SQL 语句中的字段名

### 错误：`PostGIS extension not found`

**原因**: PostGIS 扩展未启用  
**解决**: 运行 `CREATE EXTENSION postgis;` 启用 PostGIS

### 视图创建成功但查询返回 0 行

**原因**: 数据未导入或视图字段映射有误  
**解决**: 检查原表数据，确认字段名正确

---

## 回滚（如需删除视图）

```sql
DROP VIEW IF EXISTS shapefile.heritage_items;
```

---

## 参考文档

- 原表分析：见 `PROJECT_ANALYSIS.md`
- 后端 API 设计：见 `INTEGRATION_GUIDE.md`
- 数据库连接配置：见 `hesitage/backend/config/database.js`

---

**创建时间**: 2025-01-10  
**数据库**: hositage (PostgreSQL 11.2)  
**状态**: 待执行

