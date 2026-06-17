import type { WPScheduleEvent } from '@/api/wordpress';
import type { ScheduleEvent } from '@/data/schedule';

function normalizeDays(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((day) => String(day).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((day) => day.trim()).filter(Boolean);
  }

  return [];
}

function normalizeType(event: WPScheduleEvent): ScheduleEvent['type'] {
  const price = Number(event.price) || 0;

  if (event.closed || event.sanitaryDay || event.type === 'closed') {
    return 'closed';
  }

  if (price > 0) {
    return 'paid';
  }

  if (event.type === 'free' || event.type === 'paid' || event.type === 'special') {
    return event.type;
  }

  if (event.isFree === true) {
    return 'free';
  }
  return 'free';
}

export function mapWPScheduleEvent(event: WPScheduleEvent, index = 0): ScheduleEvent {
  return {
    id: event.id || index + 1,
    date: event.date || undefined,
    name: event.name || event.title || '',
    time: event.time || '',
    duration: event.duration || '',
    day: normalizeDays(event.day || event.weekdays),
    type: normalizeType(event),
    description: event.description || '',
    instructor: event.instructor || undefined,
    location: event.location || undefined,
    price: Number(event.price) > 0 ? Number(event.price) : undefined,
    highlight: Boolean(event.highlight),
    closed: Boolean(event.closed),
    sanitaryDay: Boolean(event.sanitaryDay),
  };
}

export function mapScheduleData(events?: WPScheduleEvent[] | null): ScheduleEvent[] {
  const wpEvents = Array.isArray(events) ? events : [];
  return wpEvents
    .map(mapWPScheduleEvent)
    .filter((event) => event.name && (event.type === 'closed' || event.time) && (event.date || event.day.length > 0));
}
