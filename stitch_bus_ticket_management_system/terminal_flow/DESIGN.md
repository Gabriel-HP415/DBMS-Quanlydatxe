---
name: Terminal Flow
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#434655'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#525657'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b6e70'
  on-tertiary-container: '#eff1f3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  table-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '450'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1280px
  gutter: 16px
---

## Brand & Style

The design system focuses on administrative efficiency, clarity, and reliability. Designed for a high-utility management environment, it prioritizes the speed of data entry and the legibility of complex bus scheduling information. 

The visual style is **Modern Minimalism**. It avoids decorative flourishes in favor of structured data layouts, ample whitespace to prevent cognitive overload during CRUD operations, and a strict adherence to functional hierarchy. The emotional response is one of organized control and professional stability, ensuring that university staff or system administrators can navigate high volumes of transactional data without friction.

## Colors

This design system utilizes a high-contrast palette optimized for readability.

- **Primary Blue (#2563EB):** Reserved for primary actions, active navigation states, and key interactive elements.
- **Surface & Backgrounds:** Uses a pure White (#FFFFFF) for cards and modals, with Light Gray (Tertiary) used for page backgrounds to provide subtle contrast between the UI and the canvas.
- **Semantic Palette:** Strict color coding for system statuses:
    - **Green (#22C55E):** Available seats and "Completed" trips.
    - **Red (#EF4444):** Booked seats and "Cancelled" trips.
    - **Yellow (#F59E0B):** "Selecting" seats and "Pending" actions.
- **Neutrals:** A scale of Slate grays is used for typography, borders, and secondary icons to maintain a professional, de-saturated environment.

## Typography

The system uses **Inter** exclusively to leverage its exceptional legibility in data-heavy environments. 

- **Data Tables:** Use `table-data` for row content to maximize information density while maintaining vertical rhythm. 
- **Hierarchy:** Use `label-md` for table headers and form labels to create a clear distinction from the data itself.
- **Numbers:** Since this is a booking system, ensure tabular lining figures are used for seat numbers and prices to keep columns aligned.

## Layout & Spacing

This design system employs a **12-column fluid grid** for dashboard layouts, transitioning to a single-column stack for mobile devices.

- **Dashboard Layout:** A fixed-width left sidebar (240px) with a fluid main content area.
- **Consistency:** All spacing is based on a **4px baseline grid**. Components like buttons and inputs use `md` (16px) horizontal padding and `sm` (8px) vertical padding.
- **Data Density:** In CRUD tables, use a "Comfortable" vertical padding of 12px for rows, but allow a "Compact" mode of 8px for high-volume data sets.

## Elevation & Depth

To maintain a clean, professional aesthetic, this design system uses **Low-contrast outlines** combined with very subtle **Ambient shadows**.

- **Level 0 (Background):** Light Gray (#F8FAFC).
- **Level 1 (Cards/Tables):** White surface with a 1px border (#E2E8F0). No shadow.
- **Level 2 (Modals/Dropdowns):** White surface with a 1px border and a soft, diffused shadow (0px 4px 12px rgba(0, 0, 0, 0.05)).
- **Active State:** Elements being edited or selected should receive a 2px Primary Blue outline or a subtle blue tinted background (Blue 50).

## Shapes

The shape language is **Soft**. It uses a consistent 0.25rem (4px) radius for standard elements to maintain a precise, professional feel.

- **Standard (4px):** Buttons, Input fields, Checkboxes.
- **Large (8px):** Data cards, Modals, Container sections.
- **Full (Pill):** Status badges (Active, Cancelled) and Seat map icons to make them feel distinct from the structural grid.

## Components

### Data Tables
Tables are the core of the system. Use sticky headers and a hover state for rows (#F1F5F9). Columns containing status badges or actions should be right-aligned or center-aligned for better visual scanning.

### Buttons
- **Primary:** Solid #2563EB with White text.
- **Secondary:** White background with #E2E8F0 border and #1E293B text.
- **Destructive:** Clear red text for "Delete" or "Cancel Booking" actions to prevent errors.

### Status Badges
Badges use a "Tinted" style: a high-saturation text color on a low-saturation background of the same hue (e.g., Active: Dark Green text on Light Green background).

### Form Fields
Inputs must have clear, persistent labels. Focus states use a 2px #2563EB ring with an offset. Error states replace the border with #EF4444 and include a descriptive error message below the field.

### Bus Seat Map
- **Available:** Rounded square, Green border, White fill.
- **Booked:** Rounded square, Light Gray fill, Red diagonal strikethrough or Red icon.
- **Selecting:** Rounded square, Solid Yellow fill with Black text for seat number.
- **Driver Position:** Use a simple steering wheel icon to provide spatial orientation.