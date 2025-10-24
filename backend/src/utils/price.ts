import { db } from '../config/db';

interface Promotion {
  id: number;
  discount_type: 'percent' | 'amount';
  discount_value: number;
}

/**
 * คำนวณราคาหลังหักส่วนลด
 */
export const calculateFinalPrice = (basePrice: number, promotion: Promotion | null): number => {
  if (!promotion) {
    return basePrice;
  }

  if (promotion.discount_type === 'percent') {
    return basePrice * (1 - promotion.discount_value / 100);
  } else {
    return Math.max(0, basePrice - promotion.discount_value);
  }
};

/**
 * หาราคาปัจจุบันของบริการ ณ เวลาที่กำหนด
 */
export const getCurrentServicePrice = async (
  serviceId: number,
  datetime: Date
): Promise<number> => {
  const priceRecord = await db('service_prices')
    .where('service_id', serviceId)
    .where('started_at', '<=', datetime)
    .where((qb) => {
      qb.whereNull('ended_at').orWhere('ended_at', '>', datetime);
    })
    .orderBy('started_at', 'desc')
    .first();

  if (priceRecord) {
    return parseFloat(priceRecord.price);
  }

  // Fallback to base_price if no price history
  const service = await db('services').where('id', serviceId).first();
  return service ? parseFloat(service.base_price) : 0;
};

/**
 * หาโปรโมชันที่ active ณ วันที่กำหนด
 */
export const getActivePromotion = async (bookingDate: Date): Promise<Promotion | null> => {
  const dateStr = bookingDate.toISOString().split('T')[0];
  
  const promotion = await db('promotions')
    .where('is_active', true)
    .where('start_date', '<=', dateStr)
    .where('end_date', '>=', dateStr)
    .first();

  return promotion || null;
};

/**
 * คำนวณราคาสุทธิสำหรับการจอง
 */
export const calculateBookingPrice = async (
  serviceId: number,
  bookingDatetime: Date,
  promotionId?: number
): Promise<{ price: number; promotion: Promotion | null }> => {
  const basePrice = await getCurrentServicePrice(serviceId, bookingDatetime);
  
  let promotion: Promotion | null = null;
  
  if (promotionId) {
    promotion = await db('promotions').where('id', promotionId).first();
  } else {
    promotion = await getActivePromotion(bookingDatetime);
  }

  const finalPrice = calculateFinalPrice(basePrice, promotion);

  return {
    price: Math.round(finalPrice * 100) / 100, // Round to 2 decimals
    promotion,
  };
};
