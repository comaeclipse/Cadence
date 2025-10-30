# Cadence

A modern behavior tracking application for Applied Behavior Analysis (ABA) data collection and behavioral incident logging.

## Overview

Cadence is a web application built with Next.js that provides a streamlined interface for tracking behavioral incidents, poop events, and other ABA data throughout the day. The app features an intuitive design with multi-level expandable forms for quick data entry and a PostgreSQL backend for reliable data persistence.

## Purpose

Cadence is designed for parents, caregivers, therapists, and behavior analysts to track behavioral incidents with detailed information including behavior type, severity, duration, triggers, consequences, and function hypotheses. The app aims to make ABA data collection simple, accessible, and consistent.

## Features

- **Multi-Level Entry System**: Expandable "add..." button that reveals Incident or Poop logging options
- **Behavioral Incident Tracking**: Log behavior type, severity, duration, trigger, consequence, and notes
- **Poop Event Tracking**: Quick-log consistency types (Soft, Normal, Hard, Formed, Loose, Watery)
- **Auto-Scroll UX**: Smart form navigation that scrolls to next relevant section
- **Calendar View**: Visual month view with incident highlighting
- **Child Profiles**: Support for multiple children with easy switching
- **Real-time Toast Notifications**: Immediate feedback for user actions
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Tech Stack

### Core Framework
- **Next.js 15.5.5** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type-safe development

### Database & Backend
- **Prisma 6.17** - Type-safe ORM
- **Neon PostgreSQL** - Serverless Postgres database
- **Next.js API Routes** - RESTful API endpoints

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI primitives
- **Radix UI** - Accessible component primitives (Select, Slider, Dialog, Accordion, etc.)
- **Lucide React** - Modern icon library (1000+ icons)
- **class-variance-authority** - Component variant styling
- **tailwind-merge** - Smart class merging

### Forms & Validation
- **React Hook Form 7.65** - Performant form handling
- **Zod 4** - TypeScript-first schema validation

### Additional Libraries
- **Sonner** - Beautiful toast notifications
- **date-fns** - Date manipulation and formatting
- **React Day Picker** - Calendar component
- **Recharts** - Charts and data visualization
- **React Swipeable** - Touch gesture support
- **@tanstack/react-query** - Data fetching and caching
- **next-themes** - Dark/light mode theming

### Legacy Dependencies (Not Currently Used)
- **Dexie** - Replaced by Prisma/PostgreSQL
- **Capacitor** - Mobile app framework (web-only now)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Neon PostgreSQL database (get free at [neon.tech](https://neon.tech))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/comaeclipse/Cadence.git
cd Cadence/behavior-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Neon database URLs:
```env
DATABASE_URL="postgresql://..." # Pooled connection
DIRECT_URL="postgresql://..."    # Direct connection (for migrations)
```

4. Initialize the database:
```bash
npx prisma db push
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

The app uses Prisma with the following main models:
- **Child** - Child profiles
- **Incident** - Behavioral incident logs with relations to behaviors, antecedents, consequences, interventions
- **Behavior**, **Antecedent**, **Consequence**, **Intervention**, **Location** - Catalog items
- **Attachment** - Media attachments for incidents

## API Routes

- `GET/POST /api/incidents` - List and create incidents
- `GET/PATCH/DELETE /api/incidents/[id]` - Individual incident operations
- `GET/POST /api/children` - Child profile management
- `GET/POST /api/catalogs/[type]` - Catalog management (behaviors, antecedents, etc.)

## Deployment

The app is configured for deployment on Vercel:

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to master branch

Build uses production webpack (not turbopack) and generates Prisma Client automatically via `postinstall` script.

## Roadmap

- [x] PostgreSQL integration with Prisma
- [x] Multi-level add button UI
- [x] Poop event tracking
- [x] Consequence field with custom input
- [ ] Advanced analytics and reports
- [ ] Data export (CSV, PDF)
- [ ] Multi-user authentication
- [ ] Timeline view improvements
- [ ] Catalog management UI
- [ ] Mobile-optimized gestures
