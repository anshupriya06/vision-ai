"""
Email Service for VisionSafe
Sends welcome emails and notifications
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

# Email Configuration (use environment variables in production)
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "")
FROM_NAME = os.getenv("FROM_NAME", "VisionSafe Team")


def get_welcome_email_html(subscriber_email: str, unsubscribe_token: str) -> str:
    """
    Generate HTML content for welcome email
    """
    unsubscribe_link = f"http://localhost:8000/newsletter/unsubscribe?token={unsubscribe_token}"
    
    html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }}
        .logo {{
            font-size: 32px;
            font-weight: bold;
            color: white;
            margin-bottom: 10px;
        }}
        .header-subtitle {{
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .greeting {{
            font-size: 24px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
        }}
        .message {{
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 20px;
        }}
        .feature-box {{
            background: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }}
        .feature-title {{
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 10px;
            font-size: 18px;
        }}
        .feature-list {{
            list-style: none;
            padding: 0;
            margin: 0;
        }}
        .feature-list li {{
            padding: 8px 0;
            color: #4a5568;
        }}
        .feature-list li:before {{
            content: "✓ ";
            color: #48bb78;
            font-weight: bold;
            margin-right: 10px;
        }}
        .cta-button {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }}
        .cta-button:hover {{
            opacity: 0.9;
        }}
        .footer {{
            background: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }}
        .footer-text {{
            font-size: 14px;
            color: #718096;
            margin-bottom: 10px;
        }}
        .unsubscribe {{
            font-size: 12px;
            color: #a0aec0;
        }}
        .unsubscribe a {{
            color: #667eea;
            text-decoration: none;
        }}
        .social-links {{
            margin: 20px 0;
        }}
        .social-links a {{
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🎥 VisionSafe</div>
            <div class="header-subtitle">AI-Powered Surveillance Intelligence</div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">Welcome to VisionSafe! 👋</div>
            
            <p class="message">
                Hi there! We're absolutely thrilled to have you join our community. Thank you for subscribing to VisionSafe updates!
            </p>

            <p class="message">
                VisionSafe is revolutionizing the way we approach safety and security through cutting-edge artificial intelligence. 
                Our platform transforms ordinary surveillance footage into intelligent insights, helping you maintain safer environments 
                for everyone.
            </p>

            <div class="feature-box">
                <div class="feature-title">🚀 What Makes VisionSafe Special?</div>
                <ul class="feature-list">
                    <li><strong>Real-Time Detection:</strong> Instantly identify unsafe activities as they happen</li>
                    <li><strong>AI-Powered Analysis:</strong> Advanced computer vision analyzes every frame with precision</li>
                    <li><strong>Instant Alerts:</strong> Get notified immediately when potential threats are detected</li>
                    <li><strong>Smart Dashboard:</strong> Beautiful, intuitive interface to monitor and manage everything</li>
                    <li><strong>Privacy-First:</strong> Your data security is our top priority</li>
                </ul>
            </div>

            <p class="message">
                As a subscriber, you'll be the first to know about:
            </p>
            
            <ul class="feature-list" style="padding-left: 20px;">
                <li>New AI detection capabilities and features</li>
                <li>Platform updates and improvements</li>
                <li>Safety tips and best practices</li>
                <li>Exclusive insights and industry trends</li>
                <li>Special offers and early access opportunities</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3001" class="cta-button">
                    Get Started with VisionSafe →
                </a>
            </div>

            <div class="feature-box" style="border-left-color: #48bb78;">
                <div class="feature-title">💡 Quick Start Guide</div>
                <p style="color: #4a5568; margin: 10px 0 5px 0;">Ready to try VisionSafe? Here's how to begin:</p>
                <ol style="color: #4a5568; margin: 5px 0; padding-left: 20px;">
                    <li>Create your free account in seconds</li>
                    <li>Upload your first video for analysis</li>
                    <li>Watch our AI work its magic in real-time</li>
                    <li>Review detailed safety insights and reports</li>
                </ol>
            </div>

            <p class="message">
                Have questions? We're here to help! Feel free to reply to this email, and our friendly support team 
                will get back to you as soon as possible.
            </p>

            <p class="message" style="margin-top: 30px;">
                Thank you for being part of the VisionSafe family. Together, we're building a safer tomorrow! 🌟
            </p>

            <p class="message" style="font-weight: 600; color: #2d3748;">
                Warm regards,<br>
                The VisionSafe Team
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="social-links">
                <a href="https://twitter.com/visionsafe">Twitter</a>
                <a href="https://linkedin.com/company/visionsafe">LinkedIn</a>
                <a href="https://github.com/visionsafe">GitHub</a>
            </div>
            
            <p class="footer-text">
                VisionSafe AI - Intelligent Surveillance Solutions<br>
                Making the world a safer place, one frame at a time
            </p>
            
            <p class="unsubscribe">
                You're receiving this email because you subscribed to VisionSafe updates.<br>
                <a href="{unsubscribe_link}">Unsubscribe</a> | 
                <a href="http://localhost:3001/privacy">Privacy Policy</a>
            </p>
        </div>
    </div>
</body>
</html>
    """
    return html


def send_welcome_email(recipient_email: str, unsubscribe_token: str) -> bool:
    """
    Send welcome email to new subscriber
    
    Args:
        recipient_email: Email address of the subscriber
        unsubscribe_token: Token for unsubscribe link
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        if not SMTP_USER or not SMTP_PASSWORD or not FROM_EMAIL:
            logger.error("SMTP credentials are not configured. Set SMTP_USER, SMTP_PASSWORD, and FROM_EMAIL in environment variables.")
            return False

        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = '🎉 Welcome to VisionSafe - Your Journey to Smarter Security Begins!'
        msg['From'] = f'{FROM_NAME} <{FROM_EMAIL}>'
        msg['To'] = recipient_email

        # Plain text version (fallback)
        text_content = f"""
Welcome to VisionSafe!

Thank you for subscribing to our newsletter. We're thrilled to have you join our community!

VisionSafe is revolutionizing safety and security through AI-powered surveillance intelligence. 
Our platform helps you maintain safer environments by detecting potential threats in real-time.

What you'll receive as a subscriber:
- New feature announcements
- Platform updates
- Safety tips and best practices
- Exclusive insights
- Special offers

Get started: http://localhost:3001

Thank you for being part of the VisionSafe family!

Best regards,
The VisionSafe Team

Unsubscribe: http://localhost:8000/newsletter/unsubscribe?token={unsubscribe_token}
        """

        # HTML version
        html_content = get_welcome_email_html(recipient_email, unsubscribe_token)

        # Attach both versions
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))

        # Send email
        logger.info(f"Attempting to send welcome email to {recipient_email}")
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"✅ Welcome email sent successfully to {recipient_email}")
        return True

    except Exception as e:
        logger.error(f"❌ Failed to send welcome email to {recipient_email}: {e}")
        return False


def send_test_email():
    """Test email configuration"""
    test_email = "test@example.com"
    test_token = "test-token-123"
    return send_welcome_email(test_email, test_token)


if __name__ == "__main__":
    # Test email sending
    logging.basicConfig(level=logging.INFO)
    print("Testing email configuration...")
    send_test_email()
