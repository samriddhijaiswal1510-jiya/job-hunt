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

@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Save to a dedicated uploads folder
    upload_dir = os.path.join(os.getcwd(), 'uploads')
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    filepath = os.path.join(upload_dir, file.filename)
    file.save(filepath)
    
    # Update settings with the new path
    conn = get_db_connection()
    conn.execute('UPDATE settings SET default_resume_path=? WHERE id=1', (filepath,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Resume uploaded successfully", "path": filepath})

@app.route('/api/send-emails', methods=['POST'])
def send_bulk_emails():
    data = request.json
    recipients = data.get('recipients', [])
    template = data.get('template', '')
    subject = data.get('subject', 'Application for {role}')
    delay = int(data.get('delay', 2))
    is_test = data.get('is_test', False)
    
    # Get SMTP settings
    conn = get_db_connection()
    settings = conn.execute('SELECT * FROM settings WHERE id=1').fetchone()
    conn.close()
    
    if not settings or not settings['smtp_email'] or not settings['smtp_password']:
        return jsonify({"error": "SMTP settings not configured"}), 400
    
    smtp_settings = {
        "email": settings['smtp_email'],
        "password": settings['smtp_password']
    }
    
    resume_path = settings['default_resume_path']
    
    # Call the real bulk_send logic
    try:
        results = bulk_send(
            smtp_settings, 
            recipients, 
            subject, 
            template, 
            resume_path, 
            delay=delay, 
            is_test=is_test
        )
    except Exception as e:
        print(f"CRITICAL ERROR IN BULK SEND: {str(e)}")
        return jsonify({"error": f"Server Error: {str(e)}"}), 500
    
    # Log to emails_sent table
    conn = get_db_connection()
    for res in results:
        conn.execute('''
            INSERT INTO emails_sent (recipient, status, sent_at)
            VALUES (?, ?, ?)
        ''', (res['recipient'], res['status'], datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
    conn.commit()
    conn.close()
    
    return jsonify({
        "sent": len([r for r in results if r['status'] == 'Success']),
        "failed": len([r for r in results if r['status'] != 'Success']),
        "report": results
    })

@app.route('/api/test-smtp', methods=['POST'])
def test_smtp():
    conn = get_db_connection()
    settings = conn.execute('SELECT * FROM settings WHERE id=1').fetchone()
    conn.close()
    
    if not settings or not settings['smtp_email'] or not settings['smtp_password']:
        return jsonify({"error": "SMTP credentials missing in settings"}), 400
    
    smtp_settings = {
        "email": settings['smtp_email'],
        "password": settings['smtp_password']
    }
    
    # Send a single test email to the user themselves
    results = bulk_send(
        smtp_settings, 
        [{'email': settings['smtp_email'], 'name': 'User', 'company': 'Test', 'role': 'Admin'}], 
        "SMTP Connection Test", 
        "Hello! This is a test email to verify your SMTP settings in Smart Job Hunt.", 
        None, 
        is_test=True
    )
    
    if results[0]['status'] == 'Success':
        return jsonify({"message": "Connection Successful! Test email sent."})
    else:
        return jsonify({"error": f"Connection Failed: {results[0].get('error', 'Unknown Error')}"}), 500

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
