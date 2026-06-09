import { format, isValid } from "date-fns";

/**
 * Astro වෙබ් අඩවිය සඳහා කළු පසුබිමට සහ SEO වලට ගැළපෙන පරිදි 
 * දිනය කොටස් වශයෙන් ලබා දෙන ශ්‍රිතය.
 * දිනය වැරදි හෝ නොමැති නම් ස්වයංක්‍රීයව අද දිනය (Current Date) ලබා ගනී.
 */
const dateFormat = (date: Date | string) => {
  let dateObj: Date;

  // 1. දිනයක් ලබා දී නොමැති නම් හෝ හිස් නම්, ස්වයංක්‍රීයව අද දිනය (Current Date) ලබා ගනී
  if (!date) {
    dateObj = new Date();
  } else {
    dateObj = typeof date === "string" ? new Date(date) : date;
  }

  // 2. ලබා දුන් දිනය වලංගු නොවේ නම් (Invalid Date), එයද ස්වයංක්‍රීයව අද දිනයට හැරවේ
  if (!isValid(dateObj)) {
    dateObj = new Date();
  }

  // කළු පසුබිමක වෙන වෙනම ඉස්මතු කිරීමට සහ SEO සඳහා දත්ත සකස් කිරීම
  return {
    day: format(dateObj, "dd"),          // උදා: "09"
    month: format(dateObj, "MMM"),       // උදා: "Jun"
    year: format(dateObj, "yyyy"),       // උදා: "2026"
    isoString: dateObj.toISOString(),    // SEO (Google Bot) සඳහා: "2026-06-09T02:30:00.000Z"
  };
};

export default dateFormat;
