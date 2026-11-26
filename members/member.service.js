const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const directoryService = require('../directory/directory.service');
const { generateMemberCode } = require('../utils/codeGenerator');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'bmss_raptor_secret', { expiresIn: '30d' });
}

async function registerMember(data) {
  const [existing] = await pool.query('SELECT id FROM members WHERE phone = ?', [data.phone]);
  if (existing.length > 0) {
    const err = new Error('এই মোবাইল নম্বর দিয়ে ইতিমধ্যে নিবন্ধন করা হয়েছে।');
    err.status = 409;
    throw err;
  }

  let finalDistrictId = data.district_id;
  if (data.custom_district_name && String(data.custom_district_name).trim()) {
    const createdDist = await directoryService.createGeoUnit({
      name_bn: String(data.custom_district_name).trim(),
      level: 'district',
      parent_id: data.division_id,
      dist_code: 'NEW',
      is_custom: true
    });
    finalDistrictId = createdDist.id;
  }

  let finalUpazilaId = data.upazila_id;
  if (data.custom_upazila_name && String(data.custom_upazila_name).trim()) {
    const createdUpz = await directoryService.createGeoUnit({
      name_bn: String(data.custom_upazila_name).trim(),
      level: 'upazila',
      parent_id: finalDistrictId,
      is_custom: true
    });
    finalUpazilaId = createdUpz.id;
  }

  let finalUnionId = data.union_id;
  if (data.custom_union_name && String(data.custom_union_name).trim()) {
    const createdUnion = await directoryService.createGeoUnit({
      name_bn: String(data.custom_union_name).trim(),
      level: 'union',
      parent_id: finalUpazilaId,
      is_custom: true
    });
    finalUnionId = createdUnion.id;
  }

  const [[distRow]] = await pool.query(
    'SELECT dist_code FROM geo_units WHERE id = ? LIMIT 1',
    [finalDistrictId]
  );
  const memberCode = generateMemberCode(distRow && distRow.dist_code ? distRow.dist_code : 'BMSS');
  const passwordHash = await bcrypt.hash(data.password, 10);

  const [result] = await pool.query(
    `INSERT INTO members (
      member_code, full_name_bn, full_name_en, freedom_fighter_name, relation_type,
      gazette_no, nid_no, blood_group, phone, password_hash,
      division_id, district_id, upazila_id, union_id, address_details,
      committee_level, designation, photo_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified')`,
    [
      memberCode,
      data.full_name_bn,
      data.full_name_en || null,
      data.freedom_fighter_name,
      data.relation_type || 'পিতা',
      data.gazette_no,
      data.nid_no || null,
      data.blood_group,
      data.phone,
      passwordHash,
      data.division_id,
      finalDistrictId,
      finalUpazilaId,
      finalUnionId,
      data.address_details || null,
      data.committee_level || 'union',
      data.designation || 'সদস্য',
      data.photo_url || null
    ]
  );

  const token = signToken({ id: result.insertId, member_code: memberCode, phone: data.phone });
  return {
    token,
    member: {
      id: result.insertId,
      member_code: memberCode,
      full_name_bn: data.full_name_bn,
      freedom_fighter_name: data.freedom_fighter_name,
      relation_type: data.relation_type || 'পিতা',
      gazette_no: data.gazette_no,
      blood_group: data.blood_group,
      phone: data.phone,
      division_id: data.division_id,
      district_id: finalDistrictId,
      upazila_id: finalUpazilaId,
      union_id: finalUnionId,
      committee_level: data.committee_level || 'union',
      designation: data.designation || 'সদস্য',
      status: 'verified'
    }
  };
}

async function loginMember(phone, password) {
  const [rows] = await pool.query('SELECT * FROM members WHERE phone = ?', [phone]);
  if (rows.length === 0) {
    const err = new Error('মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়।');
    err.status = 401;
    throw err;
  }

  const member = rows[0];
  const valid = await bcrypt.compare(password, member.password_hash);
  if (!valid) {
    const err = new Error('মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়।');
    err.status = 401;
    throw err;
  }

  const token = signToken({ id: member.id, member_code: member.member_code, phone: member.phone });
  delete member.password_hash;
  return { token, member };
}

async function fetchIdCard(memberId) {
  const [rows] = await pool.query(
    `SELECT id, member_code, full_name_bn, full_name_en, freedom_fighter_name,
            relation_type, gazette_no, blood_group, phone, division_id,
            district_id, upazila_id, union_id, committee_level, designation,
            photo_url, status, created_at
     FROM members WHERE id = ?`,
    [memberId]
  );
  if (rows.length === 0) {
    const err = new Error('সদস্য পাওয়া যায়নি।');
    err.status = 404;
    throw err;
  }
  return rows[0];
}

module.exports = { registerMember, loginMember, fetchIdCard };
