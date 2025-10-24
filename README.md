# 🌸 ไทยสปา (Thai Spa) - ระบบจองสปาออนไลน์

โปรเจกต์เว็บแอปพลิเคชันสำหรับจองบริการสปาและนวด แบบ Full-Stack ที่แยก Frontend และ Backend อย่างชัดเจน

## 📋 สารบัญ

- [Tech Stack](#-tech-stack)
- [โครงสร้างโปรเจกต์](#-โครงสร้างโปรเจกต์)
- [ฟีเจอร์หลัก](#-ฟีเจอร์หลัก)
- [การติดตั้งและรัน](#-การติดตั้งและรัน)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [การตั้งค่า SMTP](#-การตั้งค่า-smtp)
- [บัญชีทดสอบ](#-บัญชีทดสอบ)
- [Business Logic](#-business-logic)
- [Security Features](#-security-features)

---

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js** (REST API)
- **TypeScript**
- **SQLite** (Database)
- **Knex.js** (Query Builder + Migrations)
- **JWT** (Authentication via httpOnly cookie)
- **nodemailer** (Email notifications)
- **Zod** (Validation)
- **bcrypt** (Password hashing)
- **helmet**, **cors**, **express-rate-limit** (Security)
- **pdfkit**, **exceljs** (Export reports)

### Frontend
- **React 18** (SPA)
- **TypeScript**
- **Vite** (Build tool)
- **React Router** (Routing)
- **Bootstrap 5** + **react-bootstrap** (UI)
- **react-chartjs-2** + **Chart.js** (Data visualization)
- **zustand** (State management)
- **axios** (HTTP client)

---

## 📁 โครงสร้างโปรเจกต์

```
thai-spa/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── db.ts
│   │   │   ├── mail.ts
│   │   │   └── knexfile.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── error.ts
│   │   │   └── rateLimit.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── booking.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── booking.routes.ts
│   │   │   └── admin.routes.ts
│   │   ├── utils/
│   │   │   ├── price.ts
│   │   │   ├── time.ts
│   │   │   └── validate.ts
│   │   ├── migrations/
│   │   │   └── 20250101000000_initial_schema.ts
│   │   ├── seeds/
│   │   │   └── 01_initial_data.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── store/
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   └── Navbar.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Register.tsx
│   │   │   └── (other pages...)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── README.md
```

---

## ✨ ฟีเจอร์หลัก

### ฝั่งผู้ใช้งาน
- ✅ สมัครสมาชิก (พร้อมยืนยันอีเมล)
- ✅ เข้าสู่ระบบ / ออกจากระบบ (JWT + httpOnly cookie)
- ✅ ดูรายการบริการและโปรโมชัน
- ✅ จองบริการ 3 ขั้นตอน:
  1. เลือกบริการ
  2. เลือกพนักงาน
  3. เลือกวันเวลา (กริดบล็อกเวลา)
- ✅ ยืนยันการจอง
- ✅ รับอีเมลแจ้งเตือนเมื่อมีการเปลี่ยนแปลงสถานะ

### ฝั่งแอดมิน
- ✅ แดชบอร์ด KPI Cards:
  - รายได้วันนี้
  - ยอดจองวันนี้ (ทั้งหมด/ยืนยันแล้ว)
  - รายได้เดือนนี้ (MTD)
  - ชั่วโมงทำงานรวมสัปดาห์นี้
- ✅ กราฟ (react-chartjs-2):
  - Line Chart: รายได้รายวัน 30 วัน
  - Bar Chart: รายได้รายชั่วโมง วันนี้
  - Doughnut: สัดส่วนจองตามบริการ
  - Horizontal Bar: ชั่วโมงทำงานแต่ละคน
- ✅ ตาราง:
  - Top 5 บริการทำเงิน
  - Pending bookings ล่าสุด
  - Top 5 พนักงานชั่วโมงสูงสุด
- ✅ CRUD (Services, Promotions, Therapists, Schedules, Gallery, Bookings)
- ✅ Export รายงาน (PDF, Excel)
- ✅ จัดการสถานะการจอง (Pending → Confirmed/Cancelled/Done)

---

## 🚀 การติดตั้งและรัน

### ข้อกำหนดเบื้องต้น
- Node.js >= 18
- npm หรือ yarn

### 1. Clone โปรเจกต์
```bash
git clone <repository-url>
cd thai-spa
```

### 2. ติดตั้ง Backend

```bash
cd backend

# ติดตั้ง dependencies
npm install

# คัดลอกไฟล์ environment
cp .env.example .env

# แก้ไขค่า .env ตามต้องการ (โดยเฉพาะ SMTP_*)
# nano .env

# รัน migration และ seed
npm run db:reset

# รัน dev server
npm run dev
```

Backend จะรันที่ **http://localhost:5000**

### 3. ติดตั้ง Frontend

เปิด terminal ใหม่:

```bash
cd frontend

# ติดตั้ง dependencies
npm install

# คัดลอกไฟล์ environment
cp .env.example .env

# รัน dev server
npm run dev
```

Frontend จะรันที่ **http://localhost:3000**

---

## 🗄 Database Schema

### Tables

| ตาราง | คำอธิบาย |
|-------|----------|
| `users` | ผู้ใช้งาน (ลูกค้า, แอดมิน) |
| `services` | บริการ (นวด, สปา) |
| `service_prices` | ประวัติราคาบริการ |
| `promotions` | โปรโมชัน/ส่วนลด |
| `therapists` | พนักงานนวด |
| `schedules` | กะการทำงานของพนักงาน |
| `timesheets` | บันทึกเวลาเข้า-ออกงาน |
| `gallery` | รูปภาพแกลเลอรี่ |
| `bookings` | การจอง |

### คำสั่ง Database

```bash
# รัน migrations
npm run migrate

# รัน seeds
npm run seed

# ลบและสร้างใหม่ทั้งหมด (รวม seed)
npm run db:reset
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - สมัครสมาชิก
- `GET /api/auth/verify` - ยืนยันอีเมล
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/logout` - ออกจากระบบ
- `GET /api/auth/me` - ข้อมูลผู้ใช้ปัจจุบัน (ต้อง auth)

### Services & Therapists
- `GET /api/services` - รายการบริการทั้งหมด
- `GET /api/therapists` - รายการพนักงานที่ active
- `GET /api/promotions` - โปรโมชันที่ active
- `GET /api/gallery` - รูปภาพแกลเลอรี่

### Bookings
- `GET /api/bookings` - รายการจอง (ต้อง auth)
- `POST /api/bookings` - สร้างการจอง (ต้อง auth)
- `PUT /api/bookings/:id/status` - อัปเดตสถานะ (admin only)
- `GET /api/booking/slots` - ดูช่องเวลาว่าง

### Admin (ต้อง auth + role=admin)
- `GET /api/admin/dashboard` - ข้อมูล dashboard
- `GET /api/admin/export/pdf` - Export รายงาน PDF
- `GET /api/admin/export/excel` - Export รายงาน Excel

---

## 📧 การตั้งค่า SMTP

### Gmail
1. เปิด 2-Step Verification: https://myaccount.google.com/security
2. สร้าง App Password: https://myaccount.google.com/apppasswords
3. แก้ไข `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Thai Spa <your-email@gmail.com>
```

### Mailtrap (สำหรับทดสอบ)
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASSWORD=your-mailtrap-password
SMTP_FROM=Thai Spa <noreply@thaispa.test>
```

---

## 👤 บัญชีทดสอบ

หลังจากรัน `npm run seed` จะมีบัญชีทดสอบดังนี้:

### Admin
- **Email:** admin@thaispa.com
- **Password:** Admin@123

### User
- **Email:** user@example.com
- **Password:** User@123

---

## 💼 Business Logic

### 1. คำนวณราคา

```typescript
// ขั้นตอน:
1. หาราคาล่าสุดจาก service_prices ที่ครอบคลุม booking_datetime
2. ตรวจสอบโปรโมชันที่ active ในช่วงวันนั้น
3. คำนวณส่วนลด:
   - percent: price * (1 - discount_value / 100)
   - amount: price - discount_value
4. บันทึกลง bookings.price_at_booking
```

### 2. ตรวจสอบความว่างของพนักงาน

```typescript
// เงื่อนไข:
- พนักงานต้องมีกะ (schedules) ในช่วงเวลานั้น
- ไม่มีการจองทับซ้อน (ยกเว้น status = 'cancelled')
- ตรวจทับซ้อน: (startA < endB) AND (startB < endA)
```

### 3. Slot API

```typescript
GET /api/booking/slots?service_id=1&therapist_id=1&date=2025-01-15

// คืน:
{
  "slots": [
    {
      "start": "2025-01-15T09:00:00.000Z",
      "end": "2025-01-15T10:00:00.000Z",
      "available": true
    },
    // ...
  ]
}

// กรอง:
- ตัดเวลาที่ผ่านมา
- ตัดนอกเวลากะ
- ตัดช่องที่ทับซ้อนกับจองอื่น
```

---

## 🔒 Security Features

### ✅ Implemented

1. **JWT + httpOnly Cookie**
   - `SameSite=Lax`
   - Secure flag ใน production
   - หมดอายุ 7 วัน (ตั้งค่าได้)

2. **Password Hashing**
   - bcrypt with salt rounds = 10

3. **CORS**
   - อนุญาตเฉพาะ `FRONTEND_URL` (http://localhost:3000)
   - credentials: true

4. **Helmet.js**
   - Security headers ตามมาตรฐาน

5. **Rate Limiting**
   - Auth endpoints: 10 req / 15 min
   - Admin endpoints: 100 req / 15 min
   - General: 200 req / 15 min

6. **Input Validation**
   - Zod schemas สำหรับทุก request body
   - ข้อความ error ที่อ่านง่าย

7. **Email Verification**
   - Token หมดอายุ 24 ชั่วโมง

8. **SQL Injection Protection**
   - ใช้ Knex query builder (parameterized queries)

9. **File Upload Guard** (พร้อมใช้)
   - ตรวจชนิดไฟล์ (MIME type)
   - จำกัดขนาด (5MB default)
   - ป้องกัน Path Traversal

---

## 📊 ตัวอย่างการใช้งาน (E2E Flow)

### 1. สมัครสมาชิก
```bash
# Frontend: http://localhost:3000/register
1. กรอกแบบฟอร์ม (ชื่อ, อีเมล, รหัสผ่าน)
2. กดยอมรับเงื่อนไข
3. กด "สมัครสมาชิก"
4. ตรวจสอบอีเมลที่ระบุ
```

### 2. ยืนยันอีเมล
```bash
# คลิกลิงก์ในอีเมล
http://localhost:3000/verify-email?token=xxx&email=xxx

# หรือเรียก API โดยตรง:
curl "http://localhost:5000/api/auth/verify?token=xxx&email=xxx"
```

### 3. เข้าสู่ระบบ
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "user@example.com",
  "password": "User@123"
}

# Cookie token จะถูกส่งกลับมาอัตโนมัติ
```

### 4. จองบริการ
```bash
# ขั้นตอนที่ 1: เลือกบริการ
GET /api/services

# ขั้นตอนที่ 2: เลือกพนักงาน
GET /api/therapists

# ขั้นตอนที่ 3: เลือกวันเวลา
GET /api/booking/slots?service_id=1&therapist_id=1&date=2025-01-15

# ยืนยันการจอง
POST /api/bookings
{
  "service_id": 1,
  "therapist_id": 1,
  "booking_datetime": "2025-01-15T10:00:00.000Z",
  "promotion_id": 1
}

# อีเมลแจ้ง "pending" จะถูกส่งให้ลูกค้า
```

### 5. Admin ยืนยันการจอง
```bash
PUT /api/bookings/1/status
{
  "status": "confirmed"
}

# อีเมลแจ้ง "confirmed" จะถูกส่งให้ลูกค้า
```

---

## 🧪 การทดสอบ

### ทดสอบ Backend
```bash
cd backend

# ทดสอบ health check
curl http://localhost:5000/health

# ทดสอบ register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "phone": "0812345678",
    "password": "Test@123",
    "confirmPassword": "Test@123",
    "acceptTerms": true
  }'

# ทดสอบ login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "user@example.com",
    "password": "User@123"
  }'

# ทดสอบ authenticated endpoint
curl http://localhost:5000/api/auth/me \
  -b cookies.txt
```

---

## 📝 หมายเหตุสำคัญ

โปรเจกต์นี้เป็น **Proof of Concept** แสดงโครงสร้างและ architecture ที่ดี มี:

1. ✅ **Backend API ครบถ้วน** - JWT auth, booking logic, admin dashboard, exports
2. ✅ **Database Schema สมบูรณ์** - Migrations และ Seeds พร้อมใช้
3. ✅ **Business Logic ที่ถูกต้อง** - คำนวณราคา, ตรวจสอบว่าง, slot API
4. ✅ **Security Best Practices** - Helmet, CORS, Rate Limiting, Validation
5. ⚠️ **Frontend เป็นโครงสร้างหลัก** - ยังต้องเพิ่ม pages/components เพิ่มเติม

### Pages ที่ยังต้องสร้าง:
- Login.tsx
- VerifyEmail.tsx
- Services.tsx
- BookingService.tsx, BookingTherapist.tsx, BookingDatetime.tsx, BookingConfirm.tsx
- AdminDashboard.tsx (with Charts)

### Components ที่ยังต้องสร้าง:
- TimeBlockGrid.tsx - แสดงบล็อกเวลาให้เลือก
- ConfirmModal.tsx - Modal ยืนยันการจอง
- ChartWidgets.tsx - กราฟต่างๆ

---

## 🚀 Next Steps

1. **ติดตั้ง dependencies ทั้งหมด**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Setup database**
   ```bash
   cd backend
   cp .env.example .env
   # แก้ไข SMTP settings
   npm run db:reset
   ```

3. **รัน Backend**
   ```bash
   npm run dev
   ```

4. **รัน Frontend** (terminal ใหม่)
   ```bash
   cd frontend
   npm run dev
   ```

5. **ทดสอบระบบ**
   - เปิด http://localhost:3000
   - สมัครสมาชิก
   - Login ด้วย admin@thaispa.com / Admin@123
   - ทดสอบ API endpoints

---

## 📞 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ logs ใน terminal
2. ดู error messages ใน browser console
3. ตรวจสอบ .env settings
4. ลอง `npm run db:reset` ใหม่

---

**สร้างโดย:** Senior Full-Stack Engineer  
**License:** MIT
