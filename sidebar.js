// Helper: convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Helper: convert RGB to hex
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(c => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')).join('');
}

// Helper: mix two colors in RGB
function mixColors(hex1, hex2, ratio) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    if (!rgb1 || !rgb2) return '#888888';
    const r = rgb1.r + (rgb2.r - rgb1.r) * ratio;
    const g = rgb1.g + (rgb2.g - rgb1.g) * ratio;
    const b = rgb1.b + (rgb2.b - rgb1.b) * ratio;
    return rgbToHex(r, g, b);
}

// Helper: convert RGB to OKLCH
function rgbToOklch(r, g, b) {
    let l = r / 255, a = g / 255, _b = b / 255;
    l = l > 0.04045 ? Math.pow((l + 0.055) / 1.055, 2.4) : l / 12.92;
    a = a > 0.04045 ? Math.pow((a + 0.055) / 1.055, 2.4) : a / 12.92;
    _b = _b > 0.04045 ? Math.pow((_b + 0.055) / 1.055, 2.4) : _b / 12.92;

    const x = l * 0.4124564 + a * 0.3575761 + _b * 0.1804375;
    const y = l * 0.2126729 + a * 0.7151522 + _b * 0.0721750;
    const z = l * 0.0193339 + a * 0.1191920 + _b * 0.9503041;

    const lms = [
        x * 0.4122214708 + y * 0.5363325363 + z * 0.0514459929,
        x * 0.2119034982 + y * 0.6806995451 + z * 0.1073969566,
        x * 0.0883024619 + y * 0.2817188376 + z * 0.6299787005
    ];

    const lms2 = lms.map(c => Math.cbrt(c));
    const L = 0.2104542553 * lms2[0] + 0.7936177850 * lms2[1] - 0.0040720468 * lms2[2];
    const A = 1.9779984951 * lms2[0] - 2.4285922050 * lms2[1] + 0.4505937099 * lms2[2];
    const B = 0.0259040371 * lms2[0] + 0.7827717662 * lms2[1] - 0.8086757660 * lms2[2];

    const C = Math.sqrt(A * A + B * B);
    const H = Math.atan2(B, A) * (180 / Math.PI);
    return { l: L, c: C, h: H < 0 ? H + 360 : H };
}

// Helper: convert OKLCH to RGB
function oklchToRgb(l, c, h) {
    const hRad = h * Math.PI / 180;
    const L = l;
    const A = c * Math.cos(hRad);
    const B = c * Math.sin(hRad);

    const lms = [
        L + 0.3963377774 * A + 0.2158037573 * B,
        L - 0.1055613458 * A - 0.0638541728 * B,
        L - 0.0894841775 * A - 1.2914855480 * B
    ];

    const lms2 = lms.map(c => c * c * c);
    const x = 1.2268798752 * lms2[0] - 0.5578149945 * lms2[1] + 0.2813910450 * lms2[2];
    const y = -0.0405757622 * lms2[0] + 1.1122868030 * lms2[1] - 0.0717110585 * lms2[2];
    const z = -0.0763729493 * lms2[0] - 0.3211777763 * lms2[1] + 1.4226686893 * lms2[2];

    let r = 3.2409699419 * x - 1.5373831776 * y - 0.4986107603 * z;
    let g = -0.9692436363 * x + 1.8759675015 * y + 0.0415550574 * z;
    let b = 0.0556300797 * x - 0.2039769589 * y + 1.0569715142 * z;

    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

    return {
        r: Math.max(0, Math.min(1, r)) * 255,
        g: Math.max(0, Math.min(1, g)) * 255,
        b: Math.max(0, Math.min(1, b)) * 255
    };
}

// Apply system theme to body (for CSS variables, not palette)
function applySystemTheme() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Get localized message
function getMessage(key, substitutions) {
    return chrome.i18n.getMessage(key, substitutions) || key;
}

// Generate semantic colors
function generateSemanticColors(theme) {
    const isDark = theme === 'dark';
    
    const semanticConfig = {
        success: { l: isDark ? 0.60 : 0.50, c: 0.15, h: 140 },
        warning: { l: isDark ? 0.65 : 0.55, c: 0.15, h: 40 },
        error: { l: isDark ? 0.60 : 0.50, c: 0.18, h: 0 },
        info: { l: isDark ? 0.55 : 0.45, c: 0.15, h: 220 }
    };

    const result = {};
    for (const [key, val] of Object.entries(semanticConfig)) {
        const rgbOut = oklchToRgb(val.l, val.c, val.h);
        result[key] = rgbToHex(rgbOut.r, rgbOut.g, rgbOut.b);
    }
    return result;
}

// Generate palette from base color and theme
function generatePalette(baseHex, theme) {
    const rgb = hexToRgb(baseHex);
    if (!rgb) return null;

    const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);
    const isDark = theme === 'dark';

    function getPrimaryValues(baseL, baseC, baseH, dark) {
        const lOffset = dark ? 0.15 : -0.15;
        return {
            primary: { l: baseL, c: baseC, h: baseH },
            primaryHover: { l: Math.max(0.1, Math.min(0.9, baseL + lOffset * 0.6)), c: baseC * 1.1, h: baseH },
            primaryActive: { l: Math.max(0.1, Math.min(0.9, baseL + lOffset * 1.3)), c: baseC * 0.85, h: baseH }
        };
    }

    const primaries = getPrimaryValues(oklch.l, oklch.c, oklch.h, isDark);

    const result = {};

    // Primary always equals base color
    result.primary = baseHex;

    // Primary Hover & Active via OKLCH
    for (const [key, val] of Object.entries(primaries)) {
        if (key === 'primary') continue;
        const rgbOut = oklchToRgb(val.l, val.c, val.h);
        result[key] = rgbToHex(rgbOut.r, rgbOut.g, rgbOut.b);
    }

    // TextSecondary via OKLCH with base hue
    const textSecL = isDark ? 0.65 : 0.42;
    const textSecC = 0.02;
    const textSecH = oklch.h;
    const textSecRgb = oklchToRgb(textSecL, textSecC, textSecH);
    result.textSecondary = rgbToHex(textSecRgb.r, textSecRgb.g, textSecRgb.b);

    // Text - pure black/white
    result.text = isDark ? '#f5f5f5' : '#1a1a1a';

    // Neutral colors via RGB mixing
    if (isDark) {
        result.background = mixColors(baseHex, '#000000', 0.90);
        result.surface = mixColors(baseHex, '#000000', 0.80);
        result.border = mixColors(baseHex, '#000000', 0.45);
    } else {
        result.background = mixColors(baseHex, '#ffffff', 0.95);
        result.surface = mixColors(baseHex, '#ffffff', 0.85);
        result.border = mixColors(baseHex, '#ffffff', 0.30);
    }

    return result;
}

// Generate palette with semantic for export
function generatePaletteWithSemantic(baseHex, theme) {
    const palette = generatePalette(baseHex, theme);
    if (!palette) return null;
    const semantic = generateSemanticColors(theme);
    return { ...palette, ...semantic };
}

// Generate both themes for export
function generateBothThemes(baseHex) {
    const light = generatePaletteWithSemantic(baseHex, 'light');
    const dark = generatePaletteWithSemantic(baseHex, 'dark');
    return { light, dark };
}

// State
let currentBaseColor = '#82A9E8';
let currentTheme = 'light';
let palette = null;

// DOM refs
const hexInput = document.getElementById('baseColorHex');
const pickerInput = document.getElementById('baseColorPicker');
const pasteBtn = document.getElementById('pasteBtn');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const paletteList = document.getElementById('paletteList');
const previewBox = document.getElementById('previewBox');
const previewSurface = document.getElementById('previewSurface');
const previewTitle = document.getElementById('previewTitle');
const previewBtn = document.getElementById('previewBtn');
const previewText = document.getElementById('previewText');
const previewTextSecondary = document.getElementById('previewTextSecondary');
const previewBorderBox = document.getElementById('previewBorderBox');
const previewSemantic = document.getElementById('previewSemantic');
const exportBtns = document.querySelectorAll('.export-btn');
const tooltip = document.getElementById('tooltip');
const tooltipContainer = document.getElementById('tooltipContainer');
let tooltipHideTimeout = null;

// Show toast feedback
function showToast(messageKey, substitutions) {
    const toast = document.getElementById('toast');
    if (toast) {
        const message = getMessage(messageKey, substitutions);
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 1500);
    }
}

// Tooltip functions
function showTooltip(text, x, y) {
    tooltip.textContent = text;
    tooltipContainer.style.left = x + 'px';
    tooltipContainer.style.top = y + 'px';
    tooltip.classList.add('show');
    clearTimeout(tooltipHideTimeout);
}

function hideTooltip() {
    clearTimeout(tooltipHideTimeout);
    tooltipHideTimeout = setTimeout(() => {
        tooltip.classList.remove('show');
    }, 200);
}

function handleTooltipEnter(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.bottom + 8;
    const key = e.currentTarget.dataset.tooltipKey || e.currentTarget.dataset.tooltip;
    const text = getMessage(key);
    showTooltip(text, x, y);
}

function handleTooltipLeave() {
    hideTooltip();
}

function handleTooltipMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.bottom + 8;
    tooltipContainer.style.left = x + 'px';
    tooltipContainer.style.top = y + 'px';
}

// Setup tooltips
function setupTooltips() {
    const elements = document.querySelectorAll('[data-tooltip-key]');
    elements.forEach(el => {
        el.removeEventListener('mouseenter', handleTooltipEnter);
        el.removeEventListener('mouseleave', handleTooltipLeave);
        el.removeEventListener('mousemove', handleTooltipMove);
        el.addEventListener('mouseenter', handleTooltipEnter);
        el.addEventListener('mouseleave', handleTooltipLeave);
        el.addEventListener('mousemove', handleTooltipMove);
    });
}

// Save state to storage
function saveState() {
    chrome.storage.local.set({
        baseColor: currentBaseColor,
        theme: currentTheme
    });
}

// Load state from storage
function loadState(callback) {
    chrome.storage.local.get(['baseColor', 'theme'], function(result) {
        if (result.baseColor) {
            currentBaseColor = result.baseColor;
        }
        if (result.theme) {
            currentTheme = result.theme;
        }
        callback();
    });
}

// Render palette
function renderPalette(pal) {
    const groups = [
        {
            label: 'BASE COLOR',
            roles: [
                { key: 'primary', label: 'Primary' }
            ]
        },
        {
            label: 'ACCENT',
            roles: [
                { key: 'primaryHover', label: 'Primary Hover' },
                { key: 'primaryActive', label: 'Primary Active' }
            ]
        },
        {
            label: 'NEUTRAL',
            roles: [
                { key: 'background', label: 'Background' },
                { key: 'surface', label: 'Surface' },
                { key: 'text', label: 'Text' },
                { key: 'textSecondary', label: 'Text Secondary' },
                { key: 'border', label: 'Border' }
            ]
        }
    ];

    paletteList.innerHTML = '';

    groups.forEach((group) => {
        const header = document.createElement('div');
        header.className = 'palette-group-header';
        header.textContent = group.label;
        paletteList.appendChild(header);

        group.roles.forEach(role => {
            const hex = pal[role.key];
            const item = document.createElement('div');
            item.className = 'palette-item';

            const swatch = document.createElement('div');
            swatch.className = 'palette-swatch';
            swatch.style.background = hex;

            const info = document.createElement('div');
            info.className = 'palette-info';

            const name = document.createElement('span');
            name.className = 'palette-name';
            name.textContent = role.label;

            const hexWrapper = document.createElement('span');
            hexWrapper.className = 'palette-hex-wrapper';

            const hexSpan = document.createElement('span');
            hexSpan.className = 'palette-hex';
            hexSpan.textContent = hex;
            hexSpan.dataset.color = hex;

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.dataset.tooltipKey = 'tooltipCopy';
            copyBtn.innerHTML = '<img src="icons/copy.svg" alt="Copy" class="copy-icon">';

            copyBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                navigator.clipboard.writeText(hex).then(() => {
                    showToast('toastCopied', [hex]);
                });
            });

            copyBtn.addEventListener('mouseenter', handleTooltipEnter);
            copyBtn.addEventListener('mouseleave', handleTooltipLeave);
            copyBtn.addEventListener('mousemove', handleTooltipMove);

            hexWrapper.appendChild(hexSpan);
            hexWrapper.appendChild(copyBtn);

            info.appendChild(name);
            info.appendChild(hexWrapper);
            item.appendChild(swatch);
            item.appendChild(info);
            paletteList.appendChild(item);
        });
    });

    setupTooltips();
}

// Update palette + preview (uses currentTheme)
function updateAll() {
    const pal = generatePalette(currentBaseColor, currentTheme);
    if (!pal) return;
    palette = pal;
    
    renderPalette(pal);
    
    const bg = pal.background;
    const surface = pal.surface;
    const text = pal.text;
    const textSec = pal.textSecondary;
    const primary = pal.primary;
    const primaryHover = pal.primaryHover;
    const border = pal.border;

    previewBox.style.background = bg;
    previewBox.style.color = text;

    previewSurface.style.background = surface;
    previewSurface.style.color = text;

    previewTitle.style.color = text;

    previewBtn.style.background = primary;
    previewBtn.style.color = '#ffffff';
    previewBtn.onmouseenter = function() { this.style.background = primaryHover; };
    previewBtn.onmouseleave = function() { this.style.background = primary; };

    previewText.style.color = text;
    previewTextSecondary.style.color = textSec;

    previewBorderBox.style.background = surface;
    previewBorderBox.style.color = text;
    previewBorderBox.style.borderColor = border;

    const semanticColors = generateSemanticColors(currentTheme);
    const semanticItems = previewSemantic.querySelectorAll('.semantic-item');
    semanticItems.forEach(item => {
        if (item.classList.contains('semantic-success')) {
            item.style.color = semanticColors.success;
        } else if (item.classList.contains('semantic-warning')) {
            item.style.color = semanticColors.warning;
        } else if (item.classList.contains('semantic-error')) {
            item.style.color = semanticColors.error;
        } else if (item.classList.contains('semantic-info')) {
            item.style.color = semanticColors.info;
        }
    });

    exportBtns.forEach(btn => {
        btn.style.color = text;
    });

    hexInput.value = currentBaseColor;
    pickerInput.value = currentBaseColor;

    if (currentTheme === 'dark') {
        themeIcon.src = 'icons/sun.svg';
        themeIcon.alt = 'Light';
    } else {
        themeIcon.src = 'icons/moon.svg';
        themeIcon.alt = 'Dark';
    }

    saveState();
}

// Toggle theme
themeToggle.addEventListener('click', function() {
    currentTheme = (currentTheme === 'light') ? 'dark' : 'light';
    updateAll();
});

// Export functions
document.getElementById('exportCSS').addEventListener('click', function() {
    const both = generateBothThemes(currentBaseColor);
    let css = '/* Light theme */\n';
    css += ':root {\n';
    const light = both.light;
    for (const [key, hex] of Object.entries(light)) {
        css += `  --color-${key}: ${hex};\n`;
    }
    css += '}\n\n';
    css += '/* Dark theme */\n';
    css += '[data-theme="dark"] {\n';
    const dark = both.dark;
    for (const [key, hex] of Object.entries(dark)) {
        css += `  --color-${key}: ${hex};\n`;
    }
    css += '}\n';
    navigator.clipboard.writeText(css).then(() => {
        showToast('toastCSS');
    });
});

document.getElementById('exportJSON').addEventListener('click', function() {
    const both = generateBothThemes(currentBaseColor);
    const json = JSON.stringify({
        light: both.light,
        dark: both.dark
    }, null, 2);
    navigator.clipboard.writeText(json).then(() => {
        showToast('toastJSON');
    });
});

// Paste from clipboard
pasteBtn.addEventListener('click', async function() {
    try {
        const text = await navigator.clipboard.readText();
        const trimmed = text.trim();
        if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
            currentBaseColor = trimmed;
            hexInput.value = trimmed;
            pickerInput.value = trimmed;
            updateAll();
            showToast('toastPasted', [trimmed]);
        }
    } catch (err) {
        console.log('Failed to read clipboard');
    }
});

// Event listeners
hexInput.addEventListener('input', function() {
    let val = this.value.trim();
    if (/^#[0-9a-f]{6}$/i.test(val)) {
        currentBaseColor = val;
        pickerInput.value = val;
        updateAll();
    }
});

pickerInput.addEventListener('input', function() {
    const val = this.value;
    if (/^#[0-9a-f]{6}$/i.test(val)) {
        currentBaseColor = val;
        hexInput.value = val;
        updateAll();
    }
});

// Listen for system theme changes (only for body CSS variables)
const systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
systemThemeMedia.addEventListener('change', function(e) {
    applySystemTheme();
});

// Init
loadState(function() {
    applySystemTheme();
    setupTooltips();
    updateAll();
});