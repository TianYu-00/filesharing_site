// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
// https://app.sendgrid.com/
const sendGrid = require("@sendgrid/mail");

const ENV = process.env.NODE_ENV || "development";
require("dotenv").config({
  path: `${__dirname}/../.env.${ENV}`,
});

sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (emailTo, emailSubject, emailText, emailHtml, isTest = false) => {
  try {
    const msg = {
      to: emailTo,
      from: process.env.SECRET_SENDER_EMAIL,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      mail_settings: {
        sandbox_mode: {
          enable: isTest,
        },
      },
    };
    const [response] = await sendGrid.send(msg);
    if (isTest) {
      if (response.statusCode === 200) {
        console.log("Sandbox Mode: Email successfully processed, but not sent.");
      } else {
        console.log("Unexpected response in sandbox mode:", response.statusCode);
      }
    } else {
      if (response.statusCode === 202) {
        console.log("Email is accepted.");
      } else {
        console.log("Unexpected response status:", response.statusCode);
      }
    }
  } catch (error) {
    throw error;
  }
};

module.exports = sendEmail;

// sendEmail("test@example.com", "Test Email Subject", "Test Email Text", `<strong>Test Email HTML</strong>`, true);
