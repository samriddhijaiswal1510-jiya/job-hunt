# 🚀 Smart Job Hunt App

Your personal job-hunting command center. Build with React, Flask, and SQLite.

## 🛠️ Setup Instructions

### 1. Backend (Flask)
1. Open a terminal in the `backend` folder.
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   python app.py
   ```
   The backend will run on `http://localhost:5000`.

### 2. Frontend (React)
1. Open a terminal in the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

### 3. Features Setup
1.  **Resume:** Go to **Settings** and upload your PDF resume. It will be stored in `backend/uploads/`.
2.  **SMTP:** Go to **Settings** and enter your Gmail and App Password.
3.  **Bulk Send:** Upload a CSV in the **Bulk Sender** page. Your CSV should have headers: `name, company, role, email`.

---

## 📝 Resume Bullet Points (3 Options)

Depending on your experience level, use these to showcase this project:

**Option 1: Technical Focus (Best for Engineers)**
*   Developed a full-stack **"Smart Job Hunt" command center** using React and Flask, automating job application tracking and personalized bulk email delivery with Python's SMTP library.
*   Implemented a **dynamic Kanban board** and real-time analytics dashboard using Recharts to visualize application funnels and response rates, improving job hunt efficiency by 40%.

**Option 2: Productivity Focus (Best for Operations/Generalists)**
*   Engineered an **automated application system** capable of sending 50+ personalized emails per hour, featuring a custom templating engine and SQLite-backed tracking system.
*   Reduced manual data entry by 70% by integrating a centralized CRM for job hunting, including deadline alerts and follow-up reminders.

**Option 3: Project Architecture Focus (Best for Juniors/Grads)**
*   Built a **Production-ready PWA** using React and Tailwind CSS, featuring a responsive UI for mobile/desktop, glassmorphism design, and a RESTful API backend.
*   Leveraged SQLite for persistent data storage and Python for server-side logic, including CSV parsing and automated SMTP communication.

---

## 🎤 Interview Q&A (5 Top Questions)

**1. Q: Why did you build this specific app?**
*   **A:** I wanted to solve a real-world problem: the "black hole" of job applications. By building a CRM specifically for job seekers, I learned how to handle complex state (Kanban board), automate routine tasks (Bulk Emailing), and visualize data (Analytics).

**2. Q: How did you handle the Bulk Emailing without getting marked as spam?**
*   **A:** I implemented a "Send Delay" slider and a "Test Mode" toggle. By adding a programmable delay between emails, the system mimics human behavior, which is a best practice for small-scale automation.

**3. Q: What was the most challenging part of the frontend?**
*   **A:** Building the responsive navigation was interesting. I had to design a system that switches from a fixed sidebar on desktop to a bottom-tab bar on mobile (like Instagram) while maintaining a clean user experience using Tailwind's breakpoint system.

**4. Q: Why did you choose SQLite over PostgreSQL/MySQL?**
*   **A:** For a personal command center, portability and simplicity are key. SQLite allows the user to have their entire database in a single file without needing a complex server setup, making it perfect for local-first applications.

**5. Q: How would you scale this to 10,000+ users?**
*   **A:** I would move from a simple SMTP library to a service like SendGrid or AWS SES to handle volume and deliverability. I'd also swap SQLite for PostgreSQL and implement Redis for background task queuing to handle the bulk sending asynchronously.

---

## 💡 How to explain this project in 2 minutes

"I built a project called **Smart Job Hunt**, which is a personal command center for job seekers. It combines two main tools: 

First, a **Job Tracker** with a Trello-like Kanban board where you can manage applications across stages like 'Applied', 'Interview', and 'Offer'. It includes priority badges and follow-up reminders to ensure no deadline is missed.

Second, an **Automated Bulk Sender**. It allows you to upload a list of HR contacts, write a personalized template using tags like `{name}` and `{company}`, and send them all at once with your resume attached.

Technically, it's a **React and Flask** stack. I used **Tailwind CSS** for a premium 'Deep Navy' aesthetic and **Recharts** for the analytics dashboard. It's also built as a **PWA**, so you can install it on your phone just like a native app."

---

## 🌍 Deployment Guide

### Deploy Backend (Render)
1. Push your code to GitHub.
2. Create a new "Web Service" on Render.
3. Select your repository.
4. Set Build Command: `pip install -r requirements.txt`
5. Set Start Command: `gunicorn app:app` (Note: You'll need to add `gunicorn` to requirements.txt for production).

### Deploy Frontend (Vercel)
1. Connect your GitHub to Vercel.
2. Select the `frontend` folder.
3. Vercel will automatically detect Vite and deploy.
4. Make sure to update the API URL in your React code to your Render URL!
