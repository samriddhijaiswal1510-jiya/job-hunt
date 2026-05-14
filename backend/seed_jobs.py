import sqlite3

conn = sqlite3.connect('jobs.db')

# Fix existing priority values
conn.execute("UPDATE jobs SET priority='High' WHERE priority='Hot'")

# Add more sample jobs across all columns
jobs = [
    ('Amazon', 'Cloud Architect', 'Saved', 'High', '2026-05-10', '2026-05-15', 'AWS team'),
    ('Stripe', 'Backend Engineer', 'Saved', 'Medium', None, None, 'Fintech role'),
    ('Meta', 'ML Engineer', 'Applied', 'High', '2026-05-09', '2026-05-12', 'Applied via referral'),
    ('Apple', 'iOS Developer', 'Applied', 'Low', '2026-05-08', '2026-05-20', 'Online application'),
    ('Spotify', 'Data Scientist', 'Interview', 'High', '2026-05-07', '2026-05-10', 'Phone screen done'),
    ('Uber', 'Full Stack Dev', 'Offer', 'High', '2026-05-01', None, 'Offer: 130k'),
    ('Airbnb', 'Design Engineer', 'Rejected', 'Medium', '2026-04-28', None, 'No response after 2 weeks'),
    ('Tesla', 'Firmware Engineer', 'Saved', 'Low', None, None, 'Interesting role'),
]

conn.executemany(
    'INSERT INTO jobs (company, role, status, priority, date_applied, follow_up_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    jobs
)
conn.commit()

total = conn.execute("SELECT COUNT(*) FROM jobs").fetchone()[0]
print(f"Done. Total jobs now: {total}")
conn.close()
