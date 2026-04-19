const nodemailer = require('nodemailer');
 
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  // ✅ IPv4 force karo — Render pe IPv6 block hai
  family: 4,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});
 
module.exports = transporter;