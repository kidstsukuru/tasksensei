# Overview

This is a Japanese task management mobile web application built as a React TypeScript single-page application with an Express.js backend. The app provides comprehensive life management features including todo lists, scheduling, Pomodoro timer, sleep tracking, weight tracking, meal logging, and diary entries. It uses a mobile-first design approach with Tailwind CSS and shadcn/ui components, targeting Japanese users with a pink theme color scheme.

# User Preferences

Preferred communication style: Simple, everyday language.

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