const nodemailer = require("nodemailer");

exports.SendAccountRegistrationdEmail = async (name,email,password) => {
    const htmlBodyContents = `<p>Hello ${name},</p>
                              <p>Welcome to RCTIC! Your account has been successfully registered.</p>
                              ${password
                                ? `
                                <p>Your login credentials are:</p>
                                <p>Email: ${email}</p>
                                <p>Password: ${password}</p>`
                                : ""
                                }
                              <p>Regards,</p>
                              <p>The RCTIC Team</p>`;

    await sendEmail(email, "RCTIC: Account Registration", htmlBodyContents);
}

exports.SendForgotPasswordEmail = async (name,email,code) => {
    const htmlBodyContents = `<p>Hello ${name},</p>
                              <p>use below otp for reset password</p>
                              ${code
                                ? `
                                <p>Your reset password credentials are:</p>
                                <p>Email: ${email}</p>
                                <p>code: ${code}</p>`
                                : ""
                                }
                              <p>Regards,</p>
                              <p>The RCTIC Team</p>`;

    await sendEmail(email, "RCTIC: Account forgot password otp", htmlBodyContents);
}
async function sendEmail(receiverEmail,subject, htmlBodyContents,fromAddress = process.env.APP_NAME){
  let transporter = getTransportInfo();
  let mailOptions = {
    from: fromAddress,
    to: receiverEmail,
    subject: subject,
    html: htmlBodyContents,
  };
  if (process.env.disableEmail == true || process.env.disableEmail == "true") {
    return;
  }
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${receiverEmail}`);
} catch (error) {
    console.error(`Error sending in sending: ${error}`);
    throw error;
}
}

function getTransportInfo() {
  return nodemailer.createTransport({
    service: "Gmail",
    // host: "smtp-mail.outlook.com",
    port: 587,
    // secureConnection: true, // true for 465, false for other ports
    secure: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });
}
