// backend/services/heritage.service.js
const db = require('../config/database');

// ✅ 表名
const TABLE = 'shapefile."长三角-全部_地点唯一_地级市"';

/**
 * 列表：分页 + 可选关键词（name_cn / intro）
 * 你后面要做筛选，也可以在这里扩展
 */
async function listHeritage({ page = 1, pageSize = 12, keyword = '' }) {
  const params = [];
  let whereSql = '';

  if (keyword && keyword.trim()) {
    params.push(`%${keyword.trim()}%`);
    whereSql = `WHERE (name_cn ILIKE $1 OR intro ILIKE $1)`;
  }

  // 总数
  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLE} ${whereSql}`;
  const totalRet = await db.query(countSql, params);
  const total = totalRet.rows[0].total;

  // 分页
  const offset = (page - 1) * pageSize;

  // ✅ 返回给前端的字段名做 alias（前端更好用）
  const listSql = `
    SELECT
      fid AS id,
      name_cn AS name,
      categorycn AS category,
      place_merged AS region,
      intro AS intro,
      x AS lng,
      y AS lat,
      image_url AS image
    FROM ${TABLE}
    ${whereSql}
    ORDER BY fid
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;

  const listRet = await db.query(listSql, [...params, pageSize, offset]);
  return { total, items: listRet.rows };
}

/**
 * 详情：按 fid 查一条（详情页/弹窗用）
 */
async function getHeritageById(id) {
  const sql = `
    SELECT
      fid AS id,
      name_cn AS name,
      categorycn AS category,
      place_merged AS region,
      intro AS intro,
      x AS lng,
      y AS lat,
      image_url AS image
    FROM ${TABLE}
    WHERE fid = $1
    LIMIT 1
  `;
  const ret = await db.query(sql, [id]);
  return ret.rows[0] || null;
}

module.exports = {
  listHeritage,
  getHeritageById,
};
