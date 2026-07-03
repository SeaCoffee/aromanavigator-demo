// frontend/src/app/utils/dateFormatUtils.ts

type FormatDateOptions = {
  fallback?: string;
  locale?: string;
  dateStyle?: Intl.DateTimeFormatOptions['dateStyle'];
  timeStyle?: Intl.DateTimeFormatOptions['timeStyle'];
};

export function formatDateTime(
  value: string | null | undefined,
  {
    fallback = 'вЂ”',
    locale = 'uk-UA',
    dateStyle = 'medium',
    timeStyle = 'short',
  }: FormatDateOptions = {},
) {
  if (!value) {
    return fallback;
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle,
      timeStyle,
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatShortDateTime(value: string | null | undefined) {
  return formatDateTime(value, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function formatActivityDate(value: string): string {
  return new Date(value).toLocaleString('uk-UA', {
    timeZone: 'Europe/Kyiv',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
