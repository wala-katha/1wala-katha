import { format } from "date-fns";

const dateFormat = (
  date: Date | string,
  pattern: string = "dd MMM, yyyy",
): string => {
  const dateObj = new Date(date);
  
  // දවස, මාසය සහ අවුරුද්ද වෙන වෙනම Format කර ගැනීම
  const day = format(dateObj, "dd");
  const month = format(dateObj, "MMM");
  const year = format(dateObj, "yyyy");

  // කළු පසුබිමක මාසය සහ දවස ඉස්මතු වන ලෙස HTML structure එකක් දීම
  // (මෙහි දෙන CSS classes ඔබේ Tailwind හෝ CSS වලට අනුව සකසා ගන්න)
  return `<span class="text-amber-400 font-bold">${day}</span> <span class="text-slate-200">${month}</span>, <span class="text-slate-400 text-sm">${year}</span>`;
};

export default dateFormat;
