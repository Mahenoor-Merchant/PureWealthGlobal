import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Support converting oklch(...) and oklab(...) to rgb(...) / rgba(...) to prevent html2canvas crashes in Tailwind v4
const colorPropRegex = /color|fill|stroke|background/i;
let tempDiv: HTMLDivElement | null = null;
const cache = new Map<string, string>();

function parseOklchOrOklab(str: string) {
  const match = str.match(/(oklch|oklab)\s*\(([^)]+)\)/i);
  if (!match) return null;
  const type = match[1].toLowerCase() as 'oklch' | 'oklab';
  const partsStr = match[2].trim();
  
  const slashIndex = partsStr.indexOf('/');
  let alpha = 1;
  let mainPartsStr = partsStr;
  if (slashIndex !== -1) {
    mainPartsStr = partsStr.substring(0, slashIndex).trim();
    const alphaStr = partsStr.substring(slashIndex + 1).trim();
    if (alphaStr.endsWith('%')) {
      alpha = parseFloat(alphaStr) / 100;
    } else {
      alpha = parseFloat(alphaStr);
    }
  }
  
  const rawParts = mainPartsStr.split(/[\s,]+/).filter(Boolean);
  if (rawParts.length < 3) return null;
  
  // Parse lightness L
  let l = parseFloat(rawParts[0]);
  if (rawParts[0].endsWith('%')) {
    l = l / 100;
  }
  
  // Parse C or a
  let c = parseFloat(rawParts[1]);
  if (rawParts[1].endsWith('%')) {
    // For oklch, chroma percentage 100% is 0.4. For oklab, a percentage 100% is 0.4.
    c = (c / 100) * 0.4;
  }
  
  // Parse H or b
  let h = parseFloat(rawParts[2]);
  if (rawParts[2].endsWith('%')) {
    if (type === 'oklab') {
      h = (h / 100) * 0.4;
    } else {
      h = (h / 100) * 360;
    }
  } else if (rawParts[2].endsWith('deg')) {
    h = parseFloat(rawParts[2]);
  } else if (rawParts[2].endsWith('rad')) {
    h = (parseFloat(rawParts[2]) * 180) / Math.PI;
  }
  
  return {
    type,
    l,
    c,
    h,
    a: isNaN(alpha) ? 1 : alpha
  };
}

function oklabToRgb(L: number, a: number, b: number, alpha: number): string {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855414 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bVal = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const gamma = (c: number) => {
    if (c <= 0.0031308) return 12.92 * c;
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };

  const R = Math.round(Math.min(1, Math.max(0, gamma(r))) * 255);
  const G = Math.round(Math.min(1, Math.max(0, gamma(g))) * 255);
  const B = Math.round(Math.min(1, Math.max(0, gamma(bVal))) * 255);

  if (alpha === 1) {
    return `rgb(${R}, ${G}, ${B})`;
  } else {
    return `rgba(${R}, ${G}, ${B}, ${alpha})`;
  }
}

function oklchToRgb(L: number, C: number, H: number, alpha: number): string {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  return oklabToRgb(L, a, b, alpha);
}

function convertModernColorsToRgb(cssText: string): string {
  const colorRegex = /(oklch|oklab)\([^)]+\)/g;
  
  if (!tempDiv && typeof document !== 'undefined' && document.body) {
    tempDiv = document.createElement('div');
    tempDiv.style.display = 'none';
    tempDiv.id = 'oklch-temp-converter';
    document.body.appendChild(tempDiv);
  }

  return cssText.replace(colorRegex, (match) => {
    if (cache.has(match)) {
      return cache.get(match)!;
    }

    // 1. Try native browser resolution first
    if (tempDiv) {
      try {
        tempDiv.style.color = '';
        tempDiv.style.color = match;
        const resolved = originalGetComputedStyle(tempDiv).color;
        if (resolved && resolved !== 'rgb(0, 0, 0)' && !resolved.startsWith('oklch') && !resolved.startsWith('oklab')) {
          cache.set(match, resolved);
          return resolved;
        }
      } catch (e) {
        // ignore
      }
    }

    // 2. JS mathematical parsing & conversion (for older or headless environments)
    try {
      const parsed = parseOklchOrOklab(match);
      if (parsed) {
        const rgbVal = parsed.type === 'oklch'
          ? oklchToRgb(parsed.l, parsed.c, parsed.h, parsed.a)
          : oklabToRgb(parsed.l, parsed.c, parsed.h, parsed.a);
        cache.set(match, rgbVal);
        return rgbVal;
      }
    } catch (e) {
      // ignore
    }

    // 3. Simple static fallback values
    if (match.includes('white') || match.includes('1 0 0')) return 'rgb(255, 255, 255)';
    if (match.includes('black') || match.includes('0 0 0')) return 'rgb(0, 0, 0)';
    return 'rgb(99, 102, 241)'; 
  });
}

const originalGetComputedStyle = window.getComputedStyle;
(window as any).getComputedStyle = function(element: Element, pseudoElt?: string) {
  const style = originalGetComputedStyle(element, pseudoElt);
  return new Proxy(style, {
    get(target, prop, receiver) {
      if (prop === 'getPropertyValue') {
        return function(propertyName: string) {
          const value = target.getPropertyValue(propertyName);
          if (typeof value === 'string' && colorPropRegex.test(propertyName) && (value.includes('oklch') || value.includes('oklab'))) {
            return convertModernColorsToRgb(value);
          }
          return value;
        };
      }
      
      const value = (target as any)[prop];
      if (typeof prop === 'string' && colorPropRegex.test(prop) && typeof value === 'string' && (value.includes('oklch') || value.includes('oklab'))) {
        return convertModernColorsToRgb(value);
      }
      
      if (typeof value === 'function') {
        return value.bind(target);
      }
      return value;
    }
  });
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

