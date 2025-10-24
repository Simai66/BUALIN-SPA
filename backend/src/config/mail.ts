import nodemailer from 'nodemailer';
import { env } from './env';

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

interface BookingEmailPayload {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  therapistName: string;
  bookingDatetime: string;
  price: number;
  status: string;
}

export const sendBookingEmail = async (
  type: 'new' | 'confirmed' | 'cancelled',
  payload: BookingEmailPayload
) => {
  const { customerName, customerEmail, serviceName, therapistName, bookingDatetime, price, status } = payload;

  let subject = '';
  let html = '';

  if (type === 'new') {
    subject = 'การจองของคุณถูกสร้างแล้ว | Booking Created';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5282;">ยืนยันการจองสปา</h2>
        <p>สวัสดีคุณ <strong>${customerName}</strong>,</p>
        <p>การจองของคุณได้รับการบันทึกแล้ว รายละเอียดดังนี้:</p>
        <ul>
          <li><strong>บริการ:</strong> ${serviceName}</li>
          <li><strong>พนักงาน:</strong> ${therapistName}</li>
          <li><strong>วันเวลา:</strong> ${bookingDatetime}</li>
          <li><strong>ราคา:</strong> ${price.toLocaleString()} บาท</li>
          <li><strong>สถานะ:</strong> ${status}</li>
        </ul>
        <p>เราจะแจ้งให้คุณทราบอีกครั้งเมื่อการจองได้รับการยืนยันจากทางร้าน</p>
        <hr />
        <p style="color: #718096; font-size: 12px;">Thai Spa - Relax & Rejuvenate</p>
      </div>
    `;
  } else if (type === 'confirmed') {
    subject = 'การจองของคุณได้รับการยืนยัน | Booking Confirmed';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #38a169;">✓ การจองได้รับการยืนยันแล้ว</h2>
        <p>สวัสดีคุณ <strong>${customerName}</strong>,</p>
        <p>ยินดีด้วย! การจองของคุณได้รับการยืนยันแล้ว</p>
        <ul>
          <li><strong>บริการ:</strong> ${serviceName}</li>
          <li><strong>พนักงาน:</strong> ${therapistName}</li>
          <li><strong>วันเวลา:</strong> ${bookingDatetime}</li>
          <li><strong>ราคา:</strong> ${price.toLocaleString()} บาท</li>
        </ul>
        <p>กรุณามาถึงก่อนเวลานัด 10 นาที เพื่อเตรียมตัว</p>
        <hr />
        <p style="color: #718096; font-size: 12px;">Thai Spa - Relax & Rejuvenate</p>
      </div>
    `;
  } else {
    subject = 'การจองของคุณถูกยกเลิก | Booking Cancelled';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e53e3e;">การจองถูกยกเลิก</h2>
        <p>สวัสดีคุณ <strong>${customerName}</strong>,</p>
        <p>การจองของคุณได้ถูกยกเลิกแล้ว</p>
        <ul>
          <li><strong>บริการ:</strong> ${serviceName}</li>
          <li><strong>พนักงาน:</strong> ${therapistName}</li>
          <li><strong>วันเวลา:</strong> ${bookingDatetime}</li>
        </ul>
        <p>หากต้องการจองใหม่ กรุณาเข้าสู่ระบบและทำการจองอีกครั้ง</p>
        <hr />
        <p style="color: #718096; font-size: 12px;">Thai Spa - Relax & Rejuvenate</p>
      </div>
    `;
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: customerEmail,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (email: string, token: string, fullName: string) => {
  const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c5282;">ยืนยันอีเมลของคุณ</h2>
      <p>สวัสดีคุณ <strong>${fullName}</strong>,</p>
      <p>กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
      <p style="margin: 20px 0;">
        <a href="${verifyUrl}" style="background: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          ยืนยันอีเมล
        </a>
      </p>
      <p style="color: #718096; font-size: 14px;">ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง</p>
      <p style="color: #718096; font-size: 12px;">หากคุณไม่ได้สมัครสมาชิก กรุณาเพิกเฉยอีเมลนี้</p>
      <hr />
      <p style="color: #718096; font-size: 12px;">Thai Spa - Relax & Rejuvenate</p>
    </div>
  `;

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: 'ยืนยันอีเมลของคุณ | Verify Your Email',
    html,
  });
};
