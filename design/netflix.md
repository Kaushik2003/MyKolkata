<design-context>
---
version: alpha
name: Netflix
description: "Watch Netflix movies & TV shows online or stream right to your smart TV, game console, PC, Mac, mobile, tablet and more."
sourceUrl: "https://www.netflix.com"

colors:
  primary: "#e50914"
  on-primary: "#ffffff"
  background: "#232323"
  surface: "#2d2d2d"
  border: "#808080"
  text: "#ffffff"
  text-muted: "#000000"

typography:
  display:
    fontFamily: "sans-serif"
    fontSize: 100px
    fontWeight: 400
    lineHeight: 1.5
  heading:
    fontFamily: "sans-serif"
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5

spacing:
  base: 4px
  scale: [4, 8, 12, 16, 24, 32, 36, 64, 96, 100]

radius:
  sm: 2px
  md: 4px
  lg: 8px
  xl: 16px

shadows:
  card: "rgb(128, 128, 128) 0px 0px 5px 0px"
  elevated: "rgb(128, 128, 128) 0px 0px 5px 0px"

motion:
  duration-fast: 200ms
  duration-base: 300ms
  duration-slow: 500ms
  easing: "cubic-bezier(0.4, 0, 0.68, 0.06)"

breakpoints: [400px, 425px, 426px, 550px, 600px, 768px, 769px, 890px, 897px, 960px, 1024px, 1280px, 1600px, 1920px, 2560px]
---

## Rationale

Netflix's design system is built around bold, premium entertainment positioning. The dark background (#232323) with bright red primary (#e50914) creates high contrast and emotional intensity—red signals urgency, passion, and the "play" action central to streaming. The color palette is deliberately constrained: near-black surfaces, white text, and a single accent color that commands attention. This minimalism serves the product's core mission: content should dominate the interface, not chrome. The measured breakpoints (15 distinct values, dense around mobile) reflect Netflix's cross-device strategy—from phones to 4K displays. Typography is clean and hierarchical rather than decorative, using weight and scale to guide scanning rather than serif flourishes.

Motion curves (300ms base, cubic-bezier easing) are tuned for smoothness without lag—critical for a platform where users rapidly browse thousands of titles. The spacing scale uses a base of 4px, allowing fine-tuned micro-interactions (padding, gaps) while maintaining rhythm through larger increments (16, 24, 32). Subtle shadows (5px blur, gray) add depth without visual noise. This restraint reflects streaming UI orthodoxy: let the content imagery (posters, thumbnails) carry visual weight; the interface fades into the background.

The measured tokens reveal a mature, data-driven system. Netflix has clearly tested extensively across devices and contexts. The corner radii are minimal (2–16px), favoring sharp, modern edges. The dark mode is absolute—no light variant was detected—signaling that the brand *is* darkness and the glowing screen, suitable for evening entertainment consumption. Auth and pricing are present but de-emphasized in the token hierarchy; the CTA is "Get Started," not "Pay Now."

## 1. Visual Theme & Atmosphere

Netflix adopts a **high-contrast cinema aesthetic**: dark surfaces evoke a theater, while the red primary (#e50914) mimics the classic Netflix logo and suggests play, action, and urgency. The absence of a light mode variant signals that dark is the canonical brand experience, optimized for reduced eye strain during evening browsing and viewing. Shadows are muted (5px gray) rather than dramatic, keeping focus on content thumbnails and promotional imagery rather than UI containers.

The overall feeling is **premium but accessible**—no skeuomorphism, no gradients, no decorative elements. Every pixel serves navigation or content. The sparse color palette (essentially three tones: background, surface, red) trains users to notice *differences*, making interactive elements pop without requiring multiple hues.

## 2. Color System

- **Primary (#e50914):** Netflix red, reserved for CTAs, play buttons, and key interactive states. High saturation ensures visibility on dark backgrounds.
- **On-Primary (#ffffff):** White text/icons on red, meeting WCAG AAA contrast.
- **Background (#232323):** Deep charcoal, the canvas for the entire app. Slightly warmer than pure black (#000000) to reduce eye strain.
- **Surface (#2d2d2d):** Marginally lighter than background, used for cards, modals, and layered content areas. The 10-point difference (45 out of 255 in RGB) creates subtle visual hierarchy without harsh contrast.
- **Border (#808080):** Mid-gray, used sparingly. Divides sections when necessary but never dominates.
- **Text (#ffffff):** Primary text in white; sufficient contrast against background (21:1) for accessibility.
- **Text-Muted (#000000):** Appears to be a fallback or reserved token; likely not used on dark backgrounds (would be invisible).

The system relies on **luminosity, not saturation**: the red is the sole accent; grays and blacks provide structure. This discipline scales across 15 breakpoints without needing color shifts.

## 3. Typography

Netflix uses a single **sans-serif family** across all scales. No serif, script, or display-only typefaces; modularity and legibility take precedence.

- **Display (100px, weight 400, line-height 1.5):** Reserved for hero headlines ("Unlimited movies, TV shows, and more"). Large, light weight conveys openness and scope. 1.5 line-height prevents cramping at scale.
- **Heading (56px, weight 700, line-height 1.25):** Section titles ("Trending Now," "More Reasons to Join"). Bold weight adds authority; tighter 1.25 line-height maintains density.
- **Body (14px, weight 400, line-height 1.5):** Default paragraph text, UI labels, and small copy. 14px is legible on small screens and dense on desktop; 1.5 leading ensures scannability.

No explicit subtitle or caption scales were captured, suggesting Netflix likely uses body at smaller sizes (12px) or relies on opacity/color to de-emphasize. The measured scale is **intentionally sparse**—three tiers force consistent hierarchy rather than permitting arbitrary sizing.

## 4. Components & Patterns

### CTAs & Buttons
- **Primary button:** Red background (#e50914), white text, minimal padding. No border; the color is sufficient to signal affordance.
- **Secondary button:** Likely border-based (gray border on transparent) for lower-priority actions like "Contact Us."

### Cards & Content Containers
- Surface (#2d2d2d) with shadow (5px gray) for elevation. Minimal radius (2–8px) keeps modern feel. No hover shadow escalation; interactions likely rely on scale or opacity.

### Navigation & Headers
- Sticky or fixed header on background (#232323). Pricing, auth, and account menus positioned in top-right, de-emphasized visually.

### Forms
- Input fields: background #232323 or #2d2d2d with border #808080. Text #ffffff. Red outline or background on focus/active.

### Lists & Grids
- Horizontal scroll carousels for "Trending Now" and similar. Responsive column count based on 15 breakpoints; likely 1 column at 400px, 4+ at 1920px.

## 5. Spacing & Layout

The base unit is **4px**, enabling fine-grained layouts. The scale [4, 8, 12, 16, 24, 32, 36, 64, 96, 100] allows:
- **Tight spacing (4–12px):** Icon padding, badge spacing, dense lists.
- **Comfortable spacing (16–24px):** Card padding, section margins, button height.
- **Breathing room (32–100px):** Section gutters, hero padding, full-screen breathing.

The *unusual* entries (36px, 100px) suggest specific historical components that didn't collapse into standard intervals—likely a hero section or legacy spacing requirement.

With 15 breakpoints, Netflix adapts layout densely across devices:
- **400–550px:** Mobile stacking; 1–2 columns; reduced padding.
- **768–897px:** Tablet; 3 columns; moderate padding.
- **1024–1920px:** Desktop; 4–6 columns; generous padding.
- **2560px:** Large screens; 8+ columns or wider gutters.

This granularity suggests A/B testing and device-specific optimization, ensuring consistency from iPhone SE to 4K TV browsers.

## 6. Motion & Interaction

Motion is **functional, not decorative**.

- **durationFastMs (200ms):** Micro-interactions—hover state transitions, icon toggles, small modal reveals. Below perception threshold for delays; feels instant.
- **durationBaseMs (300ms):** Standard transitions—button presses, carousel slides, overlay fades. Natural, not rushed.
- **durationSlowMs (500ms):** Longer reveals—hero animations, large carousel transitions, modal entrances. Deliberately paced to build anticipation.

**Easing (cubic-bezier(0.4, 0, 0.68, 0.06)):** A custom curve that accelerates early and eases late—favoring snappy entrance and smooth exit. Not a standard ease-out; the values (0.68 control point late in the curve) suggest heavy emphasis on smoothness over a longer tail. This creates the Netflix "bounce" without overshoot, suitable for playful but premium interaction.

**Absence of springs or dramatic easing** signals restraint: motion clarifies interaction, not adds delight. This aligns with the interface-as-infrastructure philosophy—content is the star.

## Accessibility

### Contrast Ratios

**Primary pair: White text (#ffffff) on Background (#232323)**
- Luminance: #ffffff = 1.0, #232323 ≈ 0.07
- Ratio ≈ **21:1** (far exceeds WCAG AAA 7:1; well above AA 4.5:1)

**Secondary pair: Red primary (#e50914) on Background (#232323)**
- Red luminance ≈ 0.175
- Ratio ≈ **2.5:1** (fails WCAG AA; acceptable only for large text or icons with sufficient size/weight)
- Remediation: Red CTAs paired with white text, not standalone; red backgrounds reserved for interactive elements with clear affordance cues (borders, hover states).

**Text on Surface (#2d2d2d):**
- White on surface: ≈ 19:1 (exceeds AA/AAA)

**Gray border (#808080) on Background (#232323):**
- Ratio ≈ 6:1 (passes AA, borderline AAA); acceptable for secondary dividers but not primary text.

**Overall:** The system prioritizes readability for body and heading text. Red is used cautiously—bright, eye-catching, but supported by context and size. No reliance on red alone to convey status; use color + iconography.

### Minimum Requirements

- **Touch target:** Buttons and interactive elements should measure ≥44×44px (iOS) or ≥48×48px (Android). Given body text at 14px and heading at 56px, padding scales naturally: a body CTA with 16px (one spacing unit) padding top/bottom exceeds 44px.
- **Focus indicator:** Keyboard focus must display a 2px outline in a contrasting color (red or white) with 2px offset. Current tokens don't specify a focus state color, but red (#e50914) or white (#ffffff) would satisfy AA standards.
- **Motion:** Respect prefers-reduced-motion media query; reduce durationSlowMs and durationBaseMs by 50% or set to 0ms for users who disable animations.
- **Color dependency:** Never rely on red alone to indicate state (error, active, etc.). Pair with icon, text label, or pattern (underline, checkmark).

</design-context>

Use the design system above for all UI you generate.