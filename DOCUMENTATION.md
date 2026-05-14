# Technical Documentation: Smart Job Hunt

## 1. Project Overview
**Smart Job Hunt** is a full-stack Career CRM designed to streamline the job application process. It combines high-performance application tracking with automated outreach tools, allowing job seekers to manage hundreds of applications efficiently.

---

## 2. Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS, Framer Motion (Animations), Recharts (Data Viz).
- **Backend:** Python Flask, SQLite3, Python SMTP library.
- **Tools:** Axios (API calls), Hello Pangea DND (Kanban), Material Symbols (Icons).

---

## 3. Core Modules

### A. Job Tracker (Kanban Board)
- **Functionality:** Manage job stages via a drag-and-drop interface.
- **Columns:** Wishlist, Applied, Interviewing, Offer, Rejected.
- **Smart Features:** Automated "Overdue" alerts for follow-ups based on user-defined dates.

### B. Bulk Email Sender
- **Functionality:** Mass-personalization of recruiter outreach.
- **CSV Engine:** Custom parser for importing contact lists.
- **Variable Injection:** Uses `{name}`, `{company}`, and `{role}` tags for dynamic content replacement.
- **Attachment System:** Automatically attaches the user's PDF resume from the server.

### C. Analytics Dashboard
- **Metrics:** Total applications, response rates, and application funnels.
- **Visualization:** Bar charts for weekly activity and Pie charts for status distribution.

---

## 4. System Architecture

### Backend Structure (`/backend`)
- `app.py`: Main API gateway and route handlers.
- `database.py`: SQLite schema definition and connection management.
- `email_sender.py`: The core automation engine handling SMTP connections and email construction.
- `uploads/`: Persistent storage for the user's resume PDF.

### Frontend Structure (`/frontend`)
- `src/pages/`: Contains all main views (Dashboard, Tracker, BulkSender, Analytics, Settings).
- `src/context/`: Global state management for Themes and UI Notifications (Toasts).
- `src/components/`: Reusable UI elements (Navbar, JobCards, etc.).

---

## 5. API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/jobs` | GET | Fetch all job applications. |
| `/api/jobs` | POST | Add a new job application. |
| `/api/stats` | GET | Fetch aggregated data for charts. |
| `/api/send-emails` | POST | Trigger the bulk email automation. |
| `/api/upload-resume` | POST | Upload and store the resume PDF. |
| `/api/settings` | GET/POST | Manage SMTP and UI configuration. |

---

## 6. Automation Logic
The Bulk Sender follows a **mimic-human** protocol:
1.  **Login:** Establishes a TLS connection with `smtp.gmail.com`.
2.  **Iterate:** Loops through the recipient list from the uploaded CSV.
3.  **Personalize:** Uses Python's `.format()` to inject recipient data into the template.
4.  **Wait:** Implements a configurable delay (default 2s) between emails to maintain sender reputation.
5.  **Log:** Records the success/failure status of each attempt in the database.

---

## 7. Security Best Practices
- **App Passwords:** The system requires a Google App Password instead of primary account credentials.
- **Local-First:** All data is stored in a local SQLite database, ensuring privacy.
- **Environment Variables:** Production builds use `.env` files for sensitive configuration.
