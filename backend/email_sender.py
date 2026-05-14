import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os
import time

def send_personalized_email(smtp_settings, recipient, subject, body, attachment_path=None):
    """
    smtp_settings: dict with 'email' and 'password'
    recipient: dict with 'email', 'name', 'company', 'role'
    """
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_settings['email']
        msg['To'] = recipient['email']
        
        # Safe formatting for subject and body
        try:
            msg['Subject'] = subject.format(**recipient)
            personalized_body = body.format(**recipient)
        except KeyError as e:
            return False, f"Missing template variable: {str(e)}"
        except Exception as e:
            return False, f"Template error: {str(e)}"
            
        msg.attach(MIMEText(personalized_body, 'plain'))
        
        # Attachment
        if attachment_path and isinstance(attachment_path, str) and os.path.exists(attachment_path):
            with open(attachment_path, "rb") as attachment:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(attachment.read())
            
            encoders.encode_base64(part)
            part.add_header(
                "Content-Disposition",
                f"attachment; filename= {os.path.basename(attachment_path)}",
            )
            msg.attach(part)
        
        # SMTP Server
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(smtp_settings['email'], smtp_settings['password'])
        text = msg.as_string()
        server.sendmail(smtp_settings['email'], recipient['email'], text)
        server.quit()
        
        return True, "Sent"
    except Exception as e:
        return False, str(e)

def bulk_send(smtp_settings, recipients, subject, body, attachment_path, delay=2, is_test=False):
    results = []
    
    # If test mode, only send to sender
    if is_test:
        test_recipients = [{
            'email': smtp_settings['email'],
            'name': 'Test User',
            'company': 'Test Co',
            'role': 'Test Role'
        }]
        success, msg = send_personalized_email(smtp_settings, test_recipients[0], subject, body, attachment_path)
        results.append({'recipient': smtp_settings['email'], 'status': 'Success' if success else 'Failed', 'error': msg})
        return results

    for recipient in recipients:
        success, msg = send_personalized_email(smtp_settings, recipient, subject, body, attachment_path)
        results.append({
            'recipient': recipient['email'],
            'status': 'Success' if success else 'Failed',
            'error': msg if not success else ''
        })
        time.sleep(delay)
        
    return results
