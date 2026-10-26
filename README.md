🌐 **Language:** [English](README.md) | [العربية](README_AR.md)

# Mufakker

Mufakker is a modern web platform designed to support a technology-focused community by providing a centralized environment for managing educational programs, workshops, events, registrations, and users.

The platform is fully deployed and publicly accessible online.

🌐 Live Website: https://mufakker.com

The platform includes a public-facing website for users and a dedicated administration dashboard that allows authorized administrators to manage the platform's content and activities.

## Key Features

### User Platform
- Browse available programs, workshops, and events.
- View detailed information about activities and opportunities.
- Register and authenticate securely.
- Register for available workshops and events.
- Access a responsive interface across desktop and mobile devices.

### Admin Dashboard
- Secure administrator authentication.
- Role-based access to administrative features.
- Create, update, and manage workshops and programs.
- Manage events and their information.
- View and manage workshop registrations.
- View and manage event registrations.
- Manage platform users.
- Centralized dashboard for platform administration.

## Tech Stack

**Frontend**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

**Backend & Database**
- Supabase
- PostgreSQL
- Supabase Authentication

**Additional Technologies**
- Resend — Email functionality
- pdf-lib / PDFKit — PDF generation and processing

## Authentication & Authorization

Mufakker uses Supabase Authentication to handle user authentication.

The platform also implements role-based access control to separate regular users from administrators and protect administrative functionality.

## Architecture

Mufakker is built using a modern full-stack architecture with Next.js.

The application integrates the frontend, server-side functionality, authentication, database operations, and external services into a unified web application.

Supabase provides the database and authentication infrastructure, while Next.js manages the application interface and server-side logic.

## Database Architecture

Mufakker uses **Supabase** as its backend platform, providing PostgreSQL database services, authentication, and file storage.

The database is structured around users, training courses, events, workshops, and their associated registrations.

```text
                    ┌─────────────────┐
                    │  Supabase Auth  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │      users      │
                    ├─────────────────┤
                    │ id              │
                    │ full_name_ar    │
                    │ full_name_en    │
                    │ email           │
                    │ phone           │
                    │ university      │
                    │ skills          │
                    └───────┬─────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
┌────────────────────────┐   ┌────────────────────────┐
│ course_registrations   │   │ event_registrations    │
├────────────────────────┤   ├────────────────────────┤
│ id                     │   │ id                     │
│ user_id                │   │ user_id                │
│ course_id              │   │ event_id               │
│ status                 │   │ status                 │
│ name_ar                │   │ idea                   │
│ name_en                │   │ skills                 │
│ phone                  │   │ old_attempts           │
│ email                  │   │ created_at             │
│ university             │   └───────────┬────────────┘
└────────────┬───────────┘               │
             │                           │
             ▼                           ▼
     ┌───────────────┐           ┌───────────────┐
     │    courses    │           │    events     │
     ├───────────────┤           ├───────────────┤
     │ id            │           │ id            │
     │ title         │           │ title         │
     │ description   │           │ description   │
     │ date          │           │ date          │
     │ location      │           │ location      │
     │ image_url     │           │ image_url     │
     │ featured      │           │ featured      │
     └───────────────┘           └───────────────┘

                    ┌─────────────────────┐
                    │      workshops      │
                    ├─────────────────────┤
                    │ id                  │
                    │ title               │
                    │ description         │
                    │ date                │
                    │ image_url           │
                    │ certificate_type    │
                    │ certificate_template│
                    └─────────────────────┘
```

### Data Relationships

- A user can register for multiple courses.
- A course can have multiple registrations.
- A user can register for multiple events.
- An event can have multiple registrations.
- Registration records maintain their own status to support administrative approval and rejection workflows.
- Event registrations can store participant ideas, skills, and previous attempts.
- User skills are stored in the user profile and can be reused during event registration.

### Authentication & Data Security

Authentication is handled through **Supabase Auth**.

User profile records are associated with authenticated user IDs, and Row Level Security (RLS) is used to restrict profile updates so authenticated users can update their own information.

### Storage Architecture

Mufakker also uses **Supabase Storage** for managing application files, including event images, workshop images, certificate templates, and certificate-related assets.

This architecture combines authentication, relational data, registration workflows, and file storage within a unified backend platform.

## Admin Dashboard

The administration dashboard provides a centralized interface for managing the platform.

Administrators can manage:

- Users
- Workshops and programs
- Events
- Workshop registrations
- Event registrations

Administrative routes are protected to prevent unauthorized users from accessing management functionality.

## Installation

Clone the repository:

```bash
git clone https://github.com/ziyad-alghamdi/mufakker.git
cd mufakker
```

Install the dependencies:

```bash
npm install
```

Configure the required environment variables and then start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

The project requires environment variables for services such as Supabase and other external integrations.

Create a `.env.local` file and configure the required credentials before running the application.

> Never commit API keys or private credentials to the repository.

## Project Purpose

Mufakker was developed to provide a scalable digital platform for managing community activities and educational opportunities while simplifying administration, registration, and user management.

The project demonstrates practical experience in full-stack web development, database integration, authentication and authorization, administrative systems, and modern React/Next.js development.

## Author

**Ziyad Mohammed Alghamdi**

Computer Science  
King Abdulaziz University

GitHub: ziyad-alghamdi
