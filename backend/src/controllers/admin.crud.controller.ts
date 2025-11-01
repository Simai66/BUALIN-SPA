import { Request, Response } from 'express';
import { db } from '../config/db';
import { z } from 'zod';
import { updateServiceSchema, updateTherapistSchema, updateUserSchema, createServiceSchema, createTherapistSchema, createUserSchema, createDayOffSchema } from '../utils/validate';
import bcrypt from 'bcrypt';

// Services
export const getAllServices = async (_req: Request, res: Response) => {
  try {
    const services = await db('services').select('*').orderBy('id', 'asc');
    res.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const data = createServiceSchema.parse(req.body);
    const [id] = await db('services').insert({
      name: data.name,
      description: data.description ?? null,
      duration_minutes: data.duration_minutes,
      base_price: data.base_price,
      image_path: data.image_path ?? null,
      is_active: data.is_active ?? true,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
    const created = await db('services').where({ id }).first();
    res.status(201).json({ service: created });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors: error.errors });
    }
    console.error('Create service error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'ID ไม่ถูกต้อง' });
    }

    const data = updateServiceSchema.parse(req.body);

    const exists = await db('services').where({ id }).first();
    if (!exists) {
      return res.status(404).json({ message: 'ไม่พบบริการ' });
    }

    await db('services').where({ id }).update({
      name: data.name,
      description: data.description ?? exists.description,
      duration_minutes: data.duration_minutes,
      base_price: data.base_price,
      image_path: data.image_path ?? exists.image_path,
      is_active: data.is_active,
      updated_at: db.fn.now(),
    });

    const updated = await db('services').where({ id }).first();
    res.json({ service: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors: error.errors });
    }
    console.error('Update service error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'ID ไม่ถูกต้อง' });
    }

    const service = await db('services').where({ id }).first();
    if (!service) return res.status(404).json({ message: 'ไม่พบบริการ' });

    const hasBookings = await db('bookings').where({ service_id: id }).first();
    if (hasBookings) {
      return res.status(409).json({ message: 'ไม่สามารถลบได้ เนื่องจากมีการจองที่เกี่ยวข้อง' });
    }

    await db('services').where({ id }).del();
    res.json({ message: 'ลบบริการสำเร็จ' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

// Therapists
export const getAllTherapists = async (_req: Request, res: Response) => {
  try {
    const therapists = await db('therapists').select('*').orderBy('id', 'asc');
    res.json({ therapists });
  } catch (error) {
    console.error('Get therapists error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const createTherapist = async (req: Request, res: Response) => {
  try {
    const data = createTherapistSchema.parse(req.body);
    const [id] = await db('therapists').insert({
      name: data.name,
      specialty: data.specialty ?? null,
      bio: data.bio ?? null,
      is_active: data.is_active ?? true,
    });
    const created = await db('therapists').where({ id }).first();
    res.status(201).json({ therapist: created });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors: error.errors });
    }
    console.error('Create therapist error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const updateTherapist = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'ID ไม่ถูกต้อง' });
    }

    const data = updateTherapistSchema.parse(req.body);

    const exists = await db('therapists').where({ id }).first();
    if (!exists) {
      return res.status(404).json({ message: 'ไม่พบนักบำบัด' });
    }

    await db('therapists').where({ id }).update({
      name: data.name,
      specialty: data.specialty ?? exists.specialty,
      bio: data.bio ?? exists.bio,
      is_active: data.is_active,
      updated_at: db.fn.now(),
    });

    const updated = await db('therapists').where({ id }).first();
    res.json({ therapist: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors: error.errors });
    }
    console.error('Update therapist error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const deleteTherapist = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'ID ไม่ถูกต้อง' });
    }

    const therapist = await db('therapists').where({ id }).first();
    if (!therapist) return res.status(404).json({ message: 'ไม่พบนักบำบัด' });

    const hasBookings = await db('bookings').where({ therapist_id: id }).first();
    if (hasBookings) {
      return res.status(409).json({ message: 'ไม่สามารถลบได้ เนื่องจากมีการจองที่เกี่ยวข้อง' });
    }

    await db('therapists').where({ id }).del();
    res.json({ message: 'ลบนักบำบัดสำเร็จ' });
  } catch (error) {
    console.error('Delete therapist error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

// Users
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await db('users')
      .select('id', 'full_name', 'email', 'phone', 'role', 'is_verified', 'created_at')
      .orderBy('id', 'asc');
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const data = createUserSchema.parse(req.body);

    const existing = await db('users').where({ email: data.email }).first();
    if (existing) return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });

    const password_hash = await bcrypt.hash(data.password, 10);

    const [id] = await db('users').insert({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone ?? null,
      password_hash,
      is_verified: data.is_verified ?? true,
      role: data.role ?? 'user',
      verify_token: null,
      verify_token_expires: null,
      created_at: db.fn.now(),
    });

    const created = await db('users')
      .select('id', 'full_name', 'email', 'phone', 'role', 'is_verified', 'created_at')
      .where({ id }).first();
    res.status(201).json({ user: created });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors: error.errors });
    }
    console.error('Create user error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'ID ไม่ถูกต้อง' });
    }

    const payload = updateUserSchema.parse(req.body);

    const user = await db('users').where({ id }).first();
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    const updateData: any = {
      updated_at: db.fn.now(),
    };
    if (payload.full_name !== undefined) updateData.full_name = payload.full_name;
    if (payload.phone !== undefined) updateData.phone = payload.phone;
    if (payload.role !== undefined) updateData.role = payload.role;
    if (payload.is_verified !== undefined) updateData.is_verified = payload.is_verified;

    await db('users').where({ id }).update(updateData);
    const updated = await db('users')
      .select('id', 'full_name', 'email', 'phone', 'role', 'is_verified', 'created_at', 'updated_at')
      .where({ id }).first();
    res.json({ user: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors: error.errors });
    }
    console.error('Update user error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'ID ไม่ถูกต้อง' });
    }

    const user = await db('users').where({ id }).first();
    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'ไม่สามารถลบผู้ใช้ที่เป็นแอดมินได้' });
    }

    await db('users').where({ id }).del();
    res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

// Days Off (Therapists)
export const getTherapistDaysOff = async (req: Request, res: Response) => {
  try {
    const month = String(req.query.month || '').trim();
    const therapistId = req.query.therapist_id ? Number(req.query.therapist_id) : undefined;

    let query = db('therapist_days_off')
      .select('therapist_days_off.id', 'therapist_days_off.therapist_id', 'therapist_days_off.day_off', 'therapist_days_off.note')
      .orderBy('day_off', 'asc');

    if (month) {
      query = query.whereLike('day_off', `${month}-%`);
    }
    if (therapistId) {
      query = query.where('therapist_id', therapistId);
    }

    const daysOff = await query;

    // Include therapist names map for display convenience
    const therapists = await db('therapists').select('id', 'name');
    const nameMap: Record<number, string> = {};
    for (const t of therapists) nameMap[t.id] = t.name;

    res.json({ daysOff, therapists: nameMap });
  } catch (error) {
    console.error('Get days off error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const createTherapistDayOff = async (req: Request, res: Response) => {
  try {
    const data = createDayOffSchema.parse(req.body);

    // Ensure therapist exists
    const therapist = await db('therapists').where({ id: data.therapist_id }).first();
    if (!therapist) {
      return res.status(404).json({ message: 'ไม่พบนักบำบัด' });
    }

    // Upsert-like with unique constraint
    try {
      const [id] = await db('therapist_days_off').insert({
        therapist_id: data.therapist_id,
        day_off: data.day_off,
        note: data.note ?? null,
        created_at: db.fn.now(),
      });
      const created = await db('therapist_days_off').where({ id }).first();
      res.status(201).json({ dayOff: created });
    } catch (e: any) {
      // Handle unique conflict
      return res.status(409).json({ message: 'วันนี้ถูกบันทึกเป็นวันหยุดแล้ว' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors: error.errors });
    }
    console.error('Create day off error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const deleteTherapistDayOff = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'ID ไม่ถูกต้อง' });
    }
    const existing = await db('therapist_days_off').where({ id }).first();
    if (!existing) {
      return res.status(404).json({ message: 'ไม่พบรายการวันหยุด' });
    }
    await db('therapist_days_off').where({ id }).del();
    res.json({ message: 'ลบวันหยุดสำเร็จ' });
  } catch (error) {
    console.error('Delete day off error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};