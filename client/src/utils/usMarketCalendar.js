// US market (NYSE) trading-day helpers for payout date calculations.
// Excludes weekends + common NYSE holiday closures.

function pad2(n) {
  return String(n).padStart(2, '0');
}

function ymdUTC(date) {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

function toUTCDateOnly(dateLike) {
  // Important: JS parses "YYYY-MM-DD" as UTC midnight, which can shift the *local* date.
  // Treat date-only strings as local calendar dates.
  if (typeof dateLike === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateLike)) {
    const [y, m, d] = dateLike.split('-').map((x) => Number(x));
    return new Date(Date.UTC(y, m - 1, d));
  }
  const d = new Date(dateLike);
  // Use UTC components so UTC date-only values remain stable across conversions.
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function isWeekendUTC(d) {
  const day = d.getUTCDay(); // 0 Sun ... 6 Sat
  return day === 0 || day === 6;
}

function observedIfWeekendUTC(d) {
  // If holiday is on Sat -> observed Fri; if on Sun -> observed Mon.
  const day = d.getUTCDay();
  const obs = new Date(d);
  if (day === 6) obs.setUTCDate(obs.getUTCDate() - 1);
  if (day === 0) obs.setUTCDate(obs.getUTCDate() + 1);
  return obs;
}

function nthWeekdayOfMonthUTC(year, monthIndex0, weekday0Sun, nth) {
  // monthIndex0: 0=Jan
  const first = new Date(Date.UTC(year, monthIndex0, 1));
  const firstDay = first.getUTCDay();
  const delta = (weekday0Sun - firstDay + 7) % 7;
  const day = 1 + delta + (nth - 1) * 7;
  return new Date(Date.UTC(year, monthIndex0, day));
}

function lastWeekdayOfMonthUTC(year, monthIndex0, weekday0Sun) {
  // Start at last day of month and walk backward.
  const last = new Date(Date.UTC(year, monthIndex0 + 1, 0));
  while (last.getUTCDay() !== weekday0Sun) {
    last.setUTCDate(last.getUTCDate() - 1);
  }
  return last;
}

function easterSundayUTC(year) {
  // Anonymous Gregorian algorithm (Meeus/Jones/Butcher)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=March, 4=April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function goodFridayUTC(year) {
  const easter = easterSundayUTC(year);
  const gf = new Date(easter);
  gf.setUTCDate(gf.getUTCDate() - 2);
  return gf;
}

function nyseHolidaysUTC(year) {
  const holidays = [];

  // New Year's Day (Jan 1)
  holidays.push(observedIfWeekendUTC(new Date(Date.UTC(year, 0, 1))));

  // Martin Luther King Jr. Day (3rd Monday in January)
  holidays.push(nthWeekdayOfMonthUTC(year, 0, 1, 3));

  // Washington's Birthday / Presidents Day (3rd Monday in February)
  holidays.push(nthWeekdayOfMonthUTC(year, 1, 1, 3));

  // Good Friday
  holidays.push(goodFridayUTC(year));

  // Memorial Day (last Monday in May)
  holidays.push(lastWeekdayOfMonthUTC(year, 4, 1));

  // Juneteenth National Independence Day (Jun 19)
  holidays.push(observedIfWeekendUTC(new Date(Date.UTC(year, 5, 19))));

  // Independence Day (Jul 4)
  holidays.push(observedIfWeekendUTC(new Date(Date.UTC(year, 6, 4))));

  // Labor Day (1st Monday in September)
  holidays.push(nthWeekdayOfMonthUTC(year, 8, 1, 1));

  // Thanksgiving Day (4th Thursday in November)
  holidays.push(nthWeekdayOfMonthUTC(year, 10, 4, 4));

  // Christmas Day (Dec 25)
  holidays.push(observedIfWeekendUTC(new Date(Date.UTC(year, 11, 25))));

  // Normalize to date-only UTC
  return holidays.map((d) => toUTCDateOnly(d));
}

const holidayCache = new Map(); // year -> Set('YYYY-MM-DD')

export function getNyseHolidaySetUTC(year) {
  if (holidayCache.has(year)) return holidayCache.get(year);
  const set = new Set(nyseHolidaysUTC(year).map(ymdUTC));
  holidayCache.set(year, set);
  return set;
}

export function isUsMarketHoliday(dateLike) {
  const d = toUTCDateOnly(dateLike);
  const set = getNyseHolidaySetUTC(d.getUTCFullYear());
  return set.has(ymdUTC(d));
}

export function isUsTradingDay(dateLike) {
  const d = toUTCDateOnly(dateLike);
  if (isWeekendUTC(d)) return false;
  if (isUsMarketHoliday(d)) return false;
  return true;
}

export function nextUsTradingDay(dateLike) {
  let d = toUTCDateOnly(dateLike);
  while (!isUsTradingDay(d)) {
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return d;
}

/**
 * Adds N US trading days, optionally counting the start day as day 1 if it is a trading day.
 * @param {Date|string} startDateLike
 * @param {number} tradingDaysRequired e.g. 15
 * @param {{ includeStart?: boolean }} opts
 * @returns {Date} UTC date-only
 */
export function addUsTradingDays(startDateLike, tradingDaysRequired, opts = {}) {
  const includeStart = opts.includeStart !== false;
  let d = toUTCDateOnly(startDateLike);

  let remaining = Math.max(0, Math.floor(Number(tradingDaysRequired) || 0));
  if (remaining === 0) return d;

  // If includeStart and the start day is a trading day, count it as day 1.
  if (includeStart) {
    d = nextUsTradingDay(d);
    remaining -= 1;
  } else {
    // Move to the next trading day before counting
    d.setUTCDate(d.getUTCDate() + 1);
    d = nextUsTradingDay(d);
  }

  while (remaining > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    d = nextUsTradingDay(d);
    remaining -= 1;
  }

  return d;
}


