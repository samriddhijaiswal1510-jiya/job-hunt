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

*Happy Job Hunting!* 🚀
