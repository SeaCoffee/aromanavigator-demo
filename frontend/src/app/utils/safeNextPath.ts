export function safeNextPath(value: string | null | undefined, fallback = '/') {
  if (!value) return fallback;

  const raw = value.trim();

  if (!raw.startsWith('/')) return fallback;
  if (raw.startsWith('//')) return fallback;
  if (raw.includes('\\') || /[\u0000-\u001F\u007F]/.test(raw)) return fallback;

  let parsed: URL;

  try {
    parsed = new URL(raw, 'https://local.invalid');
  } catch {
    return fallback;
  }

  if (parsed.origin !== 'https://local.invalid') return fallback;
  if (parsed.pathname.toLowerCase().startsWith('/api/')) return fallback;

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
