export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['вЂ™"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9Р°-СЏС–С—С”Т‘С‘]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
