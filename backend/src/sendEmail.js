// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
// https://app.sendgrid.com/
const sendGrid = require("@sendgrid/mail");

const ENV = process.env.NODE_ENV || "development";
require("dotenv").config({
  path: `${__dirname}/../.env.${ENV}`,
});

sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (emailTo, emailSubject, emailText, emailHtml = "", isTest = false, isAllowReplyTo = false) => {
  try {
    const msg = {
      to: emailTo,
      from: `DropBoxer <${process.env.SECRET_SENDER_EMAIL}>`,
      subject: emailSubject,
      text: emailText,
      mail_settings: {
        sandbox_mode: {
          enable: isTest,
        },
      },
    };

    if (emailHtml) {
      msg.html = emailHtml;
    }

    if (isAllowReplyTo) {
      msg.reply_to = process.env.SECRET_SENDER_REPLY_TO;
    }

    const [response] = await sendGrid.send(msg);

    let result = {
      success: false,
      message: "",
      data: null,
    };

    if (isTest) {
      if (response.statusCode === 200) {
        console.log("Sandbox Mode: Email successfully processed, but not sent.");
        result = { success: true, message: "Email has been successfully processed in sandbox mode.", data: null };
      } else {
        console.log("Unexpected response in sandbox mode:", response.statusCode);
        result = { success: false, message: "Failed to process email in sandbox mode.", data: null };
      }
    } else {
      if (response.statusCode === 202) {
        console.log("Email request is accepted.", emailTo);
        result = { success: true, message: "Email has been sent.", data: null };
      } else {
        console.log("Unexpected response status:", response.statusCode);
        result = { success: false, message: "Failed to send email.", data: null };
      }
    }

    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = sendEmail;

// sendEmail("test@example.com", "Test Email Subject", "Test Email Text", `<strong>Test Email HTML</strong>`, true);
