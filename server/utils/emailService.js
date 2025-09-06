const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendOTPEmail(email, otp, type = 'verification') {
    const subject = type === 'verification' 
      ? 'Verify Your Email Address' 
      : 'Password Reset OTP';
    
    const html = this.getOTPEmailTemplate(otp, type);

    const mailOptions = {
      from: `"ReWear" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  getOTPEmailTemplate(otp, type) {
    const title = type === 'verification' 
      ? 'Email Verification' 
      : 'Password Reset';
    
    const message = type === 'verification'
      ? 'Please use the following OTP to verify your email address:'
      : 'Please use the following OTP to reset your password:';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ReWear - ${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .otp-box {
            background: #007bff;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 3px;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          
          <p>Hello,</p>
          <p>${message}</p>
          
          <div class="otp-box">
            ${otp}
          </div>
          
          <div class="warning">
            <strong>Important:</strong> This OTP is valid for 10 minutes only. Do not share this code with anyone.
          </div>
          
          <p>If you didn't request this ${type === 'verification' ? 'verification' : 'password reset'}, please ignore this email.</p>
          
          <div class="footer">
            <p>Best regards,<br>ReWear Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: `"ReWear" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to ReWear!',
      html: this.getWelcomeEmailTemplate(name)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Welcome email sending failed:', error);
      // Don't throw error for welcome email as it's not critical
      return { success: false, error: error.message };
    }
  }

  getWelcomeEmailTemplate(name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ReWear</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .welcome-box {
            background: #28a745;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ReWear!</h1>
          </div>
          
          <div class="welcome-box">
            <h2>🎉 Account Verified Successfully!</h2>
          </div>
          
          <p>Hello ${name},</p>
          <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
          
          <p>You can now enjoy all the features of our application:</p>
          <ul>
            <li>Secure authentication</li>
            <li>Profile management</li>
            <li>And much more!</li>
          </ul>
          
          <p>If you have any questions or need assistance, feel free to contact our support team.</p>
          
          <div class="footer">
            <p>Best regards,<br>ReWear Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
