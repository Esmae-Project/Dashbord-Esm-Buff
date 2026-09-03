import { useState, useEffect } from "react";

/* =====================================================
   تبدیل اعداد انگلیسی به فارسی
===================================================== */
function toPersianDigits(str: string): string {
  const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[0-9]/g, (d) => digits[Number(d)]);
}

/* =====================================================
   روزهای هفته به فارسی
===================================================== */
const WEEKDAYS_FARSI = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];

/* =====================================================
   ماه‌های شمسی
===================================================== */
const SHAMSIS_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

/* =====================================================
   تبدیل میلادی به شمسی
===================================================== */
function gregorianToShamsi(
  gy: number,
  gm: number,
  gd: number
): { year: number; month: number; day: number } {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    ~~((gy2 + 3) / 4) -
    ~~((gy2 + 99) / 100) +
    ~~((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * ~~(days / 12053);
  days %= 12053;
  jy += 4 * ~~(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += ~~((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + ~~(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + ~~((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { year: jy, month: jm, day: jd };
}

/* =====================================================
   کامپوننت ساعت
===================================================== */
export default function PersianClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ساعت ایران
  const tehranTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Tehran" })
  );
  const hours = tehranTime.getHours();
  const minutes = tehranTime.getMinutes();
  const seconds = tehranTime.getSeconds();

  // تاریخ شمسی
  const shamsi = gregorianToShamsi(
    tehranTime.getFullYear(),
    tehranTime.getMonth() + 1,
    tehranTime.getDate()
  );

  const weekday = WEEKDAYS_FARSI[tehranTime.getDay()];
  const month = SHAMSIS_MONTHS[shamsi.month - 1];

  // رنگ ثانیه‌ها بر اساس مقدار
  const secColor =
    seconds < 15
      ? "var(--accent-green)"
      : seconds < 30
        ? "var(--accent-gold)"
        : seconds < 45
          ? "var(--accent-blue)"
          : "var(--accent-purple)";

  return (
    <div className="persian-clock">
      <div className="clock-time">
        <span className="clock-hour">{toPersianDigits(String(hours).padStart(2, "0"))}</span>
        <span className="clock-sep" style={{ opacity: seconds % 2 === 0 ? 1 : 0.3 }}>:</span>
        <span className="clock-minute">{toPersianDigits(String(minutes).padStart(2, "0"))}</span>
        <span className="clock-second" style={{ color: secColor }}>
          {toPersianDigits(String(seconds).padStart(2, "0"))}
        </span>
      </div>
      <div className="clock-date">
        <span className="clock-weekday">{weekday}</span>
        <span className="clock-dot">•</span>
        <span>
          {toPersianDigits(String(shamsi.day))} {month}{" "}
          {toPersianDigits(String(shamsi.year))}
        </span>
      </div>
    </div>
  );
}
