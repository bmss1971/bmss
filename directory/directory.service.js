const pool = require('../config/db');
const { slugifyGeoId } = require('../utils/codeGenerator');

async function listDivisions() {
  const [units] = await pool.query(
    "SELECT id, name_bn FROM geo_units WHERE level = 'division' ORDER BY id ASC"
  );
  const [counts] = await pool.query(
    'SELECT division_id, COUNT(*) AS total FROM members GROUP BY division_id'
  );
  const map = Object.fromEntries(counts.map(r => [r.division_id, Number(r.total)]));
  return units.map(u => ({ ...u, member_count: map[u.id] || 0 }));
}

async function listDistricts(divisionId) {
  const [units] = await pool.query(
    "SELECT id, name_bn, dist_code FROM geo_units WHERE level = 'district' AND parent_id = ? ORDER BY name_bn ASC",
    [divisionId]
  );
  const [counts] = await pool.query(
    'SELECT district_id, COUNT(*) AS total FROM members WHERE division_id = ? GROUP BY district_id',
    [divisionId]
  );
  const map = Object.fromEntries(counts.map(r => [r.district_id, Number(r.total)]));
  return units.map(u => ({ ...u, division_id: divisionId, member_count: map[u.id] || 0 }));
}

async function listUpazilas(districtId) {
  const [units] = await pool.query(
    "SELECT id, name_bn FROM geo_units WHERE level = 'upazila' AND parent_id = ? ORDER BY name_bn ASC",
    [districtId]
  );
  const [counts] = await pool.query(
    'SELECT upazila_id, COUNT(*) AS total FROM members WHERE district_id = ? GROUP BY upazila_id',
    [districtId]
  );
  const map = Object.fromEntries(counts.map(r => [r.upazila_id, Number(r.total)]));
  return units.map(u => ({ ...u, district_id: districtId, member_count: map[u.id] || 0 }));
}

async function listUnions(upazilaId) {
  const [units] = await pool.query(
    "SELECT id, name_bn, is_custom FROM geo_units WHERE level = 'union' AND parent_id = ? ORDER BY name_bn ASC",
    [upazilaId]
  );
  const [counts] = await pool.query(
    'SELECT union_id, COUNT(*) AS total FROM members WHERE upazila_id = ? GROUP BY union_id',
    [upazilaId]
  );
  const map = Object.fromEntries(counts.map(r => [r.union_id, Number(r.total)]));
  return units.map(u => ({ ...u, upazila_id: upazilaId, member_count: map[u.id] || 0 }));
}

async function createGeoUnit({ name_bn, level, parent_id = null, dist_code = 'GEN', is_custom = true }) {
  const trimmedName = String(name_bn).trim();

  if (parent_id) {
    const [existing] = await pool.query(
      'SELECT id, name_bn, dist_code FROM geo_units WHERE level = ? AND parent_id = ? AND name_bn = ? LIMIT 1',
      [level, parent_id, trimmedName]
    );
    if (existing.length > 0) {
      return existing[0];
    }
  }

  const id = slugifyGeoId(trimmedName, parent_id || level);
  const finalDistCode = level === 'district' ? (dist_code || 'GEN') : null;

  await pool.query(
    'INSERT INTO geo_units (id, name_bn, level, parent_id, dist_code, is_custom) VALUES (?, ?, ?, ?, ?, ?)',
    [id, trimmedName, level, parent_id, finalDistCode, Boolean(is_custom)]
  );
  return { id, name_bn: trimmedName, level, parent_id, dist_code: finalDistCode, is_custom: Boolean(is_custom) };
}

async function filterMembers(filters) {
  const { division_id, district_id, upazila_id, union_id, blood_group, q } = filters;
  let sql = `SELECT id, member_code, full_name_bn, freedom_fighter_name, relation_type,
                    gazette_no, blood_group, phone, division_id, district_id, upazila_id,
                    union_id, committee_level, designation, status
             FROM members WHERE 1=1`;
  const params = [];

  if (division_id) { sql += ' AND division_id = ?'; params.push(division_id); }
  if (district_id) { sql += ' AND district_id = ?'; params.push(district_id); }
  if (upazila_id) { sql += ' AND upazila_id = ?'; params.push(upazila_id); }
  if (union_id) { sql += ' AND union_id = ?'; params.push(union_id); }
  if (blood_group) { sql += ' AND blood_group = ?'; params.push(blood_group); }
  if (q) {
    sql += ' AND (full_name_bn LIKE ? OR member_code LIKE ? OR phone LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  sql += ' ORDER BY id DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = { listDivisions, listDistricts, listUpazilas, listUnions, createGeoUnit, filterMembers };
