from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from database import get_db_connection, init_db
from email_sender import bulk_send
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize database
init_db()

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    conn = get_db_connection()
    jobs = conn.execute('SELECT * FROM jobs ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in jobs])

@app.route('/api/jobs', methods=['POST'])
def add_job():
    data = request.json
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO jobs (company, role, status, priority, date_applied, follow_up_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (data.get('company'), data.get('role'), data.get('status', 'Saved'), 
          data.get('priority', 'Medium'), data.get('date_applied'), 
          data.get('follow_up_date'), data.get('notes')))
    conn.commit()
    conn.close()
    return jsonify({"message": "Job added successfully"}), 201

@app.route('/api/jobs/<int:id>', methods=['PUT'])
def update_job(id):
    data = request.json
    conn = get_db_connection()
    conn.execute('''
        UPDATE jobs SET company=?, role=?, status=?, priority=?, 
        date_applied=?, follow_up_date=?, notes=? WHERE id=?
    ''', (data.get('company'), data.get('role'), data.get('status'), 
          data.get('priority'), data.get('date_applied'), 
          data.get('follow_up_date'), data.get('notes'), id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Job updated successfully"})

@app.route('/api/jobs/<int:id>', methods=['DELETE'])
def delete_job(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM jobs WHERE id=?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Job deleted successfully"})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db_connection()
    total = conn.execute('SELECT COUNT(*) FROM jobs').fetchone()[0]
    applied = conn.execute('SELECT COUNT(*) FROM jobs WHERE status="Applied"').fetchone()[0]
    interviews = conn.execute('SELECT COUNT(*) FROM jobs WHERE status="Interview"').fetchone()[0]
    offers = conn.execute('SELECT COUNT(*) FROM jobs WHERE status="Offer"').fetchone()[0]
    
    # Weekly applications (simplified)
    # In a real app, you'd filter by date
    weekly = [
        {"name": "Mon", "apps": 2},
        {"name": "Tue", "apps": 5},
        {"name": "Wed", "apps": 3},
        {"name": "Thu", "apps": 8},
        {"name": "Fri", "apps": 4},
        {"name": "Sat", "apps": 1},
        {"name": "Sun", "apps": 0}
    ]
    
    status_breakdown = [
        {"name": "Saved", "value": conn.execute('SELECT COUNT(*) FROM jobs WHERE status="Saved"').fetchone()[0]},
        {"name": "Applied", "value": applied},
        {"name": "Interview", "value": interviews},
        {"name": "Offer", "value": offers},
        {"name": "Rejected", "value": conn.execute('SELECT COUNT(*) FROM jobs WHERE status="Rejected"').fetchone()[0]}
    ]
    
    conn.close()
    return jsonify({
        "total": total,
        "applied": applied,
        "interviews": interviews,
        "offers": offers,
        "weekly": weekly,
        "status_breakdown": status_breakdown
    })

@app.route('/api/send-emails', methods=['POST'])
def send_bulk_emails():
    # This would take CSV, template, and settings
    # For now, placeholder for the logic
    data = request.form
    # attachment = request.files.get('resume')
    
    # Mock response
    return jsonify({
        "sent": 10,
        "failed": 2,
        "report": [
            {"recipient": "hr@google.com", "status": "Success"},
            {"recipient": "jobs@meta.com", "status": "Failed", "error": "Invalid email"}
        ]
    })

@app.route('/api/settings', methods=['GET', 'POST'])
def handle_settings():
    conn = get_db_connection()
    if request.method == 'GET':
        settings = conn.execute('SELECT * FROM settings WHERE id=1').fetchone()
        conn.close()
        return jsonify(dict(settings))
    else:
        data = request.json
        conn.execute('''
            UPDATE settings SET smtp_email=?, smtp_password=?, 
            default_resume_path=?, theme=? WHERE id=1
        ''', (data.get('smtp_email'), data.get('smtp_password'), 
              data.get('default_resume_path'), data.get('theme')))
        conn.commit()
        conn.close()
        return jsonify({"message": "Settings updated"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
