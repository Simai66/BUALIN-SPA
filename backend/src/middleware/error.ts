import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'ข้อมูลไม่ถูกต้อง',
      errors: err.errors || err.message,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ message: 'ไม่พบเส้นทางที่ร้องขอ' });
};
