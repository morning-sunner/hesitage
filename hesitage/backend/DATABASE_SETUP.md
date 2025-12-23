# WebGIS 后端配置指南

## 📊 数据库架构

### PostgreSQL + PostGIS 设置

#### 1. 安装 PostgreSQL 和 PostGIS

**Windows:**
```powershell
# 使用 PostgreSQL 官方安装程序
# 下载链接: https://www.postgresql.org/download/windows/
# 安装时记住 postgres 用户的密码
```

**macOS:**
```bash
brew install postgresql
brew install postgis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib postgis
```

#### 2. 创建数据库

```bash
# 登录 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE heritage_db;

# 连接到数据库
\c heritage_db

# 创建 PostGIS 扩展
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;

# 验证安装
SELECT PostGIS_Version();
```

### 数据库表结构

#### 表 1: 非遗项目 (heritage_items)

```sql
CREATE TABLE heritage_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,  -- 传统戏剧, 工艺美术, 传统技艺, 传统建筑等
  description TEXT,
  province VARCHAR(50) NOT NULL,   -- 江苏, 浙江, 上海, 安徽
  city VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  geom GEOMETRY(Point, 4326),      -- PostGIS 空间字段
  established_year INT,
  inheritors_count INT DEFAULT 0,
  books_count INT DEFAULT 0,
  videos_count INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建空间索引
CREATE INDEX idx_heritage_geom ON heritage_items USING GIST (geom);
CREATE INDEX idx_heritage_category ON heritage_items(category);
CREATE INDEX idx_heritage_province ON heritage_items(province);
CREATE INDEX idx_heritage_city ON heritage_items(city);
```

#### 表 2: 传承人 (inheritors)

```sql
CREATE TABLE inheritors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  heritage_id INT NOT NULL REFERENCES heritage_items(id),
  age INT,
  gender VARCHAR(10),
  biography TEXT,
  photo_url VARCHAR(500),
  level VARCHAR(50),  -- 国家级, 省级, 市级, 县级
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (heritage_id) REFERENCES heritage_items(id)
);

CREATE INDEX idx_inheritors_heritage ON inheritors(heritage_id);
```

#### 表 3: 相关文献 (heritage_books)

```sql
CREATE TABLE heritage_books (
  id SERIAL PRIMARY KEY,
  heritage_id INT NOT NULL REFERENCES heritage_items(id),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  isbn VARCHAR(20),
  published_year INT,
  publisher VARCHAR(255),
  description TEXT,
  cover_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (heritage_id) REFERENCES heritage_items(id)
);

CREATE INDEX idx_books_heritage ON heritage_books(heritage_id);
```

#### 表 4: 相关视频 (heritage_videos)

```sql
CREATE TABLE heritage_videos (
  id SERIAL PRIMARY KEY,
  heritage_id INT NOT NULL REFERENCES heritage_items(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  duration INT,  -- 秒
  publish_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (heritage_id) REFERENCES heritage_items(id)
);

CREATE INDEX idx_videos_heritage ON heritage_videos(heritage_id);
```

#### 表 5: 行政区划 (admin_regions)

```sql
CREATE TABLE admin_regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL,  -- province, city, district
  parent_id INT REFERENCES admin_regions(id),
  geom GEOMETRY(MultiPolygon, 4326),
  properties JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_regions_geom ON admin_regions USING GIST (geom);
CREATE INDEX idx_regions_level ON admin_regions(level);
```

## 🔌 API 端点设计

### Node.js Express 示例

#### 1. 基础配置 (app.js)

```javascript
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// PostgreSQL 连接池
const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'heritage_db'
});

// 路由
app.use('/api/heritage', require('./routes/heritage'));
app.use('/api/statistics', require('./routes/statistics'));
app.use('/api/spatial', require('./routes/spatial'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, pool };
```

#### 2. 非遗项目接口 (routes/heritage.js)

```javascript
const express = require('express');
const { pool } = require('../app');
const router = express.Router();

// 获取所有非遗项目 (GeoJSON 格式)
router.get('/geojson', async (req, res) => {
  try {
    const { category, province } = req.query;
    
    let query = `
      SELECT 
        id,
        name,
        category,
        province,
        city,
        ST_AsGeoJSON(geom) as geometry,
        description,
        inheritors_count,
        books_count,
        videos_count
      FROM heritage_items
      WHERE status = 'active'
    `;
    
    const params = [];
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    if (province) {
      params.push(province);
      query += ` AND province = $${params.length}`;
    }
    
    query += ` ORDER BY name`;
    
    const result = await pool.query(query, params);
    
    // 转换为 GeoJSON FeatureCollection
    const features = result.rows.map(row => ({
      type: 'Feature',
      geometry: JSON.parse(row.geometry),
      properties: {
        id: row.id,
        name: row.name,
        category: row.category,
        province: row.province,
        city: row.city,
        description: row.description,
        inheritors_count: row.inheritors_count,
        books_count: row.books_count,
        videos_count: row.videos_count
      }
    }));
    
    res.json({
      type: 'FeatureCollection',
      features: features
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 获取单个项目详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const itemQuery = `
      SELECT * FROM heritage_items WHERE id = $1
    `;
    const itemResult = await pool.query(itemQuery, [id]);
    
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const item = itemResult.rows[0];
    
    // 获取传承人
    const inheritorsQuery = `
      SELECT * FROM inheritors WHERE heritage_id = $1 ORDER BY level
    `;
    const inheritorsResult = await pool.query(inheritorsQuery, [id]);
    
    // 获取书籍
    const booksQuery = `
      SELECT * FROM heritage_books WHERE heritage_id = $1 ORDER BY published_year DESC
    `;
    const booksResult = await pool.query(booksQuery, [id]);
    
    // 获取视频
    const videosQuery = `
      SELECT * FROM heritage_videos WHERE heritage_id = $1 ORDER BY publish_date DESC
    `;
    const videosResult = await pool.query(videosQuery, [id]);
    
    res.json({
      item: item,
      inheritors: inheritorsResult.rows,
      books: booksResult.rows,
      videos: videosResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### 3. 空间查询接口 (routes/spatial.js)

```javascript
const express = require('express');
const { pool } = require('../app');
const router = express.Router();

// 点查询 - 返回指定距离内的项目
router.post('/point-query', async (req, res) => {
  try {
    const { lng, lat, radius = 10000 } = req.body;  // radius 单位: 米
    
    const query = `
      SELECT 
        id,
        name,
        category,
        city,
        ST_Distance(geom, ST_SetSRID(ST_Point($1, $2), 4326)) as distance
      FROM heritage_items
      WHERE status = 'active'
        AND ST_DWithin(
          geom,
          ST_SetSRID(ST_Point($1, $2), 4326),
          $3 / 111000.0
        )
      ORDER BY distance
      LIMIT 20
    `;
    
    const result = await pool.query(query, [lng, lat, radius]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 矩形查询
router.post('/bbox-query', async (req, res) => {
  try {
    const { minLng, minLat, maxLng, maxLat } = req.body;
    
    const query = `
      SELECT 
        id,
        name,
        category,
        province,
        city,
        ST_AsGeoJSON(geom) as geometry
      FROM heritage_items
      WHERE status = 'active'
        AND geom && ST_SetSRID(
          ST_MakeEnvelope($1, $2, $3, $4),
          4326
        )
      ORDER BY name
    `;
    
    const result = await pool.query(query, [minLng, minLat, maxLng, maxLat]);
    
    const features = result.rows.map(row => ({
      type: 'Feature',
      geometry: JSON.parse(row.geometry),
      properties: {
        id: row.id,
        name: row.name,
        category: row.category,
        province: row.province,
        city: row.city
      }
    }));
    
    res.json({
      type: 'FeatureCollection',
      features: features,
      count: features.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 缓冲区查询 - 返回在行政区划内的项目
router.post('/within-region', async (req, res) => {
  try {
    const { regionId } = req.body;
    
    const query = `
      SELECT 
        h.id,
        h.name,
        h.category,
        h.province,
        h.city
      FROM heritage_items h
      WHERE status = 'active'
        AND ST_Contains(
          (SELECT geom FROM admin_regions WHERE id = $1),
          h.geom
        )
      ORDER BY h.name
    `;
    
    const result = await pool.query(query, [regionId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### 4. 统计分析接口 (routes/statistics.js)

```javascript
const express = require('express');
const { pool } = require('../app');
const router = express.Router();

// 按分类统计
router.get('/by-category', async (req, res) => {
  try {
    const query = `
      SELECT 
        category,
        COUNT(*) as count
      FROM heritage_items
      WHERE status = 'active'
      GROUP BY category
      ORDER BY count DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 按地区统计
router.get('/by-region', async (req, res) => {
  try {
    const { level = 'province' } = req.query;
    
    let groupField = 'province';
    if (level === 'city') groupField = 'city';
    if (level === 'province') groupField = 'province';
    
    const query = `
      SELECT 
        ${groupField} as name,
        COUNT(*) as count,
        COUNT(DISTINCT category) as categories
      FROM heritage_items
      WHERE status = 'active'
      GROUP BY ${groupField}
      ORDER BY count DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 热力图数据
router.get('/heatmap', async (req, res) => {
  try {
    const query = `
      SELECT 
        ST_X(geom) as lng,
        ST_Y(geom) as lat,
        COUNT(*) as weight
      FROM heritage_items
      WHERE status = 'active'
      GROUP BY ST_X(geom), ST_Y(geom)
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## 🚀 环境配置

### .env 文件示例

```env
# 数据库
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=heritage_db

# 服务器
PORT=3000
NODE_ENV=development

# Mapbox
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiY2hlbnlhbmd6aHUiLCJhIjoiY21qZ3gyd3NlMTd1YjNjb3JqNDNyb3Y5eSJ9.eVPOmxIjsx1Zm2DRZSAUqw
```

## 📦 必需的 NPM 包

```bash
npm install express pg cors dotenv
npm install --save-dev nodemon
```

## 🧪 测试 API

### 使用 curl

```bash
# 获取所有非遗项目
curl http://localhost:3000/api/heritage/geojson

# 按类别筛选
curl "http://localhost:3000/api/heritage/geojson?category=传统戏剧"

# 点查询
curl -X POST http://localhost:3000/api/spatial/point-query \
  -H "Content-Type: application/json" \
  -d '{"lng": 120.595, "lat": 31.299, "radius": 50000}'

# 统计数据
curl http://localhost:3000/api/statistics/by-category
```

## 🎯 集成步骤

1. **本地测试**
   - 安装 PostgreSQL 和 PostGIS
   - 创建数据库和表结构
   - 启动 Node.js 后端服务
   - 修改 MapView.vue 中的 API 端点

2. **前端集成**
   ```javascript
   // 替换硬编码的数据
   const response = await fetch('http://localhost:3000/api/heritage/geojson')
   const geojsonData = await response.json()
   // 更新地图源
   map.getSource('heritage-sites').setData(geojsonData)
   ```

3. **生产部署**
   - 使用云数据库服务（AWS RDS, Azure Database）
   - 部署到服务器（Docker, Kubernetes）
   - 配置 HTTPS 和 API 认证

## 📚 更多参考

- [PostGIS 官方文档](https://postgis.net/documentation/)
- [Express.js 官方文档](https://expressjs.com/)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
