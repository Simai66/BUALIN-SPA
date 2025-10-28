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
