---
name: Executive Asset Intelligence
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#44474d'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#4e5f7e'
  primary: '#031632'
  on-primary: '#ffffff'
  primary-container: '#1a2b48'
  on-primary-container: '#8293b5'
  inverse-primary: '#b6c7eb'
  secondary: '#006e25'
  on-secondary: '#ffffff'
  secondary-container: '#80f98b'
  on-secondary-container: '#007327'
  tertiary: '#241300'
  on-tertiary: '#ffffff'
  tertiary-container: '#402500'
  on-tertiary-container: '#cd8100'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#b6c7eb'
  on-primary-fixed: '#081b38'
  on-primary-fixed-variant: '#374765'
  secondary-fixed: '#83fc8e'
  secondary-fixed-dim: '#66df75'
  on-secondary-fixed: '#002106'
  on-secondary-fixed-variant: '#00531a'
  tertiary-fixed: '#ffddb9'
  tertiary-fixed-dim: '#ffb961'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#663e00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  stat-xl:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  gutter: 16px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style

The design system is engineered for high-stakes property management and financial oversight. It balances the authority of traditional banking with the agility of modern fintech. The aesthetic is **Corporate / Modern**, leaning heavily into a refined, data-dense executive dashboard look. 

The primary emotional response is one of **calculated confidence**. By utilizing generous whitespace, structured data grids, and a disciplined color application, the UI transforms complex financial datasets into actionable intelligence. The style avoids decorative flourishes, favoring functional precision and a "glass-and-steel" architectural clarity that mirrors the physical assets being managed.

## Colors

The palette is anchored by **Deep Navy Blue**, used for headers, primary actions, and navigation to establish immediate trust and institutional stability. **Financial Green** is reserved strictly for positive growth indicators, successful transactions, and "Active" statuses, providing a clear visual reward for positive data.

The background uses a subtle **Off-white** to reduce eye strain during long sessions of data entry, while pure **White surfaces** are used for cards to create a clear "layering" effect. **Warm Orange** and **Warning Red** act as high-signal disruptors, used sparingly for overdue payments and urgent maintenance alerts to ensure they command immediate attention without overwhelming the daily-use interface.

## Typography

This design system utilizes **Inter** exclusively to leverage its exceptional legibility and systematic feel. For financial figures, we enable tabular nummbers (`tnum`) to ensure that columns of decimals align perfectly, aiding in rapid price and ROI comparison.

- **Headlines:** Use semi-bold weights with slight negative letter-spacing for a sophisticated, "newsprint" digital feel.
- **Data Points:** Large financial totals should use the `stat-xl` style to stand out as the primary focal point of cards.
- **Labels:** Use `label-caps` for table headers and secondary category descriptors to create a clear hierarchy between metadata and primary content.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop (12 columns) and a **Fluid Fluid** approach for mobile (4 columns). The spacing rhythm is based on an 8px baseline to maintain mathematical consistency across the UI.

- **Data Density:** Content-heavy views (like property lists) should utilize "compact" vertical spacing (8px-12px) to allow more rows to be visible above the fold. 
- **Mobile Reflow:** On mobile, side-by-side financial metrics should stack vertically or transition into a horizontal scrollable "carousel" of cards to maintain the legibility of large numbers.
- **Safe Areas:** Ensure a 24px margin on all screen edges to maintain the premium, "un-cluttered" feel of an executive tool.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and extremely subtle **Ambient Shadows**. 

1.  **Level 0 (Background):** The `#F8F9FA` off-white surface.
2.  **Level 1 (Cards/Containers):** Pure white surfaces with a 1px border of `#E9ECEF` and a very soft, 4% opacity navy shadow (Blur: 8px, Y: 2px).
3.  **Level 2 (Modals/Popovers):** Higher contrast shadow (Blur: 16px, Y: 8px, 8% opacity) to provide clear separation from the data grid.

Avoid heavy blurs or colorful glows. Depth should feel structural, like a physical ledger or architectural drawing.

## Shapes

The shape language is **Soft (0.25rem)**. This slight rounding provides a modern touch while maintaining the sharp, professional edge required for a financial tool. 

- **Cards & Inputs:** 4px (0.25rem) corner radius.
- **Status Badges:** Use a slightly higher `rounded-lg` (8px) to distinguish them from interactive buttons.
- **Charts:** Sparklines should use smooth cubic-bezier curves rather than jagged lines, reflecting stable, professional growth.

## Components

### Bottom Navigation
High-contrast Navy background or pure white with a top border. Active states use the Financial Green for the icon or a subtle 2px bottom indicator. Icons must be stroke-based (2px) for clarity.

### Status Badges
Small, pill-shaped containers with a 10% opacity background of the status color and a 100% opacity text color. 
- *Active:* Green
- *Overdue:* Red
- *Maintenance:* Orange
- *Available:* Navy

### Financial Cards
White surfaces featuring a `stat-xl` figure in the top left, a `label-caps` title above it, and a 24px height sparkline chart at the bottom. The sparkline color should match the trend (Green for up, Red for down).

### Forms & Inputs
Inputs should have a 1px border (`#DEE2E6`). On focus, the border transitions to Primary Navy. Labels are always visible above the input field in `label-caps` to ensure the user never loses context during data entry.

### Notification Markers
Small (8px) circular pips. Use Warning Red for urgent financial discrepancies and Warm Orange for routine property maintenance tasks. Place these on the top-right corner of icons or list items.