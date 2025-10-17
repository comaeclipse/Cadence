# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### 2025-10-17 - Fix Calendar View

#### Fixed
- Calendar page now shows actual month calendar grid with 30+ days
- Days with incidents are highlighted in emerald green
- Click day to expand accordion showing incident details for that date
- Added month navigation (previous/next)
- Added visual legend for calendar indicators

### 2025-10-17 - Mobile-Only iOS Design

#### Added
- Mobile-first iOS design system across entire application
- Reusable `MobileLayout` component with iOS status bar, header, and bottom navigation
- Swipe gesture navigation between main tabs (Home, Calendar, Insights, Settings)
- `react-swipeable` package for touch gesture handling

#### Changed
- Converted all pages to mobile-only design:
  - Home page (dashboard with expandable incident form)
  - Calendar page
  - Log page
  - Timeline page
  - Reports/Insights page (with analytics charts)
  - Settings page (with navigation menu)
  - Children management page
  - Behavior catalogs page
- Simplified layout system - removed desktop header and conditional logic
- Updated navigation to fixed bottom tab bar with 4 main sections
- Unified visual design: stone backgrounds, emerald accents, rounded cards

#### Removed
- Desktop layout components and conditional rendering
- Individual bottom navigation implementations (now centralized)

