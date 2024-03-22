const ContactMessage = require('../../models/contactMessage');
const nodemailer = require('nodemailer');

// Handle contact form submission
exports.submitContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Save contact message to the database
    const newContactMessage = new ContactMessage({
      name,
      email,
      message
    });
    await newContactMessage.save();

    // Send email notification to admin
    sendEmailReminder(name, email, message);

    res.json({ msg: 'Contact message submitted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Function to send email notification
const sendEmailReminder = (name, email, message) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "your_mailtrap_username",
        pass: "your_mailtrap_password"
      }
    });
  
    const mailOptions = {
      from: email, // Use the email provided by the user
      to: 'admin@example.com',
      subject: 'New Contact Form Submission',
      html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  };
  
