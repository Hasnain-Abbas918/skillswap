const resend = require('../config/email');

const sendEmail = async ({ to, subject, html }) => {
  const { error } = await resend.emails.send({
    from: 'SkillSwap <onboarding@resend.dev>',
    to,
    subject,
    html,
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error(error.message);
  }
};

module.exports = sendEmail;