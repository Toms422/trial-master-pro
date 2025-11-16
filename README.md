# Trial Management System - Participant Database & Check-in

מערכת ניהול נסיינים לניסויים עם קבלת פרטים דרך QR Code ויצוא INI

A comprehensive trial management system for managing participants, scheduling trial days, and collecting participant data via mobile check-in forms.

## Project info

**URL**: https://lovable.dev/projects/18022a91-b474-404d-9ca6-bf0e26d48e54

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/18022a91-b474-404d-9ca6-bf0e26d48e54) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Features Implemented

### Core Functionality
- **Trial Days Management** (`/trial-days`) - Create, edit, and manage trial schedules with station assignments
- **Participant Management** (`/participants`) - Full CRUD operations with real-time status tracking
- **Excel Import** - Bulk participant import with automatic column detection and duplicate handling
- **QR Code Generation** - Unique QR codes for participant check-in with download/print options
- **Mobile Check-In Form** (`/check-in/:qrId`) - Responsive form for collecting participant demographics
- **INI Export** - Export individual or bulk participant data in INI format
- **Audit Logging** (`/audit`) - Complete audit trail with filtering and search
- **User Management** (`/admin`) - Admin panel for user and role assignment

### User Roles & Permissions
- **Admin**: Full system access (all features)
- **Operator**: Participant and trial day management
- **QA Viewer**: Read-only access to audit logs

### Security & Data Protection
- Row-Level Security (RLS) policies
- OAuth2 authentication via Supabase
- Encrypted data transmission
- Audit logging for all operations

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe development
- **React 18** - UI framework
- **shadcn-ui** - Component library
- **Tailwind CSS** - Styling framework
- **Supabase** - Backend & PostgreSQL database
- **TanStack Query** - Server state management
- **React Hook Form + Zod** - Form handling and validation
- **xlsx** - Excel file parsing
- **qrcode.react** - QR code generation
- **react-dropzone** - File upload handling
- **lucide-react** - Icon library
- **Hebrew (RTL)** - Full RTL support

## API Routes & Pages

### Public Routes
- `GET /check-in/:qrId` - Participant data entry form (no auth required)

### Protected Routes (Admin/Operator)
- `GET /trial-days` - Trial schedule management
- `GET /participants` - Participant database
- `POST /participants` - Create/update participants
- `POST /participants/import` - Excel import endpoint

### Protected Routes (Admin Only)
- `GET /stations` - Trial station management
- `GET /audit` - Audit log viewer
- `GET /admin` - User management

### Protected Routes (Admin/QA Viewer)
- `GET /audit` - Audit log access

## Database Schema

The system uses PostgreSQL with the following key tables:

- **trial_days** - Trial schedules and metadata
- **trial_day_stations** - Junction table for trial/station relationships
- **stations** - Physical trial locations/equipment
- **participants** - Participant records with full demographics
- **user_roles** - User to role mappings
- **profiles** - Extended user profiles
- **audit_log** - Complete audit trail

All tables have Row-Level Security (RLS) policies for role-based access control.

## Development Quick Start

```sh
# Install dependencies (use legacy-peer-deps due to date-fns v4 conflict)
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Excel Import Format

The Excel import accepts any of these column names:
- **Required**: "שם"/"Name"/"full_name" (full name), "טלפון"/"Phone"/"phone" (phone)
- **Optional**: Age, BirthDate, Weight, Height, Gender, SkinColor, Allergies, Notes

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/18022a91-b474-404d-9ca6-bf0e26d48e54) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
