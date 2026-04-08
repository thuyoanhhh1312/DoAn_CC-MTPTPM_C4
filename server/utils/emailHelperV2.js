import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

const { MAIL_USER, MAIL_PASS, SENDGRID_API_KEY, SENDGRID_FROM } = process.env;

const hasGmailCredentials = MAIL_USER && MAIL_PASS;
const hasSendGridCredentials = SENDGRID_API_KEY && SENDGRID_FROM;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export const createMailTransporter = () => {
  if (!hasGmailCredentials) {
    throw new Error("MAIL_USER/MAIL_PASS are not configured");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });
};

export const sendEmail = async (to, subject, htmlContent) => {
  let lastError = null;

  if (hasSendGridCredentials) {
    const proxyEnvKeys = [
      "HTTP_PROXY",
      "HTTPS_PROXY",
      "ALL_PROXY",
      "http_proxy",
      "https_proxy",
      "all_proxy",
    ];
    const previousProxyEnv = Object.fromEntries(
      proxyEnvKeys.map((key) => [key, process.env[key]]),
    );

    try {
      for (const key of proxyEnvKeys) {
        delete process.env[key];
      }

      await sgMail.send({
        to,
        from: `OanhNgoc Jewelry <${SENDGRID_FROM}>`,
        subject,
        html: htmlContent,
      });

      console.log(`Email sent via SendGrid to ${to}`);
      return true;
    } catch (error) {
      lastError = error;
      const sendGridDetail =
        error?.response?.body?.errors?.map((item) => item.message).join("; ") ||
        error.message;
      console.error(`SendGrid failed for ${to}:`, sendGridDetail);
    } finally {
      for (const [key, value] of Object.entries(previousProxyEnv)) {
        if (value) {
          process.env[key] = value;
        } else {
          delete process.env[key];
        }
      }
    }
  }

  if (hasGmailCredentials) {
    try {
      const transporter = createMailTransporter();
      const mailOptions = {
        from: `"OanhNgoc Jewelry" <${MAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      lastError = error;
      console.error(`Gmail SMTP failed for ${to}:`, error.message);
    }
  }

  if (!hasSendGridCredentials && !hasGmailCredentials) {
    console.error(
      "Failed to send email: No email credentials configured (SENDGRID_API_KEY/SENDGRID_FROM or MAIL_USER/MAIL_PASS)",
    );
    return false;
  }

  if (lastError) {
    console.error(`Failed to send email to ${to}:`, lastError.message);
  }

  return false;
};

export const formatVND = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const getCurrentPeriod = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

export const isBirthdayToday = (birthday) => {
  if (!birthday) return false;

  const today = new Date();
  const birthDate = new Date(birthday);

  return (
    birthDate.getDate() === today.getDate() &&
    birthDate.getMonth() === today.getMonth()
  );
};
