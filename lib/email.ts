import nodemailer from "nodemailer"

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Gmail credentials are not set. Skipping email sending.")
    console.log(`Simulated email to: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body:\n${html}`)
    return
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    })
    console.log(`Email sent successfully to ${to}`)
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error)
    throw new Error("Failed to send email.")
  }
}
