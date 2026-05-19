---
name: SmartImob Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777e'
  outline-variant: '#c6c6ce'
  surface-tint: '#555e78'
  primary: '#040d23'
  on-primary: '#ffffff'
  primary-container: '#1a233a'
  on-primary-container: '#818aa6'
  inverse-primary: '#bdc6e4'
  secondary: '#4e49ca'
  on-secondary: '#ffffff'
  secondary-container: '#6764e5'
  on-secondary-container: '#fffbff'
  tertiary: '#001209'
  on-tertiary: '#ffffff'
  tertiary-container: '#002a1a'
  on-tertiary-container: '#009e6d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#bdc6e4'
  on-primary-fixed: '#121b31'
  on-primary-fixed-variant: '#3d465f'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c1ff'
  on-secondary-fixed: '#0e006a'
  on-secondary-fixed-variant: '#3730b4'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 24px
  gutter: 16px
  card-padding: 20px
  sidebar-width: 240px
  stack-gap-sm: 8px
  stack-gap-md: 16px
---

## Brand & Style
The design system embodies a **Corporate Modern** aesthetic tailored for real estate management. The visual language is defined by precision, reliability, and clarity. It utilizes a high-contrast relationship between a deep navy sidebar and a pristine, light-gray workspace to establish a clear structural hierarchy. 

The brand personality is professional and efficient, aiming to instill confidence in administrators handling complex financial and contractual data. The interface prioritizes high legibility and a systematic distribution of information, using subtle depth and soft rounding to humanize the data-heavy environment.

## Colors
The palette is centered around a primary **Navy (#1A233A)** used for structural navigation, creating a solid "anchor" for the UI. The secondary **Indigo/Violet (#5E5ADB)** acts as the primary action color for buttons and active states.

Functional status colors are critical for real estate management:
- **Green (Success):** Used for financial gains, active statuses, and positive confirmations.
- **Amber (Warning):** Used for upcoming expirations and pending adjustments.
- **Red (Error):** Reserved for overdue payments and urgent alerts.

Backgrounds utilize a tiered grayscale starting from a neutral **Off-White (#F8FAFC)** for the page canvas, with pure white cards to create a clear "layering" effect.

## Typography
This design system uses **Hanken Grotesk** for all levels, providing a contemporary, geometric feel that remains highly readable at small sizes in data tables.

- **Headlines:** Use Bold (700) or SemiBold (600) weights to clearly demarcate page sections and dashboard headers.
- **Body Text:** Primarily uses the 14px size for standard data entry and table rows, ensuring a high information density without sacrificing legibility.
- **Numeric Data:** Financial figures in the dashboard use the Medium (500) or SemiBold (600) weights to stand out from surrounding labels.

## Layout & Spacing
The layout follows a **Fixed Sidebar + Fluid Content** model. The sidebar remains at a constant 240px width, while the main workspace expands to fit the viewport. 

A 12-column grid is used for the internal workspace, allowing cards to span 3 columns (for metrics), 6 columns (for summaries), or 12 columns (for data tables). Spacing relies on a base 8px scale, with 16px being the standard gutter between elements and 24px used for the main page margins. Data-heavy lists use a condensed vertical padding (8-10px) to maximize the amount of information visible on a single screen.

## Elevation & Depth
Depth is achieved through **Tonal Layering** and low-intensity ambient shadows. 
- **Level 0 (Base):** The #F8FAFC background.
- **Level 1 (Cards):** Pure white (#FFFFFF) surfaces with a subtle 4px blur, 2% opacity black shadow. This creates a soft lift that distinguishes actionable cards from the background.
- **Level 2 (Dropdowns/Modals):** Elements that float above the UI use a more pronounced shadow (12px blur, 8% opacity) to indicate temporary overlay status.
- **Sidebar:** Uses a flat, dark fill with no shadow, relying on color contrast to establish hierarchy.

## Shapes
The shape language is **Rounded**, favoring a friendly but professional appearance. 
- **Buttons & Inputs:** 0.5rem (8px) corner radius.
- **Cards:** 0.75rem (12px) to 1rem (16px) corner radius for larger containers.
- **Badges/Chips:** Use a fully "Pill-shaped" (rounded-full) geometry to differentiate them from interactive buttons.
- **Selection Indicators:** Active states in the sidebar use a subtle left-aligned vertical bar or a rounded background highlight.

## Components
- **Buttons:** Primary buttons are solid Indigo (#5E5ADB). Secondary buttons use a light gray ghost style with thin borders. Action buttons within tables (edit/delete) use minimal icon-only styles to reduce visual noise.
- **Data Tables:** Use a clean, borderless header style with a light gray divider between rows. Alternate row striping is optional, but high-contrast "Active" status badges (green pill) are mandatory for clarity.
- **Input Fields:** Outlined style with a light gray border (#E2E8F0) that thickens and changes color to Indigo on focus.
- **Sidebar Nav:** High-contrast icons (linear style) paired with text. The active menu item uses a solid background tint or a left-hand accent line.
- **Metric Cards:** Large numeric displays with a subtitle and a trend indicator (percentage + icon) to show monthly growth.
- **Alerts:** Full-width banners with a light tinted background corresponding to the status color (e.g., light red background for error) and a left-accent border.