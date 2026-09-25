/**
 * Accurate Jalali (Solar Hijri) calendar calculation and conversion engine
 * Standard astronomical algorithm for Persian calendar
 */

export const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

export const PERSIAN_WEEKDAYS = [
  'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'
];

export const PERSIAN_WEEKDAYS_SHORT = [
  'ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'
];

/**
 * Checks if a Jalali year is leap year (کبیسه)
 */
export function isJalaliLeapYear(jy) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  let bl = breaks.length;
  let jp = breaks[0];
  let jm;
  let jump = 0;
  let n;

  if (jy < jp || jy >= breaks[bl - 1]) {
    throw new Error('Invalid Jalali year ' + jy);
  }

  for (let i = 1; i < bl; i += 1) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    jp = jm;
  }
  n = jy - jp;

  if (jump - n < 6) n = n - jump + ((jump + 4) >> 2) * 33;
  let leap = ((n + 1) % 33) - 1;
  if (leap === -1) leap = 4;

  return leap % 4 === 0;
}

/**
 * Returns number of days in a given Jalali month (1-12)
 */
export function getJalaliMonthDays(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeapYear(jy) ? 30 : 29;
}

/**
 * Converts Gregorian date to Jalali date
 */
export function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy;
  let gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
  jy = -1595 + (33 * Math.floor(days / 12053));
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let jm, jd;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }

  return { jy, jm, jd };
}

/**
 * Converts Jalali date to Gregorian date
 */
export function jalaliToGregorian(jy, jm, jd) {
  let gy = jy + 621;
  let breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  let bl = breaks.length;
  let jp = breaks[0];
  let jmBreak;
  let jump = 0;

  for (let i = 1; i < bl; i += 1) {
    jmBreak = breaks[i];
    jump = jmBreak - jp;
    if (jy < jmBreak) break;
    jp = jmBreak;
  }
  let n = jy - jp;

  let leapJ = ((n + 1) % 33) - 1;
  if (leapJ === -1) leapJ = 4;

  let days = (jy - 979) * 365 + Math.floor((jy - 979) / 33) * 8 + Math.floor(((jy - 979) % 33 + 3) / 4) + 78;
  if (jm < 7) {
    days += (jm - 1) * 31;
  } else {
    days += ((jm - 7) * 30) + 186;
  }
  days += jd - 1;

  let g_day_no = days + 1605373;
  let g_d_m = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  let l = g_day_no + 68569;
  let nGreg = Math.floor((4 * l) / 146097);
  l = l - Math.floor((146097 * nGreg + 3) / 4);
  let i = Math.floor((4000 * (l + 1)) / 1461001);
  l = l - Math.floor((1461 * i) / 4) + 31;
  let j = Math.floor((80 * l) / 2447);
  let gd = l - Math.floor((2447 * j) / 80);
  l = Math.floor(j / 11);
  let gm = j + 2 - 12 * l;
  let gyResult = 100 * (nGreg - 49) + i + l;

  return { gy: gyResult, gm, gd };
}

/**
 * Gets today's Jalali date object {jy, jm, jd}
 */
export function getTodayJalali() {
  const now = new Date();
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/**
 * Formats a Jalali date string as YYYY/MM/DD
 */
export function formatJalaliString(jy, jm, jd) {
  const m = String(jm).padStart(2, '0');
  const d = String(jd).padStart(2, '0');
  return `${jy}/${m}/${d}`;
}

/**
 * Gets today's Jalali date as string "YYYY/MM/DD"
 */
export function getTodayJalaliString() {
  const { jy, jm, jd } = getTodayJalali();
  return formatJalaliString(jy, jm, jd);
}

/**
 * Formats date into full Persian readable string, e.g. "شنبه، ۵ مهر ۱۴۰۵"
 */
export function formatFullPersianDate(dateStringOrObj) {
  let jy, jm, jd;
  if (typeof dateStringOrObj === 'string') {
    const parts = dateStringOrObj.split('/');
    if (parts.length === 3) {
      jy = parseInt(parts[0], 10);
      jm = parseInt(parts[1], 10);
      jd = parseInt(parts[2], 10);
    } else {
      const today = getTodayJalali();
      jy = today.jy;
      jm = today.jm;
      jd = today.jd;
    }
  } else if (dateStringOrObj && dateStringOrObj.jy) {
    jy = dateStringOrObj.jy;
    jm = dateStringOrObj.jm;
    jd = dateStringOrObj.jd;
  } else {
    const today = getTodayJalali();
    jy = today.jy;
    jm = today.jm;
    jd = today.jd;
  }

  // Get day of week from corresponding Gregorian date
  const g = jalaliToGregorian(jy, jm, jd);
  const gDate = new Date(g.gy, g.gm - 1, g.gd);
  const dayIndex = (gDate.getDay() + 1) % 7; // Sunday is 0 -> 1, Saturday is 6 -> 0
  const weekday = PERSIAN_WEEKDAYS[dayIndex];
  const monthName = PERSIAN_MONTHS[jm - 1] || '';

  return `${weekday}، ${toPersianNumber(jd)} ${monthName} ${toPersianNumber(jy)}`;
}

/**
 * Get weekday name of 1st day of month for calendar grid
 * Returns 0 for Saturday, 1 for Sunday, ..., 6 for Friday
 */
export function getMonthFirstDayWeekday(jy, jm) {
  const g = jalaliToGregorian(jy, jm, 1);
  const gDate = new Date(g.gy, g.gm - 1, g.gd);
  return (gDate.getDay() + 1) % 7;
}

/**
 * Converts English digits to Persian digits
 */
export function toPersianNumber(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

/**
 * Converts Persian and Arabic digits to English digits
 */
export function toEnglishNumber(val) {
  if (val === null || val === undefined || val === '') return '';
  const str = String(val);
  const persianMap = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  return str.replace(/[۰-۹٠-٩]/g, (w) => (persianMap[w] !== undefined ? persianMap[w] : w));
}
