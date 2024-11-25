require("dotenv").config();
const functions = require("firebase-functions");
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.pass, 
  },
});


app.post("/api/send-email", async (req, res) => {
  try {
    const { name, surname, sub, email, cont, org, loc, msg, attach } = req.body;

    let attachUrl = "";
    if (attach) {
      const attachment = {
        filename: attach.name,
        content: Buffer.from(attach.data, "base64"),
        contentType: attach.type,
      };
      attachUrl = attachment;
    }

    const mailOptions = {
      from: email,
      to: "info@jaishglobaltech.com",
      subject: `${sub} - ${org}`,
      html: `
        <p><strong>Name:</strong> ${name} ${surname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Contact:</strong> ${cont}</p>
        <p><strong>Organization:</strong> ${org}</p>
        <p><strong>Location:</strong> ${loc}</p>
        <p><strong>Message:</strong> ${msg}</p>
      `,
      attachments: attachUrl ? [attachUrl] : [],
    };

    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send", error: error.message });
  }
});

exports.api = functions.https.onRequest(app);
