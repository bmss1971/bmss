function generateMemberCode(distCode = 'BMSS') {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BMSS-${distCode || 'BMSS'}-${rand}`;
}

function generateTrxCode(prefix = 'TRX') {
  const stamp = Date.now().toString().slice(-6);
  const rand = Math.floor(10 + Math.random() * 89);
  return `${prefix}-${stamp}-${rand}`;
}

function generateAidCode() {
  return `AID-${Date.now().toString().slice(-6)}`;
}

function slugifyGeoId(nameBn, parentId) {
  const clean = String(nameBn || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ঀ-৿]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${parentId}_${clean || 'unit'}_${suffix}`;
}

module.exports = { generateMemberCode, generateTrxCode, generateAidCode, slugifyGeoId };
