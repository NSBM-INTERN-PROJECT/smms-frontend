# SMMS Frontend (Student Mentoring Management System)

This is the official frontend for SMMS, built with **Vite, React 18, TypeScript, TailwindCSS (for utility functions), and Vanilla CSS (for design system)**.

## 🚀 Setup Guide

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Make sure the backend is running on port 8080. The Vite proxy is already configured to route `/api` to `http://localhost:8080`.*

3. **Run Dev Server**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture & Conflict Prevention

To prevent merge conflicts in a team setting, we use a **Role-Based Folder Structure**. 

- **Global/Shared Code** (`src/components/ui`, `src/api`, `src/store`) should only be modified by the Lead (or via approved PR).
- **Page Implementation** is isolated by role. Each member works exclusively in their assigned folder.

### 👥 Member Ownership Mapping

|  Folder | Responsibilities |
|---------|------------------|
| `src/components/ui/`, `src/api/` | Architecture, Design System, API Integration |
| `src/pages/auth/`, `src/pages/admin/ReportsPage.tsx` | Authentication flow, OTP, Analytics/Reports |
| `src/pages/admin/UsersPage.tsx`, `src/pages/student/ProfilePage.tsx` | User management, profile editing |
| `src/pages/admin/AllocationsPage.tsx`, `src/pages/coordinator/` | Coordinator flows, Allocation engine UI |
| `src/pages/mentor/`, `src/pages/student/MeetingsPage.tsx` | Mentoring sessions, meeting requests |

## 🎨 Design System

We strictly use the custom CSS properties defined in `src/styles/index.css` and the classes in `src/styles/components.css`. 
- **Colors**: Dark Navy (`#0C1220`), Electric Cyan (`#22D3EE`), Warm Amber (`#F59E0B`).
- **Typography**: Syne (Headings), Plus Jakarta Sans (Body).

Avoid ad-hoc inline styles. Use the provided UI atoms (`<Button>`, `<Card>`, `<Badge>`, etc.) to maintain visual consistency.
