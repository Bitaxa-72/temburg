export interface TariffPricingSlot {
  id: string | number;
  name: string;
  duration?: string;
  adultPrice: number;
  childPrice: number;
  fridayWeekendAllDay?: boolean;
  availableUntil?: string;
  noticeLines?: string[];
  purchaseTimeFrom?: string;
  purchaseTimeTo?: string;
}

export interface TariffOption {
  id: string;
  label: string;
  duration: number;
  durationText: string;
  fridayWeekendAllDay?: boolean;
  availableUntil?: string;
  noticeLines: string[];
  purchaseTimeFrom: string;
  purchaseTimeTo: string;
}

function normalizeText(value: unknown) {
  return String(value ?? '').trim();
}

function normalizeKey(value: unknown) {
  return normalizeText(value).toLocaleLowerCase('ru-RU');
}

function getEmbeddedTariffKey(tariffId: string) {
  const separatorIndex = tariffId.indexOf('::');
  return separatorIndex >= 0 ? tariffId.slice(separatorIndex + 2) : '';
}

function parseDurationMinutes(text: string) {
  const normalized = text.replace(',', '.');
  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:h|ч|час)/i);

  if (hourMatch) {
    return Math.max(1, Math.round(Number(hourMatch[1]) * 60));
  }

  if (/\d{1,2}:\d{2}\s*[-–—]\s*\d{1,2}:\d{2}/.test(normalized)) {
    return 480;
  }

  return 60;
}

export function getTariffOptionId(slot: TariffPricingSlot) {
  return `${normalizeText(slot.id)}::${normalizeKey(slot.name)}`;
}

export function getTariffOptions(...groups: Array<TariffPricingSlot[] | undefined>) {
  const options: TariffOption[] = [];
  const seen = new Set<string>();

  groups.flatMap((group) => group ?? []).forEach((slot) => {
    const label = normalizeText(slot.name);
    if (!label) return;

    const key = normalizeKey(label);
    if (seen.has(key)) return;

    seen.add(key);
    const durationText = normalizeText(slot.duration);
    options.push({
      id: getTariffOptionId(slot),
      label,
      duration: parseDurationMinutes(durationText || label),
      durationText,
      fridayWeekendAllDay: Boolean(slot.fridayWeekendAllDay),
      availableUntil: normalizeDateValue(slot.availableUntil),
      noticeLines: normalizeNoticeLines(slot.noticeLines),
      purchaseTimeFrom: normalizeTimeValue(slot.purchaseTimeFrom),
      purchaseTimeTo: normalizeTimeValue(slot.purchaseTimeTo),
    });
  });

  return options;
}

export function normalizeNoticeLines(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(normalizeText).filter(Boolean);
  }

  return normalizeText(value)
    .split(/\r?\n/)
    .map(normalizeText)
    .filter(Boolean);
}

export function normalizeTimeValue(value: unknown) {
  const match = normalizeText(value).match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return '';

  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

export function timeToMinutes(value: unknown, fallback = 0) {
  const normalized = normalizeTimeValue(value);
  if (!normalized) return fallback;

  const [hours = '0', minutes = '0'] = normalized.split(':');
  return Number(hours) * 60 + Number(minutes);
}

export function isFridayWeekendTime(time: unknown, fridayWeekendFrom: string) {
  const normalizedCutoff = normalizeTimeValue(fridayWeekendFrom);
  return normalizedCutoff !== '' && timeToMinutes(time, 0) >= timeToMinutes(normalizedCutoff, 0);
}

export function getTariffNoticeLines(
  options: TariffOption[],
  tariffId: string,
  ...groups: Array<TariffPricingSlot[] | undefined>
) {
  const option = options.find((item) => item.id === tariffId);
  if (option?.noticeLines.length) return option.noticeLines;

  return groups
    .flatMap((group) => group ?? [])
    .map((slot) => normalizeNoticeLines(findPricingSlot([slot], tariffId, options)?.noticeLines))
    .find((lines) => lines.length > 0) ?? [];
}

export function getTariffTimeWindow(
  options: TariffOption[],
  tariffId: string,
  ...groups: Array<TariffPricingSlot[] | undefined>
) {
  const option = options.find((item) => item.id === tariffId);
  if (option && (option.purchaseTimeFrom || option.purchaseTimeTo)) {
    return {
      from: option.purchaseTimeFrom,
      to: option.purchaseTimeTo,
    };
  }

  for (const slot of groups.flatMap((group) => group ?? [])) {
    const matched = findPricingSlot([slot], tariffId, options);
    const from = normalizeTimeValue(matched?.purchaseTimeFrom);
    const to = normalizeTimeValue(matched?.purchaseTimeTo);
    if (from || to) {
      return { from, to };
    }
  }

  return { from: '', to: '' };
}

export function getTariffTimeWindowText(window: { from: string; to: string }) {
  if (window.from && window.to) return `с ${window.from} до ${window.to}`;
  if (window.from) return `с ${window.from}`;
  if (window.to) return `до ${window.to}`;
  return '';
}

export function isTimeOutsideTariffWindow(time: string, window: { from: string; to: string }) {
  const normalizedTime = normalizeTimeValue(time);
  if (!normalizedTime || (!window.from && !window.to)) return false;

  return (window.from !== '' && normalizedTime < window.from)
    || (window.to !== '' && normalizedTime > window.to);
}

export function normalizeDateValue(value: unknown) {
  const text = normalizeText(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : '';
}

export function isDateAfter(date: string, limit: string) {
  const checkedDate = normalizeDateValue(date);
  const checkedLimit = normalizeDateValue(limit);
  return checkedDate !== '' && checkedLimit !== '' && checkedDate > checkedLimit;
}

export function formatDateRu(date: string) {
  const normalized = normalizeDateValue(date);
  if (!normalized) return date;

  const [year, month, day] = normalized.split('-');
  return `${day}.${month}.${year}`;
}

export function getTariffAvailableUntil(
  options: TariffOption[],
  tariffId: string,
  ...groups: Array<TariffPricingSlot[] | undefined>
) {
  const option = options.find((item) => item.id === tariffId);
  if (option?.availableUntil) return option.availableUntil;

  return groups
    .flatMap((group) => group ?? [])
    .map((slot) => findPricingSlot([slot], tariffId, options)?.availableUntil)
    .map(normalizeDateValue)
    .find(Boolean) ?? '';
}

export function isTariffAvailableForDate(
  options: TariffOption[],
  tariffId: string,
  date: string,
  ...groups: Array<TariffPricingSlot[] | undefined>
) {
  const availableUntil = getTariffAvailableUntil(options, tariffId, ...groups);
  return !isDateAfter(date, availableUntil);
}

export function getDefaultTariffId(options: TariffOption[]) {
  return options.find((option) => option.duration >= 480)?.id ?? options[0]?.id ?? '';
}

export function getTariffLabel(options: TariffOption[], tariffId: string) {
  return options.find((option) => option.id === tariffId)?.label ?? '';
}

export function findPricingSlot(
  slots: TariffPricingSlot[],
  tariffId: string,
  options: TariffOption[],
) {
  const option = options.find((item) => item.id === tariffId);
  const optionKey = option ? normalizeKey(option.label) : '';
  const embeddedKey = getEmbeddedTariffKey(tariffId);

  return slots.find((slot) => getTariffOptionId(slot) === tariffId)
    ?? slots.find((slot) => optionKey !== '' && normalizeKey(slot.name) === optionKey)
    ?? slots.find((slot) => embeddedKey !== '' && normalizeKey(slot.name) === embeddedKey)
    ?? slots.find((slot) => normalizeText(slot.id) === tariffId)
    ?? null;
}

export function tariffUsesFridayWeekendAllDay(
  options: TariffOption[],
  tariffId: string,
  ...groups: Array<TariffPricingSlot[] | undefined>
) {
  const option = options.find((item) => item.id === tariffId);
  if (option?.fridayWeekendAllDay) return true;

  return groups
    .flatMap((group) => group ?? [])
    .some((slot) => findPricingSlot([slot], tariffId, options)?.fridayWeekendAllDay);
}
