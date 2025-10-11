# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

Development commands:
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint

Database operations:
- `npx prisma generate` - Generate Prisma client (outputs to src/lib/generated/prisma)
- `npx prisma migrate dev` - Run database migrations
- `npx prisma studio` - Open Prisma Studio database viewer

## Architecture Overview

This is a Next.js 15 dashboard application using the App Router with the following key architectural decisions:

### Authentication & Database
- **Authentication**: Better Auth with email/password and organization support
- **Database**: PostgreSQL with Prisma ORM
- **Prisma Client**: Custom output location at `src/lib/generated/prisma`
- **Database Models**: User, Session, Account, Organization, Member, Invitation, Verification

### UI & Styling  
- **UI Components**: Radix UI primitives with shadcn/ui (New York style)
- **Styling**: Tailwind CSS v4 with CSS variables
- **Icons**: Lucide React
- **Theme**: Dark/light mode support with next-themes
- **Charts**: Recharts for data visualization

### Project Structure
- **App Directory**: Uses Next.js App Router with route groups `(dashboard)`
- **Path Aliases**: 
  - `@/*` → `./src/*`
  - `@app/*` → `./app/*`
- **Components**: Located in `src/components/` with separate `ui/` and `dashboard/` folders
- **Authentication pages**: `app/auth/` for login/signup flows
- **API routes**: `app/api/[...auth]/` for Better Auth endpoints

### Key Features
- Multi-organization support with role-based access
- Dashboard with sidebar navigation using shadcn/ui sidebar component
- Form handling with React Hook Form + Zod validation
- Interactive charts and data tables
- Responsive design with mobile detection hook

### Development Notes
- Uses TypeScript with strict mode
- Custom Prisma client generation to `src/lib/generated/prisma`
- Better Auth configuration in `src/lib/auth.ts`
- Database connection utilities in `src/lib/prisma/`
- @app/(dashboard)/dashboard/reductions/ajouter/add-discount-form.tsx Peux-tu ajouter le time picker pour la date de début et d'expiration