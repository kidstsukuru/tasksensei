# Overview

This is a Japanese task management mobile web application built as a React TypeScript single-page application with an Express.js backend. The app provides comprehensive life management features including todo lists, scheduling, Pomodoro timer, sleep tracking, weight tracking, meal logging, diary entries, weekly tracker, calendar view, and user settings (dark mode, custom themes, push notifications). It uses a mobile-first design approach with Tailwind CSS and shadcn/ui components, targeting Japanese users with a customizable theme color scheme (default: pink).

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## October 15, 2025
- **Calendar View Implementation**: Added monthly calendar screen with task/schedule visualization, deadline alerts (overdue tasks shown in red), and day selection to view detailed tasks and schedules
- **Settings Screen Implementation**: Implemented user settings with dark mode toggle, custom theme selection (5 colors: pink, blue, green, purple, orange), and push notification preferences
- **Header Navigation**: Added calendar and settings icons to home screen header for easy access
- **User Settings Database**: Created userSettings table to persist user preferences (dark mode, theme color, push notifications)
- **React Hooks Fix**: Resolved React Rules of Hooks violations by moving calendar screen state (calendarMonth, calendarSelectedDay) to TaskManager component top level
- **All features tested**: End-to-end tests confirmed calendar navigation, settings changes, and theme persistence work correctly
- **Navigation Restructure**: Moved timer icon to home screen header (left of calendar icon), removed timer from bottom navigation bar. Bottom nav now contains only home button.
- **Task Management Screen**: Created dedicated task management screen with TODOs, schedules, and management cards (daily routine, monthly goals, weekly review, week tracker). Moved these features from home screen to new dedicated screen accessible via bottom navigation.

# System Architecture

## Frontend Architecture

The client uses a modern React setup with TypeScript and Vite as the build tool. The application follows a component-based architecture with:

- **State Management**: React Query for server state management and React Context for authentication
- **Routing**: Single-page application with screen-based navigation (no traditional routing)
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **Theme System**: CSS custom properties with a pink-based color scheme optimized for mobile

## Backend Architecture

The server follows a RESTful API design using Express.js with TypeScript:

- **API Structure**: Route handlers in `/api` endpoints with Express middleware
- **Session Management**: Express sessions with memory store for authentication
- **Data Access Layer**: Storage abstraction pattern with Drizzle ORM
- **Authentication**: Session-based auth with bcrypt password hashing
- **Development**: Vite integration for hot module replacement in development

## Data Storage

The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations:

- **Schema Definition**: Centralized schema in `shared/schema.ts` with Zod validation
- **Database Client**: Neon serverless PostgreSQL driver for cloud deployment
- **Migrations**: Drizzle Kit for database schema migrations
- **Type Safety**: Full type safety between frontend and backend using shared types

## Authentication & Authorization

Session-based authentication system:

- **Password Security**: bcrypt hashing with salt rounds
- **Session Storage**: Express sessions with configurable store
- **Route Protection**: Middleware-based authentication for API endpoints
- **Frontend Auth**: Context provider with automatic authentication status checking

# External Dependencies

- **Database**: Neon PostgreSQL serverless database
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS for utility-first styling approach
- **Fonts**: Google Fonts integration (Inter and Noto Sans JP for Japanese support)
- **Charts**: Chart.js for data visualization in tracking features
- **Development Tools**: Replit-specific plugins for development environment integration
- **Build Tools**: Vite for fast development and optimized production builds
- **Validation**: Zod for runtime type checking and form validation