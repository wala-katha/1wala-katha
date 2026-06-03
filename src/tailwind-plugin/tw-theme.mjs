// 📄 src/tailwind-plugin/tw-theme.mjs (100% FIXED FOR RICH BLACK)
// Https://github.com/wala-katha/1wala-katha/blob/main/src/tailwind-plugin/tw-theme.mjs

import plugin from "tailwindcss/plugin";
import themeConfig from "../config/theme.json";

// Helper to extract a clean font name.
const findFont = (fontStr) =>
  fontStr.replace(/\+/g, " ").replace(/:[^:]+/g, "");

// Set font families dynamically, filtering out 'type' keys
const fontFamilies = Object.entries(themeConfig.fonts.font_family)
  .filter(([key]) => !key.includes("type"))
  .reduce((acc, [key, font]) => {
    acc[key] =
      `${findFont(font)}, ${themeConfig.fonts.font_family[`${key}_type`] || "sans-serif"}`;
    return acc;
  }, {});

// ============================================================
// 👑 PREMIUM DARKMODE INTEGRATION (HARDCODED FOR RICH BLACK)
// ============================================================
// 🎯 FIXED: defaultColorGroups එකේ අගයන් config එකෙන් (theme.json) නොගෙන, 
// මම කෙලින්ම මෙතනට Rich Black සහ Light Text එකක් දැම්මා. 
// එතකොට සයිට් එකේ සාමාන්‍ය Light පසුබිම Rich Black වෙනවා, අකුරු සුදු වෙනවා.

const hardcodedDefaultColors = {
  theme_color: {
    body: "#010203",       // 🎯 Rich Black Background
    theme_light: "#010203", // 🎯 All Theme Light Areas are also Rich Black
    primary: "#00b5b5",     // Primary Cyan
    dark: "#ffffff",        // 🎯 Headings (Dark) are now White for contrast
    border: "#333333",      // Slightly lighter border
  },
  text_color: {
    text: "#b0b3b8",        // 🎯 Regular text is now light gray for contrast
    dark: "#ffffff",        // 🎯 Text dark is White
    light: "#010203",       // (Inverted for logical reasons)
  }
};

const defaultColorGroups = [
  { colors: hardcodedDefaultColors.theme_color, prefix: "" },
  { colors: hardcodedDefaultColors.text_color, prefix: "" },
];

// Darkmode කෑල්ල ඒ විදිහටම config එකෙන් එන්න ඉඩ දුන්නා (සාමාන්‍යයෙන් color.json හෝ theme.json වලින්)
const darkColorGroups = [];
if (themeConfig.colors.darkmode?.theme_color) {
  darkColorGroups.push({
    colors: themeConfig.colors.darkmode.theme_color,
    prefix: "darkmode-",
  });
}
if (themeConfig.colors.darkmode?.text_color) {
  darkColorGroups.push({
    colors: themeConfig.colors.darkmode.text_color,
    prefix: "darkmode-",
  });
}

const getVars = (groups) => {
  const vars = {};
  groups.forEach(({ colors, prefix }) => {
    Object.entries(colors).forEach(([k, v]) => {
      const cssKey = k.replace(/_/g, "-");
      vars[`--color-${prefix}${cssKey}`] = v;
    });
  });
  return vars;
};

const defaultVars = getVars(defaultColorGroups);
const darkVars = getVars(darkColorGroups);

const baseSize = Number(themeConfig.fonts.font_size.base);
const scale = Number(themeConfig.fonts.font_size.scale);
const calculateFontSizes = (base, scale) => {
  const sizes = {};
  let currentSize = scale;
  for (let i = 6; i >= 1; i--) {
    sizes[`h${i}`] = `${currentSize}rem`;
    sizes[`h${i}-sm`] = `${currentSize * 0.8}rem`;
    currentSize *= scale;
  }
  sizes.base = `${base}px`;
  sizes["base-sm"] = `${base * 0.8}px`;
  return sizes;
};
const fontSizes = calculateFontSizes(baseSize, scale);

const fontVars = {};
Object.entries(fontSizes).forEach(([key, value]) => {
  fontVars[`--text-${key}`] = value;
});
Object.entries(fontFamilies).forEach(([key, font]) => {
  fontVars[`--font-${key}`] = font;
});

const baseVars = { ...fontVars, ...defaultVars };

// Build a colorsMap including both sets
const colorsMap = {};
[...defaultColorGroups, ...darkColorGroups].forEach(({ colors, prefix }) => {
  Object.entries(colors).forEach(([key]) => {
    const cssKey = key.replace(/_/g, "-");
    colorsMap[prefix + cssKey] = `var(--color-${prefix}${cssKey})`;
  });
});

module.exports = plugin.withOptions(() => {
  return function ({ addBase, addUtilities, matchUtilities }) {
    // Default vars on :root (This will now be Rich Black); dark vars on .dark
    addBase({
      ":root": baseVars,
      ".dark": darkVars,
    });

    const fontUtils = {};
    Object.keys(fontFamilies).forEach((key) => {
      fontUtils[`.font-${key}`] = { fontFamily: `var(--font-${key})` };
    });
    Object.keys(fontSizes).forEach((key) => {
      fontUtils[`.text-${key}`] = { fontSize: `var(--text-${key})` };
    });
    addUtilities(fontUtils, {
      variants: ["responsive", "hover", "focus", "active", "disabled"],
    });

    matchUtilities(
      {
        bg: (value) => ({ backgroundColor: value }),
        text: (value) => ({ color: value }),
        border: (value) => ({ borderColor: value }),
        fill: (value) => ({ fill: value }),
        stroke: (value) => ({ stroke: value }),
      },
      { values: colorsMap, type: "color" },
    );

    matchUtilities(
      {
        from: (value) => ({
          "--tw-gradient-from": value,
          "--tw-gradient-via-stops":
            "var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))",
          "--tw-gradient-stops":
            "var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))",
        }),
        to: (value) => ({
          "--tw-gradient-to": value,
          "--tw-gradient-via-stops":
            "var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))",
          "--tw-gradient-stops":
            "var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))",
        }),
        via: (value) => ({
          "--tw-gradient-via": value,
          "--tw-gradient-via-stops":
            "var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-via) var(--tw-gradient-via-position), var(--tw-gradient-to) var(--tw-gradient-to-position)",
        }),
      },
      { values: colorsMap, type: "color" },
    );
  };
});
