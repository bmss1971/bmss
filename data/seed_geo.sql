USE bmss_db;

INSERT IGNORE INTO geo_units (id, name_bn, level, parent_id, dist_code, is_custom) VALUES
('dhaka', 'ঢাকা বিভাগ', 'division', NULL, NULL, FALSE),
('chattogram', 'চট্টগ্রাম বিভাগ', 'division', NULL, NULL, FALSE),
('rajshahi', 'রাজশাহী বিভাগ', 'division', NULL, NULL, FALSE),
('khulna', 'খুলনা বিভাগ', 'division', NULL, NULL, FALSE),
('sylhet', 'সিলেট বিভাগ', 'division', NULL, NULL, FALSE),
('rangpur', 'রংপুর বিভাগ', 'division', NULL, NULL, FALSE),
('barishal', 'বরিশাল বিভাগ', 'division', NULL, NULL, FALSE),
('mymensingh', 'ময়মনসিংহ বিভাগ', 'division', NULL, NULL, FALSE),

('dhaka_dist', 'ঢাকা জেলা', 'district', 'dhaka', 'DHK', FALSE),
('gazipur', 'গাজীপুর', 'district', 'dhaka', 'GAZ', FALSE),
('narayanganj', 'নারায়ণগঞ্জ', 'district', 'dhaka', 'NRG', FALSE),
('narsingdi', 'নরসিংদী', 'district', 'dhaka', 'NRS', FALSE),
('tangail', 'টাঙ্গাইল', 'district', 'dhaka', 'TNG', FALSE),
('ctg_dist', 'চট্টগ্রাম জেলা', 'district', 'chattogram', 'CTG', FALSE),
('cumilla', 'কুমিল্লা', 'district', 'chattogram', 'CML', FALSE),
('noakhali', 'নোয়াখালী', 'district', 'chattogram', 'NKH', FALSE),

('savar', 'সাভার উপজেলা', 'upazila', 'dhaka_dist', NULL, FALSE),
('dhamrai', 'ধামরাই উপজেলা', 'upazila', 'dhaka_dist', NULL, FALSE),
('mirpur_thana', 'মিরপুর থানা', 'upazila', 'dhaka_dist', NULL, FALSE),
('gazipur_sadar', 'গাজীপুর সদর', 'upazila', 'gazipur', NULL, FALSE),
('kaliakoir', 'কালিয়াকৈর উপজেলা', 'upazila', 'gazipur', NULL, FALSE),
('hathazari', 'হাটহাজারী উপজেলা', 'upazila', 'ctg_dist', NULL, FALSE),

('shimulia_union', 'শিমুলিয়া ইউনিয়ন', 'union', 'savar', NULL, FALSE),
('ashulia_union', 'আশুলিয়া ইউনিয়ন', 'union', 'savar', NULL, FALSE),
('savar_poura', 'সাভার পৌরসভা', 'union', 'savar', NULL, FALSE),
('bari_union', 'বাড়িয়া ইউনিয়ন', 'union', 'gazipur_sadar', NULL, FALSE),
('fatehpur_union', 'ফতেপুর ইউনিয়ন', 'union', 'hathazari', NULL, FALSE);
