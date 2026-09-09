# Styling Guide

## Tailwind CSS v4

This project uses **Tailwind v4** — there is no `tailwind.config.js`. All design tokens are defined in `src/app/globals.css` using the `@theme {}` block. Use those tokens in utility classes directly.

## Design Tokens

### Brand Colors
| Token | Hex | Usage |
|---|---|---|
| `brand-blue` | `#004aad` | Primary brand color, CTAs, links |
| `primary` | `#00357f` | Darker primary shade |
| `action-orange` | `#f39200` | Accents, highlights, badges |
| `secondary-container` | `#fc9910` | Orange variant |

### Surface Colors (light theme)
| Token | Usage |
|---|---|
| `surface` / `surface-bright` | Page background (`#faf8ff`) |
| `surface-deep` | Dark section backgrounds (`#05142b`) |
| `surface-container-lowest` | White cards |
| `surface-container-low` | Slightly tinted cards |
| `surface-container` | Default card/panel background |
| `surface-container-high` | Elevated panels |
| `surface-container-highest` | Highest elevation |
| `surface-variant` | Chip/tag backgrounds |
| `on-surface` | Primary text (`#191b22`) |
| `on-surface-variant` | Secondary/muted text (`#434653`) |

### Outline & Border
| Token | Usage |
|---|---|
| `outline` | Default border color (`#737784`) |
| `outline-variant` | Subtle borders (`#c3c6d5`) |

### Typography Colors
| Token | Usage |
|---|---|
| `neutral-gray` | Placeholder / disabled text |
| `inverse-surface` | Dark background for inverted text |
| `inverse-on-surface` | Text on dark backgrounds |
| `inverse-primary` | Lighter blue for text on dark |

## Typography

Two fonts loaded via `next/font/google` in the root layout:

| Variable | Font | CSS var | Usage |
|---|---|---|---|
| `hankenGrotesk` | Hanken Grotesk | `--font-hanken-grotesk` | Headings, display, hero text |
| `inter` | Inter | `--font-inter` | Body text, UI copy |

Apply display font with `font-hanken` class (or `font-display` / `font-headline`). Body defaults to `font-inter` via the `body` rule in `globals.css`.

## Custom Utility Classes

Defined in `globals.css` — use these directly, don't recreate them inline:

```css
.glass-card          /* Light glassmorphism: white/85% + blur(12px) */
.glass-card-dark     /* Dark glassmorphism: #05142b/85% + blur(14px) */
.hero-pattern        /* Dot-grid radial gradient background */
.glow-orange         /* Orange glow shadow (0 0 35px rgba(243,146,0,.35)) */
.glow-blue           /* Blue glow shadow (0 0 40px rgba(0,74,173,.3)) */
```

## Practical Guidelines

- **Dark sections**: Use `bg-surface-deep text-inverse-on-surface` for navy/dark backgrounds.
- **Cards**: Start with `bg-surface-container-lowest` or `glass-card`, add `rounded-2xl` and `border border-outline-variant`.
- **Primary buttons**: `bg-brand-blue text-white hover:bg-primary`.
- **Orange accent buttons**: `bg-action-orange text-white hover:bg-secondary-container`.
- **Muted text**: `text-on-surface-variant` for secondary labels, `text-neutral-gray` for placeholders.
- **Borders**: `border-outline-variant` for subtle, `border-outline` for visible.
- **Conditional classes**: Use `clsx(...)`. When combining with user-supplied classes that could conflict, pipe through `tailwind-merge`.
- Never hardcode hex values in JSX when a token exists — use the token class instead.
