import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// 1. FORCE THE FILE TO READ THE .ENV VARIABLES FIRST!
dotenv.config(); 

// 2. Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendNewInquiryEmail = async (clientEmail: string, companyName: string) => {
  const staffEmail = process.env.STAFF_EMAIL;
  const portalLoginUrl = "http://localhost:5173/login"; 

  const mailOptions = {
    from: `"ITAC Portal" <${process.env.EMAIL_USER}>`,
    to: staffEmail,
    subject: `🚨 New Client Inquiry: ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #FE5C00; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">New Client Inquiry</h2>
        </div>
        <div style="padding: 30px; background-color: #fafafa;">
          <p style="font-size: 16px; color: #333;">Hello Staff Team,</p>
          <p style="font-size: 16px; color: #333;">A new client has just updated their information and is awaiting your review.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FE5C00;">
            <p style="margin: 5px 0;"><strong>Company:</strong> ${companyName}</p>
            <p style="margin: 5px 0;"><strong>Contact Email:</strong> ${clientEmail}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${portalLoginUrl}" style="background-color: #FE5C00; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Login to Portal</a>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📨 Mailer: Alert email successfully delivered to staff!");
  } catch (error) {
    console.error("📨 Mailer Error: Failed to send email:", error);
    // Throw the error so the router knows it actually failed!
    throw error; 
  }
};