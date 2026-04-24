# Framer Components Reference

Exported from Framer project `a4cf2ba7bf830b43` ("22.design") via [unframer](https://github.com/remorses/unframer).

All components support `locale` (Hungarian `hu`), `style`, `className`, and a `.Responsive` variant for breakpoint-aware rendering.

```jsx
import './framer/styles.css'
```

---

## 1. Header (`header/header.jsx`)

The main site navigation bar. A large composite component (~9100 lines) that bundles several sub-components internally: Logo, Menu Items, Dropdown, Locale Selector, Buttons, Social Icons, and Feather icons.

**Import:**
```jsx
import Header from './framer/header/header'
```

**Variants:**
| Variant | Description |
|---|---|
| `Desktop` | Full-width nav for large screens |
| `Desktop On Scroll` | Compact/sticky version on scroll |
| `Destop on Scroll OPEN` | Scroll state with menu expanded |
| `Tablet` | Mid-width layout |
| `Tablet On Scroll` | Tablet sticky state |
| `Tablet On Scroll Open` | Tablet scroll with menu open |
| `Phone` | Mobile layout |
| `Phone On Scroll` | Mobile sticky state |
| `Phone-open` | Mobile with hamburger menu open |
| `Phone-on-scroll-open` | Mobile scroll with menu open |

**Responsive defaults:** Phone at base, Tablet at `md`, Desktop at `xl`.

**Default size:** 1200 x 88px

**Font:** DM Sans 400

**Sub-components used internally:**
- `header/menu-iteam` -- navigation links
- `header/drowdown` -- dropdown menus
- `logo/logo` -- site logo
- Locale Selector, Button, Social Icon, Feather icons

---

## 2. Logo (`logo/logo.jsx`)

The 22.design site logo. Lightweight component with click handler support.

**Import:**
```jsx
import Logo from './framer/logo/logo'
```

**Variants:**
| Variant | Description |
|---|---|
| `Desktop` | Standard desktop size |
| `Phone` | Smaller mobile size |
| `Footer Logo ` | Footer-specific styling |
| `White` | White color version |
| `Brand` | Brand/accent color version |

**Props:**
| Prop | Type | Description |
|---|---|---|
| `variant` | string | One of the variants above |
| `click` | Function | Click handler |

**Responsive default:** `Desktop` at base breakpoint.

---

## 3. Framer Expert Badge (`framer-expert-badge.jsx`)

A small badge component displaying "Official Framer Expert" status with a link to a Framer profile. Uses spring animation (0.4s, bounce 0.2).

**Import:**
```jsx
import FramerExpertBadge from './framer/framer-expert-badge'
```

**Props:**
| Prop | Type | Description |
|---|---|---|
| `link` | string (URL) | Expert profile URL (e.g. `framer.com/@ben/`) |

**Default size:** 151.5 x 26px

No responsive variants defined (single layout).

---

## Supporting Files

| Path | Role |
|---|---|
| `header/menu-iteam.jsx` | Menu item sub-component. Variants: `Menu Iteam`, `Black`, `Dropdwon Open`, `Footer Menu`. Props: `title`, `link`, `iconVisible`, `click`, `hover`. |
| `header/drowdown.jsx` | Dropdown sub-component. Variants: `Desktop`, `Phone`. Props: `click`. |
| `framer-badge-base.jsx` | Base badge rendering used by Expert Badge |
| `framer-badge-base-2.jsx` | Alternate badge base |
| `framer-expert-badge-2.jsx` | Alternate expert badge variant |
| `styles.css` | Required global styles -- must be imported |
| `chunks/` | Shared internal modules (icons, routes, utilities) |
