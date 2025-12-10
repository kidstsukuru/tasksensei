# Overview

This is a Japanese task management mobile web application built as a React TypeScript single-page application with PWA support. It provides comprehensive life management features including todo lists, scheduling, Pomodoro timer, weight tracking, meal logging, diary entries, weekly tracker, calendar view, and user settings. The app is frontend-only, storing all data in browser localStorage, and utilizes a mobile-first design with Tailwind CSS and shadcn/ui components, targeting Japanese users with a customizable theme (default: pink).

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client uses a modern React setup with TypeScript and Vite. It is a frontend-only application with:

-   **State Management**: localStorage-based data persistence with custom hooks mimicking React Query.
-   **Routing**: Single-page application with screen-based navigation.
-   **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS.
-   **Form Handling**: React Hook Form with Zod validation.
-   **Theme System**: CSS custom properties with a pink-based color scheme optimized for mobile.
-   **PWA Support**: Implemented with `manifest.json` and a Service Worker for offline capabilities.

## Data Storage

The application uses browser localStorage for all data persistence:

-   **Local Type Definitions**: Types defined in `client/src/types/local.ts`.
-   **LocalDataStore Module**: Provides CRUD operations for all data types (todos, schedules, weight records, meal records, diary entries, links, user settings).
-   **MonthlyGoalDataStore**: Specialized store class for monthly goals with automatic legacy data migration.
-   **Storage Keys**: Each data type stored under a unique localStorage key.
-   **Data Format**: All data stored as JSON arrays with auto-generated IDs.
-   **Data Migration**: Monthly goals are automatically migrated from legacy scalar format to array format.
-   **Custom Hooks**: `useLocalData` hooks provide a React Query-like interface for local data access.

## System Design Choices

-   **Mobile-First Design**: Optimized for mobile devices.
-   **Feature Set**: Includes todo lists, scheduling, Pomodoro timer, weight tracking, meal logging, diary entries, weekly tracker, calendar, and user settings (dark mode, custom themes, push notifications).
-   **Goal Management**: Comprehensive weekly and monthly goal systems with progress tracking and interactive completion checkboxes.
-   **Data Export**: Functionality to export user data.

# External Dependencies

-   **UI Components**: Radix UI primitives
-   **Styling**: Tailwind CSS
-   **Fonts**: Google Fonts (Inter, Noto Sans JP)
-   **Charts**: Chart.js (for data visualization)
-   **Build Tools**: Vite
-   **Validation**: Zod
-   **Storage**: Browser localStorage API