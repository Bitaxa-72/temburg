export const SERVICE_BOOKING_START_HOUR = 9;
export const SERVICE_BOOKING_END_HOUR = 21;

export type ServiceBookingSection = 'massage' | 'spa' | 'steaming' | 'service';

export interface ServiceBookingSlot {
  hour: number;
  label: string;
  endHour: number;
  endLabel: string;
  available: boolean;
  booked: boolean;
  past?: boolean;
  bookingCount?: number;
  bookings: unknown[];
}

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getServiceBookingMinDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return formatDateInputValue(date);
}

export function normalizeServiceBookingSection(...values: Array<string | undefined | null>): ServiceBookingSection {
  const text = values
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(' ');

  if (text.includes('massage') || text.includes('массаж')) return 'massage';
  if (text.includes('spa') || text.includes('спа')) return 'spa';
  if (text.includes('steaming') || text.includes('steam') || text.includes('парени') || text.includes('парение')) return 'steaming';

  return 'service';
}

export function parseServiceDurationMinutes(duration?: string): number {
  const text = String(duration || '').toLowerCase().replace(',', '.');
  let minutes = 0;

  for (const match of text.matchAll(/(\d+(?:\.\d+)?)\s*(ч|час|часа|часов|h|hour|hours)/gu)) {
    minutes += Math.round(Number(match[1]) * 60);
  }

  for (const match of text.matchAll(/(\d+(?:\.\d+)?)\s*(м|мин|минута|минут|минуты|min|mins|minute|minutes)/gu)) {
    minutes += Math.round(Number(match[1]));
  }

  if (minutes <= 0) {
    const numeric = text.match(/\d+(?:\.\d+)?/u);
    minutes = numeric ? Math.round(Number(numeric[0])) : 60;
  }

  return Math.max(1, minutes);
}

export function getServiceReservedHours(duration?: string): number {
  return Math.max(1, Math.ceil(parseServiceDurationMinutes(duration) / 60));
}

export function formatServiceBookingHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function formatServiceBookingRange(hour: number, reservedHours: number): string {
  return `${formatServiceBookingHour(hour)}-${formatServiceBookingHour(hour + reservedHours)}`;
}

export function normalizeServiceBookingSlots(value: unknown): ServiceBookingSlot[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((slot: any) => {
      const hour = Number(slot?.hour);
      const endHour = Number(slot?.endHour);

      return {
        hour,
        label: String(slot?.label || formatServiceBookingHour(hour)),
        endHour,
        endLabel: String(slot?.endLabel || formatServiceBookingHour(endHour)),
        available: Boolean(slot?.available),
        booked: Boolean(slot?.booked),
        past: Boolean(slot?.past),
        bookingCount: Number(slot?.bookingCount) || 0,
        bookings: Array.isArray(slot?.bookings) ? slot.bookings : [],
      };
    })
    .filter((slot) => (
      Number.isFinite(slot.hour)
      && Number.isFinite(slot.endHour)
      && slot.hour >= 0
      && slot.endHour <= 24
      && slot.endHour > slot.hour
    ));
}

function isFallbackServiceBookingSlotPast(date: string | undefined, hour: number): boolean {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  if (date < getServiceBookingMinDate()) return true;

  const [year, month, day] = date.split('-').map(Number);
  const slotDate = new Date(year, month - 1, day, hour, 0, 0, 0);

  return slotDate.getTime() <= Date.now();
}

export function buildServiceBookingFallbackSlots(hours: number, date?: string): ServiceBookingSlot[] {
  const safeHours = Math.max(1, Math.min(24, Math.floor(Number(hours) || 1)));
  const lastStartHour = SERVICE_BOOKING_END_HOUR - safeHours;
  const slots: ServiceBookingSlot[] = [];

  for (let hour = SERVICE_BOOKING_START_HOUR; hour <= lastStartHour; hour += 1) {
    const past = isFallbackServiceBookingSlotPast(date, hour);

    slots.push({
      hour,
      label: formatServiceBookingHour(hour),
      endHour: hour + safeHours,
      endLabel: formatServiceBookingHour(hour + safeHours),
      available: !past,
      booked: false,
      past,
      bookingCount: 0,
      bookings: [],
    });
  }

  return slots;
}
