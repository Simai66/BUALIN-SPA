import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'ข้อมูลไม่ถูกต้อง',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Common schemas
export const registerSchema = z.object({
  full_name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  phone: z.string().optional(),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'กรุณายอมรับเงื่อนไขการใช้งาน',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

export const bookingSchema = z.object({
  service_id: z.number().int().positive(),
  therapist_id: z.number().int().positive(),
  booking_datetime: z.string().datetime(),
  promotion_id: z.number().int().positive().optional(),
  customer_phone: z.string().regex(/^\d{10}$/,
    'กรุณากรอกเบอร์โทรเป็นตัวเลข 10 หลัก'),
  customer_name: z.string().min(2).optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'done', 'cancelled']),
});

// Admin update schemas
export const updateServiceSchema = z.object({
  name: z.string().min(2, 'กรุณากรอกชื่อบริการอย่างน้อย 2 ตัวอักษร'),
  description: z.string().optional(),
  duration_minutes: z.number().int().positive('ระยะเวลาต้องเป็นจำนวนเต็มมากกว่า 0 นาที'),
  base_price: z.number().nonnegative('ราคาต้องไม่ติดลบ'),
  image_path: z.string().optional(),
  is_active: z.boolean(),
});

export const updateTherapistSchema = z.object({
  name: z.string().min(2, 'กรุณากรอกชื่อนักบำบัดอย่างน้อย 2 ตัวอักษร'),
  specialty: z.string().optional(),
  bio: z.string().optional(),
  is_active: z.boolean(),
});

export const updateUserSchema = z.object({
  full_name: z.string().min(2, 'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร').optional(),
  phone: z.string().optional(),
  role: z.enum(['user', 'admin']).optional(),
  is_verified: z.boolean().optional(),
});

// Admin create schemas
export const createServiceSchema = z.object({
  name: z.string().min(2, 'กรุณากรอกชื่อบริการอย่างน้อย 2 ตัวอักษร'),
  description: z.string().optional(),
  duration_minutes: z.number().int().positive('ระยะเวลาต้องเป็นจำนวนเต็มมากกว่า 0 นาที'),
  base_price: z.number().nonnegative('ราคาต้องไม่ติดลบ'),
  image_path: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const createTherapistSchema = z.object({
  name: z.string().min(2, 'กรุณากรอกชื่อนักบำบัดอย่างน้อย 2 ตัวอักษร'),
  specialty: z.string().optional(),
  bio: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const createUserSchema = z.object({
  full_name: z.string().min(2, 'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  phone: z.string().optional(),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  role: z.enum(['user', 'admin']).optional(),
  is_verified: z.boolean().optional(),
});

// Admin: days off schemas
export const createDayOffSchema = z.object({
  therapist_id: z.number().int().positive('therapist_id ต้องเป็นเลขจำนวนเต็มมากกว่า 0'),
  day_off: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,'รูปแบบวันต้องเป็น YYYY-MM-DD'),
  note: z.string().max(255).optional(),
});
