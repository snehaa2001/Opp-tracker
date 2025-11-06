# GSA Opportunity Tracker

A modern, accessible, and fully responsive UI for searching and managing GSA-style opportunities. Built with React, TypeScript, and Tailwind CSS.

## Features

### Core Functionality
- **Advanced Filtering** - NAICS, Set-Aside, Vehicle, Agency, Date Range, Ceiling, and Keywords
- **Smart Search** - Debounced inputs with keyword highlighting in results
- **Multiple Sort Options** - Sort by Due Date, % Complete, or Fit Score
- **Quick Filters** - One-click filters for common searches (Due in 30 days, GSA only, High fit score)
- **Progress Dashboard** - Live KPIs, donut chart visualization, and average completion tracking
- **Details Drawer** - Comprehensive application details with stage timeline
- **Preset Management** - Save and load filter configurations
- **CSV Export** - Export filtered results to CSV

### Accessibility & UX
- **WCAG AA Compliant** - Semantic HTML, ARIA labels, proper roles, 4.5:1 color contrast
- **Keyboard Navigation** - Full keyboard support for all interactive elements (Arrow keys, Enter, Escape, Tab)
- **Screen Reader Friendly** - Descriptive labels, live regions, and proper announcements
- **Focus Management** - Visible focus indicators, focus trapping in modals
- **Dark Mode** - System preference detection with manual toggle
- **Responsive Design** - Optimized layouts from 375px mobile to 4K displays

### State Management
- **URL State** - All filters reflected in URL for shareable links
- **localStorage** - Persists presets, sort preferences, and dark mode
- **Real-time Updates** - Optimistic UI updates with smooth transitions

## Installation & Setup

```bash
cd gsa-ui
npm install
npm run dev
```

Open http://localhost:5173 to view the application.

## Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- **React 18** - Component framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **date-fns** - Date manipulation

## Project Structure

```
src/
├── components/          # UI components
│   ├── Select.tsx      # Accessible single-select
│   ├── MultiSelect.tsx # Multi-select with chips
│   ├── Typeahead.tsx   # Searchable multi-select
│   ├── KeywordInput.tsx
│   ├── ParameterPanel.tsx
│   ├── ApplicationCard.tsx
│   ├── ResultsList.tsx
│   ├── Dashboard.tsx
│   ├── DetailsDrawer.tsx
│   ├── Toast.tsx
│   ├── DarkModeToggle.tsx
│   ├── LoadingSkeleton.tsx
│   └── EmptyState.tsx
├── hooks/              # Custom React hooks
│   ├── useLocalStorage.ts
│   ├── useDarkMode.ts
│   └── useDebounce.ts
├── types/              # TypeScript definitions
│   └── application.ts
├── utils/              # Helper functions
│   └── filters.ts
├── data/               # Static data
│   └── applications.json
└── App.tsx             # Main application
```

## UX Design Decisions

**Multi-level Filtering**: Separate "filter selection" from "applied filters" with an explicit Apply button. This prevents jarring re-renders and allows users to compose complex queries before executing them.

**Chip-based Multi-select**: Visual chips for selected items provide clear feedback and easy removal. Keyboard shortcuts (Backspace to remove last chip) enhance efficiency.

**Quick Filters**: Frequently used filter combinations exposed as one-click chips above results for rapid exploration without opening the full parameter panel.

**Inline Validation**: Real-time validation with helpful messages (e.g., ceiling min ≤ max) prevents user errors before submission.

**Skeleton Loading**: Content placeholders during 300-600ms simulated latency maintain spatial stability and perceived performance.

**Progressive Disclosure**: Details drawer slides in from the right, preserving context while showing comprehensive information. Escape key and backdrop click provide multiple exit paths.

**Status Timeline**: Visual stage progression uses icons and color coding to communicate application lifecycle at a glance.

**Responsive Grid**: CSS Grid adapts from single-column mobile (stacked panels) to 3-column desktop (sidebar, content, dashboard) for optimal information density at each breakpoint.

**Dark Mode**: Respects system preferences on first load, then persists user choice. Smooth transitions prevent jarring color shifts.

## Accessibility Features

- Semantic HTML5 elements (header, main, nav)
- ARIA roles, labels, and live regions
- Keyboard-navigable custom components
- Focus trap in modal drawer
- Screen reader announcements for dynamic updates
- Touch-friendly 44px minimum target sizes
- Skip links for keyboard users
- High contrast color palette

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari/Chrome (iOS 14+, Android 10+)

## Performance

- Code-split routes (future enhancement)
- Debounced search inputs (300ms)
- Memoized filter/sort operations
- Optimized re-renders with React.memo
- Lightweight bundle (~150KB gzipped)
