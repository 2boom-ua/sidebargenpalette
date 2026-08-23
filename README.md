<div align="center">  
    <img src="https://github.com/2boom-ua/sidebargenpalette/blob/main/icons/icon-128.png?raw=true" alt="" width="128" height="128">
</div>

# Core UI Palette Generator

Core UI Palette Generator — Generate a UI color palette from a base color with Light/Dark themes, OKLCH-based color generation, semantic colors, and live UI preview.

![Version](https://img.shields.io/badge/version-1.2-green.svg)

## Features

- **Single Base Color** — pick any color, get a full UI palette
- **8 Core Colors** — Primary, Primary Hover, Primary Active, Background, Surface, Text, Text Secondary, Border
- **Light / Dark modes** — toggle between themes with automatic system theme detection
- **Live Preview** — see how colors look in a real UI context
- **Copy to Clipboard** — copy any color or export the entire palette
- **Export** — CSS variables and JSON with both light and dark themes
- **Localization** — English and Ukrainian support
- **Persistent State** — remembers your last selected color and theme

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the extension folder

## Usage

1. Click the extension icon in the toolbar
2. Pick a base color using the color picker or enter a HEX value
3. The palette generates automatically
4. Toggle between Light/Dark themes to preview
5. Click any HEX value or the copy button to copy a color
6. Export as CSS or JSON for use in your projects

## Color Generation

The extension uses OKLCH color space for accurate perceptual color generation:

HEX → RGB → OKLCH → Palette → RGB → HEX

### Palette Structure

| Group | Colors |
|-------|--------|
| **Base Color** | Primary |
| **Accent** | Primary Hover, Primary Active |
| **Neutral** | Background, Surface, Text, Text Secondary, Border |
| **Semantic** | Success, Warning, Error, Info |

## Export Formats

### CSS
```css
/* Light theme */
:root {
  --color-primary: #82A9E8;
  --color-primary-hover: #6a8fc9;
  --color-primary-active: #5275aa;
  --color-background: #f5f5f5;
  --color-surface: #e8e8e8;
  --color-text: #1a1a1a;
  --color-text-secondary: #777777;
  --color-border: #cccccc;
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}

/* Dark theme */
[data-theme="dark"] {
  --color-primary: #82A9E8;
  --color-primary-hover: #9ac0f0;
  --color-primary-active: #b2d7f8;
  --color-background: #2a2a2a;
  --color-surface: #3a3a3a;
  --color-text: #f5f5f5;
  --color-text-secondary: #aaaaaa;
  --color-border: #555555;
  --color-success: #4ade80;
  --color-warning: #facc15;
  --color-error: #f87171;
  --color-info: #60a5fa;
}
```
```json
{
  "light": {
    "primary": "#82A9E8",
    "primaryHover": "#6a8fc9",
    "primaryActive": "#5275aa",
    "background": "#f5f5f5",
    "surface": "#e8e8e8",
    "text": "#1a1a1a",
    "textSecondary": "#777777",
    "border": "#cccccc",
    "success": "#22c55e",
    "warning": "#eab308",
    "error": "#ef4444",
    "info": "#3b82f6"
  },
  "dark": {
    "primary": "#82A9E8",
    "primaryHover": "#9ac0f0",
    "primaryActive": "#b2d7f8",
    "background": "#2a2a2a",
    "surface": "#3a3a3a",
    "text": "#f5f5f5",
    "textSecondary": "#aaaaaa",
    "border": "#555555",
    "success": "#4ade80",
    "warning": "#facc15",
    "error": "#f87171",
    "info": "#60a5fa"
  }
}
```

## Browser Support
Chrome (Manifest V3)
Edge (Chromium-based)

## License
© 2026 2boom. All rights reserved.

