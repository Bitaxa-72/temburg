import type { WPScheduleEvent } from '@/api/wordpress';
import { scheduleEvents as fallbackEvents, type ScheduleEvent } from '@/data/schedule';

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
  if (event.highlight) {
    return 'special';
  }

  if (event.type === 'free' || event.type === 'paid' || event.type === 'special') {
    return event.type;
  }

  if (event.isFree === true) {
    return 'free';
  }

  return event.price ? 'paid' : 'free';
}

export function mapWPScheduleEvent(event: WPScheduleEvent, index = 0): ScheduleEvent {
  return {
    id: Number(event.id) || index + 1,
    name: event.name || event.title || '',
    time: event.time || '',
    duration: event.duration || '',
    day: normalizeDays(event.day || event.weekdays),
    type: normalizeType(event),
    description: event.description || '',
    instructor: event.instructor || undefined,
    location: event.location || undefined,
    price: event.price || undefined,
    highlight: Boolean(event.highlight),
  };
}

export function mapScheduleData(events?: WPScheduleEvent[] | null): ScheduleEvent[] {
  const wpEvents = Array.isArray(events) ? events : [];
  const mapped = wpEvents
    .map(mapWPScheduleEvent)
    .filter((event) => event.name && event.time && event.day.length > 0);

  return mapped.length ? mapped : fallbackEvents;
}
