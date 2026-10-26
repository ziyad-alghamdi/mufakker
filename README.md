# Mufakker

Mufakker is a modern web platform designed to support a technology-focused community by providing a centralized environment for managing educational programs, workshops, events, registrations, and users.

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

# مفكّر | Mufakker

مفكّر هو منصة ويب حديثة تهدف إلى دعم مجتمع مهتم بالتقنية من خلال توفير بيئة مركزية لإدارة البرامج التعليمية وورش العمل والفعاليات والتسجيلات والمستخدمين.

تتكون المنصة من موقع موجه للمستخدمين، بالإضافة إلى لوحة تحكم إدارية تتيح للمسؤولين المصرح لهم إدارة محتوى المنصة وأنشطتها.

## المميزات الرئيسية

### منصة المستخدم
- استعراض البرامج وورش العمل والفعاليات المتاحة.
- الاطلاع على تفاصيل الأنشطة والفرص.
- إنشاء الحسابات وتسجيل الدخول بشكل آمن.
- التسجيل في ورش العمل والفعاليات المتاحة.
- واجهة متجاوبة مع أجهزة الكمبيوتر والهواتف.

### لوحة تحكم الإدارة
- تسجيل دخول آمن للمسؤولين.
- نظام صلاحيات يعتمد على دور المستخدم.
- إنشاء وتعديل وإدارة ورش العمل والبرامج.
- إدارة الفعاليات ومعلوماتها.
- استعراض وإدارة تسجيلات ورش العمل.
- استعراض وإدارة تسجيلات الفعاليات.
- إدارة مستخدمي المنصة.
- لوحة مركزية لإدارة المنصة.

## التقنيات المستخدمة

**الواجهة الأمامية**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

**الخلفية وقاعدة البيانات**
- Supabase
- PostgreSQL
- Supabase Authentication

**تقنيات إضافية**
- Resend — لخدمات البريد الإلكتروني.
- pdf-lib / PDFKit — لإنشاء ومعالجة ملفات PDF.

## تسجيل الدخول والصلاحيات

تستخدم منصة مفكّر Supabase Authentication لإدارة تسجيل الدخول والتحقق من هوية المستخدمين.

كما تحتوي المنصة على نظام صلاحيات يعتمد على أدوار المستخدمين لفصل المستخدم العادي عن المسؤول وحماية وظائف لوحة التحكم الإدارية.

## بنية النظام

تم بناء مفكّر باستخدام بنية Full-Stack حديثة تعتمد على Next.js.

يربط النظام بين واجهة المستخدم، والوظائف التي تعمل من جهة الخادم، وقاعدة البيانات، ونظام تسجيل الدخول، والخدمات الخارجية ضمن تطبيق ويب متكامل.

يوفر Supabase البنية الخاصة بقاعدة البيانات والمصادقة، بينما يدير Next.js واجهة التطبيق والمنطق الذي يعمل من جهة الخادم.

## لوحة تحكم الإدارة

توفر لوحة التحكم واجهة مركزية لإدارة المنصة.

يمكن للمسؤولين إدارة:

- المستخدمين.
- ورش العمل والبرامج.
- الفعاليات.
- تسجيلات ورش العمل.
- تسجيلات الفعاليات.

كما تتم حماية صفحات الإدارة لمنع المستخدمين غير المصرح لهم من الوصول إلى وظائف الإدارة.

## تشغيل المشروع

قم بتحميل المستودع:

```bash
git clone https://github.com/ziyad-alghamdi/mufakker.git
cd mufakker
```

ثم تثبيت المكتبات:

```bash
npm install
```

بعد إعداد متغيرات البيئة المطلوبة، شغّل المشروع:

```bash
npm run dev
```

ثم افتح:

```text
http://localhost:3000
```

## متغيرات البيئة

يحتاج المشروع إلى متغيرات بيئة خاصة بخدمات مثل Supabase والخدمات الخارجية الأخرى المستخدمة في النظام.

يجب إنشاء ملف `.env.local` وإضافة بيانات الخدمات المطلوبة قبل تشغيل المشروع.

> يجب عدم رفع مفاتيح API أو أي بيانات سرية إلى مستودع GitHub.

## هدف المشروع

تم تطوير مفكّر لتوفير منصة رقمية قابلة للتوسع تساعد في إدارة أنشطة المجتمع والفرص التعليمية، مع تسهيل عمليات الإدارة والتسجيل وإدارة المستخدمين.

كما يُظهر المشروع خبرة عملية في تطوير تطبيقات الويب Full-Stack، وربط قواعد البيانات، وأنظمة تسجيل الدخول والصلاحيات، وبناء لوحات التحكم الإدارية، واستخدام تقنيات React وNext.js الحديثة.

## المطور

**زياد محمد الغامدي**

علوم الحاسب  
جامعة الملك عبدالعزيز

GitHub: ziyad-alghamdi
