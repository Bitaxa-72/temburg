export interface TariffPricingSlot {
  id: string | number;
  name: string;
  duration?: string;
  adultPrice: number;
  childPrice: number;
  fridayWeekendAllDay?: boolean;
}

export interface TariffOption {
  id: string;
  label: string;
  duration: number;
  durationText: string;
  fridayWeekendAllDay?: boolean;
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
    });
  });

  return options;
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
