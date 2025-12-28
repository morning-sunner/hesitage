# 非遗数据重新分类说明文档

## 📋 分类对比表

### 原有分类 → 新分类映射关系

| 序号 | 原分类 | 新分类 | 是否需要更新 | 说明 |
|------|--------|--------|-------------|------|
| 1 | 民间文学 | 民间文学 | ❌ 否 | 保持不变 |
| 2 | 曲艺 | 说唱艺曲 | ✅ 是 | 重命名 |
| 3 | 传统体育、游艺与杂技 | 体育游艺 | ✅ 是 | 简化名称 |
| 4 | 传统技艺 | 传统技艺 | ❌ 否 | 保持不变 |
| 5 | 传统美术 | 工艺美术 | ✅ 是 | 重命名 |
| 6 | 传统医药 | 传统医药 | ❌ 否 | 保持不变 |
| 7 | 民俗 | 民俗 | ❌ 否 | 保持不变(部分需拆分) |
| 8 | 传统戏剧 | 传统戏剧 | ❌ 否 | 保持不变 |
| 9 | 传统舞蹈 + 传统音乐 | 音乐舞蹈 | ✅ 是 | 合并为一类 |
| 10 | 民俗(节日类) | 风俗节庆 | ✅ 是 | 从民俗中拆分 |

## 📊 当前数据库分类统计

根据 `mydb_converted.sql` 文件分析，当前数据库包含以下分类：

```
1. 民间文学
2. 曲艺
3. 传统体育、游艺与杂技
4. 传统技艺
5. 传统美术
6. 传统医药
7. 民俗
8. 传统戏剧
9. 传统舞蹈
10. 传统音乐
```

共10个分类，总计约3610条记录。

## 🎯 新分类体系(10大类)

根据您提供的分类图片，新的10大分类为：

```
1. 民间文学
2. 说唱艺曲
3. 体育游艺
4. 传统技艺
5. 工艺美术
6. 传统医药
7. 民俗
8. 传统戏剧
9. 音乐舞蹈
10. 风俗节庆
```

## 🚀 使用步骤

### 方法一:使用UPDATE脚本(推荐)

1. **备份原数据库**
   ```bash
   pg_dump -U postgres -d your_database > backup_$(date +%Y%m%d).sql
   ```

2. **执行更新脚本**
   ```bash
   psql -U postgres -d your_database -f UPDATE_CATEGORIES.sql
   ```

3. **验证更新结果**
   脚本会自动显示更新后的分类统计

### 方法二:重新生成完整SQL文件

如果需要生成新的完整SQL文件，可以：

1. 运行 `python generate_updated_sql.py`(需要创建Python脚本)
2. 脚本会读取原SQL文件并替换所有分类
3. 生成新的 `mydb_updated.sql` 文件

## ⚠️ 重要注意事项

### 1. 风俗节庆的划分

"风俗节庆"是从"民俗"中拆分出来的,拆分依据:
- 包含"节"、"庙会"、"灯会"、"年"、"祭"等关键词的项目
- 您可能需要根据实际情况手动调整WHERE条件

### 2. 音乐舞蹈的合并

将"传统舞蹈"和"传统音乐"合并为"音乐舞蹈",这会：
- 减少一个分类
- 便于统一管理表演艺术类项目

### 3. 英文分类名称

脚本中已为每个新分类提供了英文名称(CategoryEN),您可以根据需要调整。

## 🔍 验证SQL

更新后可以运行以下SQL验证:

```sql
-- 查看所有分类及数量
SELECT 
    "CategoryCN" as "分类名称",
    "CategoryEN" as "英文名称",
    COUNT(*) as "项目数量",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM shapefile."国家级非遗点位GCS_WGS_1984"), 2) || '%' as "占比"
FROM shapefile."国家级非遗点位GCS_WGS_1984"
GROUP BY "CategoryCN", "CategoryEN"
ORDER BY COUNT(*) DESC;

-- 检查是否还有旧分类名称
SELECT DISTINCT "CategoryCN"
FROM shapefile."国家级非遗点位GCS_WGS_1984"
WHERE "CategoryCN" IN ('曲艺', '传统体育、游艺与杂技', '传统美术', '传统舞蹈', '传统音乐');
-- 如果返回空结果,说明更新成功
```

## 📝 如果需要回滚

如果更新后发现问题,可以:

1. 在事务未提交前运行 `ROLLBACK;`
2. 如已提交,从备份恢复: `psql -U postgres -d your_database < backup_YYYYMMDD.sql`

## 🔧 进一步定制

如需更精确的分类调整,建议:

1. 导出当前数据到Excel进行人工审核
2. 标注需要调整的记录
3. 生成针对性的UPDATE语句

```sql
-- 导出CSV用于审核
COPY (
    SELECT "Proj_num", "Name_CN", "CategoryCN", "CategoryEN"
    FROM shapefile."国家级非遗点位GCS_WGS_1984"
    ORDER BY "CategoryCN", "Proj_num"
) TO 'E:\study\大学\大三上\地理信息服务\长三角非遗\heritage\hesitage\categories_review.csv' 
WITH CSV HEADER ENCODING 'UTF8';
```

## 📞 技术支持

如有问题,请检查:
- PostgreSQL版本兼容性
- PostGIS扩展是否正常
- 数据库连接权限
- 字符编码设置(UTF8)

---

**最后更新:** 2025-12-27  
**数据版本:** mydb_converted.sql  
**总记录数:** 约3610条
