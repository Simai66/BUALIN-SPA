import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../config/db';
import { env } from '../config/env';
import { sendVerificationEmail } from '../config/mail';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, password } = req.body;

    // Check if user exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate verification token
    const verify_token = crypto.randomBytes(32).toString('hex');
    const verify_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const [userId] = await db('users').insert({
      full_name,
      email,
      phone,
      password_hash,
      verify_token,
      verify_token_expires,
      is_verified: false,
      role: 'user',
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verify_token, full_name);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี',
      userId,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
    }

    const user = await db('users')
      .where({ email, verify_token: token })
      .first();

    if (!user) {
      return res.status(400).json({ message: 'ลิงก์ยืนยันไม่ถูกต้อง' });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: 'บัญชีนี้ได้รับการยืนยันแล้ว' });
    }

    const now = new Date();
    const expiresAt = new Date(user.verify_token_expires);

    if (now > expiresAt) {
      return res.status(400).json({ message: 'ลิงก์ยืนยันหมดอายุแล้ว' });
    }

    // Update user
    await db('users')
      .where({ id: user.id })
      .update({
        is_verified: true,
        verify_token: null,
        verify_token_expires: null,
      });

    res.json({ message: 'ยืนยันอีเมลสำเร็จ' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการยืนยันอีเมล' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db('users').where({ email }).first();

    if (!user) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'ออกจากระบบสำเร็จ' });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await db('users')
      .where({ id: req.user?.id })
      .select('id', 'full_name', 'email', 'phone', 'role', 'created_at')
      .first();

    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};
