import React, { type FC } from "react";
import type { IconType } from "react-icons";
import * as FaIcons from "react-icons/fa6";
/* 🎯 TAILORED FIX: උඹේ සයිට් එකේ Share සහ Social කම්පෝනන්ට්ස් වල IoLogo... අයිකන 100%ක්ම 
   වැඩ කරන්න නම් io5 ලයිබ්‍රරි එක අනිවාර්යයෙන්ම මෙතැනට Import වෙන්න ඕනේ! */
import * as Io5Icons from "react-icons/io5";

type IconMap = Record<string, IconType>;

interface IDynamicIcon extends React.SVGProps<SVGSVGElement> {
  icon: string;
  className?: string;
}

// 👑 OPTIMIZED LIBRARIES MAP:
// සයිට් එකේ ස්පීඩ් එක (Performance) උපරිමව තියාගන්න පාවිච්චි කරන ලයිබ්‍රරි විතරක් සක්‍රීය කළා.
const iconLibraries: { [key: string]: IconMap } = {
  fa: FaIcons,
  io: Io5Icons, // IoLogoFacebook වගේ ඒවා 'io' කී එකෙන් අඳුරගන්නවා.
};

const DynamicIcon: FC<IDynamicIcon> = ({ icon, className, ...props }) => {
  const IconLibrary = getIconLibrary(icon);
  const Icon = IconLibrary ? IconLibrary[icon] : undefined;

  if (!Icon) {
    /* 🎯 CONTRAST & SEO FIX: අයිකන් එකක් නැති වුණොත් වැටෙන ටෙක්ස්ට් එක කළු පසුබිමට 
       කැපී පෙනෙන්න text-rose-500 (රතු/රෝස) කරලා, SEO වලට අහුවෙන්න font-medium කළා */
    return <span className={`text-xs font-medium text-rose-500 select-none ${className || ""}`}>Icon not found</span>;
  }

  // 🎯 SEARCH ICON LOOK ENHANCEMENT: 
  // සර්ච් අයිකන් එක (IoSearch හෝ IoSearchOutline) මේක හරහා රෙන්ඩර් වෙද්දී කලු පසුබිමේ සුපිරියටම කැපී පේන්න
  // ප්‍රිමියම් Teal ග්ලෝ එකක් සහ ස්මූත් ට්‍රාන්සිෂන් ක්ලාස් ටිකක් ඔටෝමැටිකව එකතු කරනවා.
  const isSearchIcon = icon.toLowerCase().includes("search");
  const enhancedClassName = `${className || ""} ${
    isSearchIcon 
      ? "text-[#01AD9F] filter drop-shadow-[0_0_6px_rgba(1,173,159,0.4)] transition-all duration-300 hover:scale-110" 
      : ""
  }`;

  return (
    <Icon 
      className={enhancedClassName} 
      /* 👑 SEO ACCESSIBILITY: අයිකන් එකක් කියවද්දී Layout Shift එකක් නොවී, 
         Google Spider එකට පිරිසිදුව SVG එකක් බව հඟවන්න aria-hidden එකක් දැම්මා */
      aria-hidden="true" 
      {...props} 
    />
  );
};

const getIconLibrary = (icon: string): IconMap | undefined => {
  if (!icon) return undefined;
  // ඉස්සරහ කෑලි දෙක (fa හෝ io) කුඩා අකුරට හරවා ලයිබ්‍රරි එක තෝරාගැනීම
  const libraryKey = icon.substring(0, 2).toLowerCase();
  return iconLibraries[libraryKey];
};

export default DynamicIcon;
