const SPANISH_SHORT_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const SPANISH_MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * Returns today's date as 'YYYY-MM-DD'.
 */
export function getTodayStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a 'YYYY-MM-DD' string into a local Date (no UTC offset shift).
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a 'YYYY-MM-DD' string as 'Lun 15', 'Mar 16', etc.
 */
export function formatDateDisplay(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const dayName = SPANISH_SHORT_DAYS[date.getDay()];
  return `${dayName} ${date.getDate()}`;
}

/**
 * Returns an array of the last 7 days (inclusive of today) as 'YYYY-MM-DD' strings,
 * ordered from 6 days ago to today.
 */
export function getWeekDays(referenceDate?: string): string[] {
  const ref = referenceDate ? parseLocalDate(referenceDate) : new Date();
  const result: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    result.push(`${year}-${month}-${day}`);
  }
  return result;
}

/**
 * Returns the Spanish short name for the day of week ('Lun', 'Mar', etc.).
 */
export function getDayOfWeek(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return SPANISH_SHORT_DAYS[date.getDay()];
}

/**
 * Returns the numeric day of the month (1-31).
 */
export function getDayNumber(dateStr: string): number {
  return parseLocalDate(dateStr).getDate();
}

/**
 * Returns true if the given date string is today.
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayStr();
}

/**
 * Returns the number of days between two 'YYYY-MM-DD' strings.
 * Always returns a positive value.
 */
export function daysBetween(a: string, b: string): number {
  const dateA = parseLocalDate(a);
  const dateB = parseLocalDate(b);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.abs(Math.round((dateA.getTime() - dateB.getTime()) / msPerDay));
}

/**
 * Returns the Spanish month name for the given 'YYYY-MM-DD' string.
 */
export function getMonthName(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return SPANISH_MONTHS[date.getMonth()];
}

/**
 * Formats a 'HH:MM' time string as '8:00 AM' or '3:30 PM'.
 */
export function formatTime(timeStr: string): string {
  const [hourStr, minuteStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? '00';
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute} ${period}`;
}
