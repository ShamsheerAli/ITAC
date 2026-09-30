"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAuditConfirmedEmail = exports.sendAuditDateSelectedEmail = exports.sendAuditDatesProposedEmail = exports.sendDocumentUploadEmail = exports.sendClientApprovalEmail = exports.sendNewInquiryEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
// 1. FORCE THE FILE TO READ THE .ENV VARIABLES FIRST!
dotenv_1.default.config();
// 2. Configure the transporter
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendNewInquiryEmail = (clientEmail, companyName) => __awaiter(void 0, void 0, void 0, function* () {
    const staffEmail = process.env.STAFF_EMAIL;
    const portalLoginUrl = "http://energyhub.okstate.edu/login";
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
        yield transporter.sendMail(mailOptions);
        console.log("📨 Mailer: Alert email successfully delivered to staff!");
    }
    catch (error) {
        console.error("📨 Mailer Error: Failed to send email:", error);
        // Throw the error so the router knows it actually failed!
        throw error;
    }
});
exports.sendNewInquiryEmail = sendNewInquiryEmail;
const sendClientApprovalEmail = (clientEmail, contactName, serviceType) => __awaiter(void 0, void 0, void 0, function* () {
    const portalLoginUrl = "http://energyhub.okstate.edu/login"; // Your frontend URL
    const mailOptions = {
        from: `"ITAC Portal" <${process.env.EMAIL_USER}>`,
        to: clientEmail, // 🚨 Sending to the CLIENT this time!
        subject: `🎉 Congratulations! You've been selected for ITAC Services`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #FE5C00; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Application Approved!</h2>
        </div>
        <div style="padding: 30px; background-color: #fafafa;">
          <p style="font-size: 16px; color: #333;">Hello <strong>${contactName}</strong>,</p>
          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            Congratulations! Your application has been reviewed by our team, and you have been selected for <strong>${serviceType || 'our assessment services'}</strong>.
          </p>
          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            To proceed with the next steps, we need you to upload a few required documents. Please log in to your dashboard to get started.
          </p>
          
          <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
            <a href="${portalLoginUrl}" style="background-color: #FE5C00; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Login to Upload Documents</a>
          </div>
        </div>
      </div>
    `,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log(`📨 Mailer: Approval email successfully delivered to client (${clientEmail})!`);
    }
    catch (error) {
        console.error("📨 Mailer Error: Failed to send client email:", error);
        throw error;
    }
});
exports.sendClientApprovalEmail = sendClientApprovalEmail;
const sendDocumentUploadEmail = (clientName, companyName) => __awaiter(void 0, void 0, void 0, function* () {
    const staffEmail = process.env.STAFF_EMAIL;
    const portalLoginUrl = "http://energyhub.okstate.edu/login"; // Staff login URL
    const mailOptions = {
        from: `"ITAC Portal" <${process.env.EMAIL_USER}>`,
        to: staffEmail, // 🚨 Sending to STAFF this time!
        subject: `📄 Documents Submitted: ${companyName}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Documents Ready for Review</h2>
        </div>
        <div style="padding: 30px; background-color: #fafafa;">
          <p style="font-size: 16px; color: #333;">Hello Staff Team,</p>
          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            <strong>${clientName}</strong> from <strong>${companyName}</strong> has just finished uploading their required documents.
          </p>
          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            Please log in to the portal to review their files and move them to the next stage of the assessment process.
          </p>
          
          <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
            <a href="${portalLoginUrl}" style="background-color: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Log in to Review Documents</a>
          </div>
        </div>
      </div>
    `,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log(`📨 Mailer: Document submission email delivered to staff for ${companyName}!`);
    }
    catch (error) {
        console.error("📨 Mailer Error: Failed to send document upload email:", error);
        throw error;
    }
});
exports.sendDocumentUploadEmail = sendDocumentUploadEmail;
const sendAuditDatesProposedEmail = (clientEmail, contactName) => __awaiter(void 0, void 0, void 0, function* () {
    const portalLoginUrl = "http://energyhub.okstate.edu/login"; // Client login URL
    const mailOptions = {
        from: `"ITAC Portal" <${process.env.EMAIL_USER}>`,
        to: clientEmail, // 🚨 Sending to the CLIENT
        subject: `📅 Documents Approved! Action Required to Schedule Audit`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #10B981; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Documents Approved & Ready!</h2>
        </div>
        <div style="padding: 30px; background-color: #fafafa;">
          <p style="font-size: 16px; color: #333;">Hello <strong>${contactName}</strong>,</p>
          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            Great news! Our team has reviewed your uploaded documents and everything looks perfect. We are officially ready to move forward with your assessment.
          </p>
          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            We have proposed some available dates for your upcoming audit. Please log in to your portal to review these dates and confirm which one works best for your team.
          </p>
          
          <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
            <a href="${portalLoginUrl}" style="background-color: #10B981; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Log in to Select Audit Date</a>
          </div>
        </div>
      </div>
    `,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log(`📨 Mailer: Proposed dates email delivered to client (${clientEmail})!`);
    }
    catch (error) {
        console.error("📨 Mailer Error: Failed to send proposed dates email:", error);
        throw error;
    }
});
exports.sendAuditDatesProposedEmail = sendAuditDatesProposedEmail;
const sendAuditDateSelectedEmail = (companyName, clientName, selectedDate) => __awaiter(void 0, void 0, void 0, function* () {
    const staffEmail = process.env.STAFF_EMAIL;
    const portalLoginUrl = "http://energyhub.okstate.edu/login"; // Staff login URL
    // Clean up the date string if it has the "Client Proposed:" prefix
    const cleanDate = selectedDate.replace('Client Proposed: ', '').replace('Staff Proposed: ', '');
    const mailOptions = {
        from: `"ITAC Portal" <${process.env.EMAIL_USER}>`,
        to: staffEmail, // 🚨 Sending to STAFF
        subject: `📅 Audit Date Selected: ${companyName}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #3B82F6; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Audit Date Selected!</h2>
        </div>
        <div style="padding: 30px; background-color: #fafafa;">
          <p style="font-size: 16px; color: #333;">Hello Staff Team,</p>
          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            <strong>${clientName}</strong> from <strong>${companyName}</strong> has just selected their preferred date for the on-site energy audit.
          </p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3B82F6;">
            <p style="margin: 5px 0; font-size: 18px;"><strong>Selected Date:</strong> ${cleanDate}</p>
          </div>

          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            Please log in to the portal to review this selection and officially confirm the audit.
          </p>
          
          <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
            <a href="${portalLoginUrl}" style="background-color: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Log in to Confirm Audit</a>
          </div>
        </div>
      </div>
    `,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log(`📨 Mailer: Date selection email delivered to staff for ${companyName}!`);
    }
    catch (error) {
        console.error("📨 Mailer Error: Failed to send date selection email:", error);
        throw error;
    }
});
exports.sendAuditDateSelectedEmail = sendAuditDateSelectedEmail;
const sendAuditConfirmedEmail = (clientEmail, contactName, confirmedDate) => __awaiter(void 0, void 0, void 0, function* () {
    const portalLoginUrl = "http://energyhub.okstate.edu/login"; // Client login URL
    // Clean up the date string so it looks nice in the email
    const cleanDate = confirmedDate ? confirmedDate.replace('Client Proposed: ', '').replace('Staff Proposed: ', '') : 'your scheduled date';
    const mailOptions = {
        from: `"ITAC Portal" <${process.env.EMAIL_USER}>`,
        to: clientEmail, // 🚨 Sending back to the CLIENT
        subject: `✅ Audit Officially Confirmed!`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #8B5CF6; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Audit Date Confirmed!</h2>
        </div>
        <div style="padding: 30px; background-color: #fafafa;">
          <p style="font-size: 16px; color: #333;">Hello <strong>${contactName}</strong>,</p>
          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            Excellent news! Our team has officially confirmed your selected date for the on-site energy assessment.
          </p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #8B5CF6;">
            <p style="margin: 5px 0; font-size: 18px;"><strong>Confirmed Date:</strong> ${cleanDate}</p>
          </div>

          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            Please ensure your team is ready for our arrival on this date. You can log in to your portal dashboard at any time to review extra information, preparation details, and contact our staff if you have any questions.
          </p>
          
          <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
            <a href="${portalLoginUrl}" style="background-color: #8B5CF6; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Log in to Dashboard</a>
          </div>
        </div>
      </div>
    `,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log(`📨 Mailer: Official confirmation email delivered to client (${clientEmail})!`);
    }
    catch (error) {
        console.error("📨 Mailer Error: Failed to send official confirmation email:", error);
        throw error;
    }
});
exports.sendAuditConfirmedEmail = sendAuditConfirmedEmail;
