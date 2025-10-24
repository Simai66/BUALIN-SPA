import { Request, Response } from 'express';
import { db } from '../config/db';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Today's revenue (confirmed + done)
    const todayRevenue = await db('bookings')
      .whereIn('status', ['confirmed', 'done'])
      .whereBetween('booking_datetime', [today, todayEnd])
      .sum('price_at_booking as total');

    // Today's bookings count
    const todayBookingsCount = await db('bookings')
      .whereBetween('booking_datetime', [today, todayEnd])
      .count('* as count');

    const todayConfirmedCount = await db('bookings')
      .whereIn('status', ['confirmed', 'done'])
      .whereBetween('booking_datetime', [today, todayEnd])
      .count('* as count');

    // Month to date revenue
    const mtdRevenue = await db('bookings')
      .whereIn('status', ['confirmed', 'done'])
      .whereBetween('booking_datetime', [firstDayOfMonth, lastDayOfMonth])
      .sum('price_at_booking as total');

    // This week's working hours
    const weekTimesheets = await db('timesheets')
      .select('therapist_id', 'therapists.name')
      .join('therapists', 'timesheets.therapist_id', 'therapists.id')
      .whereBetween('clock_in', [startOfWeek, endOfWeek])
      .whereNotNull('clock_out');

    let totalHours = 0;
    const therapistHours: { [key: string]: number } = {};

    for (const sheet of weekTimesheets) {
      const clockIn = new Date(sheet.clock_in);
      const clockOut = new Date(sheet.clock_out);
      const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
      totalHours += hours;
      
      if (!therapistHours[sheet.name]) {
        therapistHours[sheet.name] = 0;
      }
      therapistHours[sheet.name] += hours;
    }

    const therapistCount = Object.keys(therapistHours).length || 1;
    const avgHoursPerTherapist = totalHours / therapistCount;

    // Last 30 days revenue by day
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const dailyRevenue = await db('bookings')
      .select(db.raw('DATE(booking_datetime) as date'))
      .sum('price_at_booking as revenue')
      .whereIn('status', ['confirmed', 'done'])
      .whereBetween('booking_datetime', [thirtyDaysAgo, todayEnd])
      .groupBy(db.raw('DATE(booking_datetime)'))
      .orderBy('date');

    // Today's revenue by hour
    const hourlyRevenue = await db('bookings')
      .select(db.raw('CAST(strftime("%H", booking_datetime) AS INTEGER) as hour'))
      .sum('price_at_booking as revenue')
      .whereIn('status', ['confirmed', 'done'])
      .whereBetween('booking_datetime', [today, todayEnd])
      .groupBy(db.raw('strftime("%H", booking_datetime)'))
      .orderBy('hour');

    // Bookings by service (last 30 days)
    const bookingsByService = await db('bookings')
      .select('services.name as service_name')
      .count('* as count')
      .join('services', 'bookings.service_id', 'services.id')
      .whereBetween('booking_datetime', [thirtyDaysAgo, todayEnd])
      .groupBy('service_id')
      .orderBy('count', 'desc');

    // Top 5 services by revenue (last 30 days)
    const topServices = await db('bookings')
      .select('services.name as service_name')
      .sum('price_at_booking as revenue')
      .count('* as bookings')
      .join('services', 'bookings.service_id', 'services.id')
      .whereIn('status', ['confirmed', 'done'])
      .whereBetween('booking_datetime', [thirtyDaysAgo, todayEnd])
      .groupBy('service_id')
      .orderBy('revenue', 'desc')
      .limit(5);

    // Pending bookings (latest 10)
    const pendingBookings = await db('bookings')
      .select(
        'bookings.*',
        'services.name as service_name',
        'therapists.name as therapist_name'
      )
      .join('services', 'bookings.service_id', 'services.id')
      .join('therapists', 'bookings.therapist_id', 'therapists.id')
      .where('status', 'pending')
      .orderBy('created_at', 'desc')
      .limit(10);

    // Top 5 therapists by hours (this week)
    const topTherapistsByHours = Object.entries(therapistHours)
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);

    res.json({
      kpis: {
        todayRevenue: todayRevenue[0]?.total || 0,
        todayBookingsCount: todayBookingsCount[0]?.count || 0,
        todayConfirmedCount: todayConfirmedCount[0]?.count || 0,
        mtdRevenue: mtdRevenue[0]?.total || 0,
        weekTotalHours: totalHours,
        weekAvgHoursPerTherapist: avgHoursPerTherapist,
      },
      charts: {
        dailyRevenue,
        hourlyRevenue,
        bookingsByService,
        therapistHours: topTherapistsByHours,
      },
      tables: {
        topServices,
        pendingBookings,
        topTherapistsByHours,
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const exportPDF = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;

    // Create PDF
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    
    doc.pipe(res);

    doc.fontSize(20).text('Thai Spa - Booking Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Period: ${start || 'All'} to ${end || 'All'}`);
    doc.moveDown();

    // Get bookings
    let query = db('bookings')
      .select(
        'bookings.*',
        'services.name as service_name',
        'therapists.name as therapist_name'
      )
      .join('services', 'bookings.service_id', 'services.id')
      .join('therapists', 'bookings.therapist_id', 'therapists.id')
      .orderBy('booking_datetime', 'desc');

    if (start) {
      query = query.where('booking_datetime', '>=', start);
    }
    if (end) {
      query = query.where('booking_datetime', '<=', end);
    }

    const bookings = await query;

    doc.fontSize(14).text('Bookings:', { underline: true });
    doc.moveDown(0.5);

    bookings.forEach((booking: any) => {
      doc.fontSize(10).text(
        `${booking.customer_name} - ${booking.service_name} - ${booking.therapist_name} - ${new Date(booking.booking_datetime).toLocaleDateString('th-TH')} - ${booking.price_at_booking} บาท - ${booking.status}`
      );
    });

    doc.end();
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const exportExcel = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;

    // Get bookings
    let query = db('bookings')
      .select(
        'bookings.*',
        'services.name as service_name',
        'therapists.name as therapist_name'
      )
      .join('services', 'bookings.service_id', 'services.id')
      .join('therapists', 'bookings.therapist_id', 'therapists.id')
      .orderBy('booking_datetime', 'desc');

    if (start) {
      query = query.where('booking_datetime', '>=', start);
    }
    if (end) {
      query = query.where('booking_datetime', '<=', end);
    }

    const bookings = await query;

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bookings');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'ชื่อลูกค้า', key: 'customer_name', width: 20 },
      { header: 'เบอร์โทร', key: 'customer_phone', width: 15 },
      { header: 'บริการ', key: 'service_name', width: 20 },
      { header: 'พนักงาน', key: 'therapist_name', width: 20 },
      { header: 'วันเวลา', key: 'booking_datetime', width: 20 },
      { header: 'ราคา', key: 'price_at_booking', width: 10 },
      { header: 'สถานะ', key: 'status', width: 15 },
    ];

    bookings.forEach((booking: any) => {
      worksheet.addRow({
        ...booking,
        booking_datetime: new Date(booking.booking_datetime).toLocaleString('th-TH'),
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export Excel error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};
