// Makes a Prism theme readable on a given code background: every token color that
// doesn't reach WCAG AA (4.5:1) gets its lightness adjusted, keeping its hue.
// Used by createConfig for the code block themes.

const MIN_CONTRAST = 4.5;

function withContrast(theme, backgroundColor) {
  const bg = parseColor(backgroundColor);
  const fix = (color) => {
    const c = color && parseColor(color);
    return c ? toHex(ensureContrast(c, bg)) : color;
  };
  return {
    ...theme,
    plain: { ...theme.plain, backgroundColor, color: fix(theme.plain.color) },
    styles: theme.styles.map((s) => ({
      ...s,
      style: s.style.color ? { ...s.style, color: fix(s.style.color) } : s.style,
    })),
  };
}

function ensureContrast(rgb, bg) {
  if (contrast(rgb, bg) >= MIN_CONTRAST) return rgb;
  const [h, s, l] = rgbToHsl(rgb);
  const darken = luminance(bg) > 0.5;
  for (let step = 1; step <= 100; step++) {
    const next = hslToRgb([h, s, Math.min(1, Math.max(0, l + (darken ? -step : step) / 100))]);
    if (contrast(next, bg) >= MIN_CONTRAST) return next;
  }
  return darken ? [0, 0, 0] : [255, 255, 255];
}

function parseColor(value) {
  const v = value.trim().toLowerCase();
  if (v.startsWith('#')) {
    const hex = v.length === 4 ? v.replace(/[0-9a-f]/g, (c) => c + c) : v;
    return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  }
  const nums = (v.match(/[\d.]+/g) || []).map(Number);
  if (v.startsWith('rgb')) return nums.slice(0, 3);
  if (v.startsWith('hsl')) return hslToRgb([nums[0], nums[1] / 100, nums[2] / 100]);
  return null; // named colors etc. are left as they are
}

function luminance([r, g, b]) {
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function rgbToHsl([r, g, b]) {
  [r, g, b] = [r / 255, g / 255, b / 255];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb([h, s, l]) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
}

function toHex(rgb) {
  return '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
}

module.exports = { withContrast, contrast, parseColor };
