export const THEMES = {
  mondrian: { name: { en: "Mondrian", ko: "몬드리안" }, accents: ["#C7382E", "#2B3DCB", "#E3B22E"] },
  blue:     { name: { en: "Blue", ko: "블루" }, accents: ["#2B3DCB", "#2B3DCB", "#2B3DCB"] },
  red:      { name: { en: "Red", ko: "레드" }, accents: ["#C7382E", "#C7382E", "#C7382E"] },
  green:    { name: { en: "Green", ko: "그린" }, accents: ["#1F7A4D", "#1F7A4D", "#1F7A4D"] },
  yellow:   { name: { en: "Yellow", ko: "옐로우" }, accents: ["#E3B22E", "#E3B22E", "#E3B22E"] },
  bw:       { name: { en: "B & W", ko: "블랙앤화이트" }, accents: ["#B9B9B4", "#B9B9B4", "#B9B9B4"] },
};

export function paletteFor(theme, dark) {
  return {
    bg: dark ? "#16150F" : "#F4F0E4",
    ink: dark ? "#F2EDE1" : "#1B1A17",
    accent: THEMES[theme].accents[0],
    accent2: THEMES[theme].accents[1],
    accent3: THEMES[theme].accents[2],
  };
}
