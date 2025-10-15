# Design Guidelines: Japanese Task Management Mobile App

## Design Approach

**Selected Approach:** Design System-Inspired with Custom Pink Theme
**Justification:** Task management apps require strong utility focus, information density, and functional patterns. Drawing from Material Design mobile principles and modern productivity apps (Todoist, Things 3) while applying a distinctive pink color palette.

**Core Principles:**
- Mobile-first responsive design (320px-768px primary range)
- Japanese typography optimization
- Touch-friendly interactions (minimum 44px tap targets)
- Clear visual hierarchy for task prioritization

## Color Palette

**Light Mode:**
- Primary Pink: 330 65% 55% (main actions, headers)
- Pink Subtle: 330 40% 95% (backgrounds, cards)
- Pink Accent: 340 75% 65% (alerts, notifications)
- Text Primary: 0 0% 15%
- Text Secondary: 0 0% 45%
- Background: 0 0% 98%
- Card/Surface: 0 0% 100%
- Border: 330 20% 90%

**Dark Mode:**
- Primary Pink: 330 60% 70% (higher luminosity for dark bg)
- Pink Subtle: 330 25% 15% (dark card backgrounds)
- Pink Accent: 340 70% 75%
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 65%
- Background: 0 0% 8%
- Card/Surface: 0 0% 12%
- Border: 330 15% 25%

**Semantic Colors:**
- Success: 145 60% 50%
- Warning: 35 90% 60%
- Error: 0 70% 55%

## Typography

**Font Families:**
- Primary: 'Noto Sans JP', sans-serif (Google Fonts)
- Monospace: 'JetBrains Mono', monospace (for date/time)

**Scale:**
- Heading 1: text-2xl font-bold (24px) - Screen titles
- Heading 2: text-xl font-semibold (20px) - Section headers
- Body Large: text-base font-medium (16px) - Task titles
- Body: text-sm (14px) - Task details, descriptions
- Caption: text-xs (12px) - Metadata, timestamps
- Japanese line-height: leading-relaxed (1.625) for readability

## Layout System

**Spacing Units (Tailwind):**
Primary set: 2, 3, 4, 6, 8, 12 units
- Micro spacing: p-2, gap-2 (8px) - tight layouts
- Standard spacing: p-4, m-4 (16px) - general padding
- Section spacing: py-6, py-8 (24-32px) - screen sections
- Large spacing: py-12 (48px) - major divisions

**Container:**
- Mobile: px-4 (16px side padding)
- Max width: max-w-2xl for tablet landscape
- Safe areas: pb-safe for iOS notch/home indicator

## Component Library

**Navigation:**
- Bottom Navigation Bar: Fixed, 64px height, 4-5 items max
- Tab icons with Japanese labels below
- Active state: primary pink with subtle background
- Icons: Material Icons or Heroicons (24px)

**Calendar Screen:**
- Monthly Calendar Grid: 7-column grid, compact spacing
- Date cells: 40px height, circular selection
- Task indicators: Small colored dots below dates
- Current date: outlined in primary pink
- Task count badge: Small pill showing number
- Deadline alerts: Red dot indicator for overdue
- Swipe gestures: Month navigation

**Settings Screen:**
- List-based layout with sections
- Toggle switches: Primary pink when active
- Section headers: uppercase text-xs, text-secondary
- Setting items: 56px height touch targets
- Dividers: subtle border-b between items
- Theme preview cards: Small visual samples
- Dark mode toggle: Prominent top position

**Task Components:**
- Task Cards: Rounded-lg, p-4, shadow-sm
- Checkbox: Custom rounded checkbox (20px)
- Priority flags: Colored left border (4px)
- Due date chips: Rounded-full, text-xs badges
- Swipe actions: Delete (red), Complete (green)
- Category tags: Small rounded pills

**Forms/Inputs:**
- Input fields: Rounded-lg, p-3, border on focus
- Dark mode inputs: Subtle backgrounds, light borders
- Date picker: Native mobile picker integration
- Multi-select: Chip-based selection

**Buttons:**
- Primary: Rounded-full, py-3, px-6, primary pink bg
- Secondary: Rounded-full, outline with pink border
- FAB: 56px circular, bottom-right fixed
- Icon buttons: 44x44px minimum tap area

**Modals/Overlays:**
- Bottom sheets: Rounded-t-2xl, slide up animation
- Backdrop: Dark overlay (40% opacity)
- Pull handle: Centered gray bar indicator

## Animations

**Minimal Motion:**
- Screen transitions: Slide (300ms ease-out)
- Task completion: Checkbox scale + fade out (200ms)
- List reordering: Smooth position transitions
- Bottom sheet: Spring animation (400ms)
- No decorative or distracting animations

## Images

**Hero/Illustration Usage:**
No traditional hero image for utility app. Instead:
- Empty state illustrations: Simple line art in pink tones for no tasks
- Onboarding screens: Minimal illustrations showing features
- Settings theme preview: Small thumbnail images
- All illustrations: SVG-based, simple 2-color max

**Icon Library:**
Heroicons (outline for inactive, solid for active states)

## Mobile-Specific Features

- Pull-to-refresh: Standard mobile pattern
- Haptic feedback: Checkbox completion, deletions
- Bottom sheet modals: Native mobile feel
- Gesture navigation: Swipe back, swipe actions
- Safe area handling: iOS notch considerations
- Sticky headers: Scroll-aware positioning

**Accessibility:**
- Minimum 4.5:1 contrast ratios
- Touch targets: 44x44px minimum
- Focus indicators: 2px pink outline
- Screen reader labels: aria-label in Japanese
- Dark mode: Consistent across all screens including inputs