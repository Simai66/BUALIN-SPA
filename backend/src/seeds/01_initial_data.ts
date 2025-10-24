import type { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('bookings').del();
  await knex('timesheets').del();
  await knex('schedules').del();
  await knex('gallery').del();
  await knex('service_prices').del();
  await knex('promotions').del();
  await knex('therapists').del();
  await knex('services').del();
  await knex('users').del();

  // Insert admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await knex('users').insert([
    {
      full_name: 'ผู้ดูแลระบบ',
      email: 'admin@thaispa.com',
      phone: '0812345678',
      password_hash: adminPassword,
      is_verified: true,
      role: 'admin',
    },
  ]);

  // Insert test user
  const userPassword = await bcrypt.hash('User@123', 10);
  await knex('users').insert([
    {
      full_name: 'ทดสอบ ผู้ใช้งาน',
      email: 'user@example.com',
      phone: '0823456789',
      password_hash: userPassword,
      is_verified: true,
      role: 'user',
    },
  ]);

  // Insert services
  const services = await knex('services').insert([
    {
      name: 'นวดแผนไทย',
      description: 'นวดแผนไทยดั้งเดิม ผ่อนคลายกล้ามเนื้อ คลายความเมื่อยล้า',
      duration_minutes: 60,
      base_price: 500,
      image_path: '/uploads/thai-massage.jpg',
      is_active: true,
    },
    {
      name: 'นวดอโรม่า',
      description: 'นวดผ่อนคลายด้วยน้ำมันหอมระเหย เพิ่มความสงบให้จิตใจ',
      duration_minutes: 90,
      base_price: 800,
      image_path: '/uploads/aroma-massage.jpg',
      is_active: true,
    },
    {
      name: 'นวดเท้า',
      description: 'นวดเท้ากดจุดฝ่าเท้า กระตุ้นการไหลเวียนเลือด',
      duration_minutes: 45,
      base_price: 350,
      image_path: '/uploads/foot-massage.jpg',
      is_active: true,
    },
    {
      name: 'สครับผิว',
      description: 'ขัดผิวเพื่อผิวเนียนนุ่ม กำจัดเซลล์ผิวเก่า',
      duration_minutes: 60,
      base_price: 600,
      image_path: '/uploads/scrub.jpg',
      is_active: true,
    },
    {
      name: 'นวดหินร้อน',
      description: 'นวดด้วยหินร้อน ผ่อนคลายกล้ามเนื้อลึก',
      duration_minutes: 120,
      base_price: 1200,
      image_path: '/uploads/hot-stone.jpg',
      is_active: true,
    },
  ]).returning('id');

  // Insert service prices (current prices)
  const now = new Date();
  const priceInserts = services.map((id) => ({
    service_id: id,
    price: id === 1 ? 500 : id === 2 ? 800 : id === 3 ? 350 : id === 4 ? 600 : 1200,
    started_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    ended_at: null,
  }));
  await knex('service_prices').insert(priceInserts);

  // Insert promotions
  const today = new Date();
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  await knex('promotions').insert([
    {
      title: 'ส่วนลด 20% สำหรับสมาชิกใหม่',
      description: 'รับส่วนลด 20% สำหรับการจองครั้งแรก',
      discount_type: 'percent',
      discount_value: 20,
      start_date: today,
      end_date: nextMonth,
      is_active: true,
    },
    {
      title: 'ลดเงินสด 100 บาท',
      description: 'ลดทันที 100 บาท สำหรับบริการทุกประเภท',
      discount_type: 'amount',
      discount_value: 100,
      start_date: today,
      end_date: nextMonth,
      is_active: true,
    },
  ]);

  // Insert therapists
  await knex('therapists').insert([
    {
      name: 'นวล จันทร์เพ็ญ',
      specialty: 'นวดแผนไทย, นวดอโรม่า',
      bio: 'ประสบการณ์ 10 ปี เชี่ยวชาญการนวดแผนไทยและอโรม่า',
      is_active: true,
    },
    {
      name: 'สมศรี ดอกบัว',
      specialty: 'นวดเท้า, สครับผิว',
      bio: 'ประสบการณ์ 8 ปี เชี่ยวชาญการนวดเท้าและดูแลผิว',
      is_active: true,
    },
    {
      name: 'จันทร์ แสงทอง',
      specialty: 'นวดหินร้อน, นวดแผนไทย',
      bio: 'ประสบการณ์ 12 ปี เชี่ยวชาญการนวดบำบัด',
      is_active: true,
    },
  ]);

  // Insert schedules (next 7 days, 9 AM - 6 PM)
  const schedules = [];
  for (let day = 0; day < 7; day++) {
    const scheduleDate = new Date(today);
    scheduleDate.setDate(today.getDate() + day);
    
    for (let therapistId = 1; therapistId <= 3; therapistId++) {
      const startTime = new Date(scheduleDate);
      startTime.setHours(9, 0, 0, 0);
      
      const endTime = new Date(scheduleDate);
      endTime.setHours(18, 0, 0, 0);
      
      schedules.push({
        therapist_id: therapistId,
        start_datetime: startTime,
        end_datetime: endTime,
        note: 'กะปกติ',
      });
    }
  }
  await knex('schedules').insert(schedules);

  // Insert gallery
  await knex('gallery').insert([
    { title: 'ห้องนวดหลัก', image_path: '/uploads/gallery-1.jpg', is_active: true },
    { title: 'ห้องพักผ่อน', image_path: '/uploads/gallery-2.jpg', is_active: true },
    { title: 'ห้องสครับ', image_path: '/uploads/gallery-3.jpg', is_active: true },
  ]);

  // Insert sample bookings
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  await knex('bookings').insert([
    {
      customer_name: 'ทดสอบ ผู้ใช้งาน',
      customer_phone: '0823456789',
      service_id: 1,
      therapist_id: 1,
      booking_datetime: tomorrow,
      status: 'confirmed',
      price_at_booking: 500,
      promotion_id: null,
    },
  ]);
}
