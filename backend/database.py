import sqlite3
import os
from datetime import datetime, timedelta

DB_PATH = 'jobs.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Jobs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            role TEXT NOT NULL,
            status TEXT DEFAULT 'Saved',
            priority TEXT DEFAULT 'Medium',
            date_applied TEXT,
            follow_up_date TEXT,
            notes TEXT
        )
    ''')
    
    # Emails sent table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS emails_sent (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipient TEXT NOT NULL,
            company TEXT,
            subject TEXT,
            status TEXT,
            sent_at TEXT
        )
    ''')
    
    # Settings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            smtp_email TEXT,
            smtp_password TEXT,
            default_resume_path TEXT,
            theme TEXT DEFAULT 'dark'
        )
    ''')
    
    # Seed data if empty
    cursor.execute('SELECT COUNT(*) FROM jobs')
    if cursor.fetchone()[0] == 0:
        today = datetime.now().strftime('%Y-%m-%d')
        next_week = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        
        sample_jobs = [
            ('Google', 'Software Engineer', 'Applied', 'Hot', today, next_week, 'Referral from John'),
            ('Microsoft', 'Product Manager', 'Saved', 'Medium', None, None, 'Check LinkedIn for contacts'),
            ('Netflix', 'Frontend Developer', 'Interview', 'Hot', today, today, 'Round 2 scheduled')
        ]
        cursor.executemany('''
            INSERT INTO jobs (company, role, status, priority, date_applied, follow_up_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', sample_jobs)
        
    # Default settings
    cursor.execute('SELECT COUNT(*) FROM settings')
    if cursor.fetchone()[0] == 0:
        cursor.execute('INSERT INTO settings (theme) VALUES ("dark")')
        
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized!")
