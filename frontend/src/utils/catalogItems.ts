export function catalogKey(...parts: Array<string | number | null | undefined>) {
  return parts
    .map((part) => String(part ?? '').trim().toLowerCase())
    .filter(Boolean)
    .map((part) => part
      .replace(/ё/g, 'е')
      .replace(/[^a-zа-я0-9]+/gi, '-')
      .replace(/^-+|-+$/g, ''))
    .filter(Boolean)
    .join('.');
}

export function catalogSourceId(value: string | number | null | undefined) {
  return String(value ?? '').trim();
}
