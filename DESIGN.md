---
version: alpha
name: "MyKolkata"
description: "A contemporary city companion for finding a genuinely good Kolkata plan."
colors:
  primary: "#142033"
  blue: "#3157E5"
  red: "#E94B35"
  yellow: "#F5C344"
  green: "#287A63"
  paper: "#F8F7F2"
  surface: "#FFFFFF"
  muted: "#657083"
typography:
  display:
    fontFamily: "Anek Kolkata, sans-serif"
  body:
    fontFamily: "Manrope Kolkata, ui-sans-serif, system-ui, sans-serif"
rounded:
  DEFAULT: "1.25rem"
  card: "1.4rem"
  feature: "1.65rem"
  pill: "999px"
spacing:
  section-gap: "4.5rem"
  page-gutter: "1.25rem"
  page-max: "73.75rem"
components:
  search: { }
  category-button: { }
  discovery-card: { }
  view-toggle: { }
  nearby-map: { }
---

# MyKolkata Design System

## Overview

### Creative North Star

The Explore experience is **Kolkata Now**: lively, useful and rooted in how the city feels today. It should resemble a knowledgeable friend's short list, not a tourism brochure, nostalgic collage or neutral venue database.

### Product context and register

- **Audience and primary job:** Kolkata residents and visitors looking for a compelling next plan, primarily from a phone.
- **Target market and evidence:** Kolkata, India, established by the product name, repository content and Explore brief.
- **Locale and language policy:** English first with natural Kolkata place names; use `en-IN` for future formatting.
- **Usage scene:** Casual, mobile-first browsing with short attention and a desire for visual inspiration.
- **Register:** Hybrid product/editorial. Navigation and controls stay familiar; discovery surfaces carry the brand expression.
- **Memorable signature:** Bold Anek headlines, candid Kolkata photography and one timely plan card that gives the first screen a reason to act.
- **Restraint:** Filters, search, ratings and wayfinding use direct language and conventional behavior.
- **Anti-references:** Generic marketplace grids, corporate travel portals, neon nightlife apps and Pujo visual language.
- **Token ownership/runtime mapping:** This file records Explore's accepted tokens. The scoped CSS modules in `src/styles/Explore.module.css` and `src/styles/NearYou.module.css` are the runtime owners so unrelated routes remain unchanged.

## Colors

Ink anchors text and large structural surfaces. Taxi yellow marks tips and moments of delight; city red carries editorial emphasis; green supports location context; blue is reserved for links and visible keyboard focus. Warm paper and white keep dense photography breathable. Surface colors and on-dark foreground colors are separate semantic tokens, so dark mode can remap cards without reducing contrast over photography.

## Typography

Display type uses Anek, a contemporary Indian type family, for a recognisable regional voice without costume typography. Manrope handles body copy and controls. Both are self-hosted variable fonts to avoid layout shifts and third-party font requests. Display text is tightly tracked; utility labels are compact and restrained. Body copy remains sentence case.

## Layout

The layout is mobile-first with a 1.25rem default gutter and a 73.75rem maximum reading width. Explore starts with a concise split hero on desktop and an immersive photographic hero on mobile. Sections use generous separation; feature cards use an asymmetric grid on desktop and horizontally snapping stories on mobile.

Near You is map-first: between the fixed product bars, the real Kolkata map becomes an edge-to-edge city canvas while search, area, category and view controls float above it. Grid and List replace the map with a conventional results page; the representations never compete for screen space.

## Elevation & Depth

Photography creates most of the depth. Cards use quiet borders and low, broad shadows; overlays use dark tonal gradients only when required for legible text. Controls do not use decorative glass except over photography.

## Shapes

Cards use generous but not pill-like rounding. Pills are limited to compact filters, location badges and segmented controls. Circular icon wells distinguish category actions. Focus outlines sit outside the silhouette.

## Components

### Foundational visual states

Interactive elements expose hover, focus-visible, pressed and selected states. Blue focus rings remain visible on both light and dark surfaces. Motion is brief and spatial; reduced-motion mode removes transforms and effectively disables transitions.

### Buttons and actions

Primary structural actions use ink fills. Category controls use white surfaces with coloured icon wells and a clear pressed outline. Touch targets are at least 44px where practical.

### Navigation and data display

Explore cards are primarily editorial content, not false clickable containers. Real destinations use links. Nearby filters and view toggles use `aria-pressed` state and retain stable geometry.

The Nearby map uses Ola Maps vector styles with visible provider attribution and light/dark variants that follow the product theme. Individual markers use the place photography instead of arbitrary sequence numbers. Nearby markers merge into yellow count clusters and automatically separate as the map zooms in. A selected marker reveals one anchored, non-modal place card at a time; the card never hides the filter deck, and the same place can be reopened from Grid or List through a labelled “Show on map” action.

### Forms and overlays

Search has a persistent accessible label, local immediate filtering, and an explicit clear button that restores focus. It uses app-owned validation behavior and no browser message bubbles.

Near You keeps search, filter access, view switching and location in one compact control deck. Category and area choices live in a disclosure: a popover on desktop and a bottom sheet on mobile. This preserves the map as the primary surface while keeping filters touch-friendly and keyboard dismissible. Search and filters remain app-owned controls.

### Iconography

React Icons' Font Awesome family is used at compact sizes. Icons reinforce labels and do not replace necessary control text.

### Motion

Image zoom and card lift are reserved for discovery affordance. Transitions run between 180–500ms and are removed for reduced-motion preferences.

### Content and data visualization

Voice is specific, useful and lightly conversational. Copy names real neighbourhoods and suggests a time, route or way to experience the city. Ratings always include a star icon and text value.

## Do's and Don'ts

- **Do:** Let Kolkata photography, a direct Near You action and specific local copy lead the first screen.
- **Do:** Keep search, filters, view switching and keyboard focus immediately understandable.
- **Do:** Use real place photography for individual map markers and count clusters only when markers overlap.
- **Don't:** Introduce Pujo content or visual motifs into Explore.
- **Don't:** Reduce Kolkata to decorative trams, ticket stubs or heritage nostalgia.
- **Don't:** Turn every visual card into a false link or rely on hover to reveal essential information.
