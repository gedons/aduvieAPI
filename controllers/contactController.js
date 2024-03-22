const ContactMessage = require('../../models/contactMessage');
const nodemailer = require('nodemailer');

// Handle contact form submission
exports.submitContactForm = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    // Save contact message to the database
    const newContactMessage = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message
    });
    await newContactMessage.save();

    // Send email notification to admin
    sendEmailReminder(name, email, phone, subject, message);

    res.json({ msg: 'Contact message submitted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Function to send email notification
const sendEmailReminder = (name, email, subject) => {
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "235d4fbf890151",
          pass: "239a58f61ee725"
      }
    });
  
    const mailOptions = {
      from: email,  
      to: 'admin@example.com',
      subject: 'New Contact Form Submission',
      html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${subject}</p>`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
};
  
