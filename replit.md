# Overview

This is a Japanese task management mobile web application built as a React TypeScript single-page application. The app is a frontend-only application that stores all data in browser localStorage, providing comprehensive life management features including todo lists, scheduling, Pomodoro timer, weight tracking, meal logging, diary entries, weekly tracker, calendar view, and user settings (dark mode, custom themes, push notifications). It uses a mobile-first design approach with Tailwind CSS and shadcn/ui components, targeting Japanese users with a customizable theme color scheme (default: pink).

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## November 12, 2025 (Latest)
- **Sleep Tracking Feature Removal**: Completely removed the sleep tracking feature from the application
  - Deleted SleepRecord and InsertSleepRecord type definitions from `client/src/types/local.ts`
  - Removed sleepRecordStore from `client/src/lib/localDataStore.ts`
  - Removed all sleep-related imports, state variables, functions, and mutations from `TaskManager.tsx`
  - Deleted sleep card from home screen's "My Page" section
  - Removed sleep detail screen (renderSleepDetailScreen function)
  - Removed average sleep hours card from weekly review screen
  - Removed sleep column from week tracker
  - Cleaned up data export to exclude sleep records
  - Preserved formatTime function (still used for schedule time display)
  - E2E tests confirmed complete removal with no residual UI or runtime errors

## November 5, 2025
- **Weekly Review Integration**: Added monthly goal section to the weekly review screen
- **Weekly Review Integration**: Added monthly goal section to the weekly review screen
  - Integrated monthly goal display, editing, and completion tracking into the weekly review page
  - Users can now view and edit monthly goals directly from the weekly review screen (below weekly statistics)
  - Current month goals displayed with checkboxes for completion tracking
  - Edit button allows in-place modification of all four goal categories
  - Past months' goals section shows historical goal data with completion status
  - Fixed updateMonthlyGoalMutation to exclude undefined properties (prevents data loss during edits)
  - Fixed handleSaveMonthlyGoal to preserve completion states when editing goal text
  - Tests confirmed: goal display, editing, completion tracking, persistence across page reloads

## November 5, 2025 (Earlier)
- **Monthly Goal Completion Tracking**: Added individual completion checkboxes for each goal category
  - Extended MonthlyGoal type with completion state fields: weightGoalCompleted, todoGoalCompleted, achievementGoalCompleted, activityGoalCompleted
  - Implemented checkbox toggle functionality with handleToggleGoalCompletion
  - Updated UI to display interactive checkboxes next to each goal
  - Completed goals show checked checkbox with checkmark SVG and line-through text styling
  - Past goals display completion status with checkmark symbol (✓) and line-through
  - Completion state persists in localStorage across page reloads
  - Tests confirmed: checkbox toggle, visual state updates, localStorage persistence

## November 5, 2025 (Earlier)
- **Monthly Goal Enhancement**: Extended monthly goal feature with category-based goals
  - Updated MonthlyGoal type: added weightGoal, todoGoal, achievementGoal, activityGoal fields (replacing single 'goals' field)
  - Implemented automatic goal setup screen display at the beginning of each month
  - Added lastGoalSetupMonth tracking in localStorage to detect new months
  - Improved goal setup UI with separate input fields for each category with emoji icons (💪 weight, 📝 todos, 🎯 achievements, ⚡ activities)
  - Updated goal display to show categorized goals with visual separation
  - E2E tests confirmed: category goal input/save/edit, automatic monthly display, localStorage persistence

## October 22, 2025
- **Complete Architecture Migration to localStorage**: Migrated the entire application from database+authentication to localStorage-only architecture
  - Created `client/src/types/local.ts` with local type definitions (removed userId fields)
  - Implemented `client/src/lib/localDataStore.ts` module providing CRUD operations for all data types
  - Created `client/src/hooks/useLocalData.ts` custom hook with React Query-like interface
  - Completely rewrote `TaskManager.tsx` (3300+ lines) to use localStorage instead of API calls
  - Removed authentication system: deleted AuthContext, login screen, and logout functionality
  - Simplified `App.tsx`: removed AuthProvider and QueryClientProvider, now directly renders TaskManager
  - Fixed TypeScript type errors: unified weight/height/bodyFat as number type (not string)
  - Updated data export functionality to work with localStorage
  - All data now persists in browser localStorage; no server-side storage

## October 22, 2025 (Earlier)
- **Schedule Display Update**: Modified schedule display to show only today's schedules in the tasks screen. Added "Past Schedules" button that opens a modal displaying all non-today schedules grouped by month in descending order.
- **LSP Error Fix**: Fixed TypeScript type errors in insertTodoSchema and createTodoMutation by properly defining InsertTodo type with all optional fields (repeatType, repeatDays, repeatDate, location, locationLat, locationLng, locationRadius).

## October 15, 2025
- **Calendar View Implementation**: Added monthly calendar screen with task/schedule visualization, deadline alerts (overdue tasks shown in red), and day selection to view detailed tasks and schedules
- **Settings Screen Implementation**: Implemented user settings with dark mode toggle, custom theme selection (5 colors: pink, blue, green, purple, orange), and push notification preferences
- **Header Navigation**: Added calendar and settings icons to home screen header for easy access
- **User Settings Database**: Created userSettings table to persist user preferences (dark mode, theme color, push notifications)
- **React Hooks Fix**: Resolved React Rules of Hooks violations by moving calendar screen state (calendarMonth, calendarSelectedDay) to TaskManager component top level
- **All features tested**: End-to-end tests confirmed calendar navigation, settings changes, and theme persistence work correctly
- **Navigation Restructure**: Moved timer icon to home screen header (left of calendar icon), removed timer from bottom navigation bar. Bottom nav now contains only home button.
- **Task Management Screen**: Created dedicated task management screen with TODOs, schedules, and management cards (daily routine, monthly goals, weekly review, week tracker). Moved these features from home screen to new dedicated screen accessible via bottom navigation.
- **Link Collection Feature**: Implemented link management system to save and organize video links (YouTube, articles, etc.). Added links table to database, created API endpoints (GET, POST, DELETE), and built dedicated links screen with add/delete functionality. Link card added to home screen's "My Page" section.

# System Architecture

## Frontend Architecture

The client uses a modern React setup with TypeScript and Vite as the build tool. The application is entirely frontend-based with:

- **State Management**: localStorage-based data persistence with custom hooks mimicking React Query interface
- **Routing**: Single-page application with screen-based navigation (no traditional routing)
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **Theme System**: CSS custom properties with a pink-based color scheme optimized for mobile
- **Data Persistence**: All data stored in browser localStorage via LocalDataStore module

## Data Storage

The application uses browser localStorage for all data persistence:

- **Local Type Definitions**: Types defined in `client/src/types/local.ts` without userId fields
- **LocalDataStore Module**: Provides CRUD operations for all data types (todos, schedules, weight records, meal records, diary entries, links, user settings)
- **Storage Keys**: Each data type stored under a unique localStorage key (e.g., 'todos', 'schedules')
- **Data Format**: All data stored as JSON arrays with auto-generated IDs
- **Custom Hooks**: `useLocalData` hooks provide React Query-like interface for local data access

## Backend Architecture (Legacy - Not Used)

Note: Backend code still exists but is not used by the application. The app is fully client-side.

- Backend server runs but frontend does not make API calls
- All data operations happen in the browser via localStorage
- Backend files can be removed in future cleanup

# External Dependencies

- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS for utility-first styling approach
- **Fonts**: Google Fonts integration (Inter and Noto Sans JP for Japanese support)
- **Charts**: Chart.js for data visualization in tracking features (if implemented)
- **Development Tools**: Replit-specific plugins for development environment integration
- **Build Tools**: Vite for fast development and optimized production builds
- **Validation**: Zod for runtime type checking and form validation
- **Storage**: Browser localStorage API for all data persistence